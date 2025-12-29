"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const statusTransitions_1 = require("../services/statusTransitions");
const client_1 = __importDefault(require("../db/client"));
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const signSchema = zod_1.z.object({
    signerName: zod_1.z.string().min(1),
    signerEmail: zod_1.z.string().email(),
    signatureData: zod_1.z.string(),
});
// Sign e-file authorization
router.post('/:entityTaxYearId/sign', auth_1.authenticate, async (req, res, next) => {
    try {
        const { signerName, signerEmail, signatureData } = signSchema.parse(req.body);
        const entityTaxYear = await client_1.default.entityTaxYear.findUnique({
            where: { id: req.params.entityTaxYearId },
        });
        if (!entityTaxYear) {
            return res.status(404).json({ message: 'Entity tax year not found' });
        }
        // Create e-file authorization
        const authorization = await client_1.default.efileAuthorization.create({
            data: {
                entityTaxYearId: req.params.entityTaxYearId,
                signerName,
                signerEmail,
                signatureData,
            },
        });
        // Transition to FILED status
        try {
            await (0, statusTransitions_1.transitionStatus)(req.params.entityTaxYearId, 'FILED', req.userId || 'system', 'E-file authorization signed');
        }
        catch (error) {
            // If transition fails, continue anyway
            console.error('Failed to transition to FILED:', error);
        }
        res.json({
            success: true,
            authorization,
            message: 'E-file authorization signed successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
// Get e-file authorization status
router.get('/:entityTaxYearId', auth_1.authenticate, async (req, res, next) => {
    try {
        const authorization = await client_1.default.efileAuthorization.findFirst({
            where: { entityTaxYearId: req.params.entityTaxYearId },
            orderBy: { signedAt: 'desc' },
        });
        res.json({
            signed: !!authorization,
            authorization: authorization || null,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
