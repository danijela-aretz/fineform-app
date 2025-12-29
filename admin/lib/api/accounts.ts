import apiClient from './client'

export type ClientRole = 'ADMIN' | 'ASSISTANT'

export interface AccountUser {
  id: string
  accountId: string
  userId: string
  clientRole: ClientRole
  createdAt: string
  updatedAt: string
  profile?: {
    id: string
    userId: string
    fullName: string
    email: string
    userType: string
  }
}

export interface ClientUser {
  id: string
  email: string
  profile: {
    id: string
    userId: string
    fullName: string
    email: string
    userType: string
  }
}

export interface Account {
  id: string
  displayName: string
  createdAt: string
  updatedAt: string
  accountUsers?: AccountUser[]
  entities?: Array<{
    id: string
    entityName: string
  }>
}

export interface CreateAccountData {
  displayName: string
}

export interface UpdateAccountData {
  displayName?: string
}

export interface AddUserToAccountData {
  userId: string
  clientRole?: ClientRole
}

export const accountsApi = {
  getAll: async (): Promise<Account[]> => {
    const response = await apiClient.get('/accounts')
    return response.data
  },

  getById: async (id: string): Promise<Account> => {
    const response = await apiClient.get(`/accounts/${id}`)
    return response.data
  },

  getClientUsers: async (): Promise<ClientUser[]> => {
    const response = await apiClient.get('/accounts/users/clients')
    return response.data
  },

  create: async (data: CreateAccountData): Promise<Account> => {
    const response = await apiClient.post('/accounts', data)
    return response.data
  },

  update: async (id: string, data: UpdateAccountData): Promise<Account> => {
    const response = await apiClient.put(`/accounts/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/accounts/${id}`)
  },

  addUser: async (accountId: string, data: AddUserToAccountData): Promise<AccountUser> => {
    const response = await apiClient.post(`/accounts/${accountId}/users`, data)
    return response.data
  },

  removeUser: async (accountId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/accounts/${accountId}/users/${userId}`)
  },
}


