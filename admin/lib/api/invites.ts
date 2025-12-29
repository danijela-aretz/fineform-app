import apiClient from './client'

export interface InviteQueueItem {
  id: string
  clientEntityId: string
  taxYear: number
  inviteStatus: string
  inviteSentAt?: string
  attemptCount: number
  lastError?: string
  clientEntity: {
    id: string
    entityName: string
    entityType: string
    account: {
      id: string
      displayName: string
    }
  }
}

export const invitesApi = {
  queueEntities: async (entityIds: string[], taxYear: number) => {
    const response = await apiClient.post('/invites/queue', {
      entityIds,
      taxYear,
    })
    return response.data
  },

  getQueue: async (status?: string, taxYear?: number) => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (taxYear) params.append('taxYear', taxYear.toString())
    
    const response = await apiClient.get(`/invites/queue?${params.toString()}`)
    return response.data as InviteQueueItem[]
  },

  sendWave: async (entityTaxYearIds: string[]) => {
    const response = await apiClient.post('/invites/send', {
      entityTaxYearIds,
    })
    return response.data
  },
}

