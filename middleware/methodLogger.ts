import colors from 'colors'
import logger from '../util/logger'

const methodLogger = (req, res, next) => {
    const methodColors = {
        GET: 'green',
        POST: 'blue',
        PUT: 'yellow',
        DELETE: 'red'
    }

    const color = methodColors[req.method] || 'white'
    const log =`${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl} Status: ${res.statusCode}`
    console.log(colors[color](log))
    logger.info(log)
    next()
}

export default methodLogger