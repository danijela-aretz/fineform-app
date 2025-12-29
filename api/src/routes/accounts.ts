import { Router } from 'express'
import { authenticate, requireStaff } from '../middleware/auth'
import prisma from '../db/client'
import { z } from 'zod'

const router = Router()

const createAccountSchema = z.object({
  displayName: z.string().min(1),
})

const updateAccountSchema = z.object({
  displayName: z.string().min(1).optional(),
})

const addUserToAccountSchema = z.object({
  userId: z.string().uuid(),
  clientRole: z.enum(['ADMIN', 'ASSISTANT']).optional().default('ASSISTANT'),
})

// Get all accounts
router.get('/', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const accounts = await prisma.account.findMany({
      include: {
        accountUsers: {
          include: {
            profile: true,
          },
        },
        entities: {
          select: {
            id: true,
            entityName: true,
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

// Get account by ID
router.get('/:id', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const account = await prisma.account.findUnique({
      where: { id: req.params.id },
      include: {
        accountUsers: {
          include: {
            profile: true,
          },
        },
        entities: {
          include: {
            entityTaxYears: {
              orderBy: { taxYear: 'desc' },
              take: 1,
            },
          },
        },
      },
    })

    if (!account) {
      return res.status(404).json({ message: 'Account not found' })
    }

    res.json(account)
  } catch (error) {
    next(error)
  }
})

// Create account
router.post('/', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const data = createAccountSchema.parse(req.body)

    const account = await prisma.account.create({
      data: {
        displayName: data.displayName,
      },
      include: {
        accountUsers: true,
        entities: true,
      },
    })

    res.status(201).json(account)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors })
    }
    next(error)
  }
})

// Update account
router.put('/:id', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const data = updateAccountSchema.parse(req.body)

    const account = await prisma.account.update({
      where: { id: req.params.id },
      data: {
        ...(data.displayName !== undefined && { displayName: data.displayName }),
      },
      include: {
        accountUsers: {
          include: {
            profile: true,
          },
        },
        entities: true,
      },
    })

    res.json(account)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors })
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Account not found' })
    }
    next(error)
  }
})

// Delete account
router.delete('/:id', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    // Check if account has entities
    const entities = await prisma.clientEntity.count({
      where: { accountId: req.params.id },
    })

    if (entities > 0) {
      return res.status(400).json({
        message: 'Cannot delete account with existing entities. Please delete entities first.',
      })
    }

    await prisma.account.delete({
      where: { id: req.params.id },
    })

    res.json({ message: 'Account deleted successfully' })
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Account not found' })
    }
    next(error)
  }
})

// Add user to account
router.post('/:id/users', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const accountId = req.params.id
    const data = addUserToAccountSchema.parse(req.body)

    // Verify account exists
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    })

    if (!account) {
      return res.status(404).json({ message: 'Account not found' })
    }

    // Verify user exists and is a client
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      include: {
        profile: true,
      },
    })

    if (!user || !user.profile) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.profile.userType !== 'CLIENT') {
      return res.status(400).json({ message: 'Only client users can be added to accounts' })
    }

    // Check if user is already in account
    const existing = await prisma.accountUser.findUnique({
      where: {
        accountId_userId: {
          accountId,
          userId: data.userId,
        },
      },
    })

    if (existing) {
      return res.status(400).json({ message: 'User is already in this account' })
    }

    const accountUser = await prisma.accountUser.create({
      data: {
        accountId,
        userId: data.userId,
        clientRole: data.clientRole,
      },
      include: {
        profile: true,
      },
    })

    res.status(201).json(accountUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors })
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'User is already in this account' })
    }
    next(error)
  }
})

// Remove user from account
router.delete('/:id/users/:userId', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    await prisma.accountUser.delete({
      where: {
        accountId_userId: {
          accountId: req.params.id,
          userId: req.params.userId,
        },
      },
    })

    res.json({ message: 'User removed from account successfully' })
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Account user relationship not found' })
    }
    next(error)
  }
})

// Get all client users (for adding to accounts)
router.get('/users/clients', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const clientUsers = await prisma.user.findMany({
      where: {
        profile: {
          userType: 'CLIENT',
        },
      },
      include: {
        profile: true,
      },
      orderBy: {
        profile: {
          fullName: 'asc',
        },
      },
    })

    res.json(clientUsers)
  } catch (error) {
    next(error)
  }
})

export default router


