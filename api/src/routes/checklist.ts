import { Router } from 'express'
import { authenticate, requireStaff } from '../middleware/auth'
import { createBaselineChecklist, createChecklistFromProforma, ensureChecklistExists } from '../services/checklist'
import { computeChecklistCompletion } from '../services/entityTaxYear'
import { z } from 'zod'
import prisma from '../db/client'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = Router()

const upload = multer({
  dest: path.join(__dirname, '../../uploads/proforma'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
})

// Get checklist items
router.get('/:entityTaxYearId', authenticate, async (req: any, res, next) => {
  try {
    const checklistItems = await prisma.checklistItem.findMany({
      where: { entityTaxYearId: req.params.entityTaxYearId },
      include: {
        files: {
          include: {
            document: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    res.json(checklistItems)
  } catch (error) {
    next(error)
  }
})

// Generate baseline checklist
router.post('/:entityTaxYearId/generate', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const entityTaxYear = await prisma.entityTaxYear.findUnique({
      where: { id: req.params.entityTaxYearId },
      include: {
        clientEntity: true,
      },
    })

    if (!entityTaxYear) {
      return res.status(404).json({ message: 'Entity tax year not found' })
    }

    // Check if checklist exists
    const existing = await prisma.checklistItem.findFirst({
      where: { entityTaxYearId: req.params.entityTaxYearId },
    })

    if (existing) {
      return res.status(400).json({ message: 'Checklist already exists' })
    }

    const items = await createBaselineChecklist(
      req.params.entityTaxYearId,
      entityTaxYear.clientEntity.entityType
    )

    res.json({
      success: true,
      items,
      message: 'Baseline checklist created',
    })
  } catch (error) {
    next(error)
  }
})

// Upload proforma (triggers n8n parsing)
router.post('/:entityTaxYearId/proforma', authenticate, requireStaff, upload.single('file'), async (req: any, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    // Store proforma file
    // In production, this would trigger n8n workflow to parse
    // For now, return success and webhook endpoint info

    res.json({
      success: true,
      message: 'Proforma uploaded. Parsing will be triggered via webhook.',
      fileId: req.file.filename,
    })
  } catch (error) {
    next(error)
  }
})

// Webhook: Receive parsed checklist from n8n
router.post('/webhooks/checklist-generated', async (req, res, next) => {
  try {
    const { entityTaxYearId, items, fallback } = req.body

    if (!entityTaxYearId) {
      return res.status(400).json({ message: 'entityTaxYearId required' })
    }

    // Check if checklist already exists
    const existing = await prisma.checklistItem.findFirst({
      where: { entityTaxYearId },
    })

    if (existing && !fallback) {
      return res.json({ success: true, message: 'Checklist already exists' })
    }

    let checklistItems

    if (fallback || !items || items.length === 0) {
      // Use baseline checklist
      const entityTaxYear = await prisma.entityTaxYear.findUnique({
        where: { id: entityTaxYearId },
        include: {
          clientEntity: true,
        },
      })

      if (!entityTaxYear) {
        return res.status(404).json({ message: 'Entity tax year not found' })
      }

      checklistItems = await createBaselineChecklist(
        entityTaxYearId,
        entityTaxYear.clientEntity.entityType
      )
    } else {
      // Create from parsed items
      checklistItems = await createChecklistFromProforma(entityTaxYearId, items)
    }

    res.json({
      success: true,
      items: checklistItems,
    })
  } catch (error) {
    next(error)
  }
})

// Add checklist item (staff)
router.post('/:entityTaxYearId/items', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const { itemName, itemType, required } = req.body

    const item = await prisma.checklistItem.create({
      data: {
        entityTaxYearId: req.params.entityTaxYearId,
        itemName,
        itemType: itemType || null,
        required: required !== false,
        status: 'PENDING',
      },
    })

    // Recompute completion
    await computeChecklistCompletion(req.params.entityTaxYearId)

    res.json(item)
  } catch (error) {
    next(error)
  }
})

// Update checklist item
router.put('/:entityTaxYearId/items/:id', authenticate, async (req: any, res, next) => {
  try {
    const { status, itemName, required, notes } = req.body

    const item = await prisma.checklistItem.update({
      where: { id: req.params.id },
      data: {
        ...(status && { status }),
        ...(itemName && { itemName }),
        ...(required !== undefined && { required }),
        ...(notes !== undefined && { notes }),
        ...(status === 'RECEIVED' && { receivedAt: new Date() }),
        ...(status === 'NOT_APPLICABLE' && { markedNotApplicableAt: new Date() }),
      },
    })

    // Recompute completion
    await computeChecklistCompletion(req.params.entityTaxYearId)

    res.json(item)
  } catch (error) {
    next(error)
  }
})

// Delete checklist item (staff)
router.delete('/:entityTaxYearId/items/:id', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    await prisma.checklistItem.delete({
      where: { id: req.params.id },
    })

    // Recompute completion
    await computeChecklistCompletion(req.params.entityTaxYearId)

    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

export default router

