"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reminders_1 = require("../services/reminders");
const client_1 = __importDefault(require("../db/client"));
const router = (0, express_1.Router)();
/**
 * Scheduled task endpoint (called by cron job or scheduler)
 * Checks for reminders due and returns them for n8n webhook processing
 */
router.get('/check-reminders', async (req, res, next) => {
    try {
        // Get all reminders due
        const remindersDue = await (0, reminders_1.getRemindersDue)();
        // Filter by conditions and prepare for n8n
        const remindersToSend = [];
        for (const reminder of remindersDue) {
            const shouldSend = await (0, reminders_1.shouldSendReminder)(reminder.entityTaxYearId, reminder.reminderType);
            if (shouldSend) {
                // Get entity tax year details for email
                const entityTaxYear = await client_1.default.entityTaxYear.findUnique({
                    where: { id: reminder.entityTaxYearId },
                    include: {
                        clientEntity: {
                            include: {
                                account: {
                                    include: {
                                        accountUsers: {
                                            include: {
                                                profile: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
                if (entityTaxYear) {
                    remindersToSend.push({
                        reminderId: reminder.id,
                        entityTaxYearId: reminder.entityTaxYearId,
                        reminderType: reminder.reminderType,
                        taxYear: entityTaxYear.taxYear,
                        entityName: entityTaxYear.clientEntity.entityName,
                        clientEmails: entityTaxYear.clientEntity.account.accountUsers.map((au) => au.profile.email),
                        reminderCount: reminder.reminderCount,
                    });
                }
            }
        }
        res.json({
            success: true,
            count: remindersToSend.length,
            reminders: remindersToSend,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * Initialize reminder states when conditions change
 * Called when checklist completion changes, questionnaire status changes, etc.
 */
router.post('/init-reminders/:entityTaxYearId', async (req, res, next) => {
    try {
        const { entityTaxYearId } = req.params;
        const entityTaxYear = await client_1.default.entityTaxYear.findUnique({
            where: { id: entityTaxYearId },
        });
        if (!entityTaxYear) {
            return res.status(404).json({ message: 'Entity tax year not found' });
        }
        // Initialize all reminder states if they don't exist
        const reminderTypes = [
            'DOCUMENTS',
            'QUESTIONNAIRE',
            'ID',
        ];
        for (const reminderType of reminderTypes) {
            await (0, reminders_1.getOrCreateReminderState)(entityTaxYearId, reminderType);
        }
        res.json({ success: true, message: 'Reminder states initialized' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
