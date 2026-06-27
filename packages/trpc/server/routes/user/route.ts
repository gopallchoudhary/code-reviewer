import { userService } from "../../services";
import { protectedProcedure, publicProcedure, router } from "../../trpc";



export const userRouter = router({
    getLoggedInUserInfo: protectedProcedure.query(({ctx}) => {
        return {
            name: ctx.user.name,
            email: ctx.user.email,
            userId: ctx.user.id,
            imageUrl: ctx.user.image,
            isEmailVerified: ctx.user.emailVerified,
        }
        
    })
})