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
exports.getQuestionnaire = getQuestionnaire;
exports.saveAnswer = saveAnswer;
exports.submitQuestionnaire = submitQuestionnaire;
exports.getQuestionnaireStatus = getQuestionnaireStatus;
const client_1 = __importDefault(require("../db/client"));
/**
 * Get questionnaire with sections and questions for entity tax year
 */
async function getQuestionnaire(entityTaxYearId) {
    const sections = await client_1.default.questionnaireSection.findMany({
        where: { active: true },
        include: {
            questions: {
                where: { section: { active: true } },
                orderBy: { order: 'asc' },
            },
        },
        orderBy: { order: 'asc' },
    });
    // Get existing answers
    const answers = await client_1.default.questionnaireAnswer.findMany({
        where: { entityTaxYearId },
    });
    const answerMap = new Map(answers.map((a) => [a.questionId, a]));
    // Enrich questions with answers
    const enrichedSections = sections.map((section) => ({
        ...section,
        questions: section.questions.map((question) => ({
            ...question,
            answer: answerMap.get(question.id) || null,
        })),
    }));
    return enrichedSections;
}
/**
 * Save questionnaire answer (draft)
 */
async function saveAnswer(entityTaxYearId, questionId, answerValue) {
    // Validate question exists
    const question = await client_1.default.questionnaireQuestion.findUnique({
        where: { id: questionId },
    });
    if (!question) {
        throw new Error('Question not found');
    }
    // Format answer based on question type
    let formattedValue;
    if (question.questionType === 'MULTI_SELECT' || question.questionType === 'SELECT') {
        formattedValue = JSON.stringify(answerValue);
    }
    else {
        formattedValue = typeof answerValue === 'string' ? answerValue : JSON.stringify(answerValue);
    }
    const answer = await client_1.default.questionnaireAnswer.upsert({
        where: {
            entityTaxYearId_questionId: {
                entityTaxYearId,
                questionId,
            },
        },
        create: {
            entityTaxYearId,
            questionId,
            answerValue: formattedValue,
        },
        update: {
            answerValue: formattedValue,
        },
    });
    // Update questionnaire status to IN_PROGRESS
    await client_1.default.entityTaxYear.update({
        where: { id: entityTaxYearId },
        data: {
            questionnaireStatus: 'IN_PROGRESS',
        },
    });
    return answer;
}
/**
 * Submit questionnaire (mark as completed)
 */
async function submitQuestionnaire(entityTaxYearId) {
    // Get all required questions
    const sections = await client_1.default.questionnaireSection.findMany({
        where: { active: true },
        include: {
            questions: {
                where: {
                    required: true,
                    section: { active: true },
                },
            },
        },
    });
    const requiredQuestionIds = sections.flatMap((s) => s.questions.map((q) => q.id));
    // Check all required questions are answered
    const answers = await client_1.default.questionnaireAnswer.findMany({
        where: {
            entityTaxYearId,
            questionId: { in: requiredQuestionIds },
        },
    });
    const answeredQuestionIds = new Set(answers.map((a) => a.questionId));
    const missingQuestions = requiredQuestionIds.filter((id) => !answeredQuestionIds.has(id));
    if (missingQuestions.length > 0) {
        const missingQuestionTexts = await client_1.default.questionnaireQuestion.findMany({
            where: { id: { in: missingQuestions } },
            select: { questionText: true },
        });
        throw new Error(`Please answer all required questions. Missing: ${missingQuestionTexts.map((q) => q.questionText).join(', ')}`);
    }
    // Update status to COMPLETED
    const entityTaxYear = await client_1.default.entityTaxYear.update({
        where: { id: entityTaxYearId },
        data: {
            questionnaireStatus: 'COMPLETED',
            questionnaireCompletedAt: new Date(),
        },
    });
    // Check Ready for Prep
    const { computeReadyForPrep } = await Promise.resolve().then(() => __importStar(require('./entityTaxYear')));
    await computeReadyForPrep(entityTaxYearId);
    return entityTaxYear;
}
/**
 * Get questionnaire completion status
 */
async function getQuestionnaireStatus(entityTaxYearId) {
    const entityTaxYear = await client_1.default.entityTaxYear.findUnique({
        where: { id: entityTaxYearId },
        select: {
            questionnaireStatus: true,
            questionnaireCompletedAt: true,
        },
    });
    if (!entityTaxYear) {
        throw new Error('Entity tax year not found');
    }
    // Count answered questions
    const totalQuestions = await client_1.default.questionnaireQuestion.count({
        where: {
            section: { active: true },
        },
    });
    const answeredQuestions = await client_1.default.questionnaireAnswer.count({
        where: { entityTaxYearId },
    });
    const requiredQuestions = await client_1.default.questionnaireQuestion.count({
        where: {
            required: true,
            section: { active: true },
        },
    });
    const answeredRequired = await client_1.default.questionnaireAnswer.count({
        where: {
            entityTaxYearId,
            question: {
                required: true,
            },
        },
    });
    return {
        status: entityTaxYear.questionnaireStatus,
        completedAt: entityTaxYear.questionnaireCompletedAt,
        progress: {
            total: totalQuestions,
            answered: answeredQuestions,
            required: requiredQuestions,
            answeredRequired,
            percentage: totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0,
        },
    };
}
