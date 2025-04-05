"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'fallbackSecret'; // Use the same secret
const authMiddleware = (req, res, next) => {
    var _a;
    const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        // If no token is provided, send a 401 response and end the middleware chain.
        res.status(401).json({ message: 'No token provided' });
        return; // Ensure no further code is executed after the response is sent.
    }
    // Verify the token
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            // If the token is invalid, send a 401 response.
            res.status(401).json({ message: 'Unauthorized' });
            return; // Ensure no further code is executed after the response is sent.
        }
        // If the token is valid, attach the decoded user info to the request object.
        req.user = decoded;
        next(); // Continue to the next middleware or route handler.
    });
};
exports.default = authMiddleware;
