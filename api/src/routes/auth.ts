import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../db/client'
import { AppError } from '../middleware/errorHandler'
import { z } from 'zod'

const router = Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    // Normalize email to lowercase and trim whitespace
    const normalizedEmail = email.toLowerCase().trim()
    const normalizedPassword = password.trim()

    // Find user - try exact match first, then case-insensitive
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        profile: {
          include: {
            staffProfile: true,
          },
        },
      },
    })

    // If not found with exact match, try case-insensitive search
    if (!user) {
      const allUsers = await prisma.user.findMany({
        include: {
          profile: {
            include: {
              staffProfile: true,
            },
          },
        },
      })
      const foundUser = allUsers.find(u => u.email.toLowerCase() === normalizedEmail)
      if (foundUser) {
        user = await prisma.user.findUnique({
          where: { id: foundUser.id },
          include: {
            profile: {
              include: {
                staffProfile: true,
              },
            },
          },
        })
      }
    }

    if (!user) {
      console.error(`Login attempt failed: User not found for email: ${normalizedEmail}`)
      throw new AppError('Invalid credentials', 401)
    }

    if (!user.profile) {
      console.error(`Login attempt failed: User ${user.id} has no profile`)
      throw new AppError('Invalid credentials', 401)
    }

    // Verify password (trimmed to handle whitespace issues)
    const isValid = await bcrypt.compare(normalizedPassword, user.passwordHash)
    if (!isValid) {
      console.error(`Login attempt failed: Invalid password for user: ${user.id} (${normalizedEmail})`)
      throw new AppError('Invalid credentials', 401)
    }

    // Check if profile is active
    if (!user.profile.active) {
      console.error(`Login attempt failed: Account inactive for user: ${user.id}`)
      throw new AppError('Account is inactive', 403)
    }

    // Generate tokens
    const payload = {
      userId: user.id,
      email: user.email,
      userType: user.profile.userType,
      staffRole: user.profile.staffProfile?.staffRole || null,
    }

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '15m',
    })

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: '7d',
    })

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        userType: user.profile.userType,
        fullName: user.profile.fullName,
        staffRole: user.profile.staffProfile?.staffRole || null,
      },
    })
  } catch (error) {
    next(error)
  }
})

// Refresh token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      throw new AppError('Refresh token required', 401)
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        profile: {
          include: {
            staffProfile: true,
          },
        },
      },
    })

    if (!user || !user.profile || !user.profile.active) {
      throw new AppError('Invalid refresh token', 401)
    }

    // Generate new access token
    const payload = {
      userId: user.id,
      email: user.email,
      userType: user.profile.userType,
      staffRole: user.profile.staffProfile?.staffRole || null,
    }

    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '15m',
    })

    res.json({ accessToken: newAccessToken })
  } catch (error) {
    next(error)
  }
})

export default router

