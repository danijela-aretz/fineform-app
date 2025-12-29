"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSystemFolders = createSystemFolders;
exports.checkFolderVisibility = checkFolderVisibility;
exports.getTaxReturnsFolder = getTaxReturnsFolder;
const client_1 = __importDefault(require("../db/client"));
/**
 * System folder template structure
 */
const SYSTEM_FOLDER_TEMPLATE = [
    { name: 'Current Year (2025)', clientVisible: true, isSystem: true },
    { name: 'Work Folder', clientVisible: false, staffOnly: true, isSystem: true },
    { name: 'Bank Accounts', clientVisible: true, isSystem: true },
    { name: 'Credit Card Accounts', clientVisible: true, isSystem: true },
    { name: 'Reports', clientVisible: true, isSystem: true },
    { name: 'Past Years', clientVisible: true, isSystem: true },
    { name: 'Assets', clientVisible: true, isSystem: true },
    { name: 'Corporate Docs', clientVisible: true, isSystem: true },
    { name: 'Payroll', clientVisible: true, isSystem: true },
    { name: 'Admin', clientVisible: false, adminOnly: true, isSystem: true },
    { name: 'Super Admin', clientVisible: false, superAdminOnly: true, isSystem: true },
];
/**
 * Create system folder template for a new client entity
 */
async function createSystemFolders(clientEntityId, taxYear) {
    const folders = [];
    // Create top-level folders
    for (const template of SYSTEM_FOLDER_TEMPLATE) {
        const folder = await client_1.default.folder.create({
            data: {
                clientId: clientEntityId,
                name: template.name,
                clientVisible: template.clientVisible ?? true,
                staffOnly: template.staffOnly ?? false,
                adminOnly: template.adminOnly ?? false,
                superAdminOnly: template.superAdminOnly ?? false,
                isSystem: template.isSystem ?? false,
            },
        });
        folders.push(folder);
    }
    // Create Share Folder with subfolders
    const shareFolder = await client_1.default.folder.create({
        data: {
            clientId: clientEntityId,
            name: 'Share Folder',
            clientVisible: true,
            isSystem: true,
        },
    });
    const fromClientFolder = await client_1.default.folder.create({
        data: {
            clientId: clientEntityId,
            name: 'From Client',
            parentId: shareFolder.id,
            clientVisible: true,
            isSystem: true,
        },
    });
    const toClientFolder = await client_1.default.folder.create({
        data: {
            clientId: clientEntityId,
            name: 'To Client',
            clientVisible: true,
            isSystem: true,
        },
    });
    // Create Tax Returns folder (client-visible, for downloadable documents)
    const taxReturnsFolder = await client_1.default.folder.create({
        data: {
            clientId: clientEntityId,
            name: 'Tax Returns',
            clientVisible: true,
            isSystem: true,
            folderType: 'tax_returns',
        },
    });
    // Create year subfolder in Tax Returns
    await client_1.default.folder.create({
        data: {
            clientId: clientEntityId,
            name: taxYear.toString(),
            parentId: taxReturnsFolder.id,
            clientVisible: true,
            isSystem: true,
        },
    });
    return folders;
}
/**
 * Check folder visibility for a user
 */
async function checkFolderVisibility(folderId, userId, userType, staffRole) {
    const folder = await client_1.default.folder.findUnique({
        where: { id: folderId },
    });
    if (!folder) {
        return false;
    }
    // Client visibility check
    if (userType === 'CLIENT') {
        if (!folder.clientVisible) {
            return false;
        }
        if (folder.staffOnly || folder.adminOnly || folder.superAdminOnly) {
            return false;
        }
        return true;
    }
    // Staff visibility check
    if (userType === 'STAFF') {
        if (folder.superAdminOnly && staffRole !== 'SUPER_ADMIN') {
            return false;
        }
        if (folder.adminOnly && !['SUPER_ADMIN', 'ADMIN'].includes(staffRole || '')) {
            return false;
        }
        if (folder.staffOnly) {
            // Staff can see staff-only folders
            return true;
        }
        if (folder.restrictedAcl) {
            // Check folder ACL
            const aclEntry = await client_1.default.folderAcl.findUnique({
                where: {
                    folderId_staffUserId: {
                        folderId: folderId,
                        staffUserId: userId,
                    },
                },
            });
            if (!aclEntry) {
                return false;
            }
        }
        return true;
    }
    return false;
}
/**
 * Get Tax Returns folder for an entity and tax year
 */
async function getTaxReturnsFolder(clientEntityId, taxYear) {
    // Find Tax Returns folder
    const taxReturnsFolder = await client_1.default.folder.findFirst({
        where: {
            clientId: clientEntityId,
            folderType: 'tax_returns',
            name: 'Tax Returns',
        },
    });
    if (!taxReturnsFolder) {
        // Create if doesn't exist
        const folder = await client_1.default.folder.create({
            data: {
                clientId: clientEntityId,
                name: 'Tax Returns',
                clientVisible: true,
                isSystem: true,
                folderType: 'tax_returns',
            },
        });
        // Create year subfolder
        await client_1.default.folder.create({
            data: {
                clientId: clientEntityId,
                name: taxYear.toString(),
                parentId: folder.id,
                clientVisible: true,
                isSystem: true,
            },
        });
        return folder;
    }
    // Ensure year subfolder exists
    const yearFolder = await client_1.default.folder.findFirst({
        where: {
            clientId: clientEntityId,
            parentId: taxReturnsFolder.id,
            name: taxYear.toString(),
        },
    });
    if (!yearFolder) {
        await client_1.default.folder.create({
            data: {
                clientId: clientEntityId,
                name: taxYear.toString(),
                parentId: taxReturnsFolder.id,
                clientVisible: true,
                isSystem: true,
            },
        });
    }
    return taxReturnsFolder;
}
