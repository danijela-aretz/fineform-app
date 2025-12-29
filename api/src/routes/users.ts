import { Router } from 'express'
import { authenticate, requireStaff } from '../middleware/auth'
import prisma from '../db/client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const router = Router()

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1),
  userType: z.enum(['STAFF', 'CLIENT']),
  staffRole: z.enum(['SUPER_ADMIN', 'ADMIN', 'STAFF']).optional(),
  jobTitle: z.string().optional(),
  phone: z.string().optional(),
})

const updateUserSchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  active: z.boolean().optional(),
})

const updateStaffProfileSchema = z.object({
  staffRole: z.enum(['SUPER_ADMIN', 'ADMIN', 'STAFF']).optional(),
  jobTitle: z.string().optional(),
  phone: z.string().optional(),
  active: z.boolean().optional(),
})

// Get current user
router.get('/me', authenticate, async (req: any, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        profile: {
          include: {
            staffProfile: true,
          },
        },
      },
    })

    if (!user || !user.profile) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      id: user.id,
      email: user.email,
      userType: user.profile.userType,
      fullName: user.profile.fullName,
      active: user.profile.active,
      staffRole: user.profile.staffProfile?.staffRole || null,
    })
  } catch (error) {
    next(error)
  }
})

// Get all users (staff only)
router.get('/', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const { userType } = req.query

    const where: any = {}
    if (userType) {
      where.profile = {
        userType: userType as 'STAFF' | 'CLIENT',
      }
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        profile: {
          include: {
            staffProfile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(
      users.map((user) => ({
        id: user.id,
        email: user.email,
        userType: user.profile?.userType,
        fullName: user.profile?.fullName,
        active: user.profile?.active,
        staffRole: user.profile?.staffProfile?.staffRole || null,
        jobTitle: user.profile?.staffProfile?.jobTitle || null,
        phone: user.profile?.staffProfile?.phone || null,
        createdAt: user.createdAt,
      }))
    )
  } catch (error) {
    next(error)
  }
})

// Get user by ID
router.get('/:id', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        profile: {
          include: {
            staffProfile: true,
          },
        },
      },
    })

    if (!user || !user.profile) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      id: user.id,
      email: user.email,
      userType: user.profile.userType,
      fullName: user.profile.fullName,
      active: user.profile.active,
      staffRole: user.profile.staffProfile?.staffRole || null,
      jobTitle: user.profile.staffProfile?.jobTitle || null,
      phone: user.profile.staffProfile?.phone || null,
      staffActive: user.profile.staffProfile?.active ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  } catch (error) {
    next(error)
  }
})

// Create user
router.post('/', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const data = createUserSchema.parse(req.body)

    // Validate staffRole required for STAFF users
    if (data.userType === 'STAFF' && !data.staffRole) {
      return res.status(400).json({ message: 'StaffRole is required for STAFF users' })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        profile: {
          create: {
            userType: data.userType,
            fullName: data.fullName,
            email: data.email,
            active: true,
            ...(data.userType === 'STAFF' && {
              staffProfile: {
                create: {
                  staffRole: data.staffRole!,
                  jobTitle: data.jobTitle || null,
                  phone: data.phone || null,
                  active: true,
                },
              },
            }),
          },
        },
      },
      include: {
        profile: {
          include: {
            staffProfile: true,
          },
        },
      },
    })

    res.status(201).json({
      id: user.id,
      email: user.email,
      userType: user.profile.userType,
      fullName: user.profile.fullName,
      active: user.profile.active,
      staffRole: user.profile.staffProfile?.staffRole || null,
      jobTitle: user.profile.staffProfile?.jobTitle || null,
      phone: user.profile.staffProfile?.phone || null,
      createdAt: user.createdAt,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors })
    }
    next(error)
  }
})

// Update user profile
router.put('/:id', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const data = updateUserSchema.parse(req.body)

    // Check if email is being updated and if it's already taken
    if (data.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      })

      if (existingUser && existingUser.id !== req.params.id) {
        return res.status(400).json({ message: 'Email already in use' })
      }
    }

    // Update profile
    const profile = await prisma.profile.findUnique({
      where: { userId: req.params.id },
    })

    if (!profile) {
      return res.status(404).json({ message: 'User profile not found' })
    }

    await prisma.profile.update({
      where: { userId: req.params.id },
      data: {
        ...(data.fullName !== undefined && { fullName: data.fullName }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.active !== undefined && { active: data.active }),
      },
    })

    // Update user email if email changed
    if (data.email) {
      await prisma.user.update({
        where: { id: req.params.id },
        data: { email: data.email },
      })
    }

    // Get updated user
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        profile: {
          include: {
            staffProfile: true,
          },
        },
      },
    })

    res.json({
      id: user!.id,
      email: user!.email,
      userType: user!.profile!.userType,
      fullName: user!.profile!.fullName,
      active: user!.profile!.active,
      staffRole: user!.profile!.staffProfile?.staffRole || null,
      jobTitle: user!.profile!.staffProfile?.jobTitle || null,
      phone: user!.profile!.staffProfile?.phone || null,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors })
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' })
    }
    next(error)
  }
})

// Update staff profile
router.put('/:id/staff-profile', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const data = updateStaffProfileSchema.parse(req.body)

    // Check if user is STAFF
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        profile: true,
      },
    })

    if (!user || !user.profile) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.profile.userType !== 'STAFF') {
      return res.status(400).json({ message: 'User is not a staff member' })
    }

    // Update or create staff profile
    const staffProfile = await prisma.staffProfile.upsert({
      where: { userId: req.params.id },
      update: {
        ...(data.staffRole !== undefined && { staffRole: data.staffRole }),
        ...(data.jobTitle !== undefined && { jobTitle: data.jobTitle }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.active !== undefined && { active: data.active }),
      },
      create: {
        userId: req.params.id,
        staffRole: data.staffRole || 'STAFF',
        jobTitle: data.jobTitle || null,
        phone: data.phone || null,
        active: data.active !== undefined ? data.active : true,
      },
    })

    res.json({
      staffRole: staffProfile.staffRole,
      jobTitle: staffProfile.jobTitle,
      phone: staffProfile.phone,
      active: staffProfile.active,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors })
    }
    next(error)
  }
})

// Delete user
router.delete('/:id', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    // Check for related records
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        profile: {
          include: {
            accountUsers: true,
            staffProfile: {
              include: {
                clientAcl: true,
                clientStaffAssignments: { where: { active: true } },
                uploadedDocuments: true,
              },
            },
          },
        },
      },
    })

    if (!user || !user.profile) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check for active relationships
    const hasAccountUsers = user.profile.accountUsers.length > 0
    const hasActiveAssignments =
      user.profile.staffProfile?.clientStaffAssignments.length > 0
    const hasAclEntries = user.profile.staffProfile?.clientAcl.length > 0
    const hasUploadedDocuments = user.profile.staffProfile?.uploadedDocuments.length > 0

    if (hasAccountUsers || hasActiveAssignments || hasAclEntries || hasUploadedDocuments) {
      return res.status(400).json({
        message:
          'Cannot delete user with active relationships. Please remove account associations, assignments, and ACL entries first.',
        details: {
          accountUsers: hasAccountUsers,
          activeAssignments: hasActiveAssignments,
          aclEntries: hasAclEntries,
          uploadedDocuments: hasUploadedDocuments,
        },
      })
    }

    // Delete user (cascade will handle profile and staffProfile)
    await prisma.user.delete({
      where: { id: req.params.id },
    })

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' })
    }
    next(error)
  }
})

export default router

