"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const engagement_1 = require("../services/engagement");
const zod_1 = require("zod");
const client_1 = __importDefault(require("../db/client"));
const folders_1 = require("../services/folders");
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
const signSchema = zod_1.z.object({
    signerName: zod_1.z.string().min(1),
    signerEmail: zod_1.z.string().email(),
    signatureData: zod_1.z.string(),
});
// Get engagement status
router.get('/:entityTaxYearId', auth_1.authenticate, async (req, res, next) => {
    try {
        const entityTaxYear = await client_1.default.entityTaxYear.findUnique({
            where: { id: req.params.entityTaxYearId },
            include: {
                engagementSignatures: {
                    orderBy: { signedAt: 'asc' },
                },
                clientEntity: true,
            },
        });
        if (!entityTaxYear) {
            return res.status(404).json({ message: 'Entity tax year not found' });
        }
        res.json({
            engagementStatus: entityTaxYear.engagementStatus,
            signatures: entityTaxYear.engagementSignatures,
            entityName: entityTaxYear.clientEntity.entityName,
            taxYear: entityTaxYear.taxYear,
        });
    }
    catch (error) {
        next(error);
    }
});
// Submit signature
router.post('/:entityTaxYearId/sign', auth_1.authenticate, async (req, res, next) => {
    try {
        const { signerName, signerEmail, signatureData } = signSchema.parse(req.body);
        const signature = await (0, engagement_1.storeEngagementSignature)(req.params.entityTaxYearId, signerName, signerEmail, signatureData);
        res.json({
            success: true,
            signature,
            message: 'Signature recorded successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
// Get signed PDF
router.get('/:entityTaxYearId/pdf', auth_1.authenticate, async (req, res, next) => {
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
        if (entityTaxYear.engagementStatus !== 'FULLY_SIGNED') {
            return res.status(400).json({ message: 'Engagement not fully signed' });
        }
        // Find PDF in Tax Returns folder
        const taxReturnsFolder = await (0, folders_1.getTaxReturnsFolder)(entityTaxYear.clientEntityId, entityTaxYear.taxYear);
        const yearFolder = await client_1.default.folder.findFirst({
            where: {
                clientId: entityTaxYear.clientEntityId,
                parentId: taxReturnsFolder.id,
                name: entityTaxYear.taxYear.toString(),
            },
        });
        if (!yearFolder) {
            return res.status(404).json({ message: 'Tax returns folder not found' });
        }
        const document = await client_1.default.document.findFirst({
            where: {
                folderId: yearFolder.id,
                displayName: { contains: 'Engagement Letter' },
            },
        });
        if (!document || !fs_1.default.existsSync(document.storagePath)) {
            return res.status(404).json({ message: 'Engagement PDF not found' });
        }
        res.download(document.storagePath, document.displayName);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
