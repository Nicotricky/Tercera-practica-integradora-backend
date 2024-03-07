import passport from 'passport'
import jwt from 'jsonwebtoken'
import config from '../config.js'

export const authToken = (req, res, next) => {
    const headerToken = req.headers.authorization ? req.headers.authorization.split(' ')[1]: undefined
    const cookieToken = req.cookies && req.cookies['newCommerce'] ? req.cookies['newCommerce']: undefined
    const queryToken = req.query.access_token ? req.query.access_token: undefined
    const receivedToken = headerToken || cookieToken || queryToken
    if (!receivedToken) return res.redirect('/login')

    jwt.verify(receivedToken, config.PRIVATE_KEY, (err, credentials) => {
        if (err) return res.status(403).send({ status: 'ERR', data: 'No autorizado' })
        req.user = credentials
        next()
    })
}

//middleware de autenticación de estrategias de passport, asi mejoramos los mensajes de error
export const passportCall = (strategy, options) => {
    return async (req, res, next) => {
        passport.authenticate(strategy, options, (err, user, info) => {
            if (err) return next(err)
            if (!user) return res.status(401).send({ status: 'ERR', data: info.messages ? info.messages: info.toString() })
            req.user = user
            next()
        })(req, res, next)
    }
}
