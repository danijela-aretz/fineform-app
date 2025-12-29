"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBaselineChecklist = createBaselineChecklist;
exports.createChecklistFromProforma = createChecklistFromProforma;
exports.ensureChecklistExists = ensureChecklistExists;
const client_1 = __importDefault(require("../db/client"));
const entityTaxYear_1 = require("./entityTaxYear");
/**
 * Baseline checklist items by entity type
 */
const BASELINE_CHECKLIST_ITEMS = {
    HOUSEHOLD_1040: [
        'W-2 Forms',
        '1099 Forms',
        'Interest Statements (1099-INT)',
        'Dividend Statements (1099-DIV)',
        'Retirement Account Statements',
        'Mortgage Interest Statement (1098)',
        'Property Tax Statements',
        'Charitable Contribution Receipts',
        'Medical Expense Receipts',
        'Business Expense Receipts (if applicable)',
    ],
    LLC: [
        'Profit & Loss Statement',
        'Balance Sheet',
        'Bank Statements',
        '1099 Forms',
        'Expense Receipts',
        'Asset Purchase Documentation',
    ],
    S_CORP: [
        'K-1 Forms',
        'Profit & Loss Statement',
        'Balance Sheet',
        'Bank Statements',
        '1099 Forms',
        'Payroll Records',
    ],
    C_CORP: [
        'K-1 Forms',
        'Profit & Loss Statement',
        'Balance Sheet',
        'Bank Statements',
        '1099 Forms',
        'Payroll Records',
    ],
    PARTNERSHIP: [
        'K-1 Forms',
        'Profit & Loss Statement',
        'Balance Sheet',
        'Bank Statements',
    ],
    SOLE_PROPRIETORSHIP: [
        'Profit & Loss Statement',
        'Bank Statements',
        '1099 Forms',
        'Expense Receipts',
    ],
    TRUST: [
        'Trust Document',
        'Income Statements',
        'Distribution Records',
    ],
    ESTATE: [
        'Estate Documents',
        'Income Statements',
        'Distribution Records',
    ],
    OTHER: [
        'Income Documents',
        'Expense Documents',
        'Bank Statements',
    ],
};
/**
 * Create baseline checklist for entity
 */
async function createBaselineChecklist(entityTaxYearId, entityType) {
    const items = BASELINE_CHECKLIST_ITEMS[entityType] || BASELINE_CHECKLIST_ITEMS.OTHER;
    const checklistItems = [];
    for (const itemName of items) {
        const item = await client_1.default.checklistItem.create({
            data: {
                entityTaxYearId,
                itemName,
                required: true,
                status: 'PENDING',
            },
        });
        checklistItems.push(item);
    }
    return checklistItems;
}
/**
 * Create checklist from proforma parsing results (called by n8n webhook)
 */
async function createChecklistFromProforma(entityTaxYearId, items) {
    const checklistItems = [];
    for (const itemData of items) {
        const item = await client_1.default.checklistItem.create({
            data: {
                entityTaxYearId,
                itemName: itemData.name,
                itemType: itemData.type || null,
                required: itemData.required !== false,
                status: 'PENDING',
            },
        });
        checklistItems.push(item);
    }
    // Recompute completion
    await (0, entityTaxYear_1.computeChecklistCompletion)(entityTaxYearId);
    return checklistItems;
}
/**
 * Ensure checklist exists (called on first engagement signature)
 */
async function ensureChecklistExists(entityTaxYearId) {
    // Check if checklist already exists
    const existing = await client_1.default.checklistItem.findFirst({
        where: { entityTaxYearId },
    });
    if (existing) {
        return;
    }
    // Get entity type
    const entityTaxYear = await client_1.default.entityTaxYear.findUnique({
        where: { id: entityTaxYearId },
        include: {
            clientEntity: true,
        },
    });
    if (!entityTaxYear) {
        throw new Error('Entity tax year not found');
    }
    // Create baseline checklist
    await createBaselineChecklist(entityTaxYearId, entityTaxYear.clientEntity.entityType);
}
