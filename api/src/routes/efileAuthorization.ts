import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { transitionStatus } from '../services/statusTransitions'
import prisma from '../db/client'
import { z } from 'zod'

const router = Router()

const signSchema = z.object({
  signerName: z.string().min(1),
  signerEmail: z.string().email(),
  signatureData: z.string(),
})

// Sign e-file authorization
router.post('/:entityTaxYearId/sign', authenticate, async (req: any, res, next) => {
  try {
    const { signerName, signerEmail, signatureData } = signSchema.parse(req.body)

    const entityTaxYear = await prisma.entityTaxYear.findUnique({
      where: { id: req.params.entityTaxYearId },
    })

    if (!entityTaxYear) {
      return res.status(404).json({ message: 'Entity tax year not found' })
    }

    // Create e-file authorization
    const authorization = await prisma.efileAuthorization.create({
      data: {
        entityTaxYearId: req.params.entityTaxYearId,
        signerName,
        signerEmail,
        signatureData,
      },
    })

    // Transition to FILED status
    try {
      await transitionStatus(
        req.params.entityTaxYearId,
        'FILED',
        req.userId || 'system',
        'E-file authorization signed'
      )
    } catch (error) {
      // If transition fails, continue anyway
      console.error('Failed to transition to FILED:', error)
    }

    res.json({
      success: true,
      authorization,
      message: 'E-file authorization signed successfully',
    })
  } catch (error) {
    next(error)
  }
})

// Get e-file authorization status
router.get('/:entityTaxYearId', authenticate, async (req: any, res, next) => {
  try {
    const authorization = await prisma.efileAuthorization.findFirst({
      where: { entityTaxYearId: req.params.entityTaxYearId },
      orderBy: { signedAt: 'desc' },
    })

    res.json({
      signed: !!authorization,
      authorization: authorization || null,
    })
  } catch (error) {
    next(error)
  }
})

export default router

