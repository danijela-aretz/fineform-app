"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../middleware/auth");
const extensions_1 = require("../services/extensions");
const client_1 = __importDefault(require("../db/client"));
const router = (0, express_1.Router)();
// Configure multer for extension document upload
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path_1.default.join(__dirname, '../../uploads/extensions');
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
});
// Request extension (client action)
router.post('/:entityTaxYearId/request', auth_1.authenticate, async (req, res, next) => {
    try {
        // Verify client has access to this entity
        const entityTaxYear = await client_1.default.entityTaxYear.findUnique({
            where: { id: req.params.entityTaxYearId },
            include: {
                clientEntity: {
                    include: {
                        account: {
                            include: {
                                accountUsers: true,
                            },
                        },
                    },
                },
            },
        });
        if (!entityTaxYear) {
            return res.status(404).json({ message: 'Entity tax year not found' });
        }
        // Check if user is a client for this entity
        if (req.userType === 'CLIENT') {
            const hasAccess = entityTaxYear.clientEntity.account.accountUsers.some((au) => au.userId === req.userId);
            if (!hasAccess) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }
        const updated = await (0, extensions_1.requestExtension)(req.params.entityTaxYearId);
        res.json({
            success: true,
            entityTaxYear: updated,
            message: 'Extension requested. All reminders have been paused.',
        });
    }
    catch (error) {
        next(error);
    }
});
// File extension (staff action)
router.post('/:entityTaxYearId/file', auth_1.authenticate, auth_1.requireStaff, upload.single('extensionDocument'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Extension document required' });
        }
        const updated = await (0, extensions_1.fileExtension)(req.params.entityTaxYearId, req.userId, req.file.path, req.file.originalname);
        res.json({
            success: true,
            entityTaxYear: updated,
            message: 'Extension filed successfully. Reminders will resume relative to extended due date.',
        });
    }
    catch (error) {
        next(error);
    }
});
// Get extension status
router.get('/:entityTaxYearId', auth_1.authenticate, async (req, res, next) => {
    try {
        const entityTaxYear = await client_1.default.entityTaxYear.findUnique({
            where: { id: req.params.entityTaxYearId },
            select: {
                extensionRequested: true,
                extensionFiled: true,
                extendedDueDate: true,
            },
        });
        if (!entityTaxYear) {
            return res.status(404).json({ message: 'Entity tax year not found' });
        }
        res.json(entityTaxYear);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
