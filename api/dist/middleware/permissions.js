"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAssignment = exports.checkTaxAccessMiddleware = exports.checkEntityAccess = void 0;
const permissions_1 = require("../services/permissions");
const errorHandler_1 = require("./errorHandler");
/**
 * Middleware to check if staff can access a client entity
 */
const checkEntityAccess = async (req, res, next) => {
    try {
        if (req.userType !== 'STAFF') {
            return next(new errorHandler_1.AppError('Staff access required', 403));
        }
        const clientEntityId = req.params.clientId || req.params.id || req.body.clientId;
        if (!clientEntityId) {
            return next(new errorHandler_1.AppError('Client entity ID required', 400));
        }
        const result = await (0, permissions_1.checkClientVisibility)(req.userId, clientEntityId);
        if (!result.canAccess) {
            return next(new errorHandler_1.AppError(result.reason || 'Access denied', 403));
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.checkEntityAccess = checkEntityAccess;
/**
 * Middleware to check if staff can see tax-related items
 */
const checkTaxAccessMiddleware = async (req, res, next) => {
    try {
        if (req.userType !== 'STAFF') {
            return next(new errorHandler_1.AppError('Staff access required', 403));
        }
        const clientEntityId = req.params.clientId || req.params.id || req.body.clientId;
        if (!clientEntityId) {
            return next(new errorHandler_1.AppError('Client entity ID required', 400));
        }
        const result = await (0, permissions_1.checkTaxAccess)(req.userId, clientEntityId);
        if (!result.canAccess) {
            return next(new errorHandler_1.AppError(result.reason || 'Tax access denied', 403));
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.checkTaxAccessMiddleware = checkTaxAccessMiddleware;
/**
 * Middleware to check if staff is assigned to a client
 */
const checkAssignment = async (req, res, next) => {
    try {
        if (req.userType !== 'STAFF') {
            return next(new errorHandler_1.AppError('Staff access required', 403));
        }
        const clientEntityId = req.params.clientId || req.params.id || req.body.clientId;
        if (!clientEntityId) {
            return next(new errorHandler_1.AppError('Client entity ID required', 400));
        }
        // Super admin and admin don't need assignments
        if (req.staffRole === 'SUPER_ADMIN' || req.staffRole === 'ADMIN') {
            return next();
        }
        const result = await (0, permissions_1.checkStaffAssignment)(req.userId, clientEntityId);
        if (!result.canAccess) {
            return next(new errorHandler_1.AppError(result.reason || 'Not assigned to client', 403));
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.checkAssignment = checkAssignment;
