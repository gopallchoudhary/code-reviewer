import { router } from "./trpc";


export const serverRouter = router({})


export {createContext} from './context'
export type ServerRouter = typeof serverRouter