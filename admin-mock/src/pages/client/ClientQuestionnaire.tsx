import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import HelpIcon from '../../components/HelpIcon';
import ClientViewBanner from '../../components/ClientViewBanner';

interface Question {
  id: string;
  questionKey: string;
  questionText: string;
  questionType: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'boolean' | 'date' | 'number';
  required: boolean;
  order: number;
}

interface Section {
  id: string;
  sectionName: string;
  order: number;
  questions: Question[];
}

const mockSections: Section[] = [
  {
    id: '1',
    sectionName: 'Personal Information',
    order: 1,
    questions: [
      {
        id: '1',
        questionKey: 'full_name',
        questionText: 'Full Name',
        questionType: 'text',
        required: true,
        order: 1,
      },
      {
        id: '2',
        questionKey: 'date_of_birth',
        questionText: 'Date of Birth',
        questionType: 'date',
        required: true,
        order: 2,
      },
      {
        id: '3',
        questionKey: 'ssn',
        questionText: 'Social Security Number',
        questionType: 'text',
        required: true,
        order: 3,
      },
    ],
  },
  {
    id: '2',
    sectionName: 'Income Information',
    order: 2,
    questions: [
      {
        id: '4',
        questionKey: 'employment_status',
        questionText: 'Employment Status',
        questionType: 'select',
        required: true,
        order: 1,
      },
      {
        id: '5',
        questionKey: 'w2_count',
        questionText: 'Number of W-2 Forms',
        questionType: 'number',
        required: false,
        order: 2,
      },
    ],
  },
  {
    id: '3',
    sectionName: 'Deductions',
    order: 3,
    questions: [
      {
        id: '6',
        questionKey: 'has_mortgage',
        questionText: 'Do you have a mortgage?',
        questionType: 'boolean',
        required: false,
        order: 1,
      },
      {
        id: '7',
        questionKey: 'charitable_contributions',
        questionText: 'Charitable Contributions Amount',
        questionType: 'number',
        required: false,
        order: 2,
      },
    ],
  },
];

export default function ClientQuestionnaire() {
  const { id } = useParams<{ id: string }>();
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isDraft, setIsDraft] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalSections = mockSections.length;
  const completedSections = mockSections.filter((section) => {
    const sectionQuestions = section.questions.filter(q => q.required);
    return sectionQuestions.every(q => answers[q.id] !== undefined && answers[q.id] !== '');
  }).length;

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers({ ...answers, [questionId]: value });
    setIsDraft(true);
  };

  const handleSaveDraft = () => {
    // Simulate auto-save
    alert('Draft saved successfully!');
    setIsDraft(false);
  };

  const handleSubmit = () => {
    if (!confirm('Are you sure you want to submit this questionnaire? You will not be able to edit it after submission.')) {
      return;
    }
    setIsSubmitted(true);
    setIsDraft(false);
    alert('Questionnaire submitted successfully!');
  };

  const currentSectionData = mockSections[currentSection];
  const isLastSection = currentSection === totalSections - 1;
  const isFirstSection = currentSection === 0;

  if (isSubmitted) {
    return (
      <>
        <ClientViewBanner />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <HelpIcon />
        <div className="card text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Questionnaire Submitted</h2>
            <p className="text-gray-600">
              Thank you for completing the questionnaire. We will review your responses.
            </p>
          </div>
          <Link to={`/clients/${id}`} className="btn-primary inline-block">
            Back to Client Dashboard
          </Link>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <ClientViewBanner />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="mb-6">
        <Link to={`/clients/${id}`} className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
          ← Back to Client Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Tax Questionnaire</h1>
        <p className="mt-2 text-sm text-gray-600">
          Please complete all required fields. You can save your progress and return later.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-700">
            Progress: {completedSections} of {totalSections} sections completed
          </div>
          {isDraft && (
            <span className="badge badge-warning text-xs">Draft (unsaved changes)</span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(completedSections / totalSections) * 100}%` }}
          />
        </div>
      </div>

      {/* Section Navigation */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            disabled={isFirstSection}
            className={`btn-secondary ${isFirstSection ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            ← Previous
          </button>
          <div className="text-sm text-gray-600">
            Section {currentSection + 1} of {totalSections}: {currentSectionData.sectionName}
          </div>
          <button
            onClick={() => setCurrentSection(Math.min(totalSections - 1, currentSection + 1))}
            disabled={isLastSection}
            className={`btn-secondary ${isLastSection ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Questions */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">{currentSectionData.sectionName}</h2>
        <div className="space-y-6">
          {currentSectionData.questions.map((question) => (
            <div key={question.id}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {question.questionText}
                {question.required && <span className="text-red-600 ml-1">*</span>}
              </label>
              {question.questionType === 'text' && (
                <input
                  type="text"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required={question.required}
                />
              )}
              {question.questionType === 'textarea' && (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={4}
                  required={question.required}
                />
              )}
              {question.questionType === 'number' && (
                <input
                  type="number"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required={question.required}
                />
              )}
              {question.questionType === 'date' && (
                <input
                  type="date"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required={question.required}
                />
              )}
              {question.questionType === 'boolean' && (
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={question.id}
                      checked={answers[question.id] === true}
                      onChange={() => handleAnswerChange(question.id, true)}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={question.id}
                      checked={answers[question.id] === false}
                      onChange={() => handleAnswerChange(question.id, false)}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              )}
              {question.questionType === 'select' && (
                <select
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required={question.required}
                >
                  <option value="">Select an option...</option>
                  <option value="employed">Employed</option>
                  <option value="self_employed">Self-Employed</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="retired">Retired</option>
                </select>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="card">
        <div className="flex items-center justify-between">
          <button onClick={handleSaveDraft} className="btn-secondary">
            Save Draft
          </button>
          <div className="flex gap-2">
            {!isLastSection && (
              <button
                onClick={() => setCurrentSection(currentSection + 1)}
                className="btn-secondary"
              >
                Next Section →
              </button>
            )}
            {isLastSection && (
              <button onClick={handleSubmit} className="btn-primary">
                Submit Questionnaire
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

