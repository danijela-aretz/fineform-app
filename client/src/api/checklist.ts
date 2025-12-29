import apiClient from './client'

export interface ChecklistItem {
  id: string
  entityTaxYearId: string
  itemName: string
  itemType?: string | null
  required: boolean
  status: 'PENDING' | 'RECEIVED' | 'NOT_APPLICABLE'
  receivedAt?: string
  markedNotApplicableAt?: string
  notes?: string | null
  files: Array<{
    document: {
      id: string
      displayName: string
      fileSize?: number | null
    }
  }>
}

export const checklistApi = {
  getItems: async (entityTaxYearId: string): Promise<ChecklistItem[]> => {
    const response = await apiClient.get(`/checklist/${entityTaxYearId}`)
    return response.data
  },

  markNotApplicable: async (entityTaxYearId: string, itemId: string) => {
    const response = await apiClient.put(`/checklist/${entityTaxYearId}/items/${itemId}`, {
      status: 'NOT_APPLICABLE',
    })
    return response.data
  },
}

