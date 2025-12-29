import { Router } from 'express'
import { authenticate, requireStaff } from '../middleware/auth'
import {
  getQuestionnaire,
  saveAnswer,
  submitQuestionnaire,
  getQuestionnaireStatus,
} from '../services/questionnaire'
import prisma from '../db/client'
import { z } from 'zod'

const router = Router()

// Get questionnaire for entity tax year
router.get('/:entityTaxYearId', authenticate, async (req: any, res, next) => {
  try {
    const questionnaire = await getQuestionnaire(req.params.entityTaxYearId)
    res.json(questionnaire)
  } catch (error) {
    next(error)
  }
})

// Get questionnaire status
router.get('/:entityTaxYearId/status', authenticate, async (req: any, res, next) => {
  try {
    const status = await getQuestionnaireStatus(req.params.entityTaxYearId)
    res.json(status)
  } catch (error) {
    next(error)
  }
})

// Save answer (draft)
router.post('/:entityTaxYearId/answer', authenticate, async (req: any, res, next) => {
  try {
    const { questionId, answerValue } = z
      .object({
        questionId: z.string(),
        answerValue: z.any(),
      })
      .parse(req.body)

    const answer = await saveAnswer(req.params.entityTaxYearId, questionId, answerValue)
    res.json(answer)
  } catch (error) {
    next(error)
  }
})

// Submit questionnaire
router.post('/:entityTaxYearId/submit', authenticate, async (req: any, res, next) => {
  try {
    const entityTaxYear = await submitQuestionnaire(req.params.entityTaxYearId)
    res.json({
      success: true,
      entityTaxYear,
      message: 'Questionnaire submitted successfully',
    })
  } catch (error: any) {
    next(error)
  }
})

// Admin: Create section
router.post('/sections', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const { name, description, order } = z
      .object({
        name: z.string(),
        description: z.string().optional(),
        order: z.number().optional(),
      })
      .parse(req.body)

    const section = await prisma.questionnaireSection.create({
      data: {
        name,
        description: description || null,
        order: order || 0,
      },
    })

    res.json(section)
  } catch (error) {
    next(error)
  }
})

// Admin: Create question
router.post('/questions', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const { sectionId, questionText, questionType, required, order, conditionalLogic } = z
      .object({
        sectionId: z.string(),
        questionText: z.string(),
        questionType: z.enum(['TEXT', 'TEXTAREA', 'NUMBER', 'DATE', 'SELECT', 'MULTI_SELECT', 'BOOLEAN', 'FILE']),
        required: z.boolean().optional(),
        order: z.number().optional(),
        conditionalLogic: z.string().optional(),
      })
      .parse(req.body)

    const question = await prisma.questionnaireQuestion.create({
      data: {
        sectionId,
        questionText,
        questionType,
        required: required !== false,
        order: order || 0,
        conditionalLogic: conditionalLogic || null,
      },
    })

    res.json(question)
  } catch (error) {
    next(error)
  }
})

// Admin: Get all sections and questions (builder)
router.get('/builder/all', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const sections = await prisma.questionnaireSection.findMany({
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    })

    res.json(sections)
  } catch (error) {
    next(error)
  }
})

// Admin: Get all sections
router.get('/sections', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const sections = await prisma.questionnaireSection.findMany({
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    })

    res.json(sections)
  } catch (error) {
    next(error)
  }
})

// Admin: Get section by ID
router.get('/sections/:id', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const section = await prisma.questionnaireSection.findUnique({
      where: { id: req.params.id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!section) {
      return res.status(404).json({ message: 'Section not found' })
    }

    res.json(section)
  } catch (error) {
    next(error)
  }
})

// Admin: Update section
router.put('/sections/:id', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const { name, description, order, active } = z
      .object({
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        order: z.number().int().min(0).optional(),
        active: z.boolean().optional(),
      })
      .parse(req.body)

    const section = await prisma.questionnaireSection.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description: description || null }),
        ...(order !== undefined && { order }),
        ...(active !== undefined && { active }),
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    })

    res.json(section)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors })
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Section not found' })
    }
    next(error)
  }
})

// Admin: Delete section
router.delete('/sections/:id', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    // Cascade delete will handle questions
    await prisma.questionnaireSection.delete({
      where: { id: req.params.id },
    })

    res.json({ message: 'Section deleted successfully' })
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Section not found' })
    }
    next(error)
  }
})

// Admin: Get question by ID
router.get('/questions/:id', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const question = await prisma.questionnaireQuestion.findUnique({
      where: { id: req.params.id },
      include: {
        section: true,
      },
    })

    if (!question) {
      return res.status(404).json({ message: 'Question not found' })
    }

    res.json(question)
  } catch (error) {
    next(error)
  }
})

// Admin: Create question (update existing route to use sectionId param)
router.post('/sections/:sectionId/questions', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const { questionText, questionType, required, order, conditionalLogic } = z
      .object({
        questionText: z.string().min(1),
        questionType: z.enum(['TEXT', 'TEXTAREA', 'NUMBER', 'DATE', 'SELECT', 'MULTI_SELECT', 'BOOLEAN', 'FILE']),
        required: z.boolean().optional(),
        order: z.number().int().min(0).optional(),
        conditionalLogic: z.string().optional(),
      })
      .parse(req.body)

    // Validate conditionalLogic is valid JSON if provided
    if (conditionalLogic) {
      try {
        JSON.parse(conditionalLogic)
      } catch {
        return res.status(400).json({ message: 'conditionalLogic must be valid JSON' })
      }
    }

    const question = await prisma.questionnaireQuestion.create({
      data: {
        sectionId: req.params.sectionId,
        questionText,
        questionType,
        required: required !== false,
        order: order || 0,
        conditionalLogic: conditionalLogic || null,
      },
    })

    res.status(201).json(question)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors })
    }
    next(error)
  }
})

// Admin: Update question
router.put('/questions/:id', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    const { questionText, questionType, required, order, conditionalLogic } = z
      .object({
        questionText: z.string().min(1).optional(),
        questionType: z.enum(['TEXT', 'TEXTAREA', 'NUMBER', 'DATE', 'SELECT', 'MULTI_SELECT', 'BOOLEAN', 'FILE']).optional(),
        required: z.boolean().optional(),
        order: z.number().int().min(0).optional(),
        conditionalLogic: z.string().optional(),
      })
      .parse(req.body)

    // Validate conditionalLogic is valid JSON if provided
    if (conditionalLogic) {
      try {
        JSON.parse(conditionalLogic)
      } catch {
        return res.status(400).json({ message: 'conditionalLogic must be valid JSON' })
      }
    }

    const question = await prisma.questionnaireQuestion.update({
      where: { id: req.params.id },
      data: {
        ...(questionText !== undefined && { questionText }),
        ...(questionType !== undefined && { questionType }),
        ...(required !== undefined && { required }),
        ...(order !== undefined && { order }),
        ...(conditionalLogic !== undefined && { conditionalLogic: conditionalLogic || null }),
      },
    })

    res.json(question)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors })
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Question not found' })
    }
    next(error)
  }
})

// Admin: Delete question
router.delete('/questions/:id', authenticate, requireStaff, async (req: any, res, next) => {
  try {
    await prisma.questionnaireQuestion.delete({
      where: { id: req.params.id },
    })

    res.json({ message: 'Question deleted successfully' })
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Question not found' })
    }
    next(error)
  }
})

export default router

