import apiClient from './client'

export interface LoginCredentials {
  email: string
  password: string
}

export interface User {
  id: string
  email: string
  userType: 'STAFF' | 'CLIENT'
  fullName: string
  active: boolean
  staffRole?: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | null
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', credentials)
    // Store tokens in localStorage
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken)
    }
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken)
    }
    return response.data
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/users/me')
    return response.data
  },

  logout: () => {
    // Clear tokens from localStorage
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },
}

