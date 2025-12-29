import prisma from '../db/client'
import { EntityType } from '@prisma/client'
import { pauseAllReminders, resumeAllReminders } from './reminders'
import { getTaxReturnsFolder } from './folders'

/**
 * Request extension (client action)
 */
export async function requestExtension(entityTaxYearId: string) {
  // Update entity tax year
  const entityTaxYear = await prisma.entityTaxYear.update({
    where: { id: entityTaxYearId },
    data: {
      extensionRequested: true,
      internalStatus: 'COLLECTING_DOCS', // Keep in collecting docs
    },
  })

  // Pause all reminder streams
  await pauseAllReminders(entityTaxYearId, 'Extension requested by client')

  return entityTaxYear
}

/**
 * File extension (staff action)
 */
export async function fileExtension(
  entityTaxYearId: string,
  staffUserId: string,
  extensionDocumentPath: string,
  extensionDocumentName: string
) {
  const entityTaxYear = await prisma.entityTaxYear.findUnique({
    where: { id: entityTaxYearId },
    include: {
      clientEntity: true,
    },
  })

  if (!entityTaxYear) {
    throw new Error('Entity tax year not found')
  }

  // Calculate extended due date based on entity type
  const extendedDueDate = calculateExtendedDueDate(
    entityTaxYear.clientEntity.entityType,
    entityTaxYear.taxYear
  )

  // Update entity tax year
  const updated = await prisma.entityTaxYear.update({
    where: { id: entityTaxYearId },
    data: {
      extensionFiled: true,
      extendedDueDate,
    },
  })

  // Store extension document in Tax Returns folder
  const taxReturnsFolder = await getTaxReturnsFolder(
    entityTaxYear.clientEntityId,
    entityTaxYear.taxYear
  )

  const yearFolder = await prisma.folder.findFirst({
    where: {
      clientId: entityTaxYear.clientEntityId,
      parentId: taxReturnsFolder.id,
      name: entityTaxYear.taxYear.toString(),
    },
  })

  if (yearFolder) {
    await prisma.document.create({
      data: {
        clientId: entityTaxYear.clientEntityId,
        folderId: yearFolder.id,
        storagePath: extensionDocumentPath,
        displayName: extensionDocumentName,
        uploadedBy: staffUserId,
        mimeType: 'application/pdf',
      },
    })
  }

  // Resume reminders relative to extended due date
  await resumeAllReminders(entityTaxYearId)

  return updated
}

/**
 * Calculate extended due date based on entity type
 */
function calculateExtendedDueDate(entityType: EntityType, taxYear: number): Date {
  switch (entityType) {
    case 'HOUSEHOLD_1040':
      // 1040 → October 15
      return new Date(taxYear + 1, 9, 15) // October 15

    case 'LLC':
    case 'PARTNERSHIP':
      // 1065 → September 15
      return new Date(taxYear + 1, 8, 15) // September 15

    case 'S_CORP':
      // 1120S → September 15
      return new Date(taxYear + 1, 8, 15) // September 15

    case 'C_CORP':
      // 1120 → October 15
      return new Date(taxYear + 1, 9, 15) // October 15

    default:
      // Default to October 15
      return new Date(taxYear + 1, 9, 15)
  }
}

