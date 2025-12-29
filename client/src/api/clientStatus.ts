import apiClient from './client'

export interface ClientStatusInfo {
  status: 'SIGN_ENGAGEMENT' | 'UPLOAD_DOCUMENTS' | 'CONFIRM_DOCUMENTS' | 'IN_REVIEW' | 'SIGN_EFILE' | 'FILED'
  title: string
  description: string
  actionRequired: boolean
  showChecklist: boolean
  showQuestionnaire: boolean
  showMessaging: boolean
  showUploads: boolean
  showIdModule: boolean
  extensionRequested: boolean
  extensionFiled: boolean
  extendedDueDate?: string | null
  taxYear: number
  entityName: string
}

export const clientStatusApi = {
  getStatus: async (entityTaxYearId: string): Promise<ClientStatusInfo> => {
    const response = await apiClient.get(`/client-status/${entityTaxYearId}`)
    const data = response.data
    // Ensure all boolean values are actually booleans, not strings
    return {
      ...data,
      actionRequired: !!data.actionRequired,
      showChecklist: !!data.showChecklist,
      showQuestionnaire: !!data.showQuestionnaire,
      showMessaging: !!data.showMessaging,
      showUploads: !!data.showUploads,
      showIdModule: !!data.showIdModule,
      extensionRequested: !!data.extensionRequested,
      extensionFiled: !!data.extensionFiled,
    }
  },
}

