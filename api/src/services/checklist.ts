import prisma from '../db/client'
import { EntityType } from '@prisma/client'
import { computeChecklistCompletion } from './entityTaxYear'

/**
 * Baseline checklist items by entity type
 */
const BASELINE_CHECKLIST_ITEMS: Record<EntityType, string[]> = {
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
}

/**
 * Create baseline checklist for entity
 */
export async function createBaselineChecklist(
  entityTaxYearId: string,
  entityType: EntityType
) {
  const items = BASELINE_CHECKLIST_ITEMS[entityType] || BASELINE_CHECKLIST_ITEMS.OTHER

  const checklistItems = []

  for (const itemName of items) {
    const item = await prisma.checklistItem.create({
      data: {
        entityTaxYearId,
        itemName,
        required: true,
        status: 'PENDING',
      },
    })
    checklistItems.push(item)
  }

  return checklistItems
}

/**
 * Create checklist from proforma parsing results (called by n8n webhook)
 */
export async function createChecklistFromProforma(
  entityTaxYearId: string,
  items: Array<{ name: string; required: boolean; type?: string }>
) {
  const checklistItems = []

  for (const itemData of items) {
    const item = await prisma.checklistItem.create({
      data: {
        entityTaxYearId,
        itemName: itemData.name,
        itemType: itemData.type || null,
        required: itemData.required !== false,
        status: 'PENDING',
      },
    })
    checklistItems.push(item)
  }

  // Recompute completion
  await computeChecklistCompletion(entityTaxYearId)

  return checklistItems
}

/**
 * Ensure checklist exists (called on first engagement signature)
 */
export async function ensureChecklistExists(
  entityTaxYearId: string
) {
  // Check if checklist already exists
  const existing = await prisma.checklistItem.findFirst({
    where: { entityTaxYearId },
  })

  if (existing) {
    return
  }

  // Get entity type
  const entityTaxYear = await prisma.entityTaxYear.findUnique({
    where: { id: entityTaxYearId },
    include: {
      clientEntity: true,
    },
  })

  if (!entityTaxYear) {
    throw new Error('Entity tax year not found')
  }

  // Create baseline checklist
  await createBaselineChecklist(entityTaxYearId, entityTaxYear.clientEntity.entityType)
}

