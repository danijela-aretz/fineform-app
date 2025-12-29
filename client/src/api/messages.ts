import apiClient from './client'

export interface Message {
  id: string
  threadId: string
  senderId: string
  senderType: 'STAFF' | 'CLIENT'
  content: string
  read: boolean
  createdAt: string
  senderName?: string
  senderEmail?: string | null
}

export interface MessageThread {
  id: string
  entityTaxYearId: string
  archived: boolean
  createdAt: string
  updatedAt: string
  participants: Array<{
    id: string
    userId: string
    userType: 'STAFF' | 'CLIENT'
  }>
  messages?: Message[]
}

export const messagesApi = {
  getThreads: async (): Promise<MessageThread[]> => {
    const response = await apiClient.get('/messages/threads')
    return response.data
  },

  getThreadByEntityTaxYear: async (entityTaxYearId: string): Promise<MessageThread> => {
    const response = await apiClient.get(`/messages/threads/entity-tax-year/${entityTaxYearId}`)
    return response.data
  },

  getMessages: async (threadId: string): Promise<Message[]> => {
    const response = await apiClient.get(`/messages/threads/${threadId}/messages`)
    return response.data
  },

  sendMessage: async (threadId: string, content: string): Promise<Message> => {
    const response = await apiClient.post(`/messages/threads/${threadId}/messages`, { content })
    return response.data
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get('/messages/unread-count')
    return response.data.count
  },
}

