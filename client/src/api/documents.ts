import apiClient from './client'

export interface UploadProgress {
  fileId: string
  fileName: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export const documentsApi = {
  upload: async (
    file: any,
    entityTaxYearId: string,
    clientId: string,
    checklistItemId?: string,
    folderId?: string,
    onProgress?: (progress: number) => void
  ) => {
    const formData = new FormData()
    // React Native FormData format
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'application/octet-stream',
      name: file.name || 'document',
    } as any)
    formData.append('entityTaxYearId', entityTaxYearId)
    formData.append('clientId', clientId)
    if (checklistItemId) formData.append('checklistItemId', checklistItemId)
    if (folderId) formData.append('folderId', folderId)
    if (file.name) formData.append('displayName', file.name)

    const response = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })

    return response.data
  },

  uploadGeneral: async (
    file: any,
    entityTaxYearId: string,
    clientId: string,
    documentType: string,
    issuer?: string,
    onProgress?: (progress: number) => void
  ) => {
    const formData = new FormData()
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'application/octet-stream',
      name: file.name || 'document',
    } as any)
    formData.append('entityTaxYearId', entityTaxYearId)
    formData.append('clientId', clientId)
    formData.append('documentType', documentType)
    if (issuer) formData.append('issuer', issuer)
    if (file.name) formData.append('displayName', file.name)

    const response = await apiClient.post('/documents/upload/general', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })

    return response.data
  },

  replace: async (
    documentId: string,
    file: any,
    reason?: string,
    onProgress?: (progress: number) => void
  ) => {
    const formData = new FormData()
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'application/octet-stream',
      name: file.name || 'document',
    } as any)
    if (reason) formData.append('reason', reason)

    const response = await apiClient.post(`/documents/${documentId}/replace`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })

    return response.data
  },

  signConfirmation: async (
    entityTaxYearId: string,
    signerName: string,
    signerEmail: string,
    signatureData: string
  ) => {
    const response = await apiClient.post(`/documents/confirmation/${entityTaxYearId}/sign`, {
      signerName,
      signerEmail,
      signatureData,
    })
    return response.data
  },
}

