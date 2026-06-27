import { initTRPC, TRPCError } from "@trpc/server";
import { createContext } from "./context";


export const tRPCContext = initTRPC
    .context<typeof createContext>()
    .create({});


export const router = tRPCContext.router

export const publicProcedure = tRPCContext.procedure

// create authenticated procedure
export const protectedProcedure = tRPCContext.procedure.use(({ ctx, next }) => {
    if (!ctx.session) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
    }
    return next({
        ctx: {
            ...ctx,
            user: ctx.session.user,
            session: ctx.session.session
        }
    })
})
