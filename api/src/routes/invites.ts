import { Router } from 'express'
import { authenticate, requireAdmin } from '../middleware/auth'
import { queueEntitiesForInvite, updateInviteDeliveryStatus } from '../services/invites'
import { z } from 'zod'
import prisma from '../db/client'

const router = Router()

const queueSchema = z.object({
  entityIds: z.array(z.string()),
  taxYear: z.number(),
})

// Queue entities for invite
router.post('/queue', authenticate, requireAdmin, async (req: any, res, next) => {
  try {
    const { entityIds, taxYear } = queueSchema.parse(req.body)

    const results = await queueEntitiesForInvite(entityIds, taxYear)

    res.json({
      success: true,
      queued: results.length,
      entities: results,
    })
  } catch (error) {
    next(error)
  }
})

// Get invite queue
router.get('/queue', authenticate, requireAdmin, async (req: any, res, next) => {
  try {
    const { status, taxYear } = req.query

    const where: any = {
      taxReturnExpected: true,
    }

    if (status) {
      where.inviteStatus = status
    }

    if (taxYear) {
      where.taxYear = parseInt(taxYear as string)
    }

    const entityTaxYears = await prisma.entityTaxYear.findMany({
      where,
      include: {
        clientEntity: {
          include: {
            account: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(entityTaxYears)
  } catch (error) {
    next(error)
  }
})

// Trigger invite send wave
router.post('/send', authenticate, requireAdmin, async (req: any, res, next) => {
  try {
    const { entityTaxYearIds } = req.body

    if (!Array.isArray(entityTaxYearIds)) {
      return res.status(400).json({ message: 'entityTaxYearIds must be an array' })
    }

    // Update status to SENT (n8n will process and call webhook)
    await prisma.entityTaxYear.updateMany({
      where: {
        id: { in: entityTaxYearIds },
      },
      data: {
        inviteStatus: 'SENT',
      },
    })

    // In production, this would trigger n8n workflow
    // For now, return success
    res.json({
      success: true,
      message: 'Invite wave triggered',
      count: entityTaxYearIds.length,
    })
  } catch (error) {
    next(error)
  }
})

// Webhook: Update invite delivery status (called by n8n)
router.post('/webhooks/invite-delivery', async (req, res, next) => {
  try {
    // In production, verify webhook signature
    const { entityTaxYearId, status, error } = req.body

    if (!entityTaxYearId || !status) {
      return res.status(400).json({ message: 'entityTaxYearId and status required' })
    }

    await updateInviteDeliveryStatus(entityTaxYearId, status, error)

    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

export default router

