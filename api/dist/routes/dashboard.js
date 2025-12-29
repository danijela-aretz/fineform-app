"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const permissions_1 = require("../services/permissions");
const entityTaxYear_1 = require("../services/entityTaxYear");
const statusTransitions_1 = require("../services/statusTransitions");
const client_1 = __importDefault(require("../db/client"));
const router = (0, express_1.Router)();
// Get dashboard list (filtered by permissions)
router.get('/', auth_1.authenticate, auth_1.requireStaff, async (req, res, next) => {
    try {
        const { taxYear, status, assignedStaffId, extensionRequested, extensionFiled } = req.query;
        // Build where clause based on permissions
        const where = {};
        if (taxYear) {
            where.taxYear = parseInt(taxYear);
        }
        if (status) {
            where.internalStatus = status;
        }
        if (extensionRequested === 'true') {
            where.extensionRequested = true;
        }
        if (extensionFiled === 'true') {
            where.extensionFiled = true;
        }
        // Get all entity tax years (will filter by permissions in service)
        let entityTaxYears = await client_1.default.entityTaxYear.findMany({
            where,
            include: {
                clientEntity: {
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
                    },
                },
                reminderState: true,
            },
            orderBy: { updatedAt: 'desc' },
        });
        // Filter by permissions
        const filtered = [];
        for (const ety of entityTaxYears) {
            // Check client visibility
            const visibility = await (0, permissions_1.checkClientVisibility)(req.userId, ety.clientEntityId);
            if (!visibility.canAccess)
                continue;
            // Check tax access
            const taxAccess = await (0, permissions_1.checkTaxAccess)(req.userId, ety.clientEntityId);
            if (!taxAccess.canAccess)
                continue;
            // Filter by assigned staff if specified
            if (assignedStaffId) {
                const assignment = await client_1.default.clientStaffAssignment.findFirst({
                    where: {
                        clientId: ety.clientEntityId,
                        staffUserId: assignedStaffId,
                        active: true,
                    },
                });
                if (!assignment)
                    continue;
            }
            filtered.push(ety);
        }
        res.json(filtered);
    }
    catch (error) {
        next(error);
    }
});
// Get entity tax year detail
router.get('/:entityTaxYearId', auth_1.authenticate, auth_1.requireStaff, async (req, res, next) => {
    try {
        const entityTaxYear = await client_1.default.entityTaxYear.findUnique({
            where: { id: req.params.entityTaxYearId },
            include: {
                clientEntity: {
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
                    },
                },
                checklistItems: {
                    include: {
                        files: {
                            include: {
                                document: true,
                            },
                        },
                    },
                },
                reminderState: true,
                statusAuditLogs: {
                    include: {
                        staff: {
                            include: {
                                profile: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
            },
        });
        if (!entityTaxYear) {
            return res.status(404).json({ message: 'Entity tax year not found' });
        }
        // Check permissions
        const visibility = await (0, permissions_1.checkClientVisibility)(req.userId, entityTaxYear.clientEntityId);
        if (!visibility.canAccess) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const taxAccess = await (0, permissions_1.checkTaxAccess)(req.userId, entityTaxYear.clientEntityId);
        if (!taxAccess.canAccess) {
            return res.status(403).json({ message: 'Tax access denied' });
        }
        // Get blocking reasons
        const blockingReasons = await (0, entityTaxYear_1.getBlockingReasons)(req.params.entityTaxYearId);
        res.json({
            ...entityTaxYear,
            blockingReasons,
        });
    }
    catch (error) {
        next(error);
    }
});
// Transition status
router.post('/:entityTaxYearId/status', auth_1.authenticate, auth_1.requireStaff, async (req, res, next) => {
    try {
        const { newStatus, reason, allowSoftWarnings } = req.body;
        if (!newStatus) {
            return res.status(400).json({ message: 'newStatus required' });
        }
        // Check permissions
        const entityTaxYear = await client_1.default.entityTaxYear.findUnique({
            where: { id: req.params.entityTaxYearId },
        });
        if (!entityTaxYear) {
            return res.status(404).json({ message: 'Entity tax year not found' });
        }
        const visibility = await (0, permissions_1.checkClientVisibility)(req.userId, entityTaxYear.clientEntityId);
        if (!visibility.canAccess) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const result = await (0, statusTransitions_1.transitionStatus)(req.params.entityTaxYearId, newStatus, req.userId, reason, allowSoftWarnings === true);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
// Get status history
router.get('/:entityTaxYearId/history', auth_1.authenticate, auth_1.requireStaff, async (req, res, next) => {
    try {
        const history = await (0, statusTransitions_1.getStatusHistory)(req.params.entityTaxYearId);
        res.json(history);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
