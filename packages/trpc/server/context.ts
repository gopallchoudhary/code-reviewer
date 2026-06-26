

export interface tRPCContext {

}


export async function createContext() {
    const ctx: tRPCContext = {}
    return ctx
}

export type Context = Awaited<ReturnType<typeof createContext>>;