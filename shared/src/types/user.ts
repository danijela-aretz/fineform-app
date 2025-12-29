import { UserType, StaffRole } from '../constants/statuses'

export interface User {
  id: string
  email: string
  userType: UserType
  fullName: string
  active: boolean
  staffRole?: StaffRole | null
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

