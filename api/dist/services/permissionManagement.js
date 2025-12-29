"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addClientAcl = addClientAcl;
exports.removeClientAcl = removeClientAcl;
exports.grantTaxAccess = grantTaxAccess;
exports.revokeTaxAccess = revokeTaxAccess;
exports.assignStaffToClient = assignStaffToClient;
exports.unassignStaffFromClient = unassignStaffFromClient;
exports.getPermissionAuditLog = getPermissionAuditLog;
const client_1 = __importDefault(require("../db/client"));
/**
 * Add client to ACL (restricted client access)
 */
async function addClientAcl(clientEntityId, staffUserId, changedBy) {
    // Check if already exists
    const existing = await client_1.default.clientAcl.findUnique({
        where: {
            clientId_staffUserId: {
                clientId: clientEntityId,
                staffUserId,
            },
        },
    });
    if (existing) {
        return existing;
    }
    const acl = await client_1.default.clientAcl.create({
        data: {
            clientId: clientEntityId,
            staffUserId,
        },
    });
    // Log audit
    await client_1.default.permissionAuditLog.create({
        data: {
            changeType: 'client_acl',
            clientId: clientEntityId,
            staffUserId,
            newValue: JSON.stringify({ action: 'GRANTED' }),
            changedBy,
        },
    });
    return acl;
}
/**
 * Remove client from ACL
 */
async function removeClientAcl(clientEntityId, staffUserId, changedBy) {
    const acl = await client_1.default.clientAcl.delete({
        where: {
            clientId_staffUserId: {
                clientId: clientEntityId,
                staffUserId,
            },
        },
    });
    // Log audit
    await client_1.default.permissionAuditLog.create({
        data: {
            changeType: 'client_acl',
            clientId: clientEntityId,
            staffUserId,
            newValue: JSON.stringify({ action: 'REVOKED' }),
            changedBy,
        },
    });
    return acl;
}
/**
 * Grant tax access to staff
 */
async function grantTaxAccess(clientEntityId, staffUserId, changedBy) {
    // Check if already exists
    const existing = await client_1.default.clientStaffPermission.findUnique({
        where: {
            clientId_staffUserId: {
                clientId: clientEntityId,
                staffUserId,
            },
        },
    });
    if (existing && existing.canSeeTaxes) {
        return existing;
    }
    const permission = await client_1.default.clientStaffPermission.upsert({
        where: {
            clientId_staffUserId: {
                clientId: clientEntityId,
                staffUserId,
            },
        },
        create: {
            clientId: clientEntityId,
            staffUserId,
            canSeeTaxes: true,
        },
        update: {
            canSeeTaxes: true,
        },
    });
    // Log audit
    await client_1.default.permissionAuditLog.create({
        data: {
            changeType: 'tax_permission',
            clientId: clientEntityId,
            staffUserId,
            newValue: JSON.stringify({ canSeeTaxes: true, action: 'GRANTED' }),
            changedBy,
        },
    });
    return permission;
}
/**
 * Revoke tax access from staff
 */
async function revokeTaxAccess(clientEntityId, staffUserId, changedBy) {
    const permission = await client_1.default.clientStaffPermission.update({
        where: {
            clientId_staffUserId: {
                clientId: clientEntityId,
                staffUserId,
            },
        },
        data: {
            canSeeTaxes: false,
        },
    });
    // Log audit
    await client_1.default.permissionAuditLog.create({
        data: {
            changeType: 'tax_permission',
            clientId: clientEntityId,
            staffUserId,
            newValue: JSON.stringify({ canSeeTaxes: false, action: 'REVOKED' }),
            changedBy,
        },
    });
    return permission;
}
/**
 * Assign staff to client
 */
async function assignStaffToClient(clientEntityId, staffUserId, roleOnClient, assignedBy) {
    // Check if already exists
    const existing = await client_1.default.clientStaffAssignment.findFirst({
        where: {
            clientId: clientEntityId,
            staffUserId,
        },
    });
    if (existing && existing.active) {
        // Update role if different
        if (existing.roleOnClient !== roleOnClient) {
            return await client_1.default.clientStaffAssignment.update({
                where: { id: existing.id },
                data: {
                    roleOnClient,
                    assignedBy,
                },
            });
        }
        return existing;
    }
    let assignment;
    if (existing) {
        assignment = await client_1.default.clientStaffAssignment.update({
            where: { id: existing.id },
            data: {
                roleOnClient,
                assignedBy,
                active: true,
            },
        });
    }
    else {
        assignment = await client_1.default.clientStaffAssignment.create({
            data: {
                clientId: clientEntityId,
                staffUserId,
                roleOnClient,
                assignedBy,
                active: true,
            },
        });
    }
    // Log audit
    await client_1.default.permissionAuditLog.create({
        data: {
            changeType: 'assignment',
            clientId: clientEntityId,
            staffUserId,
            newValue: JSON.stringify({ roleOnClient, action: 'ASSIGNED' }),
            changedBy: assignedBy,
        },
    });
    return assignment;
}
/**
 * Unassign staff from client
 */
async function unassignStaffFromClient(clientEntityId, staffUserId, changedBy) {
    const assignment = await client_1.default.clientStaffAssignment.findFirst({
        where: {
            clientId: clientEntityId,
            staffUserId,
        },
    });
    if (!assignment) {
        throw new Error('Assignment not found');
    }
    await client_1.default.clientStaffAssignment.update({
        where: { id: assignment.id },
        data: {
            active: false,
        },
    });
    // Log audit
    await client_1.default.permissionAuditLog.create({
        data: {
            changeType: 'assignment',
            clientId: clientEntityId,
            staffUserId,
            newValue: JSON.stringify({ action: 'UNASSIGNED' }),
            changedBy,
        },
    });
    return { success: true };
}
/**
 * Get permission audit log for client
 */
async function getPermissionAuditLog(clientEntityId) {
    return await client_1.default.permissionAuditLog.findMany({
        where: { clientId: clientEntityId },
        include: {
            staff: {
                include: {
                    profile: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
}
