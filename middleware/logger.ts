import colors from 'colors'

const logger = (req, res, next) => {
    const methodColors = {
        GET: 'green',
        POST: 'blue',
        PUT: 'yellow',
        DELETE: 'red'
    }

    const color = methodColors[req.method] || 'white'
    const log =`${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`
    console.log(colors[color](log))
    next()
}

export default logger