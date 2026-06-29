import { generateText, openrouter } from '@repo/ai'

const REVIEW_MODEL = 'openrouter/free'

const SYSTEM_PROMPT = ``


type ReviewInput = {
    repoFullName: string
    title: string
}


// build repo context section


