import prisma from '../db/client'
import { QuestionType } from '@prisma/client'

/**
 * Get questionnaire with sections and questions for entity tax year
 */
export async function getQuestionnaire(entityTaxYearId: string) {
  const sections = await prisma.questionnaireSection.findMany({
    where: { active: true },
    include: {
      questions: {
        where: { section: { active: true } },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  })

  // Get existing answers
  const answers = await prisma.questionnaireAnswer.findMany({
    where: { entityTaxYearId },
  })

  const answerMap = new Map(answers.map((a) => [a.questionId, a]))

  // Enrich questions with answers
  const enrichedSections = sections.map((section) => ({
    ...section,
    questions: section.questions.map((question) => ({
      ...question,
      answer: answerMap.get(question.id) || null,
    })),
  }))

  return enrichedSections
}

/**
 * Save questionnaire answer (draft)
 */
export async function saveAnswer(
  entityTaxYearId: string,
  questionId: string,
  answerValue: any
) {
  // Validate question exists
  const question = await prisma.questionnaireQuestion.findUnique({
    where: { id: questionId },
  })

  if (!question) {
    throw new Error('Question not found')
  }

  // Format answer based on question type
  let formattedValue: string
  if (question.questionType === 'MULTI_SELECT' || question.questionType === 'SELECT') {
    formattedValue = JSON.stringify(answerValue)
  } else {
    formattedValue = typeof answerValue === 'string' ? answerValue : JSON.stringify(answerValue)
  }

  const answer = await prisma.questionnaireAnswer.upsert({
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
  })

  // Update questionnaire status to IN_PROGRESS
  await prisma.entityTaxYear.update({
    where: { id: entityTaxYearId },
    data: {
      questionnaireStatus: 'IN_PROGRESS',
    },
  })

  return answer
}

/**
 * Submit questionnaire (mark as completed)
 */
export async function submitQuestionnaire(entityTaxYearId: string) {
  // Get all required questions
  const sections = await prisma.questionnaireSection.findMany({
    where: { active: true },
    include: {
      questions: {
        where: {
          required: true,
          section: { active: true },
        },
      },
    },
  })

  const requiredQuestionIds = sections.flatMap((s) => s.questions.map((q) => q.id))

  // Check all required questions are answered
  const answers = await prisma.questionnaireAnswer.findMany({
    where: {
      entityTaxYearId,
      questionId: { in: requiredQuestionIds },
    },
  })

  const answeredQuestionIds = new Set(answers.map((a) => a.questionId))
  const missingQuestions = requiredQuestionIds.filter((id) => !answeredQuestionIds.has(id))

  if (missingQuestions.length > 0) {
    const missingQuestionTexts = await prisma.questionnaireQuestion.findMany({
      where: { id: { in: missingQuestions } },
      select: { questionText: true },
    })
    throw new Error(
      `Please answer all required questions. Missing: ${missingQuestionTexts.map((q) => q.questionText).join(', ')}`
    )
  }

  // Update status to COMPLETED
  const entityTaxYear = await prisma.entityTaxYear.update({
    where: { id: entityTaxYearId },
    data: {
      questionnaireStatus: 'COMPLETED',
      questionnaireCompletedAt: new Date(),
    },
  })

  // Check Ready for Prep
  const { computeReadyForPrep } = await import('./entityTaxYear')
  await computeReadyForPrep(entityTaxYearId)

  return entityTaxYear
}

/**
 * Get questionnaire completion status
 */
export async function getQuestionnaireStatus(entityTaxYearId: string) {
  const entityTaxYear = await prisma.entityTaxYear.findUnique({
    where: { id: entityTaxYearId },
    select: {
      questionnaireStatus: true,
      questionnaireCompletedAt: true,
    },
  })

  if (!entityTaxYear) {
    throw new Error('Entity tax year not found')
  }

  // Count answered questions
  const totalQuestions = await prisma.questionnaireQuestion.count({
    where: {
      section: { active: true },
    },
  })

  const answeredQuestions = await prisma.questionnaireAnswer.count({
    where: { entityTaxYearId },
  })

  const requiredQuestions = await prisma.questionnaireQuestion.count({
    where: {
      required: true,
      section: { active: true },
    },
  })

  const answeredRequired = await prisma.questionnaireAnswer.count({
    where: {
      entityTaxYearId,
      question: {
        required: true,
      },
    },
  })

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
  }
}

