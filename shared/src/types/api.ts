export interface ApiResponse<T = any> {
  status: 'success' | 'error'
  data?: T
  message?: string
  statusCode?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

