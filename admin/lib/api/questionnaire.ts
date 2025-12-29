import apiClient from './client'

export type QuestionType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'NUMBER'
  | 'DATE'
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'BOOLEAN'
  | 'FILE'

export interface QuestionnaireQuestion {
  id: string
  sectionId: string
  questionText: string
  questionType: QuestionType
  required: boolean
  order: number
  conditionalLogic: string | null
  createdAt: string
  updatedAt: string
  section?: QuestionnaireSection
}

export interface QuestionnaireSection {
  id: string
  name: string
  description: string | null
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
  questions?: QuestionnaireQuestion[]
}

export interface CreateSectionData {
  name: string
  description?: string
  order?: number
}

export interface UpdateSectionData {
  name?: string
  description?: string
  order?: number
  active?: boolean
}

export interface CreateQuestionData {
  questionText: string
  questionType: QuestionType
  required?: boolean
  order?: number
  conditionalLogic?: string
}

export interface UpdateQuestionData {
  questionText?: string
  questionType?: QuestionType
  required?: boolean
  order?: number
  conditionalLogic?: string
}

export const questionnaireApi = {
  // Sections
  getSections: async (): Promise<QuestionnaireSection[]> => {
    const response = await apiClient.get('/questionnaire/sections')
    return response.data
  },

  getSectionById: async (id: string): Promise<QuestionnaireSection> => {
    const response = await apiClient.get(`/questionnaire/sections/${id}`)
    return response.data
  },

  createSection: async (data: CreateSectionData): Promise<QuestionnaireSection> => {
    const response = await apiClient.post('/questionnaire/sections', data)
    return response.data
  },

  updateSection: async (id: string, data: UpdateSectionData): Promise<QuestionnaireSection> => {
    const response = await apiClient.put(`/questionnaire/sections/${id}`, data)
    return response.data
  },

  deleteSection: async (id: string): Promise<void> => {
    await apiClient.delete(`/questionnaire/sections/${id}`)
  },

  // Questions
  getQuestionById: async (id: string): Promise<QuestionnaireQuestion> => {
    const response = await apiClient.get(`/questionnaire/questions/${id}`)
    return response.data
  },

  createQuestion: async (
    sectionId: string,
    data: CreateQuestionData
  ): Promise<QuestionnaireQuestion> => {
    const response = await apiClient.post(`/questionnaire/sections/${sectionId}/questions`, data)
    return response.data
  },

  updateQuestion: async (id: string, data: UpdateQuestionData): Promise<QuestionnaireQuestion> => {
    const response = await apiClient.put(`/questionnaire/questions/${id}`, data)
    return response.data
  },

  deleteQuestion: async (id: string): Promise<void> => {
    await apiClient.delete(`/questionnaire/questions/${id}`)
  },
}


