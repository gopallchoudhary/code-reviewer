import UserService from '@repo/services/user'
import GithubService from '@repo/services/github'
import AiServices from '@repo/services/ai'
import ReposyncService from '@repo/services/reposync'

export const userService = new UserService()
export const githubService = new GithubService()
export const aiService = new AiServices()
export const reposyncService = new ReposyncService()
