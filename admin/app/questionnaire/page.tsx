'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  questionnaireApi,
  QuestionnaireSection,
  QuestionnaireQuestion,
  QuestionType,
  CreateSectionData,
  UpdateSectionData,
  CreateQuestionData,
  UpdateQuestionData,
} from '@/lib/api/questionnaire'

const QUESTION_TYPES: QuestionType[] = [
  'TEXT',
  'TEXTAREA',
  'NUMBER',
  'DATE',
  'SELECT',
  'MULTI_SELECT',
  'BOOLEAN',
  'FILE',
]

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  TEXT: 'Text',
  TEXTAREA: 'Textarea',
  NUMBER: 'Number',
  DATE: 'Date',
  SELECT: 'Select',
  MULTI_SELECT: 'Multi-Select',
  BOOLEAN: 'Boolean',
  FILE: 'File',
}

export default function QuestionnairePage() {
  const router = useRouter()
  const [sections, setSections] = useState<QuestionnaireSection[]>([])
  const [selectedSection, setSelectedSection] = useState<QuestionnaireSection | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSectionModal, setShowSectionModal] = useState(false)
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [editingSection, setEditingSection] = useState<QuestionnaireSection | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<QuestionnaireQuestion | null>(null)
  const [sectionFormData, setSectionFormData] = useState<CreateSectionData>({
    name: '',
    description: '',
    order: 0,
  })
  const [questionFormData, setQuestionFormData] = useState<CreateQuestionData>({
    questionText: '',
    questionType: 'TEXT',
    required: false,
    order: 0,
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSections()
  }, [])

  const fetchSections = async () => {
    try {
      setLoading(true)
      const data = await questionnaireApi.getSections()
      setSections(data)
      if (data.length > 0 && !selectedSection) {
        setSelectedSection(data[0])
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login')
      } else {
        setError(error.response?.data?.message || 'Failed to load sections')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSection = async () => {
    try {
      setError(null)
      await questionnaireApi.createSection(sectionFormData)
      setShowSectionModal(false)
      setSectionFormData({ name: '', description: '', order: 0 })
      await fetchSections()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create section')
    }
  }

  const handleEditSection = (section: QuestionnaireSection) => {
    setEditingSection(section)
    setSectionFormData({
      name: section.name,
      description: section.description || '',
      order: section.order,
    })
    setShowSectionModal(true)
  }

  const handleUpdateSection = async () => {
    if (!editingSection) return

    try {
      setError(null)
      const updateData: UpdateSectionData = {
        name: sectionFormData.name,
        description: sectionFormData.description || undefined,
        order: sectionFormData.order,
      }
      await questionnaireApi.updateSection(editingSection.id, updateData)
      setShowSectionModal(false)
      setEditingSection(null)
      await fetchSections()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update section')
    }
  }

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section? All questions in this section will also be deleted.')) {
      return
    }

    try {
      setError(null)
      await questionnaireApi.deleteSection(id)
      if (selectedSection?.id === id) {
        setSelectedSection(null)
      }
      await fetchSections()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete section')
    }
  }

  const handleToggleSectionActive = async (section: QuestionnaireSection) => {
    try {
      setError(null)
      await questionnaireApi.updateSection(section.id, { active: !section.active })
      await fetchSections()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update section')
    }
  }

  const handleCreateQuestion = async () => {
    if (!selectedSection) return

    try {
      setError(null)
      await questionnaireApi.createQuestion(selectedSection.id, questionFormData)
      setShowQuestionModal(false)
      setQuestionFormData({ questionText: '', questionType: 'TEXT', required: false, order: 0 })
      await fetchSections()
      // Refresh selected section
      const updated = await questionnaireApi.getSectionById(selectedSection.id)
      setSelectedSection(updated)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create question')
    }
  }

  const handleEditQuestion = (question: QuestionnaireQuestion) => {
    setEditingQuestion(question)
    setQuestionFormData({
      questionText: question.questionText,
      questionType: question.questionType,
      required: question.required,
      order: question.order,
      conditionalLogic: question.conditionalLogic || undefined,
    })
    setShowQuestionModal(true)
  }

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return

    try {
      setError(null)
      const updateData: UpdateQuestionData = {
        questionText: questionFormData.questionText,
        questionType: questionFormData.questionType,
        required: questionFormData.required,
        order: questionFormData.order,
        conditionalLogic: questionFormData.conditionalLogic,
      }
      await questionnaireApi.updateQuestion(editingQuestion.id, updateData)
      setShowQuestionModal(false)
      setEditingQuestion(null)
      await fetchSections()
      // Refresh selected section
      if (selectedSection) {
        const updated = await questionnaireApi.getSectionById(selectedSection.id)
        setSelectedSection(updated)
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update question')
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return
    }

    try {
      setError(null)
      await questionnaireApi.deleteQuestion(id)
      await fetchSections()
      // Refresh selected section
      if (selectedSection) {
        const updated = await questionnaireApi.getSectionById(selectedSection.id)
        setSelectedSection(updated)
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete question')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Questionnaire Builder</h1>
          <button
            onClick={() => {
              setEditingSection(null)
              setSectionFormData({ name: '', description: '', order: 0 })
              setShowSectionModal(true)
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Create Section
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sections List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Sections</h2>
              {sections.length === 0 ? (
                <p className="text-gray-500 text-sm">No sections yet. Create one to get started.</p>
              ) : (
                <div className="space-y-2">
                  {sections.map((section) => (
                    <div
                      key={section.id}
                      className={`p-3 rounded border cursor-pointer ${
                        selectedSection?.id === section.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedSection(section)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{section.name}</div>
                          {section.description && (
                            <div className="text-sm text-gray-500 mt-1">{section.description}</div>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            {section.questions?.length || 0} question{section.questions?.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-2">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              section.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {section.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleSectionActive(section)
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-900"
                        >
                          {section.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditSection(section)
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteSection(section.id)
                          }}
                          className="text-xs text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Questions for Selected Section */}
          <div className="lg:col-span-2">
            {selectedSection ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{selectedSection.name} - Questions</h2>
                  <button
                    onClick={() => {
                      setEditingQuestion(null)
                      setQuestionFormData({
                        questionText: '',
                        questionType: 'TEXT',
                        required: false,
                        order: selectedSection.questions?.length || 0,
                      })
                      setShowQuestionModal(true)
                    }}
                    className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                  >
                    Add Question
                  </button>
                </div>
                {selectedSection.questions && selectedSection.questions.length > 0 ? (
                  <div className="space-y-3">
                    {selectedSection.questions.map((question) => (
                      <div key={question.id} className="border border-gray-200 rounded p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{question.questionText}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              Type: {QUESTION_TYPE_LABELS[question.questionType]} | Order: {question.order} |
                              {question.required ? (
                                <span className="text-red-600 ml-1">Required</span>
                              ) : (
                                <span className="text-gray-400 ml-1">Optional</span>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditQuestion(question)}
                              className="text-indigo-600 hover:text-indigo-900 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="text-red-600 hover:text-red-900 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No questions yet. Add one to get started.</p>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">Select a section to view or manage questions.</p>
              </div>
            )}
          </div>
        </div>

        {/* Section Modal */}
        {showSectionModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingSection ? 'Edit Section' : 'Create Section'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={sectionFormData.name}
                      onChange={(e) => setSectionFormData({ ...sectionFormData, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (optional)
                    </label>
                    <textarea
                      value={sectionFormData.description}
                      onChange={(e) =>
                        setSectionFormData({ ...sectionFormData, description: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                    <input
                      type="number"
                      value={sectionFormData.order}
                      onChange={(e) =>
                        setSectionFormData({ ...sectionFormData, order: parseInt(e.target.value) || 0 })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      min="0"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowSectionModal(false)
                      setEditingSection(null)
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingSection ? handleUpdateSection : handleCreateSection}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    disabled={!sectionFormData.name}
                  >
                    {editingSection ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Question Modal */}
        {showQuestionModal && selectedSection && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingQuestion ? 'Edit Question' : 'Create Question'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                    <textarea
                      value={questionFormData.questionText}
                      onChange={(e) =>
                        setQuestionFormData({ ...questionFormData, questionText: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                    <select
                      value={questionFormData.questionType}
                      onChange={(e) =>
                        setQuestionFormData({
                          ...questionFormData,
                          questionType: e.target.value as QuestionType,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      required
                    >
                      {QUESTION_TYPES.map((type) => (
                        <option key={type} value={type} className="text-gray-900">
                          {QUESTION_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                    <input
                      type="number"
                      value={questionFormData.order}
                      onChange={(e) =>
                        setQuestionFormData({
                          ...questionFormData,
                          order: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={questionFormData.required}
                        onChange={(e) =>
                          setQuestionFormData({ ...questionFormData, required: e.target.checked })
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Required</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowQuestionModal(false)
                      setEditingQuestion(null)
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    disabled={!questionFormData.questionText}
                  >
                    {editingQuestion ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


