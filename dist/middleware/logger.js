"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const colors_1 = __importDefault(require("colors"));
const logger = (req, res, next) => {
    const methodColors = {
        GET: 'green',
        POST: 'blue',
        PUT: 'yellow',
        DELETE: 'red'
    };
    const color = methodColors[req.method] || 'white';
    const log = `${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`;
    console.log(colors_1.default[color](log));
    next();
};
exports.default = logger;
