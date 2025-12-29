"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const messaging_1 = require("../services/messaging");
const client_1 = __importDefault(require("../db/client"));
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Get message threads (filtered by user type and permissions)
router.get('/threads', auth_1.authenticate, async (req, res, next) => {
    try {
        let threads;
        if (req.userType === 'CLIENT') {
            threads = await (0, messaging_1.getClientThreads)(req.userId);
        }
        else {
            threads = await (0, messaging_1.getStaffThreads)(req.userId);
        }
        res.json(threads);
    }
    catch (error) {
        next(error);
    }
});
// Get thread by entity tax year (one thread per entity+year)
router.get('/threads/entity-tax-year/:entityTaxYearId', auth_1.authenticate, async (req, res, next) => {
    try {
        const thread = await (0, messaging_1.getThreadForEntityTaxYear)(req.params.entityTaxYearId);
        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }
        // Verify access
        if (req.userType === 'CLIENT') {
            const hasAccess = thread.participants.some((p) => p.userId === req.userId);
            if (!hasAccess) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }
        else {
            // Staff access checked in getStaffThreads, but verify here too
            const { checkClientVisibility, checkTaxAccess } = await Promise.resolve().then(() => __importStar(require('../services/permissions')));
            const entityTaxYear = await client_1.default.entityTaxYear.findUnique({
                where: { id: req.params.entityTaxYearId },
            });
            if (!entityTaxYear) {
                return res.status(404).json({ message: 'Entity tax year not found' });
            }
            const visibility = await checkClientVisibility(req.userId, entityTaxYear.clientEntityId);
            if (!visibility.canAccess) {
                return res.status(403).json({ message: 'Access denied' });
            }
            const taxAccess = await checkTaxAccess(req.userId, entityTaxYear.clientEntityId);
            if (!taxAccess.canAccess) {
                return res.status(403).json({ message: 'Tax access denied' });
            }
        }
        res.json(thread);
    }
    catch (error) {
        next(error);
    }
});
// Get messages for a thread
router.get('/threads/:threadId/messages', auth_1.authenticate, async (req, res, next) => {
    try {
        // Verify thread access
        const thread = await client_1.default.messageThread.findUnique({
            where: { id: req.params.threadId },
            include: {
                participants: true,
            },
        });
        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }
        // Check access
        if (req.userType === 'CLIENT') {
            const hasAccess = thread.participants.some((p) => p.userId === req.userId);
            if (!hasAccess) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }
        const messages = await client_1.default.message.findMany({
            where: { threadId: req.params.threadId },
            orderBy: { createdAt: 'asc' },
        });
        // Enrich messages with sender info
        const enrichedMessages = await Promise.all(messages.map(async (message) => {
            const profile = await client_1.default.profile.findUnique({
                where: { userId: message.senderId },
            });
            return {
                ...message,
                senderName: profile?.fullName || 'Unknown',
                senderEmail: profile?.email || null,
            };
        }));
        // Mark messages as read
        await (0, messaging_1.markMessagesAsRead)(req.params.threadId, req.userId);
        res.json(enrichedMessages);
    }
    catch (error) {
        next(error);
    }
});
// Send message
router.post('/threads/:threadId/messages', auth_1.authenticate, async (req, res, next) => {
    try {
        const { content } = zod_1.z.object({ content: zod_1.z.string().min(1) }).parse(req.body);
        const senderId = req.userId;
        const senderType = req.userType;
        // Verify thread access
        const thread = await client_1.default.messageThread.findUnique({
            where: { id: req.params.threadId },
            include: {
                participants: true,
            },
        });
        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }
        // Check access
        if (req.userType === 'CLIENT') {
            const hasAccess = thread.participants.some((p) => p.userId === req.userId);
            if (!hasAccess) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }
        const message = await client_1.default.message.create({
            data: {
                threadId: req.params.threadId,
                senderId,
                senderType,
                content,
            },
        });
        // Update thread updatedAt
        await client_1.default.messageThread.update({
            where: { id: req.params.threadId },
            data: { updatedAt: new Date() },
        });
        // Get recipients for email notification (webhook for n8n)
        const recipients = await (0, messaging_1.getMessageRecipients)(req.params.threadId, senderId);
        // In production, trigger n8n webhook for email notifications
        // For now, return recipients in response for testing
        res.json({
            ...message,
            _recipients: recipients, // Remove in production
        });
    }
    catch (error) {
        next(error);
    }
});
// Get unread count
router.get('/unread-count', auth_1.authenticate, async (req, res, next) => {
    try {
        const count = await (0, messaging_1.getUnreadCount)(req.userId, req.userType);
        res.json({ count });
    }
    catch (error) {
        next(error);
    }
});
// Webhook: Trigger email notifications (called by n8n or scheduled task)
router.post('/webhooks/send-notifications', async (req, res, next) => {
    try {
        // In production, verify webhook signature
        const { threadId, messageId } = req.body;
        if (!threadId || !messageId) {
            return res.status(400).json({ message: 'threadId and messageId required' });
        }
        const message = await client_1.default.message.findUnique({
            where: { id: messageId },
        });
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        const recipients = await (0, messaging_1.getMessageRecipients)(threadId, message.senderId);
        // In production, this would trigger n8n workflow to send emails
        res.json({
            success: true,
            recipients,
            message: 'Email notifications queued',
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
