import { prisma } from '@repo/db'
import { getGithubApp } from '@repo/github'
import { PrFileType, CodeChunkType, GithubReposType, InstallationReposPageType } from './model'

const FILES_PER_PAGE = 100
const MAX_CHUNK_LINES = 80;
const REPOS_PER_PAGE = 100
const MAX_FILE_SIZE_BYTES = 100_000
const MAX_FILES = 100
const UPSERT_BATCH_SIZE = 100

class GithubServices {

    public buildChunkId(prNumber: number, filePath: string, part: number) {
        return `pr-${prNumber}--${filePath}--${part}`
    }

    public chunkPrFiles(prNumber: number, files: PrFileType[]): CodeChunkType[] {
        const chunks: CodeChunkType[] = []

        for (const file of files) {
            const lines = file.patch.split('\n')

            for (let start = 0; start < lines.length; start += MAX_CHUNK_LINES) {
                const part = start / MAX_CHUNK_LINES
                const text = lines.slice(start, start + MAX_CHUNK_LINES).join('\n')

                chunks.push({
                    id: this.buildChunkId(prNumber, file.filePath, part),
                    filePath: file.filePath,
                    text
                })
            }
        }

        return chunks
    }



    public async getPullRequestFiles(installationId: number, repoFullName: string, prNumber: number): Promise<PrFileType[]> {
        const app = getGithubApp()
        const octokit = await app.getInstallationOctokit(installationId)
        const [owner, repo] = repoFullName.split('/') as [string, string]

        const { data } = await octokit.request(
            "GET /repos/{owner}/{repo}/pulls/{pull_number}/files",
            { owner, repo, pull_number: prNumber, per_page: FILES_PER_PAGE }
        )

        const files: PrFileType[] = []

        for (const file of data) {
            if (!file.patch) {
                continue
            }

            files.push({
                filePath: file.filename,
                patch: file.patch
            })
        }

        return files
    }


    public buildRepoContextSection(repoContextSnippets: string[]) {
        if (repoContextSnippets.length === 0) {
            return ''
        }

        const repoContext = repoContextSnippets.join('\n\n---\n\n')

        return `

        Related code from the repository (for context only, not part of the change):
        
        ${repoContext}
        `

    }

    //. Git Repo's 

    public getRepoVisibility(isPrivate?: boolean): GithubReposType['visibility'] {
        if (isPrivate) {
            return 'private'
        }
        return 'public'
    }


    public mapRepo(repo: {
        id: number
        name: string
        full_name: string
        private?: boolean
        default_branch?: string
        updated_at?: string | null
        language?: string | null
        stargazers_count?: number | null
    }): GithubReposType {
        return {
            id: String(repo.id),
            name: repo.name,
            fullName: repo.full_name,
            visibility: this.getRepoVisibility(repo.private),
            defaultBranch: repo.default_branch ?? 'main',
            updatedAt: repo.updated_at ?? new Date().toISOString(),
            language: repo.language ?? null,
            stars: repo.stargazers_count ?? 0,

        }
    }

    public async getInstallationReposPage(installationId: number, page: number = 1): Promise<InstallationReposPageType> {
        const app = getGithubApp()
        const octokit = await app.getInstallationOctokit(installationId)

        const { data } = await octokit.request(
            "GET /installation/repositories",
            { installation_id: installationId, per_page: REPOS_PER_PAGE, page }
        )
        const totalCount = data.total_count
        const repos = data.repositories.map(this.mapRepo.bind(this))

        return {
            repos,
            totalCount,
            page,
            hasMore: page * REPOS_PER_PAGE < totalCount,
        }
    }
}

export default GithubServices