import prisma from '../db/client'
import { InternalStatus } from '@prisma/client'
import { computeReadyForPrep, getBlockingReasons } from './entityTaxYear'

/**
 * Transition internal status with audit logging
 */
export async function transitionStatus(
  entityTaxYearId: string,
  newStatus: InternalStatus,
  changedBy: string,
  reason?: string,
  allowSoftWarnings: boolean = false
): Promise<{ success: boolean; warning?: string; entityTaxYear: any }> {
  const entityTaxYear = await prisma.entityTaxYear.findUnique({
    where: { id: entityTaxYearId },
  })

  if (!entityTaxYear) {
    throw new Error('Entity tax year not found')
  }

  const oldStatus = entityTaxYear.internalStatus

  // Check if transition is valid
  if (!isValidTransition(oldStatus, newStatus)) {
    throw new Error(`Invalid status transition from ${oldStatus} to ${newStatus}`)
  }

  // Check Ready for Prep gate
  let warning: string | undefined
  if (newStatus === 'READY_FOR_PREP') {
    const ready = await computeReadyForPrep(entityTaxYearId)
    if (!ready) {
      const blockingReasons = await getBlockingReasons(entityTaxYearId)
      if (!allowSoftWarnings) {
        throw new Error(
          `Cannot transition to Ready for Prep. Blocking reasons: ${blockingReasons.join(', ')}`
        )
      }
      warning = `Warning: Ready for Prep requirements not met. Blocking: ${blockingReasons.join(', ')}`
    }
  }

  // Soft warnings for other transitions
  if (
    (newStatus === 'IN_PREP' || newStatus === 'AWAITING_EFILE_AUTH') &&
    entityTaxYear.internalStatus !== 'READY_FOR_PREP'
  ) {
    if (!allowSoftWarnings) {
      const blockingReasons = await getBlockingReasons(entityTaxYearId)
      throw new Error(
        `Cannot transition to ${newStatus}. Not Ready for Prep. Blocking: ${blockingReasons.join(', ')}`
      )
    }
    const blockingReasons = await getBlockingReasons(entityTaxYearId)
    warning = `Warning: Not Ready for Prep. Blocking: ${blockingReasons.join(', ')}`
  }

  // Update status
  const updated = await prisma.entityTaxYear.update({
    where: { id: entityTaxYearId },
    data: {
      internalStatus: newStatus,
    },
  })

  // Log audit trail
  await prisma.statusAuditLog.create({
    data: {
      entityTaxYearId,
      oldStatus,
      newStatus,
      changedBy,
      reason: reason || warning || null,
    },
  })

  return {
    success: true,
    warning,
    entityTaxYear: updated,
  }
}

/**
 * Check if status transition is valid
 */
function isValidTransition(oldStatus: InternalStatus, newStatus: InternalStatus): boolean {
  // Same status is always valid
  if (oldStatus === newStatus) {
    return true
  }

  // Define valid transitions
  const validTransitions: Record<InternalStatus, InternalStatus[]> = {
    INVITED: ['ENGAGED'],
    ENGAGED: ['COLLECTING_DOCS'],
    COLLECTING_DOCS: ['AWAITING_CONFIRMATION', 'READY_FOR_PREP'],
    AWAITING_CONFIRMATION: ['READY_FOR_PREP'],
    READY_FOR_PREP: ['IN_PREP'],
    IN_PREP: ['AWAITING_EFILE_AUTH', 'FILED'],
    AWAITING_EFILE_AUTH: ['FILED'],
    FILED: [], // Terminal status
  }

  return validTransitions[oldStatus]?.includes(newStatus) ?? false
}

/**
 * Get status history (audit log)
 */
export async function getStatusHistory(entityTaxYearId: string) {
  return await prisma.statusAuditLog.findMany({
    where: { entityTaxYearId },
    include: {
      staff: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

