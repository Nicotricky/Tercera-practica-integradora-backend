import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { createHash, isValidPassword, generateToken, sendConfirmation, sendRestore } from '../utils.js'
import initPassport from '../auth/passport.auth.js'
import { passportCall, authToken } from '../auth/authToken.pass.js'
import { handlePolicies } from '../middlewares/authenticate.js'
import userModel from '../models/users.model.js'
import nodemailer from 'nodemailer'
import config from '../config.js'
import UsersManager from '../controllers/UserManager.js'

initPassport()

//const userManager = new UsersManager()
const router = Router()

// cerrar sesion
router.get('/logout', async (req, res) => {
    try {
        req.user = {}
        res.clearCookie('newCommerce')

        req.session.destroy((err) => {
            if (err) {
                res.status(500).send({ status: 'ERR', data: err.message })
            } else {
                res.redirect('/login')
            }
        })
    } catch (err) {
        res.status(500).send({ status: "ERR", data: err.message })
    }
})

//para hashear passwords planos anteriores. Es un endpoint de uso interno!
router.get('/hash/:pass', async (req, res) => {
    res.status(200).send({ status: 'OK', data: createHash(req.params.pass) })
})

//endpoint de fail de register
router.get('/failregister', async (req, res) => {
    res.status(400).send({ status: 'ERR', data: 'El email ya existe o faltan completar campos obligatorios' })
})

//endpoint de fail restore
router.get('/failrestore', async (req, res) => {
    res.status(400).send({ status: 'ERR', data: 'El email no existe o faltan completar campos obligatorios' })
})

//ruta de autenticación fail de login
router.get('/failauth', async (req, res) => {
    res.status(400).send({ status: 'ERR', data: 'Ha habido un error en el login' })
})

//endpoint de github con autenticación con passport
router.get('/github', passportCall('githubAuth', { scope: ['user: email'] }), async (req, res) => {
})

//endpoint de callback de github
router.get('/githubcallback', passportCall('githubAuth', { failureRedirect: '/login' }), async (req, res) => {
    req.session.user = { username: req.user.email, admin: true }
    //req.session.user = req.user
    res.redirect('/profile')
})

// tengo que ser un admin para poder ingesar
router.get('/current', authToken, passportCall('jwtAuth', { session: false }), handlePolicies(['admin']), async (req, res) => {
    res.status(200).send({ status: 'OK', data: req.user })
})

//login con token
/*
router.post('/login', async (req, res) => {
    try { 
        const { email, password } = req.body

        const userInDb = await usersModel.findOne({ email: email })

        if (userInDb !== null && isValidPassword(userInDb, password)) {
            //req.session.user = { username: email, admin: true } 
            //res.redirect('/products')

            const access_token = generateToken({ username: email, role: 'admin' }, '1h')
            //res.status(200).send({ status: 'OK', data: access_token })
           // res.redirect(`/profile?access_token=${access_token}`)
            res.cookie('newCommerce', access_token, { maxAge: 60 * 60 * 1000, httpOnly: true })
            //res.status(200).send({ status: 'OK', data: { access: "authorized", token: access_token } })
            res.redirect(`/profile?access_token=${access_token}`)
        } else {
            res.status(401).send({ status: 'ERR', data: `Datos no válidos` })
        } 
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
        }
})
*/

router.post('/login', passportCall('loginAuth', { failureRedirect: '/login?msg=Usuario o clave no válidos', session: false }), async (req, res) => {
    const access_token = generateToken(req.user, '1h')
    res.cookie('newCommerce', access_token, { maxAge: 60 * 60 * 1000, httpOnly: true })
    setTimeout(() => res.redirect('/products'), 200)
})

//register con passport
router.post('/register', passportCall('register', { failureRedirect: '/api/sessions/failregister' }), sendConfirmation('email', 'register'), async (req, res) => {
    try {
        res.status(200).send({ status: 'OK', data: 'Usuario registrado' })
        //res.redirect('/login')
    } catch(err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

router.post('/restore', async (req, res) => {
    try {
        const email = req.body.email
        if (!email) return res.status(400).send({ status: "error", error: "Valores inexistentes" })

        //Verificar existencia de usuario en db
        const user = await userModel.findOne({ email })
        if (!user) return res.status(400).send({ status: "error", error: "Usuario no encontrado" })

        // Si el usuario si existe se genera un token
        const token = generateToken({ email }, '1h')
        //console.log(token)

        const resetUrl = `http://${req.headers.host}/restorePass/${token}`
        console.log(resetUrl)

        // Enviar un correo con el enlace para restablecer la contraseña
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            auth: {
                user: config.GOOGLE_APP_EMAIL,
                pass: config.GOOGLE_APP_PASS
            }
        }) 

        const mailOptions = {
            from: config.GOOGLE_APP_EMAIL,
            to: email,
            subject: "Restablecer contraseña",
            html: `
            <div>
            <h1>Restablecer contraseña</h1>
            <p>Ingrese en el siguiente enlace: 
            <a href="http://${req.headers.host}/restorePass/${token}">Haga click aquí</a>
            </p>
            </div>
            `
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error)
            } else {
                // res.cookie('newCommerce', token, { maxAge: 60 * 60 * 1000, httpOnly: true })
                res.status(200).send({ status: 'OK', data: "Revise su correo, se le envió un enlace para restablecer su contraseña" })
            }
        })

    } catch (error) {
        res.status(500).send({ status: 'OK', data: "Error al enviar correo y restablecer contraseña" })
    }
})

// Actualizar contraseña
// al parecer el post y el action en handlebars no logra coincidir con el router --- 
router.post('/restorePass/:token', async (req, res) => {
    try {
        const { token } = req.params 
        if(!token) return res.status(400).send({ status: "ERR", error: "Token inexistente" })

        const newPassword = req.body
        if (!newPassword) return res.status(400).send({ status: 'ERR', data: 'Por favor ingrese la nueva contraseña' })

        const { email } = jwt.verify(token, config.PRIVATE_KEY)
        const user = await userModel.findOne(email)
        if (!user) return res.status(400).send({ status: 'ERR', data: 'Usuario inexistente' })

        if (isValidPassword(user, newPassword)) return res.status(400).send({ status: 'ERR', data: 'Las contraseñas deben ser diferentes' })

        // //actualizar la constraseña
        user.password = createHash(newPassword)

        //Actualizamos usuario en la base con su nuevo password.
        await UsersManager.updateUser(user._id, user)

        res.status(200).send({ status: 'OK', data: 'Contraseña actualizada' })

    } catch (err) {
        res.status(500).send({ status: 'OK', data: err.message })
    }
})

export default router