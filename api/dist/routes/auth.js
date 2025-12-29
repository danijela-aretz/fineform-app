"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = __importDefault(require("../db/client"));
const errorHandler_1 = require("../middleware/errorHandler");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
// Login
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        // Find user
        const user = await client_1.default.user.findUnique({
            where: { email },
            include: {
                profile: {
                    include: {
                        staffProfile: true,
                    },
                },
            },
        });
        if (!user || !user.profile) {
            throw new errorHandler_1.AppError('Invalid credentials', 401);
        }
        // Verify password
        const isValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValid) {
            throw new errorHandler_1.AppError('Invalid credentials', 401);
        }
        // Check if profile is active
        if (!user.profile.active) {
            throw new errorHandler_1.AppError('Account is inactive', 403);
        }
        // Generate tokens
        const payload = {
            userId: user.id,
            email: user.email,
            userType: user.profile.userType,
            staffRole: user.profile.staffProfile?.staffRole || null,
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '15m',
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: '7d',
        });
        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                userType: user.profile.userType,
                fullName: user.profile.fullName,
                staffRole: user.profile.staffProfile?.staffRole || null,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// Refresh token
router.post('/refresh', async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw new errorHandler_1.AppError('Refresh token required', 401);
        }
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        // Verify user still exists and is active
        const user = await client_1.default.user.findUnique({
            where: { id: decoded.userId },
            include: {
                profile: {
                    include: {
                        staffProfile: true,
                    },
                },
            },
        });
        if (!user || !user.profile || !user.profile.active) {
            throw new errorHandler_1.AppError('Invalid refresh token', 401);
        }
        // Generate new access token
        const payload = {
            userId: user.id,
            email: user.email,
            userType: user.profile.userType,
            staffRole: user.profile.staffProfile?.staffRole || null,
        };
        const newAccessToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '15m',
        });
        res.json({ accessToken: newAccessToken });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
