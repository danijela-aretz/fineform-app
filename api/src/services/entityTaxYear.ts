import prisma from '../db/client'
import { InternalStatus, EngagementStatus, ConfirmationStatus, QuestionnaireStatus, IdStatus } from '@prisma/client'

/**
 * Create or ensure entity_tax_year container exists
 */
export async function ensureEntityTaxYear(
  clientEntityId: string,
  taxYear: number
) {
  const existing = await prisma.entityTaxYear.findUnique({
    where: {
      clientEntityId_taxYear: {
        clientEntityId,
        taxYear,
      },
    },
  })

  if (existing) {
    return existing
  }

  return await prisma.entityTaxYear.create({
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
  })
}

/**
 * Compute checklist completion percentage
 */
export async function computeChecklistCompletion(
  entityTaxYearId: string
): Promise<{ complete: boolean; percentage: number; requiredCount: number; receivedCount: number }> {
  const checklistItems = await prisma.checklistItem.findMany({
    where: { entityTaxYearId },
  })

  const requiredItems = checklistItems.filter((item) => item.required)
  const completedItems = requiredItems.filter(
    (item) => item.status === 'RECEIVED' || item.status === 'NOT_APPLICABLE'
  )

  const requiredCount = requiredItems.length
  const receivedCount = completedItems.length
  const complete = requiredCount > 0 && receivedCount === requiredCount
  const percentage = requiredCount > 0 ? (receivedCount / requiredCount) * 100 : 0

  // Get current state
  const entityTaxYear = await prisma.entityTaxYear.findUnique({
    where: { id: entityTaxYearId },
  })

  if (!entityTaxYear) {
    throw new Error('Entity tax year not found')
  }

  const wasComplete = !!entityTaxYear.checklistCompleteAt
  const isNowComplete = complete

  // Update entity_tax_year
  await prisma.entityTaxYear.update({
    where: { id: entityTaxYearId },
    data: {
      docsRequiredCount: requiredCount,
      docsReceivedCount: receivedCount,
      checklistCompleteAt: complete ? new Date() : null,
    },
  })

  // Auto-transition status if checklist just completed
  if (!wasComplete && isNowComplete) {
    // Move to AWAITING_CONFIRMATION if currently COLLECTING_DOCS
    if (entityTaxYear.internalStatus === 'COLLECTING_DOCS') {
      try {
        const { transitionStatus } = await import('./statusTransitions')
        await transitionStatus(
          entityTaxYearId,
          'AWAITING_CONFIRMATION',
          'system',
          'Checklist completed'
        )
      } catch (error) {
        // Silently fail if transition not valid
        console.error('Failed to auto-transition status:', error)
      }
    }
  }

  // Initialize reminder states if needed (for document reminders)
  try {
    const { getOrCreateReminderState } = await import('./reminders')
    await getOrCreateReminderState(entityTaxYearId, 'DOCUMENTS')
  } catch (error) {
    // Silently fail if reminders not initialized yet
    console.error('Failed to initialize reminder state:', error)
  }

  return { complete, percentage, requiredCount, receivedCount }
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
export async function computeReadyForPrep(
  entityTaxYearId: string
): Promise<boolean> {
  const entityTaxYear = await prisma.entityTaxYear.findUnique({
    where: { id: entityTaxYearId },
  })

  if (!entityTaxYear) {
    return false
  }

  // Check all requirements
  const engagementFullySigned = entityTaxYear.engagementStatus === 'FULLY_SIGNED'
  
  const checklistComplete = await computeChecklistCompletion(entityTaxYearId)
  const checklist100Percent = checklistComplete.complete

  const confirmationSigned = entityTaxYear.docConfirmationStatus === 'SIGNED'

  const questionnaireSubmitted = entityTaxYear.questionnaireStatus === 'COMPLETED'

  const idValid = entityTaxYear.idStatus === 'VALID'

  const readyForPrep = 
    engagementFullySigned &&
    checklist100Percent &&
    confirmationSigned &&
    questionnaireSubmitted &&
    idValid

  // Update entity_tax_year
  await prisma.entityTaxYear.update({
    where: { id: entityTaxYearId },
    data: {
      readyForPrep,
    },
  })

  return readyForPrep
}

/**
 * Get blocking reasons for Ready for Prep
 */
export async function getBlockingReasons(
  entityTaxYearId: string
): Promise<string[]> {
  const entityTaxYear = await prisma.entityTaxYear.findUnique({
    where: { id: entityTaxYearId },
  })

  if (!entityTaxYear) {
    return ['Entity tax year not found']
  }

  const reasons: string[] = []

  if (entityTaxYear.engagementStatus !== 'FULLY_SIGNED') {
    reasons.push('Engagement not fully signed')
  }

  const checklistComplete = await computeChecklistCompletion(entityTaxYearId)
  if (!checklistComplete.complete) {
    reasons.push(`Checklist incomplete (${checklistComplete.receivedCount}/${checklistComplete.requiredCount})`)
  }

  if (entityTaxYear.docConfirmationStatus !== 'SIGNED') {
    reasons.push('Document confirmation not signed')
  }

  if (entityTaxYear.questionnaireStatus !== 'COMPLETED') {
    reasons.push('Questionnaire not submitted')
  }

  if (entityTaxYear.idStatus !== 'VALID') {
    reasons.push('ID not valid')
  }

  return reasons
}

/**
 * Validate status transition
 */
export function validateStatusTransition(
  oldStatus: InternalStatus,
  newStatus: InternalStatus
): { valid: boolean; warning?: string } {
  // Define valid transitions
  const validTransitions: Record<InternalStatus, InternalStatus[]> = {
    INVITED: ['ENGAGED'],
    ENGAGED: ['COLLECTING_DOCS'],
    COLLECTING_DOCS: ['AWAITING_CONFIRMATION', 'READY_FOR_PREP'],
    AWAITING_CONFIRMATION: ['READY_FOR_PREP'],
    READY_FOR_PREP: ['IN_PREP'],
    IN_PREP: ['AWAITING_EFILE_AUTH'],
    AWAITING_EFILE_AUTH: ['FILED'],
    FILED: [], // Final status
  }

  const allowed = validTransitions[oldStatus] || []
  
  if (allowed.includes(newStatus)) {
    return { valid: true }
  }

  // Allow but warn for edge cases
  return {
    valid: true, // Soft validation - allow but log
    warning: `Unusual transition from ${oldStatus} to ${newStatus}`,
  }
}

