"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateNextChecklistReminder = calculateNextChecklistReminder;
exports.calculateNextQuestionnaireReminder = calculateNextQuestionnaireReminder;
exports.calculateNextIdReminder = calculateNextIdReminder;
exports.getOrCreateReminderState = getOrCreateReminderState;
exports.markReminderSent = markReminderSent;
exports.pauseAllReminders = pauseAllReminders;
exports.resumeAllReminders = resumeAllReminders;
exports.getRemindersDue = getRemindersDue;
exports.shouldSendReminder = shouldSendReminder;
const client_1 = __importDefault(require("../db/client"));
/**
 * Calculate next reminder date for checklist (documents)
 */
function calculateNextChecklistReminder(lastReminderAt, taxYear, extensionFiled, extendedDueDate) {
    const now = new Date();
    const feb15 = new Date(taxYear, 1, 15); // February 15
    const march15 = new Date(taxYear, 2, 15); // March 15
    // Calculate second Monday of March
    const secondMondayMarch = getSecondMondayOfMarch(taxYear);
    // Use extended due date if extension filed
    const effectiveDueDate = extensionFiled && extendedDueDate ? extendedDueDate : null;
    const dueDate = effectiveDueDate || new Date(taxYear + 1, 3, 15); // April 15 default
    // First reminder: February 15
    if (!lastReminderAt) {
        if (now < feb15) {
            return feb15;
        }
        // If past Feb 15, schedule second reminder
        if (now < secondMondayMarch) {
            return secondMondayMarch;
        }
        // If past second Monday, schedule weekly
        return addWeeks(now, 1);
    }
    // Second reminder: Second Monday of March
    if (lastReminderAt < secondMondayMarch && now >= secondMondayMarch) {
        return secondMondayMarch;
    }
    // Weekly after second Monday of March
    if (lastReminderAt >= secondMondayMarch) {
        const nextWeekly = addWeeks(lastReminderAt, 1);
        // Don't schedule past due date
        if (nextWeekly <= dueDate) {
            return nextWeekly;
        }
    }
    return null;
}
/**
 * Calculate next reminder date for questionnaire
 */
function calculateNextQuestionnaireReminder(lastReminderAt, extensionFiled, extendedDueDate) {
    const now = new Date();
    // Use extended due date if extension filed
    const effectiveDueDate = extensionFiled && extendedDueDate ? extendedDueDate : null;
    const dueDate = effectiveDueDate || new Date(now.getFullYear() + 1, 3, 15); // April 15 default
    if (!lastReminderAt) {
        // First reminder: 1 month from now
        return addMonths(now, 1);
    }
    // Monthly reminders
    const nextMonthly = addMonths(lastReminderAt, 1);
    if (nextMonthly <= dueDate) {
        return nextMonthly;
    }
    return null;
}
/**
 * Calculate next reminder date for ID validity
 */
function calculateNextIdReminder(lastReminderAt, taxYear, extensionFiled, extendedDueDate) {
    const now = new Date();
    const march15 = new Date(taxYear, 2, 15); // March 15
    // Use extended due date if extension filed
    const effectiveDueDate = extensionFiled && extendedDueDate ? extendedDueDate : null;
    const dueDate = effectiveDueDate || new Date(taxYear + 1, 3, 15); // April 15 default
    if (!lastReminderAt) {
        // First reminder: 1 month from now
        return addMonths(now, 1);
    }
    // Monthly until March 15, then weekly
    if (now < march15) {
        const nextMonthly = addMonths(lastReminderAt, 1);
        if (nextMonthly <= march15) {
            return nextMonthly;
        }
        // Transition to weekly after March 15
        return addWeeks(march15, 1);
    }
    // Weekly after March 15
    const nextWeekly = addWeeks(lastReminderAt, 1);
    if (nextWeekly <= dueDate) {
        return nextWeekly;
    }
    return null;
}
/**
 * Get or create reminder state for a reminder type
 */
async function getOrCreateReminderState(entityTaxYearId, reminderType) {
    // Check if state exists (one per entityTaxYearId + reminderType combination)
    let state = await client_1.default.reminderState.findFirst({
        where: {
            entityTaxYearId,
            reminderType,
        },
    });
    if (!state) {
        state = await client_1.default.reminderState.create({
            data: {
                entityTaxYearId,
                reminderType,
                paused: false,
            },
        });
    }
    return state;
}
/**
 * Update reminder state after sending reminder
 */
