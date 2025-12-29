import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native'
import { extensionsApi, ExtensionStatus } from '../api/extensions'

interface ExtensionRequestScreenProps {
  route: {
    params: {
      entityTaxYearId: string
      taxYear: number
    }
  }
  navigation: any
}

export default function ExtensionRequestScreen({
  route,
  navigation,
}: ExtensionRequestScreenProps) {
  const { entityTaxYearId, taxYear } = route.params
  const [status, setStatus] = useState<ExtensionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    try {
      const data = await extensionsApi.getStatus(entityTaxYearId)
      setStatus(data)
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load extension status')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestExtension = async () => {
    Alert.alert(
      'Request Extension',
      'Are you sure you want to request an extension? This will pause all reminders until the extension is filed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Extension',
          style: 'destructive',
          onPress: async () => {
            try {
              setRequesting(true)
              await extensionsApi.requestExtension(entityTaxYearId)
              Alert.alert(
                'Extension Requested',
                'Your extension request has been submitted. All reminders have been paused. The firm will file the extension and notify you when it is complete.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      navigation.goBack()
                    },
                  },
                ]
              )
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to request extension')
            } finally {
              setRequesting(false)
            }
          },
        },
      ]
    )
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  if (status?.extensionFiled) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Extension Filed</Text>
          <Text style={styles.description}>
            An extension has been filed for your {taxYear} tax return.
          </Text>
          {status.extendedDueDate && (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Extended Due Date:</Text>
              <Text style={styles.infoValue}>
                {new Date(status.extendedDueDate).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    )
  }

  if (status?.extensionRequested) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Extension Requested</Text>
          <Text style={styles.description}>
            Your extension request has been submitted. The firm will file the extension and notify
            you when it is complete. All reminders have been paused.
          </Text>
        </View>
      </ScrollView>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Request Extension</Text>
        <Text style={styles.description}>
          If you will not have your documents ready by the filing deadline, you can request an
          extension. This will pause all reminders until the extension is filed.
        </Text>

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ Once you request an extension, all reminder notifications will be paused. The firm
            will file the extension on your behalf and notify you when it is complete.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.requestButton, requesting && styles.requestButtonDisabled]}
          onPress={handleRequestExtension}
          disabled={requesting}
        >
          <Text style={styles.requestButtonText}>
            {requesting ? 'Requesting...' : 'Request Extension'}
          </Text>
        </TouchableOpacity>
      </View>
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
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 22,
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    padding: 16,
    marginBottom: 24,
    borderRadius: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  requestButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  requestButtonDisabled: {
    opacity: 0.6,
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
  },
})

