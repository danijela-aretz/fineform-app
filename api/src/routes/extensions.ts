import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { authenticate, requireStaff } from '../middleware/auth'
import { requestExtension, fileExtension } from '../services/extensions'
import prisma from '../db/client'

const router = Router()

// Configure multer for extension document upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/extensions')
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
})

// Request extension (client action)
router.post('/:entityTaxYearId/request', authenticate, async (req: any, res, next) => {
  try {
    // Verify client has access to this entity
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

    // Check if user is a client for this entity
    if (req.userType === 'CLIENT') {
      const hasAccess = entityTaxYear.clientEntity.account.accountUsers.some(
        (au) => au.userId === req.userId
      )
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' })
      }
    }

    const updated = await requestExtension(req.params.entityTaxYearId)

    res.json({
      success: true,
      entityTaxYear: updated,
      message: 'Extension requested. All reminders have been paused.',
    })
  } catch (error) {
    next(error)
  }
})

// File extension (staff action)
router.post(
  '/:entityTaxYearId/file',
  authenticate,
  requireStaff,
  upload.single('extensionDocument'),
  async (req: any, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Extension document required' })
      }

      const updated = await fileExtension(
        req.params.entityTaxYearId,
        req.userId!,
        req.file.path,
        req.file.originalname
      )

      res.json({
        success: true,
        entityTaxYear: updated,
        message: 'Extension filed successfully. Reminders will resume relative to extended due date.',
      })
    } catch (error) {
      next(error)
    }
  }
)

// Get extension status
router.get('/:entityTaxYearId', authenticate, async (req: any, res, next) => {
  try {
    const entityTaxYear = await prisma.entityTaxYear.findUnique({
      where: { id: req.params.entityTaxYearId },
      select: {
        extensionRequested: true,
        extensionFiled: true,
        extendedDueDate: true,
      },
    })

    if (!entityTaxYear) {
      return res.status(404).json({ message: 'Entity tax year not found' })
    }

    res.json(entityTaxYear)
  } catch (error) {
    next(error)
  }
})

export default router

