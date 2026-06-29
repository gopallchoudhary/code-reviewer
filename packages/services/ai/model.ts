import { z } from 'zod'


export const reviewInput = z.object({
    repoFullName: z.string(),
    title: z.string(),
    contextSnippets: z.array(z.string()),
    repoContextSnippets: z.array(z.string()),
})

export type ReviewInputType = z.infer<typeof reviewInput>

export const codeChunk = z.object({
    id: z.string(),
    filePath: z.string(),
    text: z.string()
})

export type CodeChunkType = z.infer<typeof codeChunk>
