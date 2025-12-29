"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSuperAdmin = exports.requireAdmin = exports.requireStaff = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("./errorHandler");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorHandler_1.AppError('No token provided', 401);
        }
        const token = authHeader.substring(7);
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.userType = decoded.userType;
        req.staffRole = decoded.staffRole;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new errorHandler_1.AppError('Invalid token', 401));
        }
        else {
            next(error);
        }
    }
};
exports.authenticate = authenticate;
const requireStaff = (req, res, next) => {
    if (req.userType !== 'STAFF') {
        return next(new errorHandler_1.AppError('Staff access required', 403));
    }
    next();
};
exports.requireStaff = requireStaff;
const requireAdmin = (req, res, next) => {
    if (req.userType !== 'STAFF' || !['SUPER_ADMIN', 'ADMIN'].includes(req.staffRole || '')) {
        return next(new errorHandler_1.AppError('Admin access required', 403));
    }
    next();
};
exports.requireAdmin = requireAdmin;
const requireSuperAdmin = (req, res, next) => {
    if (req.userType !== 'STAFF' || req.staffRole !== 'SUPER_ADMIN') {
        return next(new errorHandler_1.AppError('Super admin access required', 403));
    }
    next();
};
exports.requireSuperAdmin = requireSuperAdmin;
