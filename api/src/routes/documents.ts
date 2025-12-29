import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { authenticate } from '../middleware/auth'
import prisma from '../db/client'
import { linkDocumentToChecklistItem, logDocumentEvent, checkConfirmationRequired } from '../services/documents'
import { computeChecklistCompletion } from '../services/entityTaxYear'
import { getStaffWithAccess } from '../services/permissions'
import { z } from 'zod'

const router = Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const clientId = req.body.clientId || req.body.clientEntityId
    const folderId = req.body.folderId
    
    // Create path: uploads/{clientId}/{folderId}/
    let uploadPath = path.join(__dirname, '../../uploads')
    if (clientId) {
      uploadPath = path.join(uploadPath, clientId)
      if (folderId) {
        uploadPath = path.join(uploadPath, folderId)
      }
    }
    
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
    fileSize: 50 * 1024 * 1024, // 50MB
  },
})

// Upload document via checklist item
router.post('/upload', authenticate, upload.single('file'), async (req: any, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const { entityTaxYearId, checklistItemId, clientId, folderId, displayName } = req.body

    if (!clientId) {
      return res.status(400).json({ message: 'clientId required' })
    }

    // Create document
    const document = await prisma.document.create({
      data: {
        clientId,
        folderId: folderId || null,
        storagePath: req.file.path,
        displayName: displayName || req.file.originalname,
        uploadedBy: req.userType === 'STAFF' ? req.userId : null,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      },
    })

    // Link to checklist item if provided
    if (checklistItemId) {
      await linkDocumentToChecklistItem(document.id, checklistItemId)
    }

    // Log event
    if (entityTaxYearId) {
      await logDocumentEvent(entityTaxYearId, 'UPLOADED', document.id)
      
      // Check if confirmation required
      const confirmationRequired = await checkConfirmationRequired(entityTaxYearId)
      
      // Send upload notifications (webhook for n8n)
      const staffUserIds = await getStaffWithAccess(clientId)
      // In production, trigger n8n webhook for email notifications
    }

    res.json(document)
  } catch (error) {
    next(error)
  }
})

// General upload (fallback)
router.post('/upload/general', authenticate, upload.single('file'), async (req: any, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const { entityTaxYearId, clientId, documentType, issuer, displayName } = req.body

    if (!clientId || !entityTaxYearId) {
      return res.status(400).json({ message: 'clientId and entityTaxYearId required' })
    }

    // Create document
    const document = await prisma.document.create({
      data: {
        clientId,
        storagePath: req.file.path,
        displayName: displayName || req.file.originalname,
        uploadedBy: req.userType === 'STAFF' ? req.userId : null,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      },
    })

    // Try to match to existing checklist item or create new
    if (documentType) {
      let checklistItem = await prisma.checklistItem.findFirst({
        where: {
          entityTaxYearId,
          itemType: documentType,
        },
      })

      if (!checklistItem) {
        // Create new checklist item
        checklistItem = await prisma.checklistItem.create({
          data: {
            entityTaxYearId,
            itemName: documentType,
            itemType: documentType,
            required: false,
            status: 'RECEIVED',
            receivedAt: new Date(),
          },
        })
      }

      // Link document to checklist item
      await linkDocumentToChecklistItem(document.id, checklistItem.id)
    }

    // Log event
    await logDocumentEvent(entityTaxYearId, 'UPLOADED', document.id, { documentType, issuer })

    res.json(document)
  } catch (error) {
    next(error)
  }
})

// Replace document
router.post('/:id/replace', authenticate, upload.single('file'), async (req: any, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const { reason } = req.body

    const oldDocument = await prisma.document.findUnique({
      where: { id: req.params.id },
    })

    if (!oldDocument) {
      return res.status(404).json({ message: 'Document not found' })
    }

    // Create new document (keep old for audit)
    const newDocument = await prisma.document.create({
      data: {
        clientId: oldDocument.clientId,
        folderId: oldDocument.folderId,
        storagePath: req.file.path,
        displayName: req.file.originalname,
        uploadedBy: req.userType === 'STAFF' ? req.userId : null,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      },
    })

    // Update checklist item status
    const checklistLink = await prisma.checklistItemFile.findFirst({
      where: { documentId: oldDocument.id },
    })

    if (checklistLink) {
      // Link new document to checklist item
      await linkDocumentToChecklistItem(newDocument.id, checklistLink.checklistItemId)
    }

    // Get entity tax year for logging
    const checklistItem = checklistLink
      ? await prisma.checklistItem.findUnique({
          where: { id: checklistLink.checklistItemId },
        })
      : null

    if (checklistItem) {
      await logDocumentEvent(checklistItem.entityTaxYearId, 'REPLACED', newDocument.id, {
        oldDocumentId: oldDocument.id,
        reason,
      })
    }

    res.json(newDocument)
  } catch (error) {
    next(error)
  }
})

// Sign document receipt confirmation
router.post('/confirmation/:entityTaxYearId/sign', authenticate, async (req: any, res, next) => {
  try {
    const { signerName, signerEmail, signatureData } = req.body

    const entityTaxYear = await prisma.entityTaxYear.findUnique({
      where: { id: req.params.entityTaxYearId },
    })

    if (!entityTaxYear) {
      return res.status(404).json({ message: 'Entity tax year not found' })
    }

    // Check if checklist is complete
    if (!entityTaxYear.checklistCompleteAt) {
      return res.status(400).json({ message: 'Checklist must be complete before confirmation' })
    }

    // Update confirmation status
    await prisma.entityTaxYear.update({
      where: { id: req.params.entityTaxYearId },
      data: {
        docConfirmationStatus: 'SIGNED',
        docConfirmationSignedAt: new Date(),
        docConfirmationSignerId: req.userId || null,
      },
    })

    // Log event
    await logDocumentEvent(req.params.entityTaxYearId, 'CONFIRMATION_SIGNED')

    // Check Ready for Prep and auto-transition if ready
    const { computeReadyForPrep } = await import('../services/entityTaxYear')
    const readyForPrep = await computeReadyForPrep(req.params.entityTaxYearId)

    // Auto-transition to READY_FOR_PREP if all gates are met
    if (readyForPrep && entityTaxYear.internalStatus === 'AWAITING_CONFIRMATION') {
      try {
        const { transitionStatus } = await import('../services/statusTransitions')
        await transitionStatus(
          req.params.entityTaxYearId,
          'READY_FOR_PREP',
          'system',
          'All client requirements satisfied'
        )
      } catch (error) {
        // Silently fail if transition not valid
        console.error('Failed to auto-transition to Ready for Prep:', error)
      }
    }

    res.json({
      success: true,
      message: 'Confirmation signed successfully',
    })
  } catch (error) {
    next(error)
  }
})

// Get document by ID
router.get('/:id', authenticate, async (req: any, res, next) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    })

    if (!document) {
      return res.status(404).json({ message: 'Document not found' })
    }

    res.json(document)
  } catch (error) {
    next(error)
  }
})

// Download document
router.get('/:id/download', authenticate, async (req: any, res, next) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    })

    if (!document) {
      return res.status(404).json({ message: 'Document not found' })
    }

    if (!fs.existsSync(document.storagePath)) {
      return res.status(404).json({ message: 'File not found on server' })
    }

    res.download(document.storagePath, document.displayName)
  } catch (error) {
    next(error)
  }
})

export default router

