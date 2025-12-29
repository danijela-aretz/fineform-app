"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkClientVisibility = checkClientVisibility;
exports.checkTaxAccess = checkTaxAccess;
exports.checkStaffAssignment = checkStaffAssignment;
exports.getStaffWithAccess = getStaffWithAccess;
const client_1 = __importDefault(require("../db/client"));
/**
 * Check if staff can see a client entity
 */
async function checkClientVisibility(staffUserId, clientEntityId) {
    // Get staff profile
    const staff = await client_1.default.staffProfile.findUnique({
        where: { userId: staffUserId },
        include: { profile: true },
    });
    if (!staff || !staff.active) {
        return { canAccess: false, reason: 'Staff not found or inactive' };
    }
    // Super admin can always see
    if (staff.staffRole === 'SUPER_ADMIN') {
        return { canAccess: true };
    }
    // Get client entity
    const clientEntity = await client_1.default.clientEntity.findUnique({
        where: { id: clientEntityId },
    });
    if (!clientEntity) {
        return { canAccess: false, reason: 'Client entity not found' };
    }
    // If not restricted, all staff can see
    if (!clientEntity.isRestricted) {
        return { canAccess: true };
    }
    // If restricted, check ACL
    const aclEntry = await client_1.default.clientAcl.findUnique({
        where: {
            clientId_staffUserId: {
                clientId: clientEntityId,
                staffUserId: staffUserId,
            },
        },
    });
    if (aclEntry) {
        return { canAccess: true };
    }
    return { canAccess: false, reason: 'Client is restricted and staff not in ACL' };
}
/**
 * Check if staff can see tax-related items for a client
 */
async function checkTaxAccess(staffUserId, clientEntityId) {
    // Get staff profile
    const staff = await client_1.default.staffProfile.findUnique({
        where: { userId: staffUserId },
    });
    if (!staff || !staff.active) {
        return { canAccess: false, reason: 'Staff not found or inactive' };
    }
    // Super admin always can see taxes
    if (staff.staffRole === 'SUPER_ADMIN') {
        return { canAccess: true };
    }
    // Admin can see taxes for all clients by default
    if (staff.staffRole === 'ADMIN') {
        // Check if client is restricted (admin might be blocked by restricted logic)
        const clientEntity = await client_1.default.clientEntity.findUnique({
            where: { id: clientEntityId },
        });
        if (!clientEntity) {
            return { canAccess: false, reason: 'Client entity not found' };
        }
        // If client is restricted and admin not in ACL, no access
        if (clientEntity.isRestricted) {
            const aclEntry = await client_1.default.clientAcl.findUnique({
                where: {
                    clientId_staffUserId: {
                        clientId: clientEntityId,
                        staffUserId: staffUserId,
                    },
                },
            });
            if (!aclEntry) {
                return { canAccess: false, reason: 'Restricted client and admin not in ACL' };
            }
        }
        return { canAccess: true };
    }
    // Staff: only if explicitly granted
    const permission = await client_1.default.clientStaffPermission.findUnique({
        where: {
            clientId_staffUserId: {
                clientId: clientEntityId,
                staffUserId: staffUserId,
            },
        },
    });
    if (permission && permission.canSeeTaxes) {
        return { canAccess: true };
    }
    return { canAccess: false, reason: 'Tax access not granted to staff' };
}
/**
 * Check if staff is assigned to a client entity
 */
async function checkStaffAssignment(staffUserId, clientEntityId) {
    const assignment = await client_1.default.clientStaffAssignment.findFirst({
        where: {
            clientId: clientEntityId,
            staffUserId: staffUserId,
            active: true,
        },
    });
    if (assignment) {
        return { canAccess: true };
    }
    return { canAccess: false, reason: 'Staff not assigned to client' };
}
/**
 * Get all staff who can see a client (for notifications, etc.)
 */
async function getStaffWithAccess(clientEntityId) {
    const clientEntity = await client_1.default.clientEntity.findUnique({
        where: { id: clientEntityId },
    });
    if (!clientEntity) {
        return [];
    }
    const staffUserIds = [];
    // Always include super_admin and admin
    const superAdmins = await client_1.default.staffProfile.findMany({
        where: {
            staffRole: 'SUPER_ADMIN',
            active: true,
        },
        select: { userId: true },
    });
    staffUserIds.push(...superAdmins.map((s) => s.userId));
    const admins = await client_1.default.staffProfile.findMany({
        where: {
            staffRole: 'ADMIN',
            active: true,
        },
        select: { userId: true },
    });
    staffUserIds.push(...admins.map((s) => s.userId));
    // If restricted, only include ACL members
    if (clientEntity.isRestricted) {
        const aclMembers = await client_1.default.clientAcl.findMany({
            where: { clientId: clientEntityId },
            select: { staffUserId: true },
        });
        staffUserIds.push(...aclMembers.map((a) => a.staffUserId));
    }
    // Include assigned staff (Idir)
    const assignments = await client_1.default.clientStaffAssignment.findMany({
        where: {
            clientId: clientEntityId,
            active: true,
        },
        select: { staffUserId: true },
    });
    staffUserIds.push(...assignments.map((a) => a.staffUserId));
    // Remove duplicates
    return [...new Set(staffUserIds)];
}
