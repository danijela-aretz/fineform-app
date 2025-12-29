"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const invites_1 = require("../services/invites");
const zod_1 = require("zod");
const client_1 = __importDefault(require("../db/client"));
const router = (0, express_1.Router)();
const queueSchema = zod_1.z.object({
    entityIds: zod_1.z.array(zod_1.z.string()),
    taxYear: zod_1.z.number(),
});
// Queue entities for invite
router.post('/queue', auth_1.authenticate, auth_1.requireAdmin, async (req, res, next) => {
    try {
        const { entityIds, taxYear } = queueSchema.parse(req.body);
        const results = await (0, invites_1.queueEntitiesForInvite)(entityIds, taxYear);
        res.json({
            success: true,
            queued: results.length,
            entities: results,
        });
    }
    catch (error) {
        next(error);
    }
});
// Get invite queue
router.get('/queue', auth_1.authenticate, auth_1.requireAdmin, async (req, res, next) => {
    try {
        const { status, taxYear } = req.query;
        const where = {
            taxReturnExpected: true,
        };
        if (status) {
            where.inviteStatus = status;
        }
        if (taxYear) {
            where.taxYear = parseInt(taxYear);
        }
        const entityTaxYears = await client_1.default.entityTaxYear.findMany({
            where,
            include: {
                clientEntity: {
                    include: {
                        account: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(entityTaxYears);
    }
    catch (error) {
        next(error);
    }
});
// Trigger invite send wave
router.post('/send', auth_1.authenticate, auth_1.requireAdmin, async (req, res, next) => {
    try {
        const { entityTaxYearIds } = req.body;
        if (!Array.isArray(entityTaxYearIds)) {
            return res.status(400).json({ message: 'entityTaxYearIds must be an array' });
        }
        // Update status to SENT (n8n will process and call webhook)
        await client_1.default.entityTaxYear.updateMany({
            where: {
                id: { in: entityTaxYearIds },
            },
            data: {
                inviteStatus: 'SENT',
            },
        });
        // In production, this would trigger n8n workflow
        // For now, return success
        res.json({
            success: true,
            message: 'Invite wave triggered',
            count: entityTaxYearIds.length,
        });
    }
    catch (error) {
        next(error);
    }
});
// Webhook: Update invite delivery status (called by n8n)
router.post('/webhooks/invite-delivery', async (req, res, next) => {
    try {
        // In production, verify webhook signature
        const { entityTaxYearId, status, error } = req.body;
        if (!entityTaxYearId || !status) {
            return res.status(400).json({ message: 'entityTaxYearId and status required' });
        }
        await (0, invites_1.updateInviteDeliveryStatus)(entityTaxYearId, status, error);
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
