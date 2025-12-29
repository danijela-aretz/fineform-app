import apiClient from './client'

export type EntityType =
  | 'HOUSEHOLD_1040'
  | 'LLC'
  | 'S_CORP'
  | 'C_CORP'
  | 'PARTNERSHIP'
  | 'SOLE_PROPRIETORSHIP'
  | 'TRUST'
  | 'ESTATE'
  | 'OTHER'

export interface Account {
  id: string
  displayName: string
  createdAt: string
  accountUsers: Array<{
    id: string
    userId: string
    clientRole: string
    profile: {
      fullName: string
      email: string
    }
  }>
}

export interface ClientEntity {
  id: string
  accountId: string
  entityName: string
  entityType: EntityType
  status: string | null
  isRestricted: boolean
  createdAt: string
  updatedAt: string
  account?: Account
  entityTaxYears?: Array<{
    id: string
    taxYear: number
  }>
}

export interface CreateEntityData {
  accountId: string
  entityName: string
  entityType: EntityType
  status?: string
  isRestricted?: boolean
}

export interface UpdateEntityData {
  entityName?: string
  entityType?: EntityType
  status?: string
  isRestricted?: boolean
}

export const entitiesApi = {
  getAll: async (): Promise<ClientEntity[]> => {
    const response = await apiClient.get('/entities')
    return response.data
  },

  getById: async (id: string): Promise<ClientEntity> => {
    const response = await apiClient.get(`/entities/${id}`)
    return response.data
  },

  getAccounts: async (): Promise<Account[]> => {
    const response = await apiClient.get('/entities/accounts/list')
    return response.data
  },

  create: async (data: CreateEntityData): Promise<ClientEntity> => {
    const response = await apiClient.post('/entities', data)
    return response.data
  },

  update: async (id: string, data: UpdateEntityData): Promise<ClientEntity> => {
    const response = await apiClient.put(`/entities/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/entities/${id}`)
  },
}

