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
exports.getSignatureRequirement = getSignatureRequirement;
exports.storeEngagementSignature = storeEngagementSignature;
const client_1 = __importDefault(require("../db/client"));
const folders_1 = require("./folders");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Determine signature requirement based on entity type
 */
function getSignatureRequirement(entityType) {
    // For now, assume MFJ is determined by entity type or filing status
    // In production, this would check entity metadata or filing type
    if (entityType === 'HOUSEHOLD_1040') {
        // Check if MFJ - this would come from entity metadata in production
        // For now, default to 1 signature, but support 2 for MFJ
        return 1; // Will be updated based on actual filing status
    }
    return 1; // Single filer or business entity
}
/**
 * Store engagement signature
 */
async function storeEngagementSignature(entityTaxYearId, signerName, signerEmail, signatureData) {
    // Store signature
    const signature = await client_1.default.engagementSignature.create({
        data: {
            entityTaxYearId,
            signerName,
            signerEmail,
            signatureData,
        },
    });
    // Get entity tax year
    const entityTaxYear = await client_1.default.entityTaxYear.findUnique({
        where: { id: entityTaxYearId },
        include: {
            clientEntity: true,
        },
    });
    if (!entityTaxYear) {
        throw new Error('Entity tax year not found');
    }
    // Count existing signatures
    const signatureCount = await client_1.default.engagementSignature.count({
        where: { entityTaxYearId },
    });
    // Determine required signatures (simplified - in production would check filing status)
    const requiredSignatures = 1; // Default, would check for MFJ
    // Update engagement status
    let newStatus;
    if (signatureCount >= requiredSignatures) {
        newStatus = 'FULLY_SIGNED';
    }
    else if (signatureCount === 1) {
        newStatus = 'PARTIALLY_SIGNED';
    }
    else {
        newStatus = 'NOT_STARTED';
    }
    await client_1.default.entityTaxYear.update({
        where: { id: entityTaxYearId },
        data: {
            engagementStatus: newStatus,
            engagementSignedAt: newStatus === 'FULLY_SIGNED' ? new Date() : null,
            engagementSigner1Id: signatureCount === 1 ? signature.id : entityTaxYear.engagementSigner1Id,
            engagementSigner2Id: signatureCount === 2 ? signature.id : entityTaxYear.engagementSigner2Id,
        },
    });
    // On first signature, trigger unlocks
    if (signatureCount === 1) {
        // Trigger checklist creation (Workflow 3)
        const { ensureChecklistExists } = await Promise.resolve().then(() => __importStar(require('./checklist')));
        await ensureChecklistExists(entityTaxYearId);
        // Create message thread (Workflow 8)
        await createMessageThread(entityTaxYearId, entityTaxYear.clientEntityId);
        // Update internal status to ENGAGED with audit log
        const { transitionStatus } = await Promise.resolve().then(() => __importStar(require('./statusTransitions')));
        try {
            await transitionStatus(entityTaxYearId, 'ENGAGED', 'system', 'First engagement signature captured');
        }
        catch (error) {
            // If transition fails (e.g., already ENGAGED), just update status directly
            await client_1.default.entityTaxYear.update({
                where: { id: entityTaxYearId },
                data: {
                    internalStatus: 'ENGAGED',
                },
            });
        }
    }
    // Generate PDF when fully signed
    if (newStatus === 'FULLY_SIGNED') {
        await generateEngagementPDF(entityTaxYearId, entityTaxYear.clientEntityId, entityTaxYear.taxYear);
    }
    return signature;
}
/**
 * Create message thread on first engagement signature
 */
async function createMessageThread(entityTaxYearId, clientEntityId) {
    // Check if thread already exists
    const existing = await client_1.default.messageThread.findUnique({
        where: { entityTaxYearId },
    });
    if (existing) {
        return existing;
    }
    // Get client account users
    const clientEntity = await client_1.default.clientEntity.findUnique({
        where: { id: clientEntityId },
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
    });
    if (!clientEntity) {
        return;
    }
    // Create thread
    const thread = await client_1.default.messageThread.create({
        data: {
            entityTaxYearId,
        },
    });
    // Add participants: clients
    for (const accountUser of clientEntity.account.accountUsers) {
        await client_1.default.threadParticipant.create({
            data: {
                threadId: thread.id,
                userId: accountUser.userId,
                userType: 'CLIENT',
            },
        });
    }
    // Add participants: super_admin, admin
    const superAdmins = await client_1.default.staffProfile.findMany({
        where: {
            staffRole: 'SUPER_ADMIN',
            active: true,
        },
    });
    const admins = await client_1.default.staffProfile.findMany({
        where: {
            staffRole: 'ADMIN',
            active: true,
        },
    });
    for (const staff of [...superAdmins, ...admins]) {
        await client_1.default.threadParticipant.create({
            data: {
                threadId: thread.id,
                userId: staff.userId,
                userType: 'STAFF',
            },
        });
    }
    // Add assigned staff (Idir)
    const assignments = await client_1.default.clientStaffAssignment.findMany({
        where: {
            clientId: clientEntityId,
            active: true,
        },
    });
    for (const assignment of assignments) {
        await client_1.default.threadParticipant.create({
            data: {
                threadId: thread.id,
                userId: assignment.staffUserId,
                userType: 'STAFF',
            },
        });
    }
    return thread;
}
/**
 * Generate signed engagement letter PDF
 */
async function generateEngagementPDF(entityTaxYearId, clientEntityId, taxYear) {
    // Get all signatures
    const signatures = await client_1.default.engagementSignature.findMany({
        where: { entityTaxYearId },
        orderBy: { signedAt: 'asc' },
    });
    // Get entity info
    const entityTaxYear = await client_1.default.entityTaxYear.findUnique({
        where: { id: entityTaxYearId },
        include: {
            clientEntity: true,
        },
    });
    if (!entityTaxYear) {
        throw new Error('Entity tax year not found');
    }
    // In production, use a PDF generation library (pdfkit, puppeteer, etc.)
    // For now, create a placeholder file
    const taxReturnsFolder = await (0, folders_1.getTaxReturnsFolder)(clientEntityId, taxYear);
    const yearFolder = await client_1.default.folder.findFirst({
        where: {
            clientId: clientEntityId,
            parentId: taxReturnsFolder.id,
            name: taxYear.toString(),
        },
    });
    if (!yearFolder) {
        throw new Error('Year folder not found');
    }
    const uploadsDir = path_1.default.join(__dirname, '../../uploads', clientEntityId, yearFolder.id);
    if (!fs_1.default.existsSync(uploadsDir)) {
        fs_1.default.mkdirSync(uploadsDir, { recursive: true });
    }
    const pdfPath = path_1.default.join(uploadsDir, `engagement-letter-${taxYear}.pdf`);
    // Create a simple text file as placeholder (in production, generate actual PDF)
    const pdfContent = `Engagement Letter for ${entityTaxYear.clientEntity.entityName} - Tax Year ${taxYear}\n\nSigned by:\n${signatures.map((s, i) => `${i + 1}. ${s.signerName} (${s.signerEmail}) on ${s.signedAt.toISOString()}`).join('\n')}`;
    fs_1.default.writeFileSync(pdfPath, pdfContent);
    // Store document record
    await client_1.default.document.create({
        data: {
            clientId: clientEntityId,
            folderId: yearFolder.id,
            storagePath: pdfPath,
            displayName: `Engagement Letter - ${taxYear}.pdf`,
            mimeType: 'application/pdf',
        },
    });
}
