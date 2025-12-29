"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueEntitiesForInvite = queueEntitiesForInvite;
exports.generateInviteLink = generateInviteLink;
exports.updateInviteDeliveryStatus = updateInviteDeliveryStatus;
const client_1 = __importDefault(require("../db/client"));
const entityTaxYear_1 = require("./entityTaxYear");
/**
 * Queue entities for tax season invite
 */
async function queueEntitiesForInvite(entityIds, taxYear) {
    const results = [];
    for (const entityId of entityIds) {
        // Ensure entity_tax_year exists
        const entityTaxYear = await (0, entityTaxYear_1.ensureEntityTaxYear)(entityId, taxYear);
        // Update invite status
        const updated = await client_1.default.entityTaxYear.update({
            where: { id: entityTaxYear.id },
            data: {
                taxReturnExpected: true,
                inviteStatus: 'QUEUED',
            },
        });
        results.push(updated);
    }
    return results;
}
/**
 * Generate secure app link for invite
 */
function generateInviteLink(entityId, taxYear) {
    // In production, this would be a secure token-based link
    // For now, return a link with entity context
    const baseUrl = process.env.CLIENT_APP_URL || 'http://localhost:8081';
    return `${baseUrl}/invite?entity=${entityId}&year=${taxYear}`;
}
/**
 * Update invite delivery status (called by n8n webhook)
 */
async function updateInviteDeliveryStatus(entityTaxYearId, status, error) {
    const updateData = {
        inviteStatus: status,
        attemptCount: { increment: 1 },
    };
    if (status === 'SENT') {
        updateData.inviteSentAt = new Date();
        updateData.lastError = null;
    }
    else {
        updateData.lastError = error || 'Unknown error';
    }
    return await client_1.default.entityTaxYear.update({
        where: { id: entityTaxYearId },
        data: updateData,
    });
}
