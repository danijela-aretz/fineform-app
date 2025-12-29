"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureEntityTaxYear = ensureEntityTaxYear;
exports.computeChecklistCompletion = computeChecklistCompletion;
exports.computeReadyForPrep = computeReadyForPrep;
exports.getBlockingReasons = getBlockingReasons;
exports.validateStatusTransition = validateStatusTransition;
const client_1 = __importDefault(require("../db/client"));
/**
 * Create or ensure entity_tax_year container exists
 */
async function ensureEntityTaxYear(clientEntityId, taxYear) {
    const existing = await client_1.default.entityTaxYear.findUnique({
        where: {
            clientEntityId_taxYear: {
                clientEntityId,
                taxYear,
            },
        },
    });
    if (existing) {
        return existing;
    }
    return await client_1.default.entityTaxYear.create({
        data: {
            clientEntityId,
            taxYear,
            taxReturnExpected: true,
            inviteStatus: 'NOT_SENT',
            engagementStatus: 'NOT_STARTED',
            docConfirmationStatus: 'NOT_SIGNED',
            questionnaireStatus: 'NOT_STARTED',
            idStatus: 'INVALID',
            internalStatus: 'INVITED',
            readyForPrep: false,
        },
    });
}
/**
 * Compute checklist completion percentage
 */
async function computeChecklistCompletion(entityTaxYearId) {
    const checklistItems = await client_1.default.checklistItem.findMany({
        where: { entityTaxYearId },
    });
    const requiredItems = checklistItems.filter((item) => item.required);
    const completedItems = requiredItems.filter((item) => item.status === 'RECEIVED' || item.status === 'NOT_APPLICABLE');
    const requiredCount = requiredItems.length;
    const receivedCount = completedItems.length;
    const complete = requiredCount > 0 && receivedCount === requiredCount;
    const percentage = requiredCount > 0 ? (receivedCount / requiredCount) * 100 : 0;
    // Get current state
    const entityTaxYear = await client_1.default.entityTaxYear.findUnique({
        where: { id: entityTaxYearId },
    });
    if (!entityTaxYear) {
        throw new Error('Entity tax year not found');
    }
    const wasComplete = !!entityTaxYear.checklistCompleteAt;
    const isNowComplete = complete;
    // Update entity_tax_year
    await client_1.default.entityTaxYear.update({
        where: { id: entityTaxYearId },
        data: {
            docsRequiredCount: requiredCount,
            docsReceivedCount: receivedCount,
            checklistCompleteAt: complete ? new Date() : null,
        },
    });
    // Auto-transition status if checklist just completed
    if (!wasComplete && isNowComplete) {
        // Move to AWAITING_CONFIRMATION if currently COLLECTING_DOCS
        if (entityTaxYear.internalStatus === 'COLLECTING_DOCS') {
            try {
                const { transitionStatus } = await Promise.resolve().then(() => __importStar(require('./statusTransitions')));
                await transitionStatus(entityTaxYearId, 'AWAITING_CONFIRMATION', 'system', 'Checklist completed');
            }
            catch (error) {
                // Silently fail if transition not valid
                console.error('Failed to auto-transition status:', error);
            }
        }
    }
    // Initialize reminder states if needed (for document reminders)
    try {
        const { getOrCreateReminderState } = await Promise.resolve().then(() => __importStar(require('./reminders')));
        await getOrCreateReminderState(entityTaxYearId, 'DOCUMENTS');
    }
    catch (error) {
        // Silently fail if reminders not initialized yet
        console.error('Failed to initialize reminder state:', error);
    }
    return { complete, percentage, requiredCount, receivedCount };
}
/**
 * Compute Ready for Prep gate
 * All requirements must be satisfied:
 * - Engagement fully signed
 * - Checklist 100% complete
 * - Document confirmation signed
 * - Questionnaire submitted
 * - ID valid
 */
async function computeReadyForPrep(entityTaxYearId) {
    const entityTaxYear = await client_1.default.entityTaxYear.findUnique({
        where: { id: entityTaxYearId },
    });
    if (!entityTaxYear) {
        return false;
    }
    // Check all requirements
    const engagementFullySigned = entityTaxYear.engagementStatus === 'FULLY_SIGNED';
    const checklistComplete = await computeChecklistCompletion(entityTaxYearId);
    const checklist100Percent = checklistComplete.complete;
    const confirmationSigned = entityTaxYear.docConfirmationStatus === 'SIGNED';
    const questionnaireSubmitted = entityTaxYear.questionnaireStatus === 'COMPLETED';
    const idValid = entityTaxYear.idStatus === 'VALID';
    const readyForPrep = engagementFullySigned &&
        checklist100Percent &&
        confirmationSigned &&
        questionnaireSubmitted &&
        idValid;
    // Update entity_tax_year
    await client_1.default.entityTaxYear.update({
        where: { id: entityTaxYearId },
        data: {
            readyForPrep,
        },
    });
    return readyForPrep;
}
/**
 * Get blocking reasons for Ready for Prep
 */
async function getBlockingReasons(entityTaxYearId) {
    const entityTaxYear = await client_1.default.entityTaxYear.findUnique({
        where: { id: entityTaxYearId },
    });
    if (!entityTaxYear) {
        return ['Entity tax year not found'];
    }
    const reasons = [];
    if (entityTaxYear.engagementStatus !== 'FULLY_SIGNED') {
        reasons.push('Engagement not fully signed');
    }
    const checklistComplete = await computeChecklistCompletion(entityTaxYearId);
    if (!checklistComplete.complete) {
        reasons.push(`Checklist incomplete (${checklistComplete.receivedCount}/${checklistComplete.requiredCount})`);
    }
    if (entityTaxYear.docConfirmationStatus !== 'SIGNED') {
        reasons.push('Document confirmation not signed');
    }
    if (entityTaxYear.questionnaireStatus !== 'COMPLETED') {
        reasons.push('Questionnaire not submitted');
    }
    if (entityTaxYear.idStatus !== 'VALID') {
        reasons.push('ID not valid');
    }
    return reasons;
}
/**
 * Validate status transition
 */
function validateStatusTransition(oldStatus, newStatus) {
    // Define valid transitions
    const validTransitions = {
        INVITED: ['ENGAGED'],
        ENGAGED: ['COLLECTING_DOCS'],
        COLLECTING_DOCS: ['AWAITING_CONFIRMATION', 'READY_FOR_PREP'],
        AWAITING_CONFIRMATION: ['READY_FOR_PREP'],
        READY_FOR_PREP: ['IN_PREP'],
        IN_PREP: ['AWAITING_EFILE_AUTH'],
        AWAITING_EFILE_AUTH: ['FILED'],
        FILED: [], // Final status
    };
    const allowed = validTransitions[oldStatus] || [];
    if (allowed.includes(newStatus)) {
        return { valid: true };
    }
    // Allow but warn for edge cases
    return {
        valid: true, // Soft validation - allow but log
        warning: `Unusual transition from ${oldStatus} to ${newStatus}`,
    };
}
