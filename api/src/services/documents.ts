import prisma from '../db/client'
import { computeChecklistCompletion } from './entityTaxYear'
import { getStaffWithAccess } from './permissions'

/**
 * Link document to checklist item
 */
export async function linkDocumentToChecklistItem(
  documentId: string,
  checklistItemId: string
) {
  // Check if link already exists
  const existing = await prisma.checklistItemFile.findUnique({
    where: {
      checklistItemId_documentId: {
        checklistItemId,
        documentId,
      },
    },
  })

  if (existing) {
    return existing
  }

  // Create link
  const link = await prisma.checklistItemFile.create({
    data: {
      checklistItemId,
      documentId,
    },
  })

  // Update checklist item status to RECEIVED
  await prisma.checklistItem.update({
    where: { id: checklistItemId },
    data: {
      status: 'RECEIVED',
      receivedAt: new Date(),
    },
  })

  // Recompute checklist completion
  const entityTaxYear = await prisma.checklistItem.findUnique({
    where: { id: checklistItemId },
    select: { entityTaxYearId: true },
  })

  if (entityTaxYear) {
    await computeChecklistCompletion(entityTaxYear.entityTaxYearId)
  }

  return link
}

/**
 * Log document event
 */
export async function logDocumentEvent(
  entityTaxYearId: string,
  eventType: 'UPLOADED' | 'REPLACED' | 'MARKED_NOT_APPLICABLE' | 'CONFIRMATION_SIGNED',
  documentId?: string,
  metadata?: any
) {
  return await prisma.documentEvent.create({
    data: {
      entityTaxYearId,
      eventType,
      documentId: documentId || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  })
}

/**
 * Check if confirmation should be requested
 */
export async function checkConfirmationRequired(entityTaxYearId: string): Promise<boolean> {
  const entityTaxYear = await prisma.entityTaxYear.findUnique({
    where: { id: entityTaxYearId },
  })

  if (!entityTaxYear) {
    return false
  }

  // Confirmation required if checklist 100% complete and not yet signed
  if (entityTaxYear.checklistCompleteAt && entityTaxYear.docConfirmationStatus !== 'SIGNED') {
    return true
  }

  return false
}

