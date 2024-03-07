import { UserService } from '../services/users.mongo.dao.js'
import UserDTO from '../DTO/user.js'

const userService = new UserService()

class UsersManager {
    constructor() {
    }

    //obtener users
    getUsers = async () => {
        try {
            return await userService.getUsers()
        } catch (err) {
            return err.message
        }
    }

    createUser = async (first_name, last_name, email, age, password, cart, role) => {
        try {
            const newUser = new UserDTO({ first_name, last_name, email, age, password: createHash(password), cart, role })
            const result = await this.dao.createUser(newUser)
            return result
        } catch (err) {
            return err.message
        }
    }

    getUserById = async (uid) => {
        try {
            return await userService.getUserById(uid)
        } catch (err) {
            return err.message
        }
    }

    deleteUser = async (uid) => {
        try {
            return await userService.deleteUser(uid)
        } catch (err) {
            return err.message
        }
    }

    updateUser = async (uid, user) => {
        try {
            return await userService.updateUser(uid, user)
        } catch (err) {
            return err.message
        }
    }
}

export default UsersManager