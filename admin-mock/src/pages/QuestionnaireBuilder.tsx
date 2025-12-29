import { useState } from 'react';
import HelpIcon from '../components/HelpIcon';

interface Question {
  id: string;
  questionKey: string;
  questionText: string;
  questionType: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'boolean' | 'date' | 'number';
  required: boolean;
  order: number;
  active: boolean;
}

interface Section {
  id: string;
  sectionName: string;
  order: number;
  active: boolean;
  questions: Question[];
}

const mockSections: Section[] = [
  {
    id: '1',
    sectionName: 'Personal Information',
    order: 1,
    active: true,
    questions: [
      {
        id: '1',
        questionKey: 'full_name',
        questionText: 'Full Name',
        questionType: 'text',
        required: true,
        order: 1,
        active: true,
      },
      {
        id: '2',
        questionKey: 'date_of_birth',
        questionText: 'Date of Birth',
        questionType: 'date',
        required: true,
        order: 2,
        active: true,
      },
    ],
  },
  {
    id: '2',
    sectionName: 'Income Information',
    order: 2,
    active: true,
    questions: [
      {
        id: '3',
        questionKey: 'employment_status',
        questionText: 'Employment Status',
        questionType: 'select',
        required: true,
        order: 1,
        active: true,
      },
    ],
  },
];

