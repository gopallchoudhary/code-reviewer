// apps/web/lib/trpc/create-client.ts
import { httpBatchLink, httpBatchStreamLink } from "@trpc/client";

interface CreateTRPCHttpClientOpts {
    enableStreaming?: boolean;
}

export const createTRPCHttpClient = (opts?: CreateTRPCHttpClientOpts) => {
    const link = opts?.enableStreaming ? httpBatchStreamLink : httpBatchLink;

    return link({
        url: "/api/trpc", // same origin — no env var, no port, no credentials needed
    });
};