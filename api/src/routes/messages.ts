import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import {
  getClientThreads,
  getStaffThreads,
  getThreadForEntityTaxYear,
  markMessagesAsRead,
  getUnreadCount,
  getMessageRecipients,
} from '../services/messaging'
import prisma from '../db/client'
import { z } from 'zod'

const router = Router()

// Get message threads (filtered by user type and permissions)
router.get('/threads', authenticate, async (req: any, res, next) => {
  try {
    let threads

    if (req.userType === 'CLIENT') {
      threads = await getClientThreads(req.userId!)
    } else {
      threads = await getStaffThreads(req.userId!)
    }

    res.json(threads)
  } catch (error) {
    next(error)
  }
})

// Get thread by entity tax year (one thread per entity+year)
router.get('/threads/entity-tax-year/:entityTaxYearId', authenticate, async (req: any, res, next) => {
  try {
    const thread = await getThreadForEntityTaxYear(req.params.entityTaxYearId)

    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' })
    }

    // Verify access
    if (req.userType === 'CLIENT') {
      const hasAccess = thread.participants.some((p) => p.userId === req.userId)
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' })
      }
    } else {
      // Staff access checked in getStaffThreads, but verify here too
      const { checkClientVisibility, checkTaxAccess } = await import('../services/permissions')
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

      const taxAccess = await checkTaxAccess(req.userId!, entityTaxYear.clientEntityId)
      if (!taxAccess.canAccess) {
        return res.status(403).json({ message: 'Tax access denied' })
      }
    }

    res.json(thread)
  } catch (error) {
    next(error)
  }
})

// Get messages for a thread
router.get('/threads/:threadId/messages', authenticate, async (req: any, res, next) => {
  try {
    // Verify thread access
    const thread = await prisma.messageThread.findUnique({
      where: { id: req.params.threadId },
      include: {
        participants: true,
      },
    })

    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' })
    }

    // Check access
    if (req.userType === 'CLIENT') {
      const hasAccess = thread.participants.some((p: any) => p.userId === req.userId)
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' })
      }
    }

    const messages = await prisma.message.findMany({
      where: { threadId: req.params.threadId },
      orderBy: { createdAt: 'asc' },
    })

    // Enrich messages with sender info
    const enrichedMessages = await Promise.all(
      messages.map(async (message) => {
        const profile = await prisma.profile.findUnique({
          where: { userId: message.senderId },
        })
        return {
          ...message,
          senderName: profile?.fullName || 'Unknown',
          senderEmail: profile?.email || null,
        }
      })
    )

    // Mark messages as read
    await markMessagesAsRead(req.params.threadId, req.userId!)

    res.json(enrichedMessages)
  } catch (error) {
    next(error)
  }
})

// Send message
router.post('/threads/:threadId/messages', authenticate, async (req: any, res, next) => {
  try {
    const { content } = z.object({ content: z.string().min(1) }).parse(req.body)
    const senderId = req.userId!
    const senderType = req.userType!

    // Verify thread access
    const thread = await prisma.messageThread.findUnique({
      where: { id: req.params.threadId },
      include: {
        participants: true,
      },
    })

    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' })
    }

    // Check access
    if (req.userType === 'CLIENT') {
      const hasAccess = thread.participants.some((p: any) => p.userId === req.userId)
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' })
      }
    }

    const message = await prisma.message.create({
      data: {
        threadId: req.params.threadId,
        senderId,
        senderType,
        content,
      },
    })

    // Update thread updatedAt
    await prisma.messageThread.update({
      where: { id: req.params.threadId },
      data: { updatedAt: new Date() },
    })

    // Get recipients for email notification (webhook for n8n)
    const recipients = await getMessageRecipients(req.params.threadId, senderId)

    // In production, trigger n8n webhook for email notifications
    // For now, return recipients in response for testing
    res.json({
      ...message,
      _recipients: recipients, // Remove in production
    })
  } catch (error) {
    next(error)
  }
})

// Get unread count
router.get('/unread-count', authenticate, async (req: any, res, next) => {
  try {
    const count = await getUnreadCount(req.userId!, req.userType!)
    res.json({ count })
  } catch (error) {
    next(error)
  }
})

// Webhook: Trigger email notifications (called by n8n or scheduled task)
router.post('/webhooks/send-notifications', async (req, res, next) => {
  try {
    // In production, verify webhook signature
    const { threadId, messageId } = req.body

    if (!threadId || !messageId) {
      return res.status(400).json({ message: 'threadId and messageId required' })
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    })

    if (!message) {
      return res.status(404).json({ message: 'Message not found' })
    }

    const recipients = await getMessageRecipients(threadId, message.senderId)

    // In production, this would trigger n8n workflow to send emails
    res.json({
      success: true,
      recipients,
      message: 'Email notifications queued',
    })
  } catch (error) {
    next(error)
  }
})

export default router

