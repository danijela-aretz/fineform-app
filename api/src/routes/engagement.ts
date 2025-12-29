import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { storeEngagementSignature } from '../services/engagement'
import { z } from 'zod'
import prisma from '../db/client'
import { getTaxReturnsFolder } from '../services/folders'
import fs from 'fs'
import path from 'path'

const router = Router()

const signSchema = z.object({
  signerName: z.string().min(1),
  signerEmail: z.string().email(),
  signatureData: z.string(),
})

// Get engagement status
router.get('/:entityTaxYearId', authenticate, async (req: any, res, next) => {
  try {
    const entityTaxYear = await prisma.entityTaxYear.findUnique({
      where: { id: req.params.entityTaxYearId },
      include: {
        engagementSignatures: {
          orderBy: { signedAt: 'asc' },
        },
        clientEntity: true,
      },
    })

    if (!entityTaxYear) {
      return res.status(404).json({ message: 'Entity tax year not found' })
    }

    res.json({
      engagementStatus: entityTaxYear.engagementStatus,
      signatures: entityTaxYear.engagementSignatures,
      entityName: entityTaxYear.clientEntity.entityName,
      taxYear: entityTaxYear.taxYear,
    })
  } catch (error) {
    next(error)
  }
})

// Submit signature
router.post('/:entityTaxYearId/sign', authenticate, async (req: any, res, next) => {
  try {
    const { signerName, signerEmail, signatureData } = signSchema.parse(req.body)

    const signature = await storeEngagementSignature(
      req.params.entityTaxYearId,
      signerName,
      signerEmail,
      signatureData
    )

    res.json({
      success: true,
      signature,
      message: 'Signature recorded successfully',
    })
  } catch (error) {
    next(error)
  }
})

// Get signed PDF
router.get('/:entityTaxYearId/pdf', authenticate, async (req: any, res, next) => {
  try {
    const entityTaxYear = await prisma.entityTaxYear.findUnique({
      where: { id: req.params.entityTaxYearId },
      include: {
        clientEntity: true,
      },
    })

    if (!entityTaxYear) {
      return res.status(404).json({ message: 'Entity tax year not found' })
    }

    if (entityTaxYear.engagementStatus !== 'FULLY_SIGNED') {
      return res.status(400).json({ message: 'Engagement not fully signed' })
    }

    // Find PDF in Tax Returns folder
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

    if (!yearFolder) {
      return res.status(404).json({ message: 'Tax returns folder not found' })
    }

    const document = await prisma.document.findFirst({
      where: {
        folderId: yearFolder.id,
        displayName: { contains: 'Engagement Letter' },
      },
    })

    if (!document || !fs.existsSync(document.storagePath)) {
      return res.status(404).json({ message: 'Engagement PDF not found' })
    }

    res.download(document.storagePath, document.displayName)
  } catch (error) {
    next(error)
  }
})

export default router

