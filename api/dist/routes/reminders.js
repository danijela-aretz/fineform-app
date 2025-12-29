"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const reminders_1 = require("../services/reminders");
const client_1 = __importDefault(require("../db/client"));
const router = (0, express_1.Router)();
// Get reminder status for entity tax year
router.get('/:entityTaxYearId', auth_1.authenticate, async (req, res, next) => {
    try {
        const states = await client_1.default.reminderState.findMany({
            where: { entityTaxYearId: req.params.entityTaxYearId },
            orderBy: { reminderType: 'asc' },
        });
        res.json(states);
    }
    catch (error) {
        next(error);
    }
});
// Get reminders due for sending (staff/admin only, for n8n webhook)
router.get('/due', auth_1.authenticate, auth_1.requireAdmin, async (req, res, next) => {
    try {
        const reminderTypeParam = req.query.reminderType;
        const reminderType = reminderTypeParam
            ? reminderTypeParam.toUpperCase()
            : undefined;
        const reminders = await (0, reminders_1.getRemindersDue)(reminderType);
        // Filter by conditions (should send)
        const remindersToSend = [];
        for (const reminder of reminders) {
            const shouldSend = await (0, reminders_1.shouldSendReminder)(reminder.entityTaxYearId, reminder.reminderType);
            if (shouldSend) {
                remindersToSend.push(reminder);
            }
        }
        res.json(remindersToSend);
    }
    catch (error) {
        next(error);
    }
});
// Webhook: Mark reminder as sent (called by n8n after sending)
router.post('/webhooks/reminder-sent', async (req, res, next) => {
    try {
        // In production, verify webhook signature
        const { entityTaxYearId, reminderType } = req.body;
        if (!entityTaxYearId || !reminderType) {
            return res.status(400).json({ message: 'entityTaxYearId and reminderType required' });
        }
        await (0, reminders_1.markReminderSent)(entityTaxYearId, reminderType);
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
