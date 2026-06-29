import { generateText, openrouter } from '@repo/ai'
import type { ReviewInputType } from './model'
import { getPineconeIndex } from '@repo/vector-db'
const REVIEW_MODEL = 'openrouter/free'
import { CodeChunkType } from './model'
import { githubServices } from '@repo/jobs';
import { getGithubApp } from '@repo/github';

const SYSTEM_PROMPT = `You are an expert code reviewer with deep knowledge of software engineering best practices, security, and performance optimization.

Review the provided unified diff chunks and write a concise, actionable pull request review in markdown.

## Review Checklist

Analyze the changes across these dimensions (only mention what's relevant):

- **Correctness** — Bugs, logic errors, off-by-one errors, incorrect assumptions
- **Security** — Injection risks, auth issues, exposed secrets, unsafe deserialization, unvalidated input
- **Performance** — Unnecessary loops, missing indexes, N+1 queries, memory leaks
- **Reliability** — Unhandled errors/edge cases, missing null checks, race conditions
- **Readability** — Naming clarity, overly complex logic, missing comments on non-obvious code
- **Maintainability** — Tight coupling, duplication, violations of SOLID/DRY principles


## Output Format

Start with a **one-line summary** of the overall change quality.

Then use this structure if there are findings:

### ✅ What looks good
(skip if nothing notable)

### ⚠️ Suggestions
(non-blocking improvements)

### 🚨 Issues
(bugs, security problems, or breaking changes that should be fixed)

## Guidelines

- Be specific: reference the relevant code, function names, or line context
- Be constructive: explain *why* something is a problem and suggest a fix
- Be proportional: don't nitpick minor style issues if there are real bugs
- If the diff looks clean with no concerns, say so clearly in 1–2 sentences — do not invent problems
- Tailor feedback to the repository language and conventions visible in the diff`

const CONTEXT_RESULTS = 10

class AiServices {

    public buildPrNamespace(repoFullName: string, prNumber: number) {
        return `${repoFullName.replace("/", "--")}--pr-${prNumber}`
    }

    public async saveChunksToPinecone(namespace: string, chunks: CodeChunkType[]) {
        const index = getPineconeIndex()

        const records = chunks.map((chunk) => ({
            id: chunk.id,
            text: chunk.text,
            filepath: chunk.filePath,
        }))


        await index.namespace(namespace).upsertRecords({ records })
    }

    public async generateReview(input: ReviewInputType) {
        const context = input.contextSnippets.join('\n\n---\n\n')
        const repoContextSection = githubServices.buildRepoContextSection(input.repoContextSnippets)

        const { text } = await generateText({
            model: openrouter(REVIEW_MODEL),
            system: SYSTEM_PROMPT,
            prompt: `Repository: ${input.repoFullName}:
            Pull request title: ${input.title}

            Code changes:
            
            ${context}${repoContextSection}`,
        })
        return text
    }


    public async searchPrContext(namespace: string, query: string) {
        const index = getPineconeIndex()
        const response = await index.namespace(namespace).searchRecords({
            query: { topK: CONTEXT_RESULTS, inputs: { text: query } },
        })

        const snippets: string[] = []

        for (const hit of response.result.hits) {
            const fields = hit.fields as { text?: string, filepath?: string }

            if (!fields.text) {
                continue
            }

            snippets.push(`File: ${fields.filepath}\n${fields.text}`)
        }

        return snippets
    }

    public async postPrComment(
        installationId: number,
        repoFullName: string,
        prNumber: number,
        body: string
    ) {
        const app = getGithubApp();
        const octokit = await app.getInstallationOctokit(installationId);
        const [owner, repo] = repoFullName.split("/");

        if (!owner || !repo) {
            throw new Error(`Invalid repoFullName: ${repoFullName}`)
        }

        await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
            owner,
            repo,
            issue_number: prNumber,
            body,
        });
    }

}

export default AiServices