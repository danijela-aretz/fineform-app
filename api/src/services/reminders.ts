import prisma from '../db/client'
import { ReminderType } from '@prisma/client'

/**
 * Calculate next reminder date for checklist (documents)
 */
export function calculateNextChecklistReminder(
  lastReminderAt: Date | null,
  taxYear: number,
  extensionFiled: boolean,
  extendedDueDate: Date | null
): Date | null {
  const now = new Date()
  const feb15 = new Date(taxYear, 1, 15) // February 15
  const march15 = new Date(taxYear, 2, 15) // March 15

  // Calculate second Monday of March
  const secondMondayMarch = getSecondMondayOfMarch(taxYear)

  // Use extended due date if extension filed
  const effectiveDueDate = extensionFiled && extendedDueDate ? extendedDueDate : null
  const dueDate = effectiveDueDate || new Date(taxYear + 1, 3, 15) // April 15 default

  // First reminder: February 15
  if (!lastReminderAt) {
    if (now < feb15) {
      return feb15
    }
    // If past Feb 15, schedule second reminder
    if (now < secondMondayMarch) {
      return secondMondayMarch
    }
    // If past second Monday, schedule weekly
    return addWeeks(now, 1)
  }

  // Second reminder: Second Monday of March
  if (lastReminderAt < secondMondayMarch && now >= secondMondayMarch) {
    return secondMondayMarch
  }

  // Weekly after second Monday of March
  if (lastReminderAt >= secondMondayMarch) {
    const nextWeekly = addWeeks(lastReminderAt, 1)
    // Don't schedule past due date
    if (nextWeekly <= dueDate) {
      return nextWeekly
    }
  }

  return null
}

/**
 * Calculate next reminder date for questionnaire
 */
export function calculateNextQuestionnaireReminder(
  lastReminderAt: Date | null,
  extensionFiled: boolean,
  extendedDueDate: Date | null
): Date | null {
  const now = new Date()

  // Use extended due date if extension filed
  const effectiveDueDate = extensionFiled && extendedDueDate ? extendedDueDate : null
  const dueDate = effectiveDueDate || new Date(now.getFullYear() + 1, 3, 15) // April 15 default

  if (!lastReminderAt) {
    // First reminder: 1 month from now
    return addMonths(now, 1)
  }

  // Monthly reminders
  const nextMonthly = addMonths(lastReminderAt, 1)
  if (nextMonthly <= dueDate) {
    return nextMonthly
  }

  return null
}

/**
 * Calculate next reminder date for ID validity
 */
export function calculateNextIdReminder(
  lastReminderAt: Date | null,
  taxYear: number,
  extensionFiled: boolean,
  extendedDueDate: Date | null
): Date | null {
  const now = new Date()
  const march15 = new Date(taxYear, 2, 15) // March 15

  // Use extended due date if extension filed
  const effectiveDueDate = extensionFiled && extendedDueDate ? extendedDueDate : null
  const dueDate = effectiveDueDate || new Date(taxYear + 1, 3, 15) // April 15 default

  if (!lastReminderAt) {
    // First reminder: 1 month from now
    return addMonths(now, 1)
  }

  // Monthly until March 15, then weekly
  if (now < march15) {
    const nextMonthly = addMonths(lastReminderAt, 1)
    if (nextMonthly <= march15) {
      return nextMonthly
    }
    // Transition to weekly after March 15
    return addWeeks(march15, 1)
  }

  // Weekly after March 15
  const nextWeekly = addWeeks(lastReminderAt, 1)
  if (nextWeekly <= dueDate) {
    return nextWeekly
  }

  return null
}

/**
 * Get or create reminder state for a reminder type
 */
export async function getOrCreateReminderState(
  entityTaxYearId: string,
  reminderType: ReminderType
) {
  // Check if state exists (one per entityTaxYearId + reminderType combination)
  let state = await prisma.reminderState.findFirst({
    where: {
      entityTaxYearId,
      reminderType,
    },
  })

  if (!state) {
    state = await prisma.reminderState.create({
      data: {
        entityTaxYearId,
        reminderType,
        paused: false,
      },
    })
  }

  return state
}

/**
 * Update reminder state after sending reminder
 */
