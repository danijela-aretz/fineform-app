"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestExtension = requestExtension;
exports.fileExtension = fileExtension;
const client_1 = __importDefault(require("../db/client"));
const reminders_1 = require("./reminders");
const folders_1 = require("./folders");
/**
 * Request extension (client action)
 */
async function requestExtension(entityTaxYearId) {
    // Update entity tax year
    const entityTaxYear = await client_1.default.entityTaxYear.update({
        where: { id: entityTaxYearId },
        data: {
            extensionRequested: true,
            internalStatus: 'COLLECTING_DOCS', // Keep in collecting docs
        },
    });
    // Pause all reminder streams
    await (0, reminders_1.pauseAllReminders)(entityTaxYearId, 'Extension requested by client');
    return entityTaxYear;
}
/**
 * File extension (staff action)
 */
async function fileExtension(entityTaxYearId, staffUserId, extensionDocumentPath, extensionDocumentName) {
    const entityTaxYear = await client_1.default.entityTaxYear.findUnique({
        where: { id: entityTaxYearId },
        include: {
            clientEntity: true,
        },
    });
    if (!entityTaxYear) {
        throw new Error('Entity tax year not found');
    }
    // Calculate extended due date based on entity type
    const extendedDueDate = calculateExtendedDueDate(entityTaxYear.clientEntity.entityType, entityTaxYear.taxYear);
    // Update entity tax year
    const updated = await client_1.default.entityTaxYear.update({
        where: { id: entityTaxYearId },
        data: {
            extensionFiled: true,
            extendedDueDate,
        },
    });
    // Store extension document in Tax Returns folder
    const taxReturnsFolder = await (0, folders_1.getTaxReturnsFolder)(entityTaxYear.clientEntityId, entityTaxYear.taxYear);
    const yearFolder = await client_1.default.folder.findFirst({
        where: {
            clientId: entityTaxYear.clientEntityId,
            parentId: taxReturnsFolder.id,
            name: entityTaxYear.taxYear.toString(),
        },
    });
    if (yearFolder) {
        await client_1.default.document.create({
            data: {
                clientId: entityTaxYear.clientEntityId,
                folderId: yearFolder.id,
                storagePath: extensionDocumentPath,
                displayName: extensionDocumentName,
                uploadedBy: staffUserId,
                mimeType: 'application/pdf',
            },
        });
    }
    // Resume reminders relative to extended due date
    await (0, reminders_1.resumeAllReminders)(entityTaxYearId);
    return updated;
}
/**
 * Calculate extended due date based on entity type
 */
function calculateExtendedDueDate(entityType, taxYear) {
    switch (entityType) {
        case 'HOUSEHOLD_1040':
            // 1040 → October 15
            return new Date(taxYear + 1, 9, 15); // October 15
        case 'LLC':
        case 'PARTNERSHIP':
            // 1065 → September 15
            return new Date(taxYear + 1, 8, 15); // September 15
        case 'S_CORP':
            // 1120S → September 15
            return new Date(taxYear + 1, 8, 15); // September 15
        case 'C_CORP':
            // 1120 → October 15
            return new Date(taxYear + 1, 9, 15); // October 15
        default:
            // Default to October 15
            return new Date(taxYear + 1, 9, 15);
    }
}
