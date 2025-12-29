import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { getClientStatus } from '../services/clientStatus'
import prisma from '../db/client'

const router = Router()

// Get client status for entity tax year
router.get('/:entityTaxYearId', authenticate, async (req: any, res, next) => {
  try {
    const entityTaxYear = await prisma.entityTaxYear.findUnique({
      where: { id: req.params.entityTaxYearId },
      include: {
        clientEntity: {
          include: {
            account: {
              include: {
                accountUsers: true,
              },
            },
          },
        },
      },
    })

    if (!entityTaxYear) {
      return res.status(404).json({ message: 'Entity tax year not found' })
    }

    // Verify client has access
    if (req.userType === 'CLIENT') {
      const hasAccess = entityTaxYear.clientEntity.account.accountUsers.some(
        (au) => au.userId === req.userId
      )
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' })
      }
    }

    const statusInfo = await getClientStatus(req.params.entityTaxYearId)

    // Include extension info - ensure all booleans are explicitly boolean
    res.json({
      ...statusInfo,
      extensionRequested: !!entityTaxYear.extensionRequested,
      extensionFiled: !!entityTaxYear.extensionFiled,
      extendedDueDate: entityTaxYear.extendedDueDate,
      taxYear: entityTaxYear.taxYear,
      entityName: entityTaxYear.clientEntity.entityName,
    })
  } catch (error) {
    next(error)
  }
})

export default router

