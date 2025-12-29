"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const checklist_1 = require("../services/checklist");
const entityTaxYear_1 = require("../services/entityTaxYear");
const client_1 = __importDefault(require("../db/client"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    dest: path_1.default.join(__dirname, '../../uploads/proforma'),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
// Get checklist items
router.get('/:entityTaxYearId', auth_1.authenticate, async (req, res, next) => {
    try {
        const checklistItems = await client_1.default.checklistItem.findMany({
            where: { entityTaxYearId: req.params.entityTaxYearId },
            include: {
                files: {
                    include: {
                        document: true,
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
        res.json(checklistItems);
    }
    catch (error) {
        next(error);
    }
});
// Generate baseline checklist
router.post('/:entityTaxYearId/generate', auth_1.authenticate, auth_1.requireStaff, async (req, res, next) => {
    try {
        const entityTaxYear = await client_1.default.entityTaxYear.findUnique({
            where: { id: req.params.entityTaxYearId },
            include: {
                clientEntity: true,
            },
        });
        if (!entityTaxYear) {
            return res.status(404).json({ message: 'Entity tax year not found' });
        }
        // Check if checklist exists
        const existing = await client_1.default.checklistItem.findFirst({
            where: { entityTaxYearId: req.params.entityTaxYearId },
        });
        if (existing) {
            return res.status(400).json({ message: 'Checklist already exists' });
        }
        const items = await (0, checklist_1.createBaselineChecklist)(req.params.entityTaxYearId, entityTaxYear.clientEntity.entityType);
        res.json({
            success: true,
            items,
            message: 'Baseline checklist created',
        });
    }
    catch (error) {
        next(error);
    }
});
// Upload proforma (triggers n8n parsing)
router.post('/:entityTaxYearId/proforma', auth_1.authenticate, auth_1.requireStaff, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // Store proforma file
        // In production, this would trigger n8n workflow to parse
        // For now, return success and webhook endpoint info
        res.json({
            success: true,
            message: 'Proforma uploaded. Parsing will be triggered via webhook.',
            fileId: req.file.filename,
        });
    }
    catch (error) {
        next(error);
    }
});
// Webhook: Receive parsed checklist from n8n
router.post('/webhooks/checklist-generated', async (req, res, next) => {
    try {
        const { entityTaxYearId, items, fallback } = req.body;
        if (!entityTaxYearId) {
            return res.status(400).json({ message: 'entityTaxYearId required' });
        }
        // Check if checklist already exists
        const existing = await client_1.default.checklistItem.findFirst({
            where: { entityTaxYearId },
        });
        if (existing && !fallback) {
            return res.json({ success: true, message: 'Checklist already exists' });
        }
        let checklistItems;
        if (fallback || !items || items.length === 0) {
            // Use baseline checklist
            const entityTaxYear = await client_1.default.entityTaxYear.findUnique({
                where: { id: entityTaxYearId },
                include: {
                    clientEntity: true,
                },
            });
            if (!entityTaxYear) {
                return res.status(404).json({ message: 'Entity tax year not found' });
            }
            checklistItems = await (0, checklist_1.createBaselineChecklist)(entityTaxYearId, entityTaxYear.clientEntity.entityType);
        }
        else {
            // Create from parsed items
            checklistItems = await (0, checklist_1.createChecklistFromProforma)(entityTaxYearId, items);
        }
        res.json({
            success: true,
            items: checklistItems,
        });
    }
    catch (error) {
        next(error);
    }
});
// Add checklist item (staff)
router.post('/:entityTaxYearId/items', auth_1.authenticate, auth_1.requireStaff, async (req, res, next) => {
    try {
        const { itemName, itemType, required } = req.body;
        const item = await client_1.default.checklistItem.create({
            data: {
                entityTaxYearId: req.params.entityTaxYearId,
                itemName,
                itemType: itemType || null,
                required: required !== false,
                status: 'PENDING',
            },
        });
        // Recompute completion
        await (0, entityTaxYear_1.computeChecklistCompletion)(req.params.entityTaxYearId);
        res.json(item);
    }
    catch (error) {
        next(error);
    }
});
// Update checklist item
router.put('/:entityTaxYearId/items/:id', auth_1.authenticate, async (req, res, next) => {
    try {
        const { status, itemName, required, notes } = req.body;
        const item = await client_1.default.checklistItem.update({
            where: { id: req.params.id },
            data: {
                ...(status && { status }),
                ...(itemName && { itemName }),
                ...(required !== undefined && { required }),
                ...(notes !== undefined && { notes }),
                ...(status === 'RECEIVED' && { receivedAt: new Date() }),
                ...(status === 'NOT_APPLICABLE' && { markedNotApplicableAt: new Date() }),
            },
        });
        // Recompute completion
        await (0, entityTaxYear_1.computeChecklistCompletion)(req.params.entityTaxYearId);
        res.json(item);
    }
    catch (error) {
        next(error);
    }
});
// Delete checklist item (staff)
router.delete('/:entityTaxYearId/items/:id', auth_1.authenticate, auth_1.requireStaff, async (req, res, next) => {
    try {
        await client_1.default.checklistItem.delete({
            where: { id: req.params.id },
        });
        // Recompute completion
        await (0, entityTaxYear_1.computeChecklistCompletion)(req.params.entityTaxYearId);
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
