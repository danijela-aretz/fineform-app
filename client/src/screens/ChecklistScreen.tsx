import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
// Note: expo-document-picker needs to be installed
// For now, using a placeholder - install with: npm install expo-document-picker
// import * as DocumentPicker from 'expo-document-picker'
import { checklistApi, ChecklistItem } from '../api/checklist'
import { documentsApi, UploadProgress } from '../api/documents'

interface ChecklistScreenProps {
  route: {
    params: {
      entityTaxYearId: string
      clientId: string
    }
  }
}

interface UploadQueueItem {
  id: string
  file: any
  checklistItemId: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export default function ChecklistScreen({ route }: ChecklistScreenProps) {
  const { entityTaxYearId, clientId } = route.params
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([])

  useEffect(() => {
    loadChecklist()
  }, [])

  const loadChecklist = async () => {
    try {
      setLoading(true)
      const data = await checklistApi.getItems(entityTaxYearId)
      setItems(data)
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load checklist')
    } finally {
      setLoading(false)
    }
  }

  const pickDocument = async (itemId: string) => {
    try {
      // TODO: Install expo-document-picker: npm install expo-document-picker
      // For now, using a mock implementation
      Alert.alert(
        'Document Picker',
        'Please install expo-document-picker to enable file selection',
        [
          {
            text: 'OK',
            onPress: () => {
              // Mock file for testing
              const mockFile = {
                uri: 'file://mock',
                name: 'test-document.pdf',
                type: 'application/pdf',
              }
              const queueId = `${itemId}-${Date.now()}`

              const queueItem: UploadQueueItem = {
                id: queueId,
                file: mockFile,
                checklistItemId: itemId,
                progress: 0,
                status: 'pending',
              }

              setUploadQueue((prev) => [...prev, queueItem])
              processUploadQueue()
            },
          },
        ]
      )
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pick document')
    }
  }

  const processUploadQueue = async () => {
    // Find first pending item
    const pendingItem = uploadQueue.find((item) => item.status === 'pending')
    if (!pendingItem) return

    // Mark as uploading
    setUploadQueue((prev) =>
      prev.map((item) =>
        item.id === pendingItem.id ? { ...item, status: 'uploading' } : item
      )
    )

    try {
      await documentsApi.upload(
        pendingItem.file,
        entityTaxYearId,
        clientId,
        pendingItem.checklistItemId,
        undefined,
        (progress) => {
          setUploadQueue((prev) =>
            prev.map((item) =>
              item.id === pendingItem.id ? { ...item, progress } : item
            )
          )
        }
      )

      // Mark as success
      setUploadQueue((prev) =>
        prev.map((item) =>
          item.id === pendingItem.id ? { ...item, status: 'success', progress: 100 } : item
        )
      )

      // Reload checklist
      await loadChecklist()

      // Remove from queue after delay
      setTimeout(() => {
        setUploadQueue((prev) => {
          const filtered = prev.filter((item) => item.id !== pendingItem.id)
          // Process next item if any
          if (filtered.some((item) => item.status === 'pending')) {
            setTimeout(() => processUploadQueue(), 100)
          }
          return filtered
        })
      }, 2000)
    } catch (error: any) {
      setUploadQueue((prev) =>
        prev.map((item) =>
          item.id === pendingItem.id
            ? { ...item, status: 'error', error: error.message }
            : item
        )
      )
    }
  }

  const retryUpload = (queueItemId: string) => {
    setUploadQueue((prev) =>
      prev.map((item) =>
        item.id === queueItemId ? { ...item, status: 'pending', error: undefined } : item
      )
    )
    processUploadQueue()
  }

  const markNotApplicable = async (itemId: string) => {
    try {
      await checklistApi.markNotApplicable(entityTaxYearId, itemId)
      await loadChecklist()
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to mark as not applicable')
    }
  }

  const renderItem = ({ item }: { item: ChecklistItem }) => {
    const queueItem = uploadQueue.find((q) => q.checklistItemId === item.id)
    const hasFiles = item.files && item.files.length > 0

    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.itemName}</Text>
          {item.required && <Text style={styles.required}>Required</Text>}
        </View>

        {hasFiles && (
          <View style={styles.filesContainer}>
            {item.files.map((file, idx) => (
              <Text key={idx} style={styles.fileName}>
                ✓ {file.document.displayName}
              </Text>
            ))}
          </View>
        )}

        {queueItem && (
          <View style={styles.uploadProgress}>
            {queueItem.status === 'uploading' && (
              <>
                <ActivityIndicator size="small" />
                <Text style={styles.progressText}>{queueItem.progress}%</Text>
              </>
            )}
            {queueItem.status === 'error' && (
              <TouchableOpacity onPress={() => retryUpload(queueItem.id)}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            )}
            {queueItem.status === 'success' && (
              <Text style={styles.successText}>✓ Uploaded</Text>
            )}
          </View>
        )}

        {item.status !== 'NOT_APPLICABLE' && !queueItem && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => pickDocument(item.id)}
            >
              <Text style={styles.uploadButtonText}>
                {hasFiles ? 'Replace' : 'Upload'}
              </Text>
            </TouchableOpacity>
            {!item.required && (
              <TouchableOpacity
                style={styles.naButton}
                onPress={() => markNotApplicable(item.id)}
              >
                <Text style={styles.naButtonText}>Not Applicable</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {item.status === 'NOT_APPLICABLE' && (
          <Text style={styles.naStatus}>Marked as not applicable</Text>
        )}
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  required: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
  },
  filesContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  fileName: {
    fontSize: 14,
    color: '#059669',
    marginBottom: 4,
  },
  uploadProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#3b82f6',
  },
  retryText: {
    fontSize: 14,
    color: '#ef4444',
    textDecorationLine: 'underline',
  },
  successText: {
    fontSize: 14,
    color: '#059669',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  uploadButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center',
  },
  naButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  naButtonText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  naStatus: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 8,
  },
})

