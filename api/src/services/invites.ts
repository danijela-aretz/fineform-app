import prisma from '../db/client'
import { ensureEntityTaxYear } from './entityTaxYear'
import { getTaxReturnsFolder } from './folders'

/**
 * Queue entities for tax season invite
 */
export async function queueEntitiesForInvite(
  entityIds: string[],
  taxYear: number
) {
  const results = []

  for (const entityId of entityIds) {
    // Ensure entity_tax_year exists
    const entityTaxYear = await ensureEntityTaxYear(entityId, taxYear)

    // Ensure Tax Returns folder exists for this tax year
    try {
      await getTaxReturnsFolder(entityId, taxYear)
    } catch (error) {
      // Log error but don't fail queueing
      console.error('Failed to create tax returns folder:', error)
    }

    // Update invite status
    const updated = await prisma.entityTaxYear.update({
      where: { id: entityTaxYear.id },
      data: {
        taxReturnExpected: true,
        inviteStatus: 'QUEUED',
      },
    })

    results.push(updated)
  }

  return results
}

/**
 * Generate secure app link for invite
 */
export function generateInviteLink(entityId: string, taxYear: number): string {
  // In production, this would be a secure token-based link
  // For now, return a link with entity context
  const baseUrl = process.env.CLIENT_APP_URL || 'http://localhost:8081'
  return `${baseUrl}/invite?entity=${entityId}&year=${taxYear}`
}

/**
 * Update invite delivery status (called by n8n webhook)
 */
export async function updateInviteDeliveryStatus(
  entityTaxYearId: string,
  status: 'SENT' | 'FAILED',
  error?: string
) {
  const updateData: any = {
    inviteStatus: status,
    attemptCount: { increment: 1 },
  }

  if (status === 'SENT') {
    updateData.inviteSentAt = new Date()
    updateData.lastError = null
  } else {
    updateData.lastError = error || 'Unknown error'
  }

  return await prisma.entityTaxYear.update({
    where: { id: entityTaxYearId },
    data: updateData,
  })
}

