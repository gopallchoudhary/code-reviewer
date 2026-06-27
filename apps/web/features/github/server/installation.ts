import type { GithubInstallationStatus } from '@/features/dashboard/lib/types'
import { getGithubApp } from "@repo/github"
import { prisma } from "@repo/db"

interface IAccountLogin {
    login?: string
    slug?: string
}

function getAccountLogin(account: IAccountLogin | null | undefined): string | null {
    if (!account) return null

    if ('login' in account && account.login) return account.login
    if (account.slug) return account.slug
    return null
}


function buildDisconnectedStatus(): GithubInstallationStatus {
    return {
        connected: false,
        accountLogin: null,
        installedAt: null,
    }
}


export async function getInstallationStatus(userId: string) {
    const installation = await prisma.githubInstallation.findUnique({
        where: {
            userId
        }
    })

    if (!installation) {
        return buildDisconnectedStatus()
    }


    return {
        connected: true,
        accountLogin: installation.accountLogin,
        installedAt: installation.createdAt.toISOString(),
    }
}


export async function saveInstallation(userId: string, installationId: number) {
    const app = getGithubApp()

    const { data } = await app.octokit.request(
        "GET /app/installations/{installation_id}",
        {
            installation_id: installationId,
        }
    )

    const accountLogin = getAccountLogin(data.account)

    await prisma.githubInstallation.upsert({
        where: {
            userId,
        },
        create: {
            userId,
            installationId,
            accountLogin,
            accountType: data.target_type,
        },
        update: {
            installationId,
            accountLogin,
            accountType: data.target_type,
        },
    })
}

export async function deleteInstallation(userId: string) {
    await prisma.githubInstallation.delete({
        where: {
            userId,
        },
    })
}

export async function getUserByInstallationId(installationId: number) {
    const installation = await prisma.githubInstallation.findFirst({
        where: {
            installationId,
        },
        select: {
            userId: true,
        },
    })

    if (!installation) {
        return null
    }

    return installation.userId
}

export async function getUserInstallationId(userId: string) {
    const user = await prisma.githubInstallation.findFirst({
        where: {
            userId,
        },
        select: {
            installationId: true,
        },
    })

    if (!user) {
        return null
    }

    return user.installationId
}




//. assignment
// export async function deleteInstallation(userId: string, installationId: number) {
//     const app = getGithubApp()

//     await app.octokit.request(
//         "DELETE /app/installations/{installation_id}",
//         {
//             installation_id: installationId,
//         }
//     )

//     await prisma.githubInstallation.delete({
//         where: {
//             userId,
//             installationId,
//         },
//     })
// }