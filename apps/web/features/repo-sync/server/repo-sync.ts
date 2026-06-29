const MAX_FILE_SIZE_BYTES = 100_000
const MAX_FILES = 100
const MAX_CHUNK_LINES = 80
const UPSERT_BATCH_SIZE = 100

const CODE_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.css', '.scss', '.html', '.vue', '.json', '.md', '.mjs', '.py', '.go', '.rb', '.rs', '.java', '.kt', '.swift', '.c', '.h', '.cpp', '.cs', '.php', '.sql', '.prisma', '.md', '.yml', '.yaml']

const SKIPPED_FOLDERS = ['node_modules', '.git', '.next', '.github', '.vscode', '.idea', '.DS_Store', 'dist', 'build', 'out', 'target', 'vendor', 'node_modules']

type TreeEntry = {
    path?: string
    type?: string
    sha?: string
    size?: number
}

// trigger repo sync