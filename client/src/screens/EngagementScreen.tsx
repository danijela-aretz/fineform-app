import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { engagementApi, EngagementStatus } from '../api/engagement'

interface EngagementScreenProps {
  entityTaxYearId: string
  onSigned: () => void
}

export default function EngagementScreen({ entityTaxYearId, onSigned }: EngagementScreenProps) {
  const [status, setStatus] = useState<EngagementStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState(false)
  const [signerName, setSignerName] = useState('')
  const [signerEmail, setSignerEmail] = useState('')

  useEffect(() => {
    loadStatus()
  }, [entityTaxYearId])

  const loadStatus = async () => {
    try {
      const data = await engagementApi.getStatus(entityTaxYearId)
      setStatus(data)
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load engagement status')
    } finally {
      setLoading(false)
    }
  }

  const handleSign = async () => {
    if (!signerName.trim() || !signerEmail.trim()) {
      Alert.alert('Error', 'Please enter your name and email')
      return
    }

    setSigning(true)
    try {
      // In production, this would capture actual signature drawing
      const signatureData = JSON.stringify({
        signerName,
        signerEmail,
        signedAt: new Date().toISOString(),
      })

      await engagementApi.sign(entityTaxYearId, {
        signerName,
        signerEmail,
        signatureData,
      })

      Alert.alert('Success', 'Engagement letter signed successfully', [
        { text: 'OK', onPress: () => {
          loadStatus()
          onSigned()
        }},
      ])
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to sign engagement letter')
    } finally {
      setSigning(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    )
  }

  if (!status) {
    return (
      <View style={styles.container}>
        <Text>Failed to load engagement letter</Text>
      </View>
    )
  }

  const isFullySigned = status.engagementStatus === 'FULLY_SIGNED'
  const isPartiallySigned = status.engagementStatus === 'PARTIALLY_SIGNED'
  const canSign = !isFullySigned

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Engagement Letter</Text>
        <Text style={styles.subtitle}>
          {status.entityName} - Tax Year {status.taxYear}
        </Text>

        {/* Engagement Letter Content */}
        <View style={styles.letterContent}>
          <Text style={styles.letterText}>
            This is the engagement letter content. In production, this would be loaded from a template or database.
            {'\n\n'}
            Terms and conditions would be displayed here.
            {'\n\n'}
            By signing below, you agree to engage Fine Form Accounting for tax preparation services for the tax year {status.taxYear}.
          </Text>
        </View>

        {/* Signature Status */}
        {isPartiallySigned && (
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>
              Progress: {status.signatures.length} of 2 signatures
            </Text>
            <Text style={styles.statusSubtext}>
              Signed by: {status.signatures.map((s) => s.signerName).join(', ')}
            </Text>
          </View>
        )}

        {isFullySigned && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>✓ Engagement Letter Fully Signed</Text>
            <Text style={styles.successSubtext}>
              Signed by: {status.signatures.map((s) => s.signerName).join(', ')}
            </Text>
          </View>
        )}

        {/* Signature Form */}
        {canSign && (
          <View style={styles.signatureForm}>
            <Text style={styles.formTitle}>Sign Engagement Letter</Text>
            
            <Text style={styles.label}>Your Name</Text>
            <View style={styles.input}>
              <Text style={styles.inputText}>{signerName || 'Enter your name'}</Text>
            </View>

            <Text style={styles.label}>Your Email</Text>
            <View style={styles.input}>
              <Text style={styles.inputText}>{signerEmail || 'Enter your email'}</Text>
            </View>

            <Text style={styles.note}>
              In production, this would include a signature capture component where you can draw your signature.
            </Text>

            <TouchableOpacity
              style={[styles.signButton, signing && styles.signButtonDisabled]}
              onPress={handleSign}
              disabled={signing}
            >
              {signing ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.signButtonText}>Sign Engagement Letter</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Download PDF */}
        {isFullySigned && (
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={async () => {
              try {
                const blob = await engagementApi.downloadPDF(entityTaxYearId)
                // In production, this would trigger file download
                Alert.alert('Success', 'PDF download started')
              } catch (error: any) {
                Alert.alert('Error', 'Failed to download PDF')
              }
            }}
          >
            <Text style={styles.downloadButtonText}>Download Signed PDF</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  letterContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  letterText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
  statusBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 14,
    color: '#78350f',
  },
  successBox: {
    backgroundColor: '#d1fae5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065f46',
    marginBottom: 4,
  },
  successSubtext: {
    fontSize: 14,
    color: '#047857',
  },
  signatureForm: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1f2937',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputText: {
    fontSize: 16,
    color: '#1f2937',
  },
  note: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  signButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  signButtonDisabled: {
    opacity: 0.5,
  },
  signButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  downloadButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})

