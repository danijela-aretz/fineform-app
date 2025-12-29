import { Router } from 'express'
import { authenticate, requireStaff } from '../middleware/auth'
import { checkClientVisibility, checkTaxAccess } from '../services/permissions'
import { getBlockingReasons } from '../services/entityTaxYear'
import { transitionStatus, getStatusHistory } from '../services/statusTransitions'
import prisma from '../db/client'

const router = Router()

// Get dashboard list (filtered by permissions)
router.get('/', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const { taxYear, status, assignedStaffId, extensionRequested, extensionFiled } = req.query

    // Build where clause based on permissions
    const where: any = {}

    if (taxYear) {
      where.taxYear = parseInt(taxYear as string)
    }

    if (status) {
      where.internalStatus = status
    }

    if (extensionRequested === 'true') {
      where.extensionRequested = true
    }

    if (extensionFiled === 'true') {
      where.extensionFiled = true
    }

    // Get all entity tax years (will filter by permissions in service)
    let entityTaxYears = await prisma.entityTaxYear.findMany({
      where,
      include: {
        clientEntity: {
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
        },
        reminderState: true,
      },
      orderBy: { updatedAt: 'desc' },
    })

    // Filter by permissions
    const filtered = []
    for (const ety of entityTaxYears) {
      // Check client visibility
      const visibility = await checkClientVisibility(req.userId!, ety.clientEntityId)
      if (!visibility.canAccess) continue

      // Check tax access
      const taxAccess = await checkTaxAccess(req.userId!, ety.clientEntityId)
      if (!taxAccess.canAccess) continue

      // Filter by assigned staff if specified
      if (assignedStaffId) {
        const assignment = await prisma.clientStaffAssignment.findFirst({
          where: {
            clientId: ety.clientEntityId,
            staffUserId: assignedStaffId as string,
            active: true,
          },
        })
        if (!assignment) continue
      }

      filtered.push(ety)
    }

    res.json(filtered)
  } catch (error) {
    next(error)
  }
})

// Get entity tax year detail
router.get('/:entityTaxYearId', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const entityTaxYear = await prisma.entityTaxYear.findUnique({
      where: { id: req.params.entityTaxYearId },
      include: {
        clientEntity: {
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
        },
        checklistItems: {
          include: {
            files: {
              include: {
                document: true,
              },
            },
          },
        },
        reminderState: true,
        statusAuditLogs: {
          include: {
            staff: {
              include: {
                profile: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!entityTaxYear) {
      return res.status(404).json({ message: 'Entity tax year not found' })
    }

    // Check permissions
    const visibility = await checkClientVisibility(req.userId!, entityTaxYear.clientEntityId)
    if (!visibility.canAccess) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const taxAccess = await checkTaxAccess(req.userId!, entityTaxYear.clientEntityId)
    if (!taxAccess.canAccess) {
      return res.status(403).json({ message: 'Tax access denied' })
    }

    // Get blocking reasons
    const blockingReasons = await getBlockingReasons(req.params.entityTaxYearId)

    res.json({
      ...entityTaxYear,
      blockingReasons,
    })
  } catch (error) {
    next(error)
  }
})

// Transition status
router.post('/:entityTaxYearId/status', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const { newStatus, reason, allowSoftWarnings } = req.body

    if (!newStatus) {
      return res.status(400).json({ message: 'newStatus required' })
    }

    // Check permissions
    const entityTaxYear = await prisma.entityTaxYear.findUnique({
      where: { id: req.params.entityTaxYearId },
    })

    if (!entityTaxYear) {
      return res.status(404).json({ message: 'Entity tax year not found' })
    }

    const visibility = await checkClientVisibility(req.userId!, entityTaxYear.clientEntityId)
    if (!visibility.canAccess) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const result = await transitionStatus(
      req.params.entityTaxYearId,
      newStatus,
      req.userId!,
      reason,
      allowSoftWarnings === true
    )

    res.json(result)
  } catch (error: any) {
    next(error)
  }
})

// Get status history
router.get('/:entityTaxYearId/history', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const history = await getStatusHistory(req.params.entityTaxYearId)
    res.json(history)
  } catch (error) {
    next(error)
  }
})

export default router

