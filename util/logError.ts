import { Request } from "express"
import logger from "./logger"
import { query } from "winston"


export default function logError(message: string, error: Error, req?: Request){
    const log = {
        stack: error.stack,
        route: req?.originalUrl,
        method: req?.method,
        params: req?.params,
        query: req?.query
    }
    if(req){
        console.log(req.method)

    }

    logger.error(message, log)
    return log
}