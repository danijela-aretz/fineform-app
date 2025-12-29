import apiClient from './client'

export interface QuestionnaireSection {
  id: string
  name: string
  description?: string | null
  order: number
  questions: Array<{
    id: string
    questionText: string
    questionType: 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'DATE' | 'SELECT' | 'MULTI_SELECT' | 'BOOLEAN' | 'FILE'
    required: boolean
    order: number
    conditionalLogic?: string | null
    answer?: {
      id: string
      answerValue: string | null
    } | null
  }>
}

export interface QuestionnaireStatus {
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  completedAt?: string | null
  progress: {
    total: number
    answered: number
    required: number
    answeredRequired: number
    percentage: number
  }
}

export const questionnaireApi = {
  getQuestionnaire: async (entityTaxYearId: string): Promise<QuestionnaireSection[]> => {
    const response = await apiClient.get(`/questionnaire/${entityTaxYearId}`)
    return response.data
  },

  getStatus: async (entityTaxYearId: string): Promise<QuestionnaireStatus> => {
    const response = await apiClient.get(`/questionnaire/${entityTaxYearId}/status`)
    return response.data
  },

  saveAnswer: async (entityTaxYearId: string, questionId: string, answerValue: any) => {
    const response = await apiClient.post(`/questionnaire/${entityTaxYearId}/answer`, {
      questionId,
      answerValue,
    })
    return response.data
  },

  submit: async (entityTaxYearId: string) => {
    const response = await apiClient.post(`/questionnaire/${entityTaxYearId}/submit`)
    return response.data
  },
}

