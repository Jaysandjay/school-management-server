"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToCamelCase = convertToCamelCase;
function convertToCamelCase(req, res, next) {
    function camelCaseKeys(obj) {
        if (Array.isArray(obj))
            return obj.map(camelCaseKeys);
        if (obj instanceof Date)
            return obj;
        if (obj !== null && typeof obj === "object") {
            return Object.fromEntries(Object.entries(obj).map(([key, value]) => [
                key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
                camelCaseKeys(value)
            ]));
        }
        return obj;
    }
    const originalJson = res.json.bind(res);
    res.json = (body) => {
        const camelCaseBody = camelCaseKeys(body);
        return originalJson(camelCaseBody);
    };
    next();
}
