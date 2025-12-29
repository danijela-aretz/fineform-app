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
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../middleware/auth");
const client_1 = __importDefault(require("../db/client"));
const documents_1 = require("../services/documents");
const permissions_1 = require("../services/permissions");
const router = (0, express_1.Router)();
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const clientId = req.body.clientId || req.body.clientEntityId;
        const folderId = req.body.folderId;
        // Create path: uploads/{clientId}/{folderId}/
        let uploadPath = path_1.default.join(__dirname, '../../uploads');
        if (clientId) {
            uploadPath = path_1.default.join(uploadPath, clientId);
            if (folderId) {
                uploadPath = path_1.default.join(uploadPath, folderId);
            }
        }
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
    },
});
// Upload document via checklist item
router.post('/upload', auth_1.authenticate, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const { entityTaxYearId, checklistItemId, clientId, folderId, displayName } = req.body;
        if (!clientId) {
            return res.status(400).json({ message: 'clientId required' });
        }
        // Create document
        const document = await client_1.default.document.create({
            data: {
                clientId,
                folderId: folderId || null,
                storagePath: req.file.path,
                displayName: displayName || req.file.originalname,
                uploadedBy: req.userType === 'STAFF' ? req.userId : null,
                fileSize: req.file.size,
                mimeType: req.file.mimetype,
            },
        });
        // Link to checklist item if provided
        if (checklistItemId) {
            await (0, documents_1.linkDocumentToChecklistItem)(document.id, checklistItemId);
        }
        // Log event
        if (entityTaxYearId) {
            await (0, documents_1.logDocumentEvent)(entityTaxYearId, 'UPLOADED', document.id);
            // Check if confirmation required
            const confirmationRequired = await (0, documents_1.checkConfirmationRequired)(entityTaxYearId);
            // Send upload notifications (webhook for n8n)
            const staffUserIds = await (0, permissions_1.getStaffWithAccess)(clientId);
            // In production, trigger n8n webhook for email notifications
        }
        res.json(document);
    }
    catch (error) {
        next(error);
    }
});
// General upload (fallback)
router.post('/upload/general', auth_1.authenticate, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const { entityTaxYearId, clientId, documentType, issuer, displayName } = req.body;
        if (!clientId || !entityTaxYearId) {
            return res.status(400).json({ message: 'clientId and entityTaxYearId required' });
        }
        // Create document
        const document = await client_1.default.document.create({
            data: {
                clientId,
                storagePath: req.file.path,
                displayName: displayName || req.file.originalname,
                uploadedBy: req.userType === 'STAFF' ? req.userId : null,
                fileSize: req.file.size,
                mimeType: req.file.mimetype,
            },
        });
        // Try to match to existing checklist item or create new
        if (documentType) {
            let checklistItem = await client_1.default.checklistItem.findFirst({
                where: {
                    entityTaxYearId,
                    itemType: documentType,
                },
            });
            if (!checklistItem) {
                // Create new checklist item
                checklistItem = await client_1.default.checklistItem.create({
                    data: {
                        entityTaxYearId,
                        itemName: documentType,
                        itemType: documentType,
                        required: false,
                        status: 'RECEIVED',
                        receivedAt: new Date(),
                    },
                });
            }
            // Link document to checklist item
            await (0, documents_1.linkDocumentToChecklistItem)(document.id, checklistItem.id);
        }
        // Log event
        await (0, documents_1.logDocumentEvent)(entityTaxYearId, 'UPLOADED', document.id, { documentType, issuer });
        res.json(document);
    }
    catch (error) {
        next(error);
    }
});
// Replace document
router.post('/:id/replace', auth_1.authenticate, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const { reason } = req.body;
        const oldDocument = await client_1.default.document.findUnique({
            where: { id: req.params.id },
        });
        if (!oldDocument) {
            return res.status(404).json({ message: 'Document not found' });
        }
        // Create new document (keep old for audit)
        const newDocument = await client_1.default.document.create({
            data: {
                clientId: oldDocument.clientId,
                folderId: oldDocument.folderId,
                storagePath: req.file.path,
                displayName: req.file.originalname,
                uploadedBy: req.userType === 'STAFF' ? req.userId : null,
                fileSize: req.file.size,
                mimeType: req.file.mimetype,
            },
        });
        // Update checklist item status
        const checklistLink = await client_1.default.checklistItemFile.findFirst({
            where: { documentId: oldDocument.id },
        });
        if (checklistLink) {
            // Link new document to checklist item
            await (0, documents_1.linkDocumentToChecklistItem)(newDocument.id, checklistLink.checklistItemId);
        }
        // Get entity tax year for logging
        const checklistItem = checklistLink
            ? await client_1.default.checklistItem.findUnique({
                where: { id: checklistLink.checklistItemId },
            })
            : null;
        if (checklistItem) {
            await (0, documents_1.logDocumentEvent)(checklistItem.entityTaxYearId, 'REPLACED', newDocument.id, {
                oldDocumentId: oldDocument.id,
                reason,
            });
        }
        res.json(newDocument);
    }
    catch (error) {
        next(error);
    }
});
// Sign document receipt confirmation
router.post('/confirmation/:entityTaxYearId/sign', auth_1.authenticate, async (req, res, next) => {
    try {
        const { signerName, signerEmail, signatureData } = req.body;
        const entityTaxYear = await client_1.default.entityTaxYear.findUnique({
            where: { id: req.params.entityTaxYearId },
        });
        if (!entityTaxYear) {
            return res.status(404).json({ message: 'Entity tax year not found' });
        }
        // Check if checklist is complete
        if (!entityTaxYear.checklistCompleteAt) {
            return res.status(400).json({ message: 'Checklist must be complete before confirmation' });
        }
        // Update confirmation status
        await client_1.default.entityTaxYear.update({
            where: { id: req.params.entityTaxYearId },
            data: {
                docConfirmationStatus: 'SIGNED',
                docConfirmationSignedAt: new Date(),
                docConfirmationSignerId: req.userId || null,
            },
        });
        // Log event
        await (0, documents_1.logDocumentEvent)(req.params.entityTaxYearId, 'CONFIRMATION_SIGNED');
        // Check Ready for Prep and auto-transition if ready
        const { computeReadyForPrep } = await Promise.resolve().then(() => __importStar(require('../services/entityTaxYear')));
        const readyForPrep = await computeReadyForPrep(req.params.entityTaxYearId);
        // Auto-transition to READY_FOR_PREP if all gates are met
        if (readyForPrep && entityTaxYear.internalStatus === 'AWAITING_CONFIRMATION') {
            try {
                const { transitionStatus } = await Promise.resolve().then(() => __importStar(require('../services/statusTransitions')));
                await transitionStatus(req.params.entityTaxYearId, 'READY_FOR_PREP', 'system', 'All client requirements satisfied');
            }
            catch (error) {
                // Silently fail if transition not valid
                console.error('Failed to auto-transition to Ready for Prep:', error);
            }
        }
        res.json({
            success: true,
            message: 'Confirmation signed successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
// Get document by ID
router.get('/:id', auth_1.authenticate, async (req, res, next) => {
    try {
        const document = await client_1.default.document.findUnique({
            where: { id: req.params.id },
        });
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.json(document);
    }
    catch (error) {
        next(error);
    }
});
// Download document
router.get('/:id/download', auth_1.authenticate, async (req, res, next) => {
    try {
        const document = await client_1.default.document.findUnique({
            where: { id: req.params.id },
        });
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        if (!fs_1.default.existsSync(document.storagePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }
        res.download(document.storagePath, document.displayName);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
