import apiClient from './client'

export interface EntityTaxYear {
  id: string
  taxYear: number
  internalStatus: string
  extensionRequested: boolean
  extensionFiled: boolean
  extendedDueDate?: string | null
  clientEntity: {
    id: string
    entityName: string
    entityType: string
    account: {
      displayName: string
      accountUsers: Array<{
        profile: {
          fullName: string
          email: string
        }
      }>
    }
  }
  blockingReasons?: string[]
}

export const dashboardApi = {
  getList: async (filters?: {
    taxYear?: number
    status?: string
    assignedStaffId?: string
    extensionRequested?: boolean
    extensionFiled?: boolean
  }): Promise<EntityTaxYear[]> => {
    const params = new URLSearchParams()
    if (filters?.taxYear) params.append('taxYear', filters.taxYear.toString())
    if (filters?.status) params.append('status', filters.status)
    if (filters?.assignedStaffId) params.append('assignedStaffId', filters.assignedStaffId)
    if (filters?.extensionRequested) params.append('extensionRequested', 'true')
    if (filters?.extensionFiled) params.append('extensionFiled', 'true')

    const response = await apiClient.get(`/dashboard?${params.toString()}`)
    return response.data
  },

  getDetail: async (entityTaxYearId: string): Promise<EntityTaxYear> => {
    const response = await apiClient.get(`/dashboard/${entityTaxYearId}`)
    return response.data
  },

  transitionStatus: async (
    entityTaxYearId: string,
    newStatus: string,
    reason?: string,
    allowSoftWarnings?: boolean
  ) => {
    const response = await apiClient.post(`/dashboard/${entityTaxYearId}/status`, {
      newStatus,
      reason,
      allowSoftWarnings,
    })
    return response.data
  },

  getStatusHistory: async (entityTaxYearId: string) => {
    const response = await apiClient.get(`/dashboard/${entityTaxYearId}/history`)
    return response.data
  },
}

