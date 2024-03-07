import usersModels from '../models/users.model.js'
import MongoSingleton from './mongoSingleton.js'

MongoSingleton.getInstance()

export class UserService {
    constructor() {
    }

    //obtener users
    getUsers = async () => {
        try {
            const users = await usersModels.find().lean()
            return users
        } catch (err) {
            return err.message
        }
    }

    // crear los users
    createUser = async (first_name, last_name, email, age, password, cart, role) => {
        try {
            const result = await usersModels.create(first_name, last_name, email, age, password, cart, role)
            return result
        } catch (err) {
            return err.message
        }
    }

    // buscar user por id
    getUserById = async (uid) => {
        try {
            const user = await usersModels.findById(uid)
            return user
        } catch (err) {
            return err.message
        }
    }

    deleteUser = async (uid) => {
        try {
            const userDelete = await usersModels.deleteOne({ _id: uid })
            return userDelete
        } catch (err) {
            return err.message
        }
    }

    updateUser = async (uid, user) => {
        try {
            const update = await usersModels.updateOne({ _id: uid }, user)
            return update
        } catch (err) {
            return err.message
        }
    }
}

