import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createContext, serverRouter } from '@repo/trpc/server';

const handler = (req: Request) =>
    fetchRequestHandler({
        endpoint: '/api/trpc',
        req,
        router: serverRouter,
        createContext: () => createContext(),
    });

export { handler as GET, handler as POST };
