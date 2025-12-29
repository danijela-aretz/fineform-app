import { Router } from 'express'
import { authenticate, requireStaff } from '../middleware/auth'
import prisma from '../db/client'
import { z } from 'zod'
import { createSystemFolders } from '../services/folders'

const router = Router()

const createEntitySchema = z.object({
  accountId: z.string().uuid(),
  entityName: z.string().min(1),
  entityType: z.enum(['HOUSEHOLD_1040', 'LLC', 'S_CORP', 'C_CORP', 'PARTNERSHIP', 'SOLE_PROPRIETORSHIP', 'TRUST', 'ESTATE', 'OTHER']),
  status: z.string().optional(),
  isRestricted: z.boolean().optional().default(false),
})

const updateEntitySchema = z.object({
  entityName: z.string().min(1).optional(),
  entityType: z.enum(['HOUSEHOLD_1040', 'LLC', 'S_CORP', 'C_CORP', 'PARTNERSHIP', 'SOLE_PROPRIETORSHIP', 'TRUST', 'ESTATE', 'OTHER']).optional(),
  status: z.string().optional(),
  isRestricted: z.boolean().optional(),
})

// Get all accounts (for dropdown in create form) - MUST come before /:id route
router.get('/accounts/list', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const accounts = await prisma.account.findMany({
      include: {
        accountUsers: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(accounts)
  } catch (error) {
    next(error)
  }
})

// Get all entities (staff only for now)
router.get('/', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const entities = await prisma.clientEntity.findMany({
      include: {
        account: true,
        entityTaxYears: {
          orderBy: { taxYear: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(entities)
  } catch (error) {
    next(error)
  }
})

// Get entity by ID
router.get('/:id', authenticate, async (req: any, res, next) => {
  try {
    const entity = await prisma.clientEntity.findUnique({
      where: { id: req.params.id },
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
        entityTaxYears: {
          orderBy: { taxYear: 'desc' },
        },
      },
    })

    if (!entity) {
      return res.status(404).json({ message: 'Entity not found' })
    }

    res.json(entity)
  } catch (error) {
    next(error)
  }
})

// Create entity
router.post('/', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const data = createEntitySchema.parse(req.body)

    // Verify account exists
    const account = await prisma.account.findUnique({
      where: { id: data.accountId },
    })

    if (!account) {
      return res.status(404).json({ message: 'Account not found' })
    }

    const entity = await prisma.clientEntity.create({
      data: {
        accountId: data.accountId,
        entityName: data.entityName,
        entityType: data.entityType,
        status: data.status || null,
        isRestricted: data.isRestricted,
      },
      include: {
        account: true,
      },
    })

    // Create system folders for the new entity
    // Use current year as default (folders will be created for the tax year when entity is queued)
    const currentYear = new Date().getFullYear()
    try {
      await createSystemFolders(entity.id, currentYear)
    } catch (error) {
      // Log error but don't fail entity creation
      console.error('Failed to create system folders:', error)
    }

    res.status(201).json(entity)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors })
    }
    next(error)
  }
})

// Update entity
router.put('/:id', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const data = updateEntitySchema.parse(req.body)

    const entity = await prisma.clientEntity.update({
      where: { id: req.params.id },
      data: {
        ...(data.entityName !== undefined && { entityName: data.entityName }),
        ...(data.entityType !== undefined && { entityType: data.entityType }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.isRestricted !== undefined && { isRestricted: data.isRestricted }),
      },
      include: {
        account: true,
      },
    })

    res.json(entity)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors })
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Entity not found' })
    }
    next(error)
  }
})

// Delete entity
router.delete('/:id', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    // Check if entity has tax years
    const entityTaxYears = await prisma.entityTaxYear.count({
      where: { clientEntityId: req.params.id },
    })

    if (entityTaxYears > 0) {
      return res.status(400).json({
        message: 'Cannot delete entity with existing tax years. Please delete tax years first.',
      })
    }

    await prisma.clientEntity.delete({
      where: { id: req.params.id },
    })

    res.json({ message: 'Entity deleted successfully' })
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Entity not found' })
    }
    next(error)
  }
})

export default router

