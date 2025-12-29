"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transitionStatus = transitionStatus;
exports.getStatusHistory = getStatusHistory;
const client_1 = __importDefault(require("../db/client"));
const entityTaxYear_1 = require("./entityTaxYear");
/**
 * Transition internal status with audit logging
 */
async function transitionStatus(entityTaxYearId, newStatus, changedBy, reason, allowSoftWarnings = false) {
    const entityTaxYear = await client_1.default.entityTaxYear.findUnique({
        where: { id: entityTaxYearId },
    });
    if (!entityTaxYear) {
        throw new Error('Entity tax year not found');
    }
    const oldStatus = entityTaxYear.internalStatus;
    // Check if transition is valid
    if (!isValidTransition(oldStatus, newStatus)) {
        throw new Error(`Invalid status transition from ${oldStatus} to ${newStatus}`);
    }
    // Check Ready for Prep gate
    let warning;
    if (newStatus === 'READY_FOR_PREP') {
        const ready = await (0, entityTaxYear_1.computeReadyForPrep)(entityTaxYearId);
        if (!ready) {
            const blockingReasons = await (0, entityTaxYear_1.getBlockingReasons)(entityTaxYearId);
            if (!allowSoftWarnings) {
                throw new Error(`Cannot transition to Ready for Prep. Blocking reasons: ${blockingReasons.join(', ')}`);
            }
            warning = `Warning: Ready for Prep requirements not met. Blocking: ${blockingReasons.join(', ')}`;
        }
    }
    // Soft warnings for other transitions
    if ((newStatus === 'IN_PREP' || newStatus === 'AWAITING_EFILE_AUTH') &&
        entityTaxYear.internalStatus !== 'READY_FOR_PREP') {
        if (!allowSoftWarnings) {
            const blockingReasons = await (0, entityTaxYear_1.getBlockingReasons)(entityTaxYearId);
            throw new Error(`Cannot transition to ${newStatus}. Not Ready for Prep. Blocking: ${blockingReasons.join(', ')}`);
        }
        const blockingReasons = await (0, entityTaxYear_1.getBlockingReasons)(entityTaxYearId);
        warning = `Warning: Not Ready for Prep. Blocking: ${blockingReasons.join(', ')}`;
    }
    // Update status
    const updated = await client_1.default.entityTaxYear.update({
        where: { id: entityTaxYearId },
        data: {
            internalStatus: newStatus,
        },
    });
    // Log audit trail
    await client_1.default.statusAuditLog.create({
        data: {
            entityTaxYearId,
            oldStatus,
            newStatus,
            changedBy,
            reason: reason || warning || null,
        },
    });
    return {
        success: true,
        warning,
        entityTaxYear: updated,
    };
}
/**
 * Check if status transition is valid
 */
function isValidTransition(oldStatus, newStatus) {
    // Same status is always valid
    if (oldStatus === newStatus) {
        return true;
    }
    // Define valid transitions
    const validTransitions = {
        INVITED: ['ENGAGED'],
        ENGAGED: ['COLLECTING_DOCS'],
        COLLECTING_DOCS: ['AWAITING_CONFIRMATION', 'READY_FOR_PREP'],
        AWAITING_CONFIRMATION: ['READY_FOR_PREP'],
        READY_FOR_PREP: ['IN_PREP'],
        IN_PREP: ['AWAITING_EFILE_AUTH', 'FILED'],
        AWAITING_EFILE_AUTH: ['FILED'],
        FILED: [], // Terminal status
    };
    return validTransitions[oldStatus]?.includes(newStatus) ?? false;
}
/**
 * Get status history (audit log)
 */
async function getStatusHistory(entityTaxYearId) {
    return await client_1.default.statusAuditLog.findMany({
        where: { entityTaxYearId },
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
