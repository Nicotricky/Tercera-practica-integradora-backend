import winston from "winston"
import config from "../config.js"

const customLevelsOptions = {
    levels: {
        debug: 0,
        http: 1,
        info: 2,
        warning: 3,
        error: 4,
        fatal: 5
    },
    colors: {
        debug: 'white',
        http: 'green',
        info: 'blue',
        warning: 'yellow',
        error: 'red',
        fatal: 'magenta'
    }
}

const loggingConfig = new winston.createLogger({
    dev: [
        new winston.transports.Console({
            level: 'debug',
            format: winston.format.combine(
                winston.format.colorize({ colors: customLevelsOptions.colors}),
                winston.format.simple()
            ),
        })
    ],
    prod: [
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(
                winston.format.colorize({ colors: customLevelsOptions.colors}),
                winston.format.simple()
            ),
        }),
        new winston.transports.File({
            filename: `${config.__DIRNAME}/logs/errors.log`,
            level: 'error',
            format: winston.format.simple()
        }),
    ],
})

/*
const addLogger = (req, res, next) => {
    req.logger = winston.createLogger({
        levels: customLevelsOptions.levels,
        transports: loggingConfig[`${config.__DIRNAME}/logs/errors.log`]
    })
    req.logger.debug(`${req.method} at ${req.url} - ${new Date().toString()} `)
    next()
}
*/
const addLogger = (req, res, next) => {
    req.logger = loggingConfig
    req.logger.debug(`${req.method} en ${req.url} - ${new Date().toString()} `)
    next()
}


export default addLogger