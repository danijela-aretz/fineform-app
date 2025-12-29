"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const questionnaire_1 = require("../services/questionnaire");
const client_1 = __importDefault(require("../db/client"));
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Get questionnaire for entity tax year
router.get('/:entityTaxYearId', auth_1.authenticate, async (req, res, next) => {
    try {
        const questionnaire = await (0, questionnaire_1.getQuestionnaire)(req.params.entityTaxYearId);
        res.json(questionnaire);
    }
    catch (error) {
        next(error);
    }
});
// Get questionnaire status
router.get('/:entityTaxYearId/status', auth_1.authenticate, async (req, res, next) => {
    try {
        const status = await (0, questionnaire_1.getQuestionnaireStatus)(req.params.entityTaxYearId);
        res.json(status);
    }
    catch (error) {
        next(error);
    }
});
// Save answer (draft)
router.post('/:entityTaxYearId/answer', auth_1.authenticate, async (req, res, next) => {
    try {
        const { questionId, answerValue } = zod_1.z
            .object({
            questionId: zod_1.z.string(),
            answerValue: zod_1.z.any(),
        })
            .parse(req.body);
        const answer = await (0, questionnaire_1.saveAnswer)(req.params.entityTaxYearId, questionId, answerValue);
        res.json(answer);
    }
    catch (error) {
        next(error);
    }
});
// Submit questionnaire
router.post('/:entityTaxYearId/submit', auth_1.authenticate, async (req, res, next) => {
    try {
        const entityTaxYear = await (0, questionnaire_1.submitQuestionnaire)(req.params.entityTaxYearId);
        res.json({
            success: true,
            entityTaxYear,
            message: 'Questionnaire submitted successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
// Admin: Create section
router.post('/sections', auth_1.authenticate, auth_1.requireStaff, async (req, res, next) => {
    try {
        const { name, description, order } = zod_1.z
            .object({
            name: zod_1.z.string(),
            description: zod_1.z.string().optional(),
            order: zod_1.z.number().optional(),
        })
            .parse(req.body);
        const section = await client_1.default.questionnaireSection.create({
            data: {
                name,
                description: description || null,
                order: order || 0,
            },
        });
        res.json(section);
    }
    catch (error) {
        next(error);
    }
});
// Admin: Create question
router.post('/questions', auth_1.authenticate, auth_1.requireStaff, async (req, res, next) => {
    try {
        const { sectionId, questionText, questionType, required, order, conditionalLogic } = zod_1.z
            .object({
            sectionId: zod_1.z.string(),
            questionText: zod_1.z.string(),
            questionType: zod_1.z.enum(['TEXT', 'TEXTAREA', 'NUMBER', 'DATE', 'SELECT', 'MULTI_SELECT', 'BOOLEAN', 'FILE']),
            required: zod_1.z.boolean().optional(),
            order: zod_1.z.number().optional(),
            conditionalLogic: zod_1.z.string().optional(),
        })
            .parse(req.body);
        const question = await client_1.default.questionnaireQuestion.create({
            data: {
                sectionId,
                questionText,
                questionType,
                required: required !== false,
                order: order || 0,
                conditionalLogic: conditionalLogic || null,
            },
        });
        res.json(question);
    }
    catch (error) {
        next(error);
    }
});
// Admin: Get all sections and questions (builder)
router.get('/builder/all', auth_1.authenticate, auth_1.requireStaff, async (req, res, next) => {
    try {
        const sections = await client_1.default.questionnaireSection.findMany({
            include: {
                questions: {
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: { order: 'asc' },
        });
        res.json(sections);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
