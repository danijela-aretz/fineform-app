import { Router } from 'express'
import { authenticate, requireAdmin } from '../middleware/auth'
import {
  getRemindersDue,
  markReminderSent,
  shouldSendReminder,
  getOrCreateReminderState,
} from '../services/reminders'
import prisma from '../db/client'

const router = Router()

// Get reminder status for entity tax year
router.get('/:entityTaxYearId', authenticate, async (req: any, res, next) => {
  try {
    const states = await prisma.reminderState.findMany({
      where: { entityTaxYearId: req.params.entityTaxYearId },
      orderBy: { reminderType: 'asc' },
    })

    res.json(states)
  } catch (error) {
    next(error)
  }
})

// Get reminders due for sending (staff/admin only, for n8n webhook)
router.get('/due', authenticate, requireAdmin, async (req: any, res, next) => {
  try {
    const reminderTypeParam = req.query.reminderType as string | undefined
    const reminderType = reminderTypeParam
      ? (reminderTypeParam.toUpperCase() as 'DOCUMENTS' | 'QUESTIONNAIRE' | 'ID')
      : undefined

    const reminders = await getRemindersDue(reminderType)

    // Filter by conditions (should send)
    const remindersToSend = []
    for (const reminder of reminders) {
      const shouldSend = await shouldSendReminder(
        reminder.entityTaxYearId,
        reminder.reminderType
      )
      if (shouldSend) {
        remindersToSend.push(reminder)
      }
    }

    res.json(remindersToSend)
  } catch (error) {
    next(error)
  }
})

// Webhook: Mark reminder as sent (called by n8n after sending)
router.post('/webhooks/reminder-sent', async (req, res, next) => {
  try {
    // In production, verify webhook signature
    const { entityTaxYearId, reminderType } = req.body

    if (!entityTaxYearId || !reminderType) {
      return res.status(400).json({ message: 'entityTaxYearId and reminderType required' })
    }

    await markReminderSent(entityTaxYearId, reminderType as 'DOCUMENTS' | 'QUESTIONNAIRE' | 'ID')

    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

export default router

