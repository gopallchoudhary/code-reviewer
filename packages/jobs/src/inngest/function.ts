// src/inngest/functions.ts
import { githubServices, aiServices, userService, reposyncServices } from "..";
import { inngest } from "./client";
import { prisma } from '@repo/db'
export const processTask = inngest.createFunction(
    { id: "process-task", triggers: [{ event: "app/task.created" }] },
    async ({ event, step }) => {
        const result = await step.run("handle-task", async () => {
            return { processed: true, id: event.data.id };
        });

        await step.sleep("pause", "1s");

        return { message: `Task ${event.data.id} complete`, result };
    }
);

//. review pull request 
export const reviewPullRequest = inngest.createFunction(
    { id: "review-pull-request", triggers: [{ event: "github/pr.received" }] },
    async ({ event, step }) => {
        const pullRequestId = event.data.pullRequestId

        const pullRequest = await step.run("mark-processing", async () => {
            return await prisma.pullRequest.update({
                where: {
                    id: pullRequestId
                },
                data: {
                    status: "processing"
                }
            })
        })

        const chunks = await step.run("breakdown-code", async () => {
            const files = await githubServices.getPullRequestFiles(
                pullRequest.installationId,
                pullRequest.repoFullName,
                pullRequest.prNumber
            )

            return githubServices.chunkPrFiles(pullRequest.prNumber, files)
        })

        if (chunks.length === 0) {
            await step.run("mark-reviewed-no-code", async () => {
                await prisma.pullRequest.update({
                    where: { id: pullRequestId },
                    data: { status: "reviewed", }
                })
            })

            return { pullRequestId, status: "reviewed", reason: "no code to review" }
        }

        const namespace = aiServices.buildPrNamespace(pullRequest.repoFullName, pullRequest.prNumber)

        await step.run("save-vectors-to-pinecone", async () => {
            await aiServices.saveChunksToPinecone(namespace, chunks)
        })

        await step.sleep("wait for vecors to index", "10s")

        //todo: repoContextSnippets
        const repoContextSnippets = await step.run('search-repo-context', async () => {
            const repoSync = await prisma.repoSync.findUnique({
                where: { repoFullName: pullRequest.repoFullName },
            })

            if (!repoSync || repoSync.status !== 'synced') {
                return []
            }
            const repoNamespace = reposyncServices.buildRepoNamespace(pullRequest.repoFullName)
            return await aiServices.searchPrContext(repoNamespace, pullRequest.title)
        })

        const review = await step.run('generate-ai-review', async () => {
            const contextSnippets = await aiServices.searchPrContext(namespace, pullRequest.title)

            return await aiServices.generateReview({
                repoFullName: pullRequest.repoFullName,
                title: pullRequest.title,
                contextSnippets,
                repoContextSnippets: repoContextSnippets,
            })
        })

        await step.run("post-pr-comment", async () => {
            await aiServices.postPrComment(
                pullRequest.installationId,
                pullRequest.repoFullName,
                pullRequest.prNumber,
                review
            )
        })

        await step.run("mark-reviewed", async () => {
            await prisma.pullRequest.update({
                where: { id: pullRequestId },
                data: { status: "reviewed", reviewComments: review, reviewedAt: new Date() }
            })
        })
    }
)

//. sync repo code base
export const syncRepoCodeBase = inngest.createFunction({
    id: 'sync-repo-codebase',
    triggers: [{ event: 'repo/sync.requested' }],
    onFailure: async ({ event, step }) => {
        await step.run('mark-sync-failed', async () => {
            await prisma.repoSync.update({
                where: { id: event.data.event.data.repoSyncId },
                data: { status: 'failed' },
            })
        })
    }
},
    async ({ event, step }) => {
        const repoSyncId = event.data.repoSyncId

        const repoSync = await step.run('mark-syncing', async () => {
            return await prisma.repoSync.update({
                where: { id: repoSyncId },
                data: { status: 'syncing' },
            })
        })

        const chunks = await step.run('fetch-and-chunk-codebase', async () => {
            const files = await reposyncServices.getRepoFiles(
                repoSync.installationId,
                repoSync.repoFullName,
                repoSync.branch
            )
            return reposyncServices.chunkRepoFiles(files)
        })

        const namespace = reposyncServices.buildRepoNamespace(repoSync.repoFullName)

        if (repoSync.syncedAt) {
            await step.run('delete-old-vectors', async () => {
                await reposyncServices.deleteRepoNamespace(namespace)
            })
        }

        await step.run('save-vector-to-pinecone', async () => {
            await reposyncServices.saveRepoChunks(namespace, chunks)
        })

        await step.run('mark-synced', async () => {
            await prisma.repoSync.update({
                where: { id: repoSyncId },
                data: { status: 'synced', syncedAt: new Date(), chunkCount: chunks.length },
            })
        })

        return {
            repoSyncId,
            status: 'synced',
            chunkCount: chunks.length,
        }


    }
)