export async function markReminderSent(
  entityTaxYearId: string,
  reminderType: ReminderType
) {
  const state = await getOrCreateReminderState(entityTaxYearId, reminderType)

  // Get entity tax year for calculations
  const entityTaxYear = await prisma.entityTaxYear.findUnique({
    where: { id: entityTaxYearId },
  })

  if (!entityTaxYear) {
    throw new Error('Entity tax year not found')
  }

  // Calculate next reminder date
  let nextReminderAt: Date | null = null

  switch (reminderType) {
    case 'DOCUMENTS':
      nextReminderAt = calculateNextChecklistReminder(
        state.lastReminderAt,
        entityTaxYear.taxYear,
        entityTaxYear.extensionFiled,
        entityTaxYear.extendedDueDate
      )
      break
    case 'QUESTIONNAIRE':
      nextReminderAt = calculateNextQuestionnaireReminder(
        state.lastReminderAt,
        entityTaxYear.extensionFiled,
        entityTaxYear.extendedDueDate
      )
      break
    case 'ID':
      nextReminderAt = calculateNextIdReminder(
        state.lastReminderAt,
        entityTaxYear.taxYear,
        entityTaxYear.extensionFiled,
        entityTaxYear.extendedDueDate
      )
      break
  }

  return await prisma.reminderState.update({
    where: { id: state.id },
    data: {
      lastReminderAt: new Date(),
      nextReminderAt,
      reminderCount: { increment: 1 },
    },
  })
}

/**
 * Pause all reminder streams for an entity tax year
 */
export async function pauseAllReminders(entityTaxYearId: string, reason: string) {
  await prisma.reminderState.updateMany({
    where: {
      entityTaxYearId,
      paused: false,
    },
    data: {
      paused: true,
      pausedReason: reason,
    },
  })
}

/**
 * Resume all reminder streams for an entity tax year
 */
export async function resumeAllReminders(entityTaxYearId: string) {
  const entityTaxYear = await prisma.entityTaxYear.findUnique({
    where: { id: entityTaxYearId },
  })

  if (!entityTaxYear) {
    throw new Error('Entity tax year not found')
  }

  // Recalculate next reminder dates for all streams
  const states = await prisma.reminderState.findMany({
    where: { entityTaxYearId },
  })

  for (const state of states) {
    let nextReminderAt: Date | null = null

    switch (state.reminderType) {
      case 'DOCUMENTS':
        nextReminderAt = calculateNextChecklistReminder(
          state.lastReminderAt,
          entityTaxYear.taxYear,
          entityTaxYear.extensionFiled,
          entityTaxYear.extendedDueDate
        )
        break
      case 'QUESTIONNAIRE':
        nextReminderAt = calculateNextQuestionnaireReminder(
          state.lastReminderAt,
          entityTaxYear.extensionFiled,
          entityTaxYear.extendedDueDate
        )
        break
      case 'ID':
        nextReminderAt = calculateNextIdReminder(
          state.lastReminderAt,
          entityTaxYear.taxYear,
          entityTaxYear.extensionFiled,
          entityTaxYear.extendedDueDate
        )
        break
    }

    await prisma.reminderState.update({
      where: { id: state.id },
      data: {
        paused: false,
        pausedReason: null,
        nextReminderAt,
      },
    })
  }
}

/**
 * Get reminders due for sending
 */
export async function getRemindersDue(reminderType?: ReminderType) {
  const where: any = {
    paused: false,
    nextReminderAt: {
      lte: new Date(),
    },
  }

  if (reminderType) {
    where.reminderType = reminderType
  }

  return await prisma.reminderState.findMany({
    where,
    include: {
      entityTaxYear: {
        include: {
          clientEntity: true,
        },
      },
    },
  })
}

/**
 * Check if reminder should be sent (conditions met)
 */
export async function shouldSendReminder(
  entityTaxYearId: string,
  reminderType: ReminderType
): Promise<boolean> {
  const entityTaxYear = await prisma.entityTaxYear.findUnique({
    where: { id: entityTaxYearId },
  })

  if (!entityTaxYear) {
    return false
  }

  // Don't send if extension requested but not filed
  if (entityTaxYear.extensionRequested && !entityTaxYear.extensionFiled) {
    return false
  }

  switch (reminderType) {
    case 'DOCUMENTS':
      // Send if checklist not complete
      return !entityTaxYear.checklistCompleteAt

    case 'QUESTIONNAIRE':
      // Send if questionnaire not completed
      return entityTaxYear.questionnaireStatus !== 'COMPLETED'

    case 'ID':
      // Send if ID invalid or expired
      return entityTaxYear.idStatus === 'INVALID' || entityTaxYear.idStatus === 'EXPIRED'

    default:
      return false
  }
}

// Helper functions
function getSecondMondayOfMarch(year: number): Date {
  const march1 = new Date(year, 2, 1) // March 1
  const dayOfWeek = march1.getDay() // 0 = Sunday, 1 = Monday, etc.
  const daysToAdd = dayOfWeek === 0 ? 8 : 9 - dayOfWeek // Days to second Monday
  return new Date(year, 2, daysToAdd)
}

function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + weeks * 7)
  return result
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

