"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getThreadForEntityTaxYear = getThreadForEntityTaxYear;
exports.getClientThreads = getClientThreads;
exports.getStaffThreads = getStaffThreads;
exports.markMessagesAsRead = markMessagesAsRead;
exports.getUnreadCount = getUnreadCount;
exports.getMessageRecipients = getMessageRecipients;
const client_1 = __importDefault(require("../db/client"));
const permissions_1 = require("./permissions");
/**
 * Get thread for entity tax year (one thread per entity+year)
 */
async function getThreadForEntityTaxYear(entityTaxYearId) {
    return await client_1.default.messageThread.findUnique({
        where: { entityTaxYearId },
        include: {
            participants: true,
        },
    });
}
/**
 * Get threads for client user
 */
async function getClientThreads(userId) {
    // Get all account users for this user
    const accountUsers = await client_1.default.accountUser.findMany({
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
    });
    const threads = [];
    for (const accountUser of accountUsers) {
        for (const entity of accountUser.account.entities) {
            for (const entityTaxYear of entity.entityTaxYears) {
                if (entityTaxYear.messageThread) {
                    threads.push(entityTaxYear.messageThread);
                }
            }
        }
    }
    return threads;
}
/**
 * Get threads for staff user (filtered by permissions)
 */
async function getStaffThreads(staffUserId) {
    // Get all entity tax years the staff can access
    const allEntityTaxYears = await client_1.default.entityTaxYear.findMany({
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
    });
    const accessibleThreads = [];
    for (const entityTaxYear of allEntityTaxYears) {
        // Check client visibility
        const visibility = await (0, permissions_1.checkClientVisibility)(staffUserId, entityTaxYear.clientEntityId);
        if (!visibility.canAccess)
            continue;
        // Check tax access
        const taxAccess = await (0, permissions_1.checkTaxAccess)(staffUserId, entityTaxYear.clientEntityId);
        if (!taxAccess.canAccess)
            continue;
        if (entityTaxYear.messageThread) {
            accessibleThreads.push(entityTaxYear.messageThread);
        }
    }
    return accessibleThreads;
}
/**
 * Mark messages as read
 */
async function markMessagesAsRead(threadId, userId) {
    return await client_1.default.message.updateMany({
        where: {
            threadId,
            senderId: { not: userId }, // Not sent by this user
            read: false,
        },
        data: {
            read: true,
        },
    });
}
/**
 * Get unread count for user
 */
async function getUnreadCount(userId, userType) {
    if (userType === 'CLIENT') {
        const threads = await getClientThreads(userId);
        const threadIds = threads.map((t) => t.id);
        if (threadIds.length === 0)
            return 0;
        return await client_1.default.message.count({
            where: {
                threadId: { in: threadIds },
                senderId: { not: userId },
                read: false,
            },
        });
    }
    else {
        const threads = await getStaffThreads(userId);
        const threadIds = threads.map((t) => t.id);
        if (threadIds.length === 0)
            return 0;
        return await client_1.default.message.count({
            where: {
                threadId: { in: threadIds },
                senderId: { not: userId },
                read: false,
            },
        });
    }
}
/**
 * Get recipients for email notification (webhook for n8n)
 */
async function getMessageRecipients(threadId, senderId) {
    const thread = await client_1.default.messageThread.findUnique({
        where: { id: threadId },
        include: {
            participants: true,
        },
    });
    if (!thread) {
        return { clientEmails: [], staffEmails: [] };
    }
    // Get all participants except sender
    const recipients = thread.participants.filter((p) => p.userId !== senderId);
    const clientEmails = [];
    const staffEmails = [];
    // Get emails from profiles
    for (const participant of recipients) {
        const profile = await client_1.default.profile.findUnique({
            where: { userId: participant.userId },
        });
        if (profile?.email) {
            if (participant.userType === 'CLIENT') {
                clientEmails.push(profile.email);
            }
            else {
                staffEmails.push(profile.email);
            }
        }
    }
    return { clientEmails, staffEmails };
}
