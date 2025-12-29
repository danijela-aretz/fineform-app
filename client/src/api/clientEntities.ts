import apiClient from './client'

export interface ClientEntityTaxYear {
  id: string
  entityId: string
  entityName: string
  entityType: string
  taxYear: number
  internalStatus: string
  engagementStatus: string
  accountName: string
}

export const clientEntitiesApi = {
  getEntities: async (): Promise<ClientEntityTaxYear[]> => {
    const response = await apiClient.get('/client/entities')
    return response.data
  },
}


