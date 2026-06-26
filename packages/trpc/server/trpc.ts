import { initTRPC } from "@trpc/server";
import { createContext } from "./context";


export const tRPCContext = initTRPC
    .context<typeof createContext>()
    .create({});


export const router = tRPCContext.router

export const publicProcedure = tRPCContext.procedure