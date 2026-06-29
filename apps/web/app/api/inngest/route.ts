import { inngest, serve, processTask, reviewPullRequest, syncRepoCodeBase } from "@repo/jobs";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [processTask, reviewPullRequest, syncRepoCodeBase],
});