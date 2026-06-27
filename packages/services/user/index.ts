import {auth} from '@repo/auth'


class UserService {

    public async getUserSession() {
        return await auth.api.getSession()
    }
}

export default UserService