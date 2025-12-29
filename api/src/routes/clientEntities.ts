import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import prisma from '../db/client'

const router = Router()

// Get all entity tax years accessible to the client
router.get('/', authenticate, async (req: any, res, next) => {
  try {
    if (req.userType !== 'CLIENT') {
      return res.status(403).json({ message: 'This endpoint is for clients only' })
    }

    // Get all accounts the user is part of
    const accountUsers = await prisma.accountUser.findMany({
      where: {
        userId: req.userId,
      },
      include: {
        account: {
          include: {
            entities: {
              include: {
                entityTaxYears: {
                  orderBy: { taxYear: 'desc' },
                },
              },
            },
          },
        },
      },
    })

    // Collect all entity tax years
    const entityTaxYears: any[] = []
    
    for (const accountUser of accountUsers) {
      for (const entity of accountUser.account.entities) {
        for (const entityTaxYear of entity.entityTaxYears) {
          entityTaxYears.push({
            id: entityTaxYear.id,
            entityId: entity.id,
            entityName: entity.entityName,
            entityType: entity.entityType,
            taxYear: entityTaxYear.taxYear,
            internalStatus: entityTaxYear.internalStatus,
            engagementStatus: entityTaxYear.engagementStatus,
            accountName: accountUser.account.displayName,
          })
        }
      }
    }

    // Sort by tax year (descending) then entity name
    entityTaxYears.sort((a, b) => {
      if (b.taxYear !== a.taxYear) {
        return b.taxYear - a.taxYear
      }
      return a.entityName.localeCompare(b.entityName)
    })

    res.json(entityTaxYears)
  } catch (error) {
    next(error)
  }
})

export default router


