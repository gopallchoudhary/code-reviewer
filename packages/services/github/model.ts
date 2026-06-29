import { z } from 'zod'

//. pr file 
export const prFile = z.object({
    filePath: z.string(),
    patch: z.string()
})

export type PrFileType = z.infer<typeof prFile>

//. code chunk 
export const codeChunk = z.object({
    id: z.string(),
    filePath: z.string(),
    text: z.string()
})

export type CodeChunkType = z.infer<typeof codeChunk>

//. pull request webhook payload 

export const pullRequestWebhookPayload = z.object({
    action: z.string(),
    installation: z.object({
        id: z.number(),
    }),
    repository: z.object({
        full_name: z.string(),
    }),
    pull_request: z.object({
        number: z.number(),
        title: z.string(),
        user: z.object({
            login: z.string(),
        }).nullable(),
        head: z.object({
            sha: z.string(),
        }),
        base: z.object({
            ref: z.string(),
        }),
    }),
})

export type PullRequestWebhookPayloadType = z.infer<typeof pullRequestWebhookPayload>

//. code extenstions
export const CODE_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.css', '.scss', '.html', '.vue', '.json', '.md', '.mjs', '.py', '.go', '.rb', '.rs', '.java', '.kt', '.swift', '.c', '.h', '.cpp', '.cs', '.php', '.sql', '.prisma', '.md', '.yml', '.yaml']

export const SKIPPED_FOLDERS = ['node_modules', '.git', '.next', '.github', '.vscode', '.idea', '.DS_Store', 'dist', 'build', 'out', 'target', 'vendor', 'node_modules']

export type TreeEntry = {
    path?: string
    type?: string
    sha?: string
    size?: number
}


//. Github Repo 

export const githubRepo = z.object({
    id: z.string(),
    name: z.string(),
    fullName: z.string(),
    visibility: z.enum(['public', 'private']),
    defaultBranch: z.string().optional(),
    updatedAt: z.string().optional(),
    language: z.string().nullable().optional(),
    stars: z.number().optional().nullable(),
})

export type GithubReposType = z.infer<typeof githubRepo>

//. Github Installation Repos Page 
export const installationReposPage = z.object({
    repos: z.array(githubRepo),
    totalCount: z.number(),
    page: z.number(),
    hasMore: z.boolean(),
})

export type InstallationReposPageType = z.infer<typeof installationReposPage>

