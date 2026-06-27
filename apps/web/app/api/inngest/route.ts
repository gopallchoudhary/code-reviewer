import { inngest, serve, processTask } from "@repo/jobs";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [processTask],
});