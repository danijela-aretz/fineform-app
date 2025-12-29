import apiClient from './client'
import AsyncStorage from '@react-native-async-storage/async-storage'

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
    try {
      console.log('Attempting login with email:', credentials.email)
      const response = await apiClient.post('/auth/login', credentials)
      await AsyncStorage.setItem('accessToken', response.data.accessToken)
      await AsyncStorage.setItem('refreshToken', response.data.refreshToken)
      console.log('Login successful')
      return response.data
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message)
      console.error('API URL:', process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001')
      throw error
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/users/me')
    return response.data
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem('accessToken')
    await AsyncStorage.removeItem('refreshToken')
  },
}

