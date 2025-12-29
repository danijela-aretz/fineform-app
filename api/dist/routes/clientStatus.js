"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const clientStatus_1 = require("../services/clientStatus");
const client_1 = __importDefault(require("../db/client"));
const router = (0, express_1.Router)();
// Get client status for entity tax year
router.get('/:entityTaxYearId', auth_1.authenticate, async (req, res, next) => {
    try {
        const entityTaxYear = await client_1.default.entityTaxYear.findUnique({
            where: { id: req.params.entityTaxYearId },
            include: {
                clientEntity: {
                    include: {
                        account: {
                            include: {
                                accountUsers: true,
                            },
                        },
                    },
                },
            },
        });
        if (!entityTaxYear) {
            return res.status(404).json({ message: 'Entity tax year not found' });
        }
        // Verify client has access
        if (req.userType === 'CLIENT') {
            const hasAccess = entityTaxYear.clientEntity.account.accountUsers.some((au) => au.userId === req.userId);
            if (!hasAccess) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }
        const statusInfo = await (0, clientStatus_1.getClientStatus)(req.params.entityTaxYearId);
        // Include extension info
        res.json({
            ...statusInfo,
            extensionRequested: entityTaxYear.extensionRequested,
            extensionFiled: entityTaxYear.extensionFiled,
            extendedDueDate: entityTaxYear.extendedDueDate,
            taxYear: entityTaxYear.taxYear,
            entityName: entityTaxYear.clientEntity.entityName,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
