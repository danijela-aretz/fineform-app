"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const client_1 = __importDefault(require("../db/client"));
const router = (0, express_1.Router)();
// Get all entities (staff only for now)
router.get('/', auth_1.authenticate, auth_1.requireStaff, async (req, res, next) => {
    try {
        const entities = await client_1.default.clientEntity.findMany({
            include: {
                account: true,
                entityTaxYears: {
                    orderBy: { taxYear: 'desc' },
                    take: 1,
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(entities);
    }
    catch (error) {
        next(error);
    }
});
// Get entity by ID
router.get('/:id', auth_1.authenticate, async (req, res, next) => {
    try {
        const entity = await client_1.default.clientEntity.findUnique({
            where: { id: req.params.id },
            include: {
                account: {
                    include: {
                        accountUsers: {
                            include: {
                                profile: true,
                            },
                        },
                    },
                },
                entityTaxYears: {
                    orderBy: { taxYear: 'desc' },
                },
            },
        });
        if (!entity) {
            return res.status(404).json({ message: 'Entity not found' });
        }
        res.json(entity);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
