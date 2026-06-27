import { savePullRequest } from "@/features/reviews/server/save-pull-request";
import { getGithubApp } from "@repo/github";

export type PullRequestWebhookPayload = {
    action: string
    installation: { id: number }
    repository: { full_name: string }
    pull_request: {
        number: number
        title: string
        user: {
            login: string
            avatar_url?: string
        } | null
        head: { sha: string }
        base: { ref: string }
    }
}


const REVIEWABLE_ACTION = ['opened', 'reopened', 'synchronize']

async function isSignatureValid(payload: string, signature: string | null) {
    if (!signature) return false

    const app = getGithubApp()

    return app.webhooks.verify(payload, signature)

}


export async function handleGithubWebhook(request: Request) {
    const payload = await request.text() // it should be verified first then parsed
    const signature = request.headers.get('x-hub-signature-256')
    const eventName = request.headers.get('x-github-event')

    const isValid = await isSignatureValid(payload, signature)

    if (!isValid) {
        return Response.json({ error: 'Invalid signature' }, { status: 401 })
    }

    if (eventName !== 'pull_request') {
        return Response.json({ received: true })
    }


    const event = JSON.parse(payload) as PullRequestWebhookPayload

    console.log("event: ", event);
    

    if (!REVIEWABLE_ACTION.includes(event.action)) {
        return Response.json({ received: true })
    }

    const pullRequest = savePullRequest(event)


    // TODO: Map github installation id to user id
    // TODO: TriggerReview job

    return Response.json({ received: true })

}