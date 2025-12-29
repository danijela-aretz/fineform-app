import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native'
import apiClient from '../api/client'

interface EfileAuthorizationScreenProps {
  route: {
    params: {
      entityTaxYearId: string
    }
  }
  navigation: any
}

export default function EfileAuthorizationScreen({
  route,
  navigation,
}: EfileAuthorizationScreenProps) {
  const { entityTaxYearId } = route.params
  const [signerName, setSignerName] = useState('')
  const [signerEmail, setSignerEmail] = useState('')
  const [signatureData, setSignatureData] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSign = async () => {
    if (!signerName.trim() || !signerEmail.trim()) {
      Alert.alert('Error', 'Please provide your name and email')
      return
    }

    if (!signatureData.trim()) {
      Alert.alert('Error', 'Please provide your signature')
      return
    }

    try {
      setLoading(true)
      await apiClient.post(`/efile-authorization/${entityTaxYearId}/sign`, {
        signerName: signerName.trim(),
        signerEmail: signerEmail.trim(),
        signatureData,
      })

      Alert.alert('Success', 'E-File authorization signed successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to sign authorization')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>E-File Authorization</Text>
        <Text style={styles.description}>
          By signing below, you authorize us to electronically file your tax return with the IRS and
          applicable state agencies.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={signerName}
            onChangeText={setSignerName}
            placeholder="Enter your full name"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={signerEmail}
            onChangeText={setSignerEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Signature *</Text>
          <TextInput
            style={[styles.input, styles.signatureInput]}
            value={signatureData}
            onChangeText={setSignatureData}
            placeholder="Type your name to sign"
            autoCapitalize="words"
            multiline={true}
          />
          <Text style={styles.signatureNote}>
            Note: In production, this would use a signature capture component
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.signButton, loading && styles.signButtonDisabled]}
          onPress={handleSign}
          disabled={loading}
        >
          <Text style={styles.signButtonText}>
            {loading ? 'Signing...' : 'Sign Authorization'}
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
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  signatureInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  signatureNote: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    fontStyle: 'italic',
  },
  signButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  signButtonDisabled: {
    opacity: 0.6,
  },
  signButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})

