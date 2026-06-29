import { z } from 'zod'

export const CODE_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.css', '.scss', '.html', '.vue', '.json', '.md', '.mjs', '.py', '.go', '.rb', '.rs', '.java', '.kt', '.swift', '.c', '.h', '.cpp', '.cs', '.php', '.sql', '.prisma', '.md', '.yml', '.yaml']

export const SKIPPED_FOLDERS = ['node_modules', '.git', '.next', '.github', '.vscode', '.idea', '.DS_Store', 'dist', 'build', 'out', 'target', 'vendor', 'node_modules']

export type TreeEntry = {
    path?: string
    type?: string
    sha?: string
    size?: number
}

export type RepoSyncStatusType = 'pending' | 'syncing' | 'synced' | 'failed'

//. code chunk 
export const codeChunk = z.object({
    id: z.string(),
    filePath: z.string(),
    text: z.string()
})

export type CodeChunkType = z.infer<typeof codeChunk>

//. repo file type 
export const repoFile = z.object({
    filePath: z.string(),
    content: z.string()
})

export type RepoFileType = z.infer<typeof repoFile>