export default function QuestionnaireBuilder() {
  const [sections, setSections] = useState(mockSections);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [, setEditingQuestion] = useState<Question | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [sectionFormData, setSectionFormData] = useState({
    sectionName: '',
    order: 0,
  });
  const [questionFormData, setQuestionFormData] = useState({
    questionKey: '',
    questionText: '',
    questionType: 'text' as Question['questionType'],
    required: false,
    order: 0,
  });

  const handleCreateSection = () => {
    if (!sectionFormData.sectionName.trim()) return;
    const newSection: Section = {
      id: String(sections.length + 1),
      sectionName: sectionFormData.sectionName,
      order: sectionFormData.order || sections.length + 1,
      active: true,
      questions: [],
    };
    setSections([...sections, newSection].sort((a, b) => a.order - b.order));
    setSectionFormData({ sectionName: '', order: 0 });
    setShowSectionModal(false);
  };

  const handleCreateQuestion = () => {
    if (!selectedSection || !questionFormData.questionText.trim()) return;
    const newQuestion: Question = {
      id: String(Date.now()),
      questionKey: questionFormData.questionKey || questionFormData.questionText.toLowerCase().replace(/\s+/g, '_'),
      questionText: questionFormData.questionText,
      questionType: questionFormData.questionType,
      required: questionFormData.required,
      order: questionFormData.order || (selectedSection.questions.length + 1),
      active: true,
    };
    setSections(sections.map(s =>
      s.id === selectedSection.id
        ? { ...s, questions: [...s.questions, newQuestion].sort((a, b) => a.order - b.order) }
        : s
    ));
    setQuestionFormData({
      questionKey: '',
      questionText: '',
      questionType: 'text',
      required: false,
      order: 0,
    });
    setShowQuestionModal(false);
  };

  const handleDeleteSection = (id: string) => {
    if (!confirm('Are you sure you want to delete this section and all its questions?')) return;
    setSections(sections.filter(s => s.id !== id));
    if (selectedSection?.id === id) {
      setSelectedSection(null);
    }
  };

  const handleDeleteQuestion = (sectionId: string, questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    setSections(sections.map(s =>
      s.id === sectionId
        ? { ...s, questions: s.questions.filter(q => q.id !== questionId) }
        : s
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Questionnaire Builder</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create and manage questionnaire sections and questions
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="btn-secondary"
          >
            {showPreview ? 'Hide Preview' : 'Preview Questionnaire'}
          </button>
          <button
            onClick={() => {
              setEditingSection(null);
              setSectionFormData({ sectionName: '', order: sections.length + 1 });
              setShowSectionModal(true);
            }}
            className="btn-primary"
          >
            Create Section
          </button>
        </div>
      </div>

      {showPreview ? (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Questionnaire Preview (Client View)</h2>
          <div className="space-y-6">
            {sections.map((section, sectionIndex) => (
              <div key={section.id} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Section {sectionIndex + 1}: {section.sectionName}
                </h3>
                <div className="space-y-4">
                  {section.questions.map((question) => (
                    <div key={question.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {question.questionText}
                        {question.required && <span className="text-red-600 ml-1">*</span>}
                      </label>
                      {question.questionType === 'text' && (
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          placeholder="Enter your answer..."
                          disabled
                        />
                      )}
                      {question.questionType === 'textarea' && (
                        <textarea
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          rows={4}
                          placeholder="Enter your answer..."
                          disabled
                        />
                      )}
                      {question.questionType === 'number' && (
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          placeholder="Enter a number..."
                          disabled
                        />
                      )}
                      {question.questionType === 'date' && (
                        <input
                          type="date"
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          disabled
                        />
                      )}
                      {question.questionType === 'boolean' && (
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input type="radio" name={question.id} className="mr-2" disabled />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input type="radio" name={question.id} className="mr-2" disabled />
                            No
                          </label>
                        </div>
                      )}
                      {question.questionType === 'select' && (
                        <select className="w-full border border-gray-300 rounded-md px-3 py-2" disabled>
                          <option>Select an option...</option>
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              This is how clients will see the questionnaire. They can navigate between sections,
              save drafts, and submit when complete.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Sections List */}
          <div className="md:col-span-1">
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Sections</h2>
              <div className="space-y-2">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    onClick={() => setSelectedSection(section)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedSection?.id === section.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{section.sectionName}</div>
                        <div className="text-xs text-gray-500">
                          {section.questions.length} questions
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSection(section.id);
                        }}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        {/* Questions List */}
        <div className="md:col-span-2">
          {selectedSection ? (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{selectedSection.sectionName}</h2>
                <button
                  onClick={() => {
                    setEditingQuestion(null);
                    setQuestionFormData({
                      questionKey: '',
                      questionText: '',
                      questionType: 'text',
                      required: false,
                      order: selectedSection.questions.length + 1,
                    });
                    setShowQuestionModal(true);
                  }}
                  className="btn-primary text-sm"
                >
                  Add Question
                </button>
              </div>
              <div className="space-y-3">
                {selectedSection.questions.map((question) => (
                  <div
                    key={question.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="badge badge-info">{question.questionType}</span>
                          {question.required && (
                            <span className="badge badge-warning">Required</span>
                          )}
                        </div>
                        <div className="font-medium text-sm mb-1">{question.questionText}</div>
                        <div className="text-xs text-gray-500">Key: {question.questionKey}</div>
                      </div>
                      <button
                        onClick={() => handleDeleteQuestion(selectedSection.id, question.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {selectedSection.questions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No questions yet. Click "Add Question" to get started.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="text-center py-12 text-gray-500">
                Select a section to view and manage questions
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {editingSection ? 'Edit Section' : 'Create Section'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Name *
                </label>
                <input
                  type="text"
                  value={sectionFormData.sectionName}
                  onChange={(e) => setSectionFormData({ ...sectionFormData, sectionName: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <input
                  type="number"
                  value={sectionFormData.order}
                  onChange={(e) => setSectionFormData({ ...sectionFormData, order: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowSectionModal(false);
                  setEditingSection(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleCreateSection} className="btn-primary">
                {editingSection ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {showQuestionModal && selectedSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add Question</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Text *
                </label>
                <input
                  type="text"
                  value={questionFormData.questionText}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, questionText: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Key
                </label>
                <input
                  type="text"
                  value={questionFormData.questionKey}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, questionKey: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Auto-generated if empty"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Type *
                </label>
                <select
                  value={questionFormData.questionType}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, questionType: e.target.value as Question['questionType'] })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="text">Text</option>
                  <option value="textarea">Textarea</option>
                  <option value="select">Select</option>
                  <option value="radio">Radio</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="boolean">Boolean</option>
                  <option value="date">Date</option>
                  <option value="number">Number</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <input
                  type="number"
                  value={questionFormData.order}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, order: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={questionFormData.required}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, required: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Required</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowQuestionModal(false);
                  setEditingQuestion(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleCreateQuestion} className="btn-primary">
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

