import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native'
import { questionnaireApi, QuestionnaireSection, QuestionnaireStatus } from '../api/questionnaire'

interface QuestionnaireScreenProps {
  route: {
    params: {
      entityTaxYearId: string
    }
  }
  navigation: any
}

export default function QuestionnaireScreen({ route, navigation }: QuestionnaireScreenProps) {
  const { entityTaxYearId } = route.params
  const [sections, setSections] = useState<QuestionnaireSection[]>([])
  const [status, setStatus] = useState<QuestionnaireStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadQuestionnaire()
  }, [])

  const loadQuestionnaire = async () => {
    try {
      setLoading(true)
      const [questionnaireData, statusData] = await Promise.all([
        questionnaireApi.getQuestionnaire(entityTaxYearId),
        questionnaireApi.getStatus(entityTaxYearId),
      ])
      setSections(questionnaireData)
      setStatus(statusData)
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load questionnaire')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = async (questionId: string, value: any) => {
    try {
      setSaving(true)
      await questionnaireApi.saveAnswer(entityTaxYearId, questionId, value)
      
      // Update local state
      setSections((prev) =>
        prev.map((section) => ({
          ...section,
          questions: section.questions.map((q) =>
            q.id === questionId
              ? {
                  ...q,
                  answer: {
                    id: 'temp',
                    answerValue: typeof value === 'string' ? value : JSON.stringify(value),
                  },
                }
              : q
          ),
        }))
      )

      // Reload status
      const statusData = await questionnaireApi.getStatus(entityTaxYearId)
      setStatus(statusData)
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save answer')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!confirm('Submit questionnaire? You will not be able to edit after submission.')) {
      return
    }

    try {
      setSubmitting(true)
      await questionnaireApi.submit(entityTaxYearId)
      Alert.alert('Success', 'Questionnaire submitted successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit questionnaire')
    } finally {
      setSubmitting(false)
    }
  }

  const renderQuestion = (question: QuestionnaireSection['questions'][0], sectionIndex: number, questionIndex: number) => {
    const answer = question.answer?.answerValue

    switch (question.questionType) {
      case 'TEXT':
      case 'TEXTAREA':
        return (
          <TextInput
            key={question.id}
            style={[styles.input, question.questionType === 'TEXTAREA' && styles.textArea]}
            value={answer || ''}
            onChangeText={(text) => handleAnswerChange(question.id, text)}
            placeholder={question.required ? `${question.questionText} *` : question.questionText}
            multiline={question.questionType === 'TEXTAREA' ? true : false}
            numberOfLines={question.questionType === 'TEXTAREA' ? 4 : 1}
          />
        )

      case 'NUMBER':
        return (
          <TextInput
            key={question.id}
            style={styles.input}
            value={answer || ''}
            onChangeText={(text) => handleAnswerChange(question.id, text)}
            placeholder={question.required ? `${question.questionText} *` : question.questionText}
            keyboardType="numeric"
          />
        )

      case 'DATE':
        return (
          <TextInput
            key={question.id}
            style={styles.input}
            value={answer || ''}
            onChangeText={(text) => handleAnswerChange(question.id, text)}
            placeholder={question.required ? `${question.questionText} * (YYYY-MM-DD)` : question.questionText}
          />
        )

      case 'BOOLEAN':
        // Ensure boolean value - handle both string and boolean from API
        const boolValue = answer === 'true' || answer === true || answer === '1'
        return (
          <View key={question.id} style={styles.booleanContainer}>
            <Text style={styles.questionText}>{question.questionText}</Text>
            <Switch
              value={!!boolValue}
              onValueChange={(value) => handleAnswerChange(question.id, value.toString())}
            />
          </View>
        )

      case 'SELECT':
      case 'MULTI_SELECT':
        // Simplified - in production would parse options from conditionalLogic or separate field
        return (
          <TextInput
            key={question.id}
            style={styles.input}
            value={answer || ''}
            onChangeText={(text) => handleAnswerChange(question.id, text)}
            placeholder={question.required ? `${question.questionText} *` : question.questionText}
          />
        )

      default:
        return (
          <Text key={question.id} style={styles.unsupported}>
            Unsupported question type: {question.questionType}
          </Text>
        )
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading questionnaire...</Text>
      </View>
    )
  }

  if (status?.status === 'COMPLETED') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Questionnaire Completed</Text>
          <Text style={styles.description}>
            This questionnaire has been submitted and cannot be edited.
          </Text>
          {status.completedAt && (
            <Text style={styles.completedDate}>
              Submitted on {new Date(status.completedAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </ScrollView>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Progress */}
        {status && (
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Progress</Text>
            <Text style={styles.progressText}>
              {status.progress.answered} of {status.progress.total} questions answered
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${status.progress.percentage}%` },
                ]}
              />
            </View>
            <Text style={styles.progressSubtext}>
              {status.progress.answeredRequired} of {status.progress.required} required questions answered
            </Text>
          </View>
        )}

        {/* Sections */}
        {sections.map((section, sectionIndex) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.name}</Text>
            {section.description && (
              <Text style={styles.sectionDescription}>{section.description}</Text>
            )}

            {section.questions.map((question, questionIndex) => (
              <View key={question.id} style={styles.questionContainer}>
                <Text style={styles.questionLabel}>
                  {question.questionText}
                  {question.required && <Text style={styles.required}> *</Text>}
                </Text>
                {renderQuestion(question, sectionIndex, questionIndex)}
              </View>
            ))}
          </View>
        ))}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting || status?.status === 'COMPLETED'}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? 'Submitting...' : 'Submit Questionnaire'}
          </Text>
        </TouchableOpacity>

        {saving && (
          <Text style={styles.savingText}>Saving...</Text>
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
    marginBottom: 16,
  },
  completedDate: {
    fontSize: 14,
    color: '#059669',
    marginTop: 8,
  },
  progressCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  progressSubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  questionContainer: {
    marginBottom: 16,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  booleanContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  questionText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  unsupported: {
    fontSize: 14,
    color: '#ef4444',
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  savingText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 12,
    marginTop: 8,
  },
})

