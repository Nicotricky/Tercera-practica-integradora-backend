import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import config from './config.js'
import nodemailer from 'nodemailer'

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10))

export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password) 

// la función token.
// los payload son los datos que queremos guardar
export const generateToken = (user, duration) => jwt.sign(user, config.PRIVATE_KEY, { expiresIn: duration })

//función de prueba de parámetros no válidos
export const listNumbers = (...numbers) => {
    numbers.forEach(number => {
        if (isNaN(number)) {
            console.log('Invalid parameters')
            process.exit(-4)
        } else {
            console.log(number)
        }
    })
}

export const mailerService = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: config.GOOGLE_APP_EMAIL,
        pass: config.GOOGLE_APP_PASS
    }
})

export const sendConfirmation = () => {
    return async (req, res, next) => {
        try {
            // Envio de correo:
            const subject = 'LADYCommerce confirmación de registro'
            const html = `
                <h1>LADYCommerce confirmación de registro</h1>
                <p>Muchas gracias por registrarte ${req.user.first_name} ${req.user.last_name}!, te hemos dado de alta en nuestro sistema con el email ${req.user.email}</p>
            `

            await mailerService.sendMail({
                from: config.GOOGLE_APP_EMAIL,
                to: req.user.email,
                subject: subject,
                html: html
            }) 

            next()
        } catch (err) {
            res.status(500).send({ status: 'ERR', data: err.message })
        }
    }
}

export const sendRestore = () => {
    return async (req, res, next) => {
        try {
            // Envio de correo:
            const subject = 'Restablecimiento de contraseña'
            const html = `
                <h1>Restablecimiento de Contraseña</h1>
                <p>Para restablecer su contraseña, por favor ingrese en el siguiente enlace: 
                <a href="http://localhost:8080/api/sessions/restorePass/${access_token}">Haga click aquí</a>
                `

            await mailerService.sendMail({
                from: config.GOOGLE_APP_EMAIL,
                to: req.user.email,
                subject: subject,
                html: html
            }) 

            next()
        } catch (err) {
            res.status(500).send({ status: 'ERR', data: err.message })
        }
    }
}