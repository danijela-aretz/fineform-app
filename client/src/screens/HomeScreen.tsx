import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { clientStatusApi, ClientStatusInfo } from '../api/clientStatus'
import { useNavigation } from '@react-navigation/native'

interface HomeScreenProps {
  route?: {
    params?: {
      entityTaxYearId: string
    }
  }
}

export default function HomeScreen({ route }: HomeScreenProps) {
  const navigation = useNavigation()
  const entityTaxYearId = route?.params?.entityTaxYearId || 'mock-id' // TODO: Get from context/state
  const [statusInfo, setStatusInfo] = useState<ClientStatusInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatus()
  }, [entityTaxYearId])

  const loadStatus = async () => {
    // Don't try to load if we have a mock ID
    if (entityTaxYearId === 'mock-id') {
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      const data = await clientStatusApi.getStatus(entityTaxYearId)
      setStatusInfo(data)
    } catch (error: any) {
      console.error('Failed to load status:', error)
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to load status')
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  if (!statusInfo) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>No entity selected</Text>
        <Text style={styles.subtitle}>Please select an entity to view your tax status</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => {
            // @ts-ignore
            navigation.navigate('EntitySelection')
          }}
        >
          <Text style={styles.selectButtonText}>Select Entity</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const getStatusColor = () => {
    if (!!statusInfo.actionRequired) {
      return '#3b82f6' // Blue for action required
    }
    if (statusInfo.status === 'FILED') {
      return '#059669' // Green for filed
    }
    return '#6b7280' // Gray for in review
  }

  return (
    <ScrollView style={styles.container}>
      {/* Extension Banner */}
      {!!statusInfo.extensionRequested && (
        <View style={styles.extensionBanner}>
          <Text style={styles.extensionBannerText}>
            {statusInfo.extensionFiled
              ? `On Extension — New Due Date ${statusInfo.extendedDueDate ? new Date(statusInfo.extendedDueDate).toLocaleDateString() : ''}`
              : 'Extension Requested'}
          </Text>
        </View>
      )}

      {/* Status Card */}
      <View style={[styles.statusCard, { borderLeftColor: getStatusColor() }]}>
        <Text style={styles.statusTitle}>{statusInfo.title}</Text>
        <Text style={styles.statusDescription}>{statusInfo.description}</Text>
      </View>

      {/* Action Buttons */}
      {statusInfo.status === 'SIGN_ENGAGEMENT' && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            // @ts-ignore
            navigation.navigate('Engagement', { entityTaxYearId })
          }}
        >
          <Text style={styles.actionButtonText}>Sign Engagement Letter</Text>
        </TouchableOpacity>
      )}

      {statusInfo.status === 'CONFIRM_DOCUMENTS' && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            // @ts-ignore
            navigation.navigate('Confirmation', { entityTaxYearId })
          }}
        >
          <Text style={styles.actionButtonText}>Confirm Documents Received</Text>
        </TouchableOpacity>
      )}

      {statusInfo.status === 'SIGN_EFILE' && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            // @ts-ignore
            navigation.navigate('EfileAuthorization', { entityTaxYearId })
          }}
        >
          <Text style={styles.actionButtonText}>Sign E-File Authorization</Text>
        </TouchableOpacity>
      )}

      {/* Main Content Areas */}
      {!!statusInfo.showChecklist && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents</Text>
          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() => {
              // @ts-ignore
              navigation.navigate('Checklist', {
                entityTaxYearId,
                clientId: 'client-id', // TODO: Get from context
              })
            }}
          >
            <Text style={styles.sectionButtonText}>View Checklist</Text>
          </TouchableOpacity>
        </View>
      )}

      {!!statusInfo.showQuestionnaire && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questionnaire</Text>
          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() => {
              // @ts-ignore
              navigation.navigate('Questionnaire', { entityTaxYearId })
            }}
          >
            <Text style={styles.sectionButtonText}>Complete Questionnaire</Text>
          </TouchableOpacity>
        </View>
      )}

      {!!statusInfo.showIdModule && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identification</Text>
          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() => {
              // @ts-ignore
              navigation.navigate('ID', { entityTaxYearId })
            }}
          >
            <Text style={styles.sectionButtonText}>Update ID Information</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Need Help */}
      {!!statusInfo.showMessaging && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => {
              // @ts-ignore
              navigation.navigate('Messages', { entityTaxYearId })
            }}
          >
            <Text style={styles.helpButtonText}>Need Help? Send a Message</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Extension Request */}
      {!statusInfo.extensionRequested && statusInfo.status !== 'FILED' && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.extensionButton}
            onPress={() => {
              // @ts-ignore
              navigation.navigate('ExtensionRequest', {
                entityTaxYearId,
                taxYear: statusInfo.taxYear,
              })
            }}
          >
            <Text style={styles.extensionButtonText}>Request Extension</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tax Documents (if filed) */}
      {statusInfo.status === 'FILED' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tax Documents</Text>
          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() => {
              // @ts-ignore
              navigation.navigate('TaxDocuments', { entityTaxYearId })
            }}
          >
            <Text style={styles.sectionButtonText}>Download Tax Documents</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
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
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  extensionBanner: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f59e0b',
  },
  extensionBannerText: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500',
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 22,
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  sectionButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  sectionButtonText: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '500',
  },
  helpButton: {
    backgroundColor: '#e0e7ff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  helpButtonText: {
    color: '#4338ca',
    fontSize: 14,
    fontWeight: '500',
  },
  extensionButton: {
    backgroundColor: '#fef3c7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  extensionButtonText: {
    color: '#92400e',
    fontSize: 14,
    fontWeight: '500',
  },
  selectButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
