export {inngest} from "./inngest/client"
export {serve} from 'inngest/next'
export {processTask, reviewPullRequest, syncRepoCodeBase} from './inngest/function'

import GithubServices from '@repo/services/github'
import AiServices from '@repo/services/ai'
import UserService from '@repo/services/user'
import ReposyncServices from '@repo/services/reposync'

export const githubServices = new GithubServices()
export const aiServices = new AiServices()
export const userService = new UserService()
export const reposyncServices = new ReposyncServices()