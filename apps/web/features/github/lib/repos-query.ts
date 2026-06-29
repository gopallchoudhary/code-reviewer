import { DashboardRepo } from "@/features/dashboard/lib/types";


type GithubReposPage = {
    repos: DashboardRepo[]
    totalCount: number
    page: number
    hasMore: boolean
}

const REPOS_STALE_TIME = 10 * 60 * 1000 // 10 minutes 