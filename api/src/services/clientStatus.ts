import prisma from '../db/client'
import { InternalStatus, EngagementStatus, ConfirmationStatus } from '@prisma/client'

export type ClientStatus =
  | 'SIGN_ENGAGEMENT'
  | 'UPLOAD_DOCUMENTS'
  | 'CONFIRM_DOCUMENTS'
  | 'IN_REVIEW'
  | 'SIGN_EFILE'
  | 'FILED'

export interface ClientStatusInfo {
  status: ClientStatus
  title: string
  description: string
  actionRequired: boolean
  showChecklist: boolean
  showQuestionnaire: boolean
  showMessaging: boolean
  showUploads: boolean
  showIdModule: boolean
}

/**
 * Map internal status to client-visible status
 */
export function mapToClientStatus(
  internalStatus: InternalStatus,
  engagementStatus: EngagementStatus,
  checklistCompleteAt: Date | null,
  docConfirmationStatus: ConfirmationStatus,
  efileAuthorizationSigned: boolean
): ClientStatus {
  // Engagement not started
  if (engagementStatus === 'NOT_STARTED') {
    return 'SIGN_ENGAGEMENT'
  }

  // Checklist not complete
  if (!checklistCompleteAt) {
    return 'UPLOAD_DOCUMENTS'
  }

  // Checklist complete but confirmation not signed
  if (docConfirmationStatus === 'NOT_SIGNED') {
    return 'CONFIRM_DOCUMENTS'
  }

  // In prep or ready for prep
  if (
    internalStatus === 'READY_FOR_PREP' ||
    internalStatus === 'IN_PREP' ||
    internalStatus === 'AWAITING_CONFIRMATION'
  ) {
    return 'IN_REVIEW'
  }

  // Awaiting e-file authorization
  if (internalStatus === 'AWAITING_EFILE_AUTH' && !efileAuthorizationSigned) {
    return 'SIGN_EFILE'
  }

  // Filed
  if (internalStatus === 'FILED') {
    return 'FILED'
  }

  // Default to in review
  return 'IN_REVIEW'
}

/**
 * Get client status info with UI configuration
 */
export function getClientStatusInfo(status: ClientStatus): ClientStatusInfo {
  switch (status) {
    case 'SIGN_ENGAGEMENT':
      return {
        status: 'SIGN_ENGAGEMENT',
        title: 'Action Required',
        description: 'Please Sign Engagement Letter',
        actionRequired: true,
        showChecklist: false,
        showQuestionnaire: false,
        showMessaging: false,
        showUploads: false,
        showIdModule: false,
      }

    case 'UPLOAD_DOCUMENTS':
      return {
        status: 'UPLOAD_DOCUMENTS',
        title: 'Action Required',
        description: 'Please Upload Documents / Complete Questionnaire',
        actionRequired: true,
        showChecklist: true,
        showQuestionnaire: true,
        showMessaging: true,
        showUploads: true,
        showIdModule: true,
      }

    case 'CONFIRM_DOCUMENTS':
      return {
        status: 'CONFIRM_DOCUMENTS',
        title: 'Action Required',
        description: 'Please Confirm Documents Received',
        actionRequired: true,
        showChecklist: true,
        showQuestionnaire: true,
        showMessaging: true,
        showUploads: true, // Allow additional uploads after confirmation
        showIdModule: true,
      }

    case 'IN_REVIEW':
      return {
        status: 'IN_REVIEW',
        title: "We're Reviewing Your Documents",
        description: 'Tax Return Preparation Is in Progress',
        actionRequired: false,
        showChecklist: true,
        showQuestionnaire: true,
        showMessaging: true,
        showUploads: true, // Allow additional uploads
        showIdModule: true,
      }

    case 'SIGN_EFILE':
      return {
        status: 'SIGN_EFILE',
        title: 'Action Required',
        description: 'Please Sign E-File Authorization',
        actionRequired: true,
        showChecklist: true,
        showQuestionnaire: true,
        showMessaging: true,
        showUploads: true,
        showIdModule: true,
      }

    case 'FILED':
      return {
        status: 'FILED',
        title: 'Filed',
        description: 'Your tax return has been filed successfully',
        actionRequired: false,
        showChecklist: true,
        showQuestionnaire: true,
        showMessaging: true, // Messaging remains open year-round
        showUploads: false,
        showIdModule: true,
      }
  }
}

/**
 * Get client status for entity tax year
 */
export async function getClientStatus(entityTaxYearId: string): Promise<ClientStatusInfo> {
  const entityTaxYear = await prisma.entityTaxYear.findUnique({
    where: { id: entityTaxYearId },
  })

  if (!entityTaxYear) {
    throw new Error('Entity tax year not found')
  }

  // Check if e-file authorization signed
  const efileAuth = await prisma.efileAuthorization.findFirst({
    where: { entityTaxYearId },
  })

  const clientStatus = mapToClientStatus(
    entityTaxYear.internalStatus,
    entityTaxYear.engagementStatus,
    entityTaxYear.checklistCompleteAt,
    entityTaxYear.docConfirmationStatus,
    !!efileAuth
  )

  return getClientStatusInfo(clientStatus)
}

