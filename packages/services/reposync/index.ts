import { CODE_EXTENSIONS, CodeChunkType, RepoFileType, SKIPPED_FOLDERS, TreeEntry } from './model'
import { getGithubApp } from '@repo/github'
import { getPineconeIndex } from '@repo/vector-db'
import { prisma } from '@repo/db'
import UserService from '../user/index'
import { inngest } from '@repo/jobs'
const FILES_PER_PAGE = 100
const MAX_CHUNK_LINES = 80;

const MAX_FILE_SIZE_BYTES = 100_000
const MAX_FILES = 100
const UPSERT_BATCH_SIZE = 100

const userService = new UserService()

class ReposyncServices {

    private async triggerRepoSync(installationId: number, repoFullName: string, branch: string) {
        // upsert repo sync record
        const repoSync = await prisma.repoSync.upsert({
            where: {
                repoFullName,
            },
            create: {
                installationId,
                repoFullName,
                branch,
                status: 'pending',
            },
            update: {
                installationId,
                branch,
                status: 'pending',
            },
        })

        await inngest.send({
            name: 'repo/sync.requested',
            data: { repoSyncId: repoSync.id }
        })

    }

    public buildRepoNamespace(repoFullName: string) {
        return `${repoFullName.replace("/", "--")}--codebase`
    }

    public hasCodeExtension(path: string) {
        return CODE_EXTENSIONS.some(ext => path.endsWith(ext))
    }

    public isSkippedPath(path: string) {
        return SKIPPED_FOLDERS.some(folder => path.includes(folder))
    }

    public isIndexableFile(entry: TreeEntry) {
        if (entry.type !== 'blob' || !entry.path || !entry.sha) {
            return false
        }

        if (entry.size && entry.size > MAX_FILE_SIZE_BYTES) {
            return false
        }

        if (this.isSkippedPath(entry.path)) {
            return false
        }

        return this.hasCodeExtension(entry.path)
    }

    public buildChunkId(filePath: string, part: number) {
        return `repo--${filePath}--part-${part}`
    }

    public chunkRepoFiles(files: RepoFileType[]): CodeChunkType[] {
        const chunks: CodeChunkType[] = []

        for (const file of files) {
            const lines = file.content.split('\n')

            for (let start = 0; start < lines.length; start += MAX_CHUNK_LINES) {
                const part = start / MAX_CHUNK_LINES
                const text = lines.slice(start, start + MAX_CHUNK_LINES).join('\n')

                chunks.push({
                    id: this.buildChunkId(file.filePath, part),
                    filePath: file.filePath,
                    text
                })
            }
        }

        return chunks
    }

    public async getRepoFiles(installationId: number, repoFullName: string, branch: string): Promise<RepoFileType[]> {
        const app = getGithubApp()
        const octokit = await app.getInstallationOctokit(installationId)
        const [owner, repo] = repoFullName.split('/') as [string, string]

        const { data: tree } = await octokit.request(
            "GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
            { owner, repo, tree_sha: branch }
        )

        const entries = tree.tree.filter(this.isIndexableFile.bind(this)).slice(0, MAX_FILES)
        const files: RepoFileType[] = []

        for (const entry of entries) {
            const { data: blob } = await octokit.request(
                "GET /repos/{owner}/{repo}/git/blobs/{file_sha}",
                { owner, repo, file_sha: entry.sha }
            )

            const content = Buffer.from(blob.content, 'base64').toString('utf-8')
            files.push({
                filePath: entry.path,
                content
            })
        }

        return files
    }

    public async deleteRepoNamespace(namespace: string) {
        const pinecone = getPineconeIndex()
        await pinecone.deleteNamespace(namespace)
    }

    public async saveRepoChunks(namespace: string, chunks: CodeChunkType[]) {
        const index = getPineconeIndex()

        for (let start = 0; start < chunks.length; start += UPSERT_BATCH_SIZE) {
            const batch = chunks.slice(start, start + UPSERT_BATCH_SIZE)

            const records = batch.map((chunk) => ({
                id: chunk.id,
                text: chunk.text,
                filepath: chunk.filePath,
            }))
            await index.namespace(namespace).upsertRecords({ records })
        }

        // index > namespace > records(multiple records)
    }

    // get the status of the repo sync, find the repoFullname and status from the prisma db 
    public async getRepoSyncStatus(repoFullName: string[]) {
        const syncs = await prisma.repoSync.findMany({
            where: { repoFullName: { in: repoFullName } },
            select: { repoFullName: true, status: true },
        })

        const statusByRepo: Record<string, string> = {}

        for (const sync of syncs) {
            statusByRepo[sync.repoFullName] = sync.status
        }

        return statusByRepo
    }

    public async syncRepoCodeBase(userId: string, repoFullName: string, branch: string) {
        const installationId = await userService.getUserInstallationId(userId)
        if (!installationId) {
            throw new Error('User not found')
        }

        await this.triggerRepoSync(installationId, repoFullName, branch)
    }

}

export default ReposyncServices