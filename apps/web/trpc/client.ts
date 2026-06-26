// apps/web/lib/trpc/client.ts
import { createTRPCClient } from "@trpc/client";
import { createTRPCOptionsProxy, type TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { ServerRouter } from "@repo/trpc";
import { createTRPCHttpClient } from "./create-client";
import { queryClient } from "./query-client";

const trpcClient = createTRPCClient<ServerRouter>({
    links: [createTRPCHttpClient()],
});

export const trpc: TRPCOptionsProxy<ServerRouter> = createTRPCOptionsProxy<ServerRouter>({
    client: trpcClient,
    queryClient,
});