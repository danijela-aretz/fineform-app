import apiClient from './client'

export type UserType = 'STAFF' | 'CLIENT'
export type StaffRole = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF'

export interface User {
  id: string
  email: string
  userType: UserType
  fullName: string
  active: boolean
  staffRole: StaffRole | null
  jobTitle: string | null
  phone: string | null
  staffActive?: boolean | null
  createdAt: string
  updatedAt?: string
}

export interface CreateUserData {
  email: string
  password: string
  fullName: string
  userType: UserType
  staffRole?: StaffRole
  jobTitle?: string
  phone?: string
}

export interface UpdateUserData {
  fullName?: string
  email?: string
  active?: boolean
}

export interface UpdateStaffProfileData {
  staffRole?: StaffRole
  jobTitle?: string
  phone?: string
  active?: boolean
}

export const usersApi = {
  getAll: async (filters?: { userType?: UserType }): Promise<User[]> => {
    const params = filters?.userType ? { userType: filters.userType } : {}
    const response = await apiClient.get('/users', { params })
    return response.data
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`)
    return response.data
  },

  create: async (data: CreateUserData): Promise<User> => {
    const response = await apiClient.post('/users', data)
    return response.data
  },

  update: async (id: string, data: UpdateUserData): Promise<User> => {
    const response = await apiClient.put(`/users/${id}`, data)
    return response.data
  },

  updateStaffProfile: async (id: string, data: UpdateStaffProfileData): Promise<any> => {
    const response = await apiClient.put(`/users/${id}/staff-profile`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`)
  },
}


