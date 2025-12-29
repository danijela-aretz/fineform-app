import prisma from '../db/client'
import { checkClientVisibility, checkTaxAccess } from './permissions'

/**
 * Get thread for entity tax year (one thread per entity+year)
 */
export async function getThreadForEntityTaxYear(entityTaxYearId: string) {
  return await prisma.messageThread.findUnique({
    where: { entityTaxYearId },
    include: {
      participants: true,
    },
  })
}

/**
 * Get threads for client user
 */
export async function getClientThreads(userId: string) {
  // Get all account users for this user
  const accountUsers = await prisma.accountUser.findMany({
    where: { userId },
    include: {
      account: {
        include: {
          entities: {
            include: {
              entityTaxYears: {
                include: {
                  messageThread: {
                    include: {
                      participants: true,
                      messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  const threads = []
  for (const accountUser of accountUsers) {
    for (const entity of accountUser.account.entities) {
      for (const entityTaxYear of entity.entityTaxYears) {
        if (entityTaxYear.messageThread) {
          threads.push(entityTaxYear.messageThread)
        }
      }
    }
  }

  return threads
}

/**
 * Get threads for staff user (filtered by permissions)
 */
export async function getStaffThreads(staffUserId: string) {
  // Get all entity tax years the staff can access
  const allEntityTaxYears = await prisma.entityTaxYear.findMany({
    include: {
      clientEntity: true,
      messageThread: {
        include: {
          participants: true,
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  })

  const accessibleThreads = []
  for (const entityTaxYear of allEntityTaxYears) {
    // Check client visibility
    const visibility = await checkClientVisibility(staffUserId, entityTaxYear.clientEntityId)
    if (!visibility.canAccess) continue

    // Check tax access
    const taxAccess = await checkTaxAccess(staffUserId, entityTaxYear.clientEntityId)
    if (!taxAccess.canAccess) continue

    if (entityTaxYear.messageThread) {
      accessibleThreads.push(entityTaxYear.messageThread)
    }
  }

  return accessibleThreads
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(threadId: string, userId: string) {
  return await prisma.message.updateMany({
    where: {
      threadId,
      senderId: { not: userId }, // Not sent by this user
      read: false,
    },
    data: {
      read: true,
    },
  })
}

/**
 * Get unread count for user
 */
export async function getUnreadCount(userId: string, userType: 'STAFF' | 'CLIENT'): Promise<number> {
  if (userType === 'CLIENT') {
    const threads = await getClientThreads(userId)
    const threadIds = threads.map((t) => t.id)

    if (threadIds.length === 0) return 0

    return await prisma.message.count({
      where: {
        threadId: { in: threadIds },
        senderId: { not: userId },
        read: false,
      },
    })
  } else {
    const threads = await getStaffThreads(userId)
    const threadIds = threads.map((t) => t.id)

    if (threadIds.length === 0) return 0

    return await prisma.message.count({
      where: {
        threadId: { in: threadIds },
        senderId: { not: userId },
        read: false,
      },
    })
  }
}

/**
 * Get recipients for email notification (webhook for n8n)
 */
export async function getMessageRecipients(threadId: string, senderId: string) {
  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: {
      participants: true,
    },
  })

  if (!thread) {
    return { clientEmails: [], staffEmails: [] }
  }

  // Get all participants except sender
  const recipients = thread.participants.filter((p) => p.userId !== senderId)

  const clientEmails: string[] = []
  const staffEmails: string[] = []

  // Get emails from profiles
  for (const participant of recipients) {
    const profile = await prisma.profile.findUnique({
      where: { userId: participant.userId },
    })

    if (profile?.email) {
      if (participant.userType === 'CLIENT') {
        clientEmails.push(profile.email)
      } else {
        staffEmails.push(profile.email)
      }
    }
  }

  return { clientEmails, staffEmails }
}

