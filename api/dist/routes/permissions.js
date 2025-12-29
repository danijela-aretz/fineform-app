"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const permissionManagement_1 = require("../services/permissionManagement");
const client_1 = __importDefault(require("../db/client"));
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Get all permissions for a client entity
router.get('/client/:clientEntityId', auth_1.authenticate, auth_1.requireAdmin, async (req, res, next) => {
    try {
        const [acl, taxPermissions, assignments] = await Promise.all([
            client_1.default.clientAcl.findMany({
                where: { clientId: req.params.clientEntityId },
                include: {
                    staff: {
                        include: {
                            profile: true,
                        },
                    },
                },
            }),
            client_1.default.clientStaffPermission.findMany({
                where: { clientId: req.params.clientEntityId },
                include: {
                    staff: {
                        include: {
                            profile: true,
                        },
                    },
                },
            }),
            client_1.default.clientStaffAssignment.findMany({
                where: { clientId: req.params.clientEntityId },
                include: {
                    staff: {
                        include: {
                            profile: true,
                        },
                    },
                },
            }),
        ]);
        res.json({
            acl,
            taxPermissions,
            assignments,
        });
    }
    catch (error) {
        next(error);
    }
});
// Add client to ACL
router.post('/client/:clientEntityId/acl', auth_1.authenticate, auth_1.requireAdmin, async (req, res, next) => {
    try {
        const { staffUserId } = zod_1.z.object({ staffUserId: zod_1.z.string() }).parse(req.body);
        const acl = await (0, permissionManagement_1.addClientAcl)(req.params.clientEntityId, staffUserId, req.userId);
        res.json(acl);
    }
    catch (error) {
        next(error);
    }
});
// Remove client from ACL
router.delete('/client/:clientEntityId/acl/:staffUserId', auth_1.authenticate, auth_1.requireAdmin, async (req, res, next) => {
    try {
        await (0, permissionManagement_1.removeClientAcl)(req.params.clientEntityId, req.params.staffUserId, req.userId);
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
// Grant tax access
router.post('/client/:clientEntityId/tax-access', auth_1.authenticate, auth_1.requireAdmin, async (req, res, next) => {
    try {
        const { staffUserId } = zod_1.z.object({ staffUserId: zod_1.z.string() }).parse(req.body);
        const permission = await (0, permissionManagement_1.grantTaxAccess)(req.params.clientEntityId, staffUserId, req.userId);
        res.json(permission);
    }
    catch (error) {
        next(error);
    }
});
// Revoke tax access
router.delete('/client/:clientEntityId/tax-access/:staffUserId', auth_1.authenticate, auth_1.requireAdmin, async (req, res, next) => {
    try {
        await (0, permissionManagement_1.revokeTaxAccess)(req.params.clientEntityId, req.params.staffUserId, req.userId);
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
// Assign staff to client
router.post('/client/:clientEntityId/assign', auth_1.authenticate, auth_1.requireAdmin, async (req, res, next) => {
    try {
        const { staffUserId, roleOnClient } = zod_1.z
            .object({
            staffUserId: zod_1.z.string(),
            roleOnClient: zod_1.z.enum(['preparer', 'assistant']),
        })
            .parse(req.body);
        const assignment = await (0, permissionManagement_1.assignStaffToClient)(req.params.clientEntityId, staffUserId, roleOnClient, req.userId);
        res.json(assignment);
    }
    catch (error) {
        next(error);
    }
});
// Unassign staff from client
router.delete('/client/:clientEntityId/assign/:staffUserId', auth_1.authenticate, auth_1.requireAdmin, async (req, res, next) => {
    try {
        await (0, permissionManagement_1.unassignStaffFromClient)(req.params.clientEntityId, req.params.staffUserId, req.userId);
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
// Get permission audit log
router.get('/client/:clientEntityId/audit', auth_1.authenticate, auth_1.requireAdmin, async (req, res, next) => {
    try {
        const auditLog = await (0, permissionManagement_1.getPermissionAuditLog)(req.params.clientEntityId);
        res.json(auditLog);
    }
    catch (error) {
        next(error);
    }
});
// Get all staff (for dropdowns)
router.get('/staff', auth_1.authenticate, auth_1.requireAdmin, async (req, res, next) => {
    try {
        const staff = await client_1.default.staffProfile.findMany({
            where: { active: true },
            include: {
                profile: true,
            },
            orderBy: {
                profile: {
                    fullName: 'asc',
                },
            },
        });
        res.json(staff);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
