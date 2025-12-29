import prisma from '../db/client'
import { EntityType } from '@prisma/client'
import { getTaxReturnsFolder } from './folders'
import { createSystemFolders } from './folders'
import fs from 'fs'
import path from 'path'

/**
 * Determine signature requirement based on entity type
 */
export function getSignatureRequirement(entityType: EntityType): number {
  // For now, assume MFJ is determined by entity type or filing status
  // In production, this would check entity metadata or filing type
  if (entityType === 'HOUSEHOLD_1040') {
    // Check if MFJ - this would come from entity metadata in production
    // For now, default to 1 signature, but support 2 for MFJ
    return 1 // Will be updated based on actual filing status
  }
  return 1 // Single filer or business entity
}

/**
 * Store engagement signature
 */
export async function storeEngagementSignature(
  entityTaxYearId: string,
  signerName: string,
  signerEmail: string,
  signatureData: string
) {
  // Store signature
  const signature = await prisma.engagementSignature.create({
    data: {
      entityTaxYearId,
      signerName,
      signerEmail,
      signatureData,
    },
  })

  // Get entity tax year
  const entityTaxYear = await prisma.entityTaxYear.findUnique({
    where: { id: entityTaxYearId },
    include: {
      clientEntity: true,
    },
  })

  if (!entityTaxYear) {
    throw new Error('Entity tax year not found')
  }

  // Count existing signatures
  const signatureCount = await prisma.engagementSignature.count({
    where: { entityTaxYearId },
  })

  // Determine required signatures (simplified - in production would check filing status)
  const requiredSignatures = 1 // Default, would check for MFJ

  // Update engagement status
  let newStatus: 'NOT_STARTED' | 'PARTIALLY_SIGNED' | 'FULLY_SIGNED'
  
  if (signatureCount >= requiredSignatures) {
    newStatus = 'FULLY_SIGNED'
  } else if (signatureCount === 1) {
    newStatus = 'PARTIALLY_SIGNED'
  } else {
    newStatus = 'NOT_STARTED'
  }

  await prisma.entityTaxYear.update({
    where: { id: entityTaxYearId },
    data: {
      engagementStatus: newStatus,
      engagementSignedAt: newStatus === 'FULLY_SIGNED' ? new Date() : null,
      engagementSigner1Id: signatureCount === 1 ? signature.id : entityTaxYear.engagementSigner1Id,
      engagementSigner2Id: signatureCount === 2 ? signature.id : entityTaxYear.engagementSigner2Id,
    },
  })

    // On first signature, trigger unlocks
    if (signatureCount === 1) {
      // Trigger checklist creation (Workflow 3)
      const { ensureChecklistExists } = await import('./checklist')
      await ensureChecklistExists(entityTaxYearId)
      
      // Create message thread (Workflow 8)
      await createMessageThread(entityTaxYearId, entityTaxYear.clientEntityId)
      
      // Update internal status to ENGAGED with audit log
      const { transitionStatus } = await import('./statusTransitions')
      try {
        await transitionStatus(entityTaxYearId, 'ENGAGED', 'system', 'First engagement signature captured')
      } catch (error) {
        // If transition fails (e.g., already ENGAGED), just update status directly
        await prisma.entityTaxYear.update({
          where: { id: entityTaxYearId },
          data: {
            internalStatus: 'ENGAGED',
          },
        })
      }
    }

  // Generate PDF when fully signed
  if (newStatus === 'FULLY_SIGNED') {
    await generateEngagementPDF(entityTaxYearId, entityTaxYear.clientEntityId, entityTaxYear.taxYear)
  }

  return signature
}

/**
 * Create message thread on first engagement signature
 */
async function createMessageThread(entityTaxYearId: string, clientEntityId: string) {
  // Check if thread already exists
  const existing = await prisma.messageThread.findUnique({
    where: { entityTaxYearId },
  })

  if (existing) {
    return existing
  }

  // Get client account users
  const clientEntity = await prisma.clientEntity.findUnique({
    where: { id: clientEntityId },
    include: {
      account: {
        include: {
          accountUsers: {
            include: {
              profile: true,
            },
          },
        },
      },
    },
  })

  if (!clientEntity) {
    return
  }

  // Create thread
  const thread = await prisma.messageThread.create({
    data: {
      entityTaxYearId,
    },
  })

  // Add participants: clients
  for (const accountUser of clientEntity.account.accountUsers) {
    await prisma.threadParticipant.create({
      data: {
        threadId: thread.id,
        userId: accountUser.userId,
        userType: 'CLIENT',
      },
    })
  }

  // Add participants: super_admin, admin
  const superAdmins = await prisma.staffProfile.findMany({
    where: {
      staffRole: 'SUPER_ADMIN',
      active: true,
    },
  })

  const admins = await prisma.staffProfile.findMany({
    where: {
      staffRole: 'ADMIN',
      active: true,
    },
  })

  for (const staff of [...superAdmins, ...admins]) {
    await prisma.threadParticipant.create({
      data: {
        threadId: thread.id,
        userId: staff.userId,
        userType: 'STAFF',
      },
    })
  }

  // Add assigned staff (Idir)
  const assignments = await prisma.clientStaffAssignment.findMany({
    where: {
      clientId: clientEntityId,
      active: true,
    },
  })

  for (const assignment of assignments) {
    await prisma.threadParticipant.create({
      data: {
        threadId: thread.id,
        userId: assignment.staffUserId,
        userType: 'STAFF',
      },
    })
  }

  return thread
}

/**
 * Generate signed engagement letter PDF
 */
async function generateEngagementPDF(
  entityTaxYearId: string,
  clientEntityId: string,
  taxYear: number
) {
  // Get all signatures
  const signatures = await prisma.engagementSignature.findMany({
    where: { entityTaxYearId },
    orderBy: { signedAt: 'asc' },
  })

  // Get entity info
  const entityTaxYear = await prisma.entityTaxYear.findUnique({
    where: { id: entityTaxYearId },
    include: {
      clientEntity: true,
    },
  })

  if (!entityTaxYear) {
    throw new Error('Entity tax year not found')
  }

  // In production, use a PDF generation library (pdfkit, puppeteer, etc.)
  // For now, create a placeholder file
  const taxReturnsFolder = await getTaxReturnsFolder(clientEntityId, taxYear)
  const yearFolder = await prisma.folder.findFirst({
    where: {
      clientId: clientEntityId,
      parentId: taxReturnsFolder.id,
      name: taxYear.toString(),
    },
  })

  if (!yearFolder) {
    throw new Error('Year folder not found')
  }

  const uploadsDir = path.join(__dirname, '../../uploads', clientEntityId, yearFolder.id)
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }

  const pdfPath = path.join(uploadsDir, `engagement-letter-${taxYear}.pdf`)
  
  // Create a simple text file as placeholder (in production, generate actual PDF)
  const pdfContent = `Engagement Letter for ${entityTaxYear.clientEntity.entityName} - Tax Year ${taxYear}\n\nSigned by:\n${signatures.map((s, i) => `${i + 1}. ${s.signerName} (${s.signerEmail}) on ${s.signedAt.toISOString()}`).join('\n')}`
  
  fs.writeFileSync(pdfPath, pdfContent)

  // Store document record
  await prisma.document.create({
    data: {
      clientId: clientEntityId,
      folderId: yearFolder.id,
      storagePath: pdfPath,
      displayName: `Engagement Letter - ${taxYear}.pdf`,
      mimeType: 'application/pdf',
    },
  })
}

