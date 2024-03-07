import { Router } from 'express'
import { authToken } from '../auth/authToken.pass.js'
import { handlePolicies } from '../middlewares/authenticate.js'
import UserManager from '../controllers/UserManager.js'
import userModel from '../models/users.model.js'

const router = Router()
const controller = new UserManager()

router.get('/', authToken, handlePolicies(['admin']), async (req, res) => {
    try {
        const users = await controller.getUsers()
        res.status(200).send({ status: 'OK', data: users })
    } catch (err) {
        res.status(403).send({ status: 'ERR', data: 'Sin permisos suficientes' })
    }
})
// si no estoy logueado como admin me redireccionará al login

router.get("/:uid", authToken, handlePolicies(['ADMIN']), async (req, res) => {
    try {
        const uid = req.params.uid
        const user = await controller.getUserById(uid)
    
        res.status(200).send({ status: 'OK', data: user })
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

router.delete("/:uid", async (req, res) => {
    try {
        const uid = req.params.uid
        const userDeleted = await controller.deleteUser(uid)
    
        res.status(200).send({ status: 'OK', data: userDeleted })
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})  

// cambio de rol  
router.put('/premium/:uid', authToken, handlePolicies(['user']), async (req, res) => {
    try {
        const uid = req.params.uid
        const user = await userModel.findById(uid)
        if (!user) return res.status(404).send({ status: 'ERR', data: 'Usuario no encontrado' })

        if (user.role === "user") user.role = "premium"
        else user.role = "user"

        //Actualizamos usuario en la base con su nuevo role
        await userModel.updateOne({ _id: uid }, user)

        res.status(200).send({ status: 'OK', data: "Role cambiado exitosamente."})
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

export default router