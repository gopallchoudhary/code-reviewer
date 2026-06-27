import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createContext, serverRouter } from '@repo/trpc/server';
import { headers } from 'next/headers';

const handler = (req: Request) =>
    fetchRequestHandler({
        endpoint: '/api/trpc',
        req,
        router: serverRouter,
        createContext: () => createContext({ headers: req.headers }),
    });

export { handler as GET, handler as POST };
