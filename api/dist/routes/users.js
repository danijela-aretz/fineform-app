"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const client_1 = __importDefault(require("../db/client"));
const router = (0, express_1.Router)();
// Get current user
router.get('/me', auth_1.authenticate, async (req, res, next) => {
    try {
        const user = await client_1.default.user.findUnique({
            where: { id: req.userId },
            include: {
                profile: {
                    include: {
                        staffProfile: true,
                    },
                },
            },
        });
        if (!user || !user.profile) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            id: user.id,
            email: user.email,
            userType: user.profile.userType,
            fullName: user.profile.fullName,
            active: user.profile.active,
            staffRole: user.profile.staffProfile?.staffRole || null,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
