import apiClient from './client'

export interface ClientAcl {
  id: string
  clientId: string
  staffUserId: string
  staff: {
    profile: {
      fullName: string
      email: string
    }
  }
}

export interface TaxPermission {
  id: string
  clientId: string
  staffUserId: string
  canSeeTaxes: boolean
  staff: {
    profile: {
      fullName: string
      email: string
    }
  }
}

export interface StaffAssignment {
  id: string
  clientId: string
  staffUserId: string
  roleOnClient: 'preparer' | 'assistant'
  active: boolean
  staff: {
    profile: {
      fullName: string
      email: string
    }
  }
}

export interface StaffMember {
  id: string
  userId: string
  staffRole: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF'
  profile: {
    fullName: string
    email: string
  }
}

export const permissionsApi = {
  getClientPermissions: async (clientEntityId: string) => {
    const response = await apiClient.get(`/permissions/client/${clientEntityId}`)
    return response.data
  },

  addClientAcl: async (clientEntityId: string, staffUserId: string) => {
    const response = await apiClient.post(`/permissions/client/${clientEntityId}/acl`, {
      staffUserId,
    })
    return response.data
  },

  removeClientAcl: async (clientEntityId: string, staffUserId: string) => {
    const response = await apiClient.delete(`/permissions/client/${clientEntityId}/acl/${staffUserId}`)
    return response.data
  },

  grantTaxAccess: async (clientEntityId: string, staffUserId: string) => {
    const response = await apiClient.post(`/permissions/client/${clientEntityId}/tax-access`, {
      staffUserId,
    })
    return response.data
  },

  revokeTaxAccess: async (clientEntityId: string, staffUserId: string) => {
    const response = await apiClient.delete(`/permissions/client/${clientEntityId}/tax-access/${staffUserId}`)
    return response.data
  },

  assignStaff: async (clientEntityId: string, staffUserId: string, roleOnClient: 'preparer' | 'assistant') => {
    const response = await apiClient.post(`/permissions/client/${clientEntityId}/assign`, {
      staffUserId,
      roleOnClient,
    })
    return response.data
  },

  unassignStaff: async (clientEntityId: string, staffUserId: string) => {
    const response = await apiClient.delete(`/permissions/client/${clientEntityId}/assign/${staffUserId}`)
    return response.data
  },

  getAuditLog: async (clientEntityId: string) => {
    const response = await apiClient.get(`/permissions/client/${clientEntityId}/audit`)
    return response.data
  },

  getStaff: async (): Promise<StaffMember[]> => {
    const response = await apiClient.get('/permissions/staff')
    return response.data
  },
}

