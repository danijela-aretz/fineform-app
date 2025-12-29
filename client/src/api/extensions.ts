import apiClient from './client'

export interface ExtensionStatus {
  extensionRequested: boolean
  extensionFiled: boolean
  extendedDueDate?: string | null
}

export const extensionsApi = {
  getStatus: async (entityTaxYearId: string): Promise<ExtensionStatus> => {
    const response = await apiClient.get(`/extensions/${entityTaxYearId}`)
    return response.data
  },

  requestExtension: async (entityTaxYearId: string) => {
    const response = await apiClient.post(`/extensions/${entityTaxYearId}/request`)
    return response.data
  },
}