async function markReminderSent(entityTaxYearId, reminderType) {
    const state = await getOrCreateReminderState(entityTaxYearId, reminderType);
    // Get entity tax year for calculations
    const entityTaxYear = await client_1.default.entityTaxYear.findUnique({
        where: { id: entityTaxYearId },
    });
    if (!entityTaxYear) {
        throw new Error('Entity tax year not found');
    }
    // Calculate next reminder date
    let nextReminderAt = null;
    switch (reminderType) {
        case 'DOCUMENTS':
            nextReminderAt = calculateNextChecklistReminder(state.lastReminderAt, entityTaxYear.taxYear, entityTaxYear.extensionFiled, entityTaxYear.extendedDueDate);
            break;
        case 'QUESTIONNAIRE':
            nextReminderAt = calculateNextQuestionnaireReminder(state.lastReminderAt, entityTaxYear.extensionFiled, entityTaxYear.extendedDueDate);
            break;
        case 'ID':
            nextReminderAt = calculateNextIdReminder(state.lastReminderAt, entityTaxYear.taxYear, entityTaxYear.extensionFiled, entityTaxYear.extendedDueDate);
            break;
    }
    return await client_1.default.reminderState.update({
        where: { id: state.id },
        data: {
            lastReminderAt: new Date(),
            nextReminderAt,
            reminderCount: { increment: 1 },
        },
    });
}
/**
 * Pause all reminder streams for an entity tax year
 */
async function pauseAllReminders(entityTaxYearId, reason) {
    await client_1.default.reminderState.updateMany({
        where: {
            entityTaxYearId,
            paused: false,
        },
        data: {
            paused: true,
            pausedReason: reason,
        },
    });
}
/**
 * Resume all reminder streams for an entity tax year
 */
async function resumeAllReminders(entityTaxYearId) {
    const entityTaxYear = await client_1.default.entityTaxYear.findUnique({
        where: { id: entityTaxYearId },
    });
    if (!entityTaxYear) {
        throw new Error('Entity tax year not found');
    }
    // Recalculate next reminder dates for all streams
    const states = await client_1.default.reminderState.findMany({
        where: { entityTaxYearId },
    });
    for (const state of states) {
        let nextReminderAt = null;
        switch (state.reminderType) {
            case 'DOCUMENTS':
                nextReminderAt = calculateNextChecklistReminder(state.lastReminderAt, entityTaxYear.taxYear, entityTaxYear.extensionFiled, entityTaxYear.extendedDueDate);
                break;
            case 'QUESTIONNAIRE':
                nextReminderAt = calculateNextQuestionnaireReminder(state.lastReminderAt, entityTaxYear.extensionFiled, entityTaxYear.extendedDueDate);
                break;
            case 'ID':
                nextReminderAt = calculateNextIdReminder(state.lastReminderAt, entityTaxYear.taxYear, entityTaxYear.extensionFiled, entityTaxYear.extendedDueDate);
                break;
        }
        await client_1.default.reminderState.update({
            where: { id: state.id },
            data: {
                paused: false,
                pausedReason: null,
                nextReminderAt,
            },
        });
    }
}
/**
 * Get reminders due for sending
 */
async function getRemindersDue(reminderType) {
    const where = {
        paused: false,
        nextReminderAt: {
            lte: new Date(),
        },
    };
    if (reminderType) {
        where.reminderType = reminderType;
    }
    return await client_1.default.reminderState.findMany({
        where,
        include: {
            entityTaxYear: {
                include: {
                    clientEntity: true,
                },
            },
        },
    });
}
/**
 * Check if reminder should be sent (conditions met)
 */
async function shouldSendReminder(entityTaxYearId, reminderType) {
    const entityTaxYear = await client_1.default.entityTaxYear.findUnique({
        where: { id: entityTaxYearId },
    });
    if (!entityTaxYear) {
        return false;
    }
    // Don't send if extension requested but not filed
    if (entityTaxYear.extensionRequested && !entityTaxYear.extensionFiled) {
        return false;
    }
    switch (reminderType) {
        case 'DOCUMENTS':
            // Send if checklist not complete
            return !entityTaxYear.checklistCompleteAt;
        case 'QUESTIONNAIRE':
            // Send if questionnaire not completed
            return entityTaxYear.questionnaireStatus !== 'COMPLETED';
        case 'ID':
            // Send if ID invalid or expired
            return entityTaxYear.idStatus === 'INVALID' || entityTaxYear.idStatus === 'EXPIRED';
        default:
            return false;
    }
}
// Helper functions
function getSecondMondayOfMarch(year) {
    const march1 = new Date(year, 2, 1); // March 1
    const dayOfWeek = march1.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysToAdd = dayOfWeek === 0 ? 8 : 9 - dayOfWeek; // Days to second Monday
    return new Date(year, 2, daysToAdd);
}
function addWeeks(date, weeks) {
    const result = new Date(date);
    result.setDate(result.getDate() + weeks * 7);
    return result;
}
function addMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
}
