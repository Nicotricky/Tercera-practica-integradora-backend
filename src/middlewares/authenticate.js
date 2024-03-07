import CustomError from '../services/error.custom.class.js'
import errorsDictionary from '../services/error.dictionary.js'

export const publicAccess = (req, res, next) => {
    if (req.user) {
        return res.redirect('/products')
    }
    next()
}

export const privateAccess = (req, res, next) => {
    if (!req.user) {
        return res.redirect('/login')
    }
    next()
}

export const handlePolicies = policies => {
    return async (req, res, next) => {
        if (!req.user) return next(new CustomError(errorsDictionary.UNAUTHORIZED_USER))

        // Normalizamos todo a mayúsculas para comparar efectivamente
        const userRole = req.user.role.toUpperCase()
        policies.forEach((policy, index) => policies[index] = policies[index].toUpperCase())

        if (policies.includes('PUBLIC') || policies.includes(userRole)) return next()
        return next(new CustomError(errorsDictionary.INSUFFICIENT_PERMISSIONS))
    }
}
