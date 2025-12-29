import apiClient from './client'

export interface EngagementStatus {
  engagementStatus: 'NOT_STARTED' | 'PARTIALLY_SIGNED' | 'FULLY_SIGNED'
  signatures: Array<{
    id: string
    signerName: string
    signerEmail: string
    signedAt: string
  }>
  entityName: string
  taxYear: number
}

export interface SignEngagementRequest {
  signerName: string
  signerEmail: string
  signatureData: string
}

export const engagementApi = {
  getStatus: async (entityTaxYearId: string): Promise<EngagementStatus> => {
    const response = await apiClient.get(`/engagement/${entityTaxYearId}`)
    return response.data
  },

  sign: async (entityTaxYearId: string, data: SignEngagementRequest) => {
    const response = await apiClient.post(`/engagement/${entityTaxYearId}/sign`, data)
    return response.data
  },

  downloadPDF: async (entityTaxYearId: string): Promise<Blob> => {
    const response = await apiClient.get(`/engagement/${entityTaxYearId}/pdf`, {
      responseType: 'blob',
    })
    return response.data
  },
}

