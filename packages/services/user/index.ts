import { auth } from '@repo/auth'
import { prisma } from '@repo/db';


class UserService {

    public async getUserInstallationId(userId: string) {
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
}

export default UserService