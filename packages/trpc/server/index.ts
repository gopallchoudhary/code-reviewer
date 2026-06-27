
import { router } from "./trpc";
import {userRouter} from "./routes/user/route"

export const serverRouter = router({
    user: userRouter,
})


export { createContext } from './context'
export type ServerRouter = typeof serverRouter