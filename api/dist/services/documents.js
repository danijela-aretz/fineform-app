"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkDocumentToChecklistItem = linkDocumentToChecklistItem;
exports.logDocumentEvent = logDocumentEvent;
exports.checkConfirmationRequired = checkConfirmationRequired;
const client_1 = __importDefault(require("../db/client"));
const entityTaxYear_1 = require("./entityTaxYear");
/**
 * Link document to checklist item
 */
async function linkDocumentToChecklistItem(documentId, checklistItemId) {
    // Check if link already exists
    const existing = await client_1.default.checklistItemFile.findUnique({
        where: {
            checklistItemId_documentId: {
                checklistItemId,
                documentId,
            },
        },
    });
    if (existing) {
        return existing;
    }
    // Create link
    const link = await client_1.default.checklistItemFile.create({
        data: {
            checklistItemId,
            documentId,
        },
    });
    // Update checklist item status to RECEIVED
    await client_1.default.checklistItem.update({
        where: { id: checklistItemId },
        data: {
            status: 'RECEIVED',
            receivedAt: new Date(),
        },
    });
    // Recompute checklist completion
    const entityTaxYear = await client_1.default.checklistItem.findUnique({
        where: { id: checklistItemId },
        select: { entityTaxYearId: true },
    });
    if (entityTaxYear) {
        await (0, entityTaxYear_1.computeChecklistCompletion)(entityTaxYear.entityTaxYearId);
    }
    return link;
}
/**
 * Log document event
 */
async function logDocumentEvent(entityTaxYearId, eventType, documentId, metadata) {
    return await client_1.default.documentEvent.create({
        data: {
            entityTaxYearId,
            eventType,
            documentId: documentId || null,
            metadata: metadata ? JSON.stringify(metadata) : null,
        },
    });
}
/**
 * Check if confirmation should be requested
 */
async function checkConfirmationRequired(entityTaxYearId) {
    const entityTaxYear = await client_1.default.entityTaxYear.findUnique({
        where: { id: entityTaxYearId },
    });
    if (!entityTaxYear) {
        return false;
    }
    // Confirmation required if checklist 100% complete and not yet signed
    if (entityTaxYear.checklistCompleteAt && entityTaxYear.docConfirmationStatus !== 'SIGNED') {
        return true;
    }
    return false;
}
