import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockEntities } from '../../data/mockData';
import HelpIcon from '../../components/HelpIcon';
import ClientViewBanner from '../../components/ClientViewBanner';

export default function ClientDocumentReceiptConfirmation() {
  const { id } = useParams<{ id: string }>();
  const entity = mockEntities.find(e => e.id === id);
  const [typedName, setTypedName] = useState('');
  const [, setIsSubmitted] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);

  if (!entity) {
    return (
      <>
        <ClientViewBanner />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <HelpIcon />
        <HelpIcon />
          <div className="card">
            <p className="text-gray-500">Client not found</p>
            <Link to="/clients" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
              ← Back to Clients
            </Link>
          </div>
        </div>
      </>
    );
  }

  const handleSubmit = () => {
    if (!typedName.trim()) {
      alert('Please type your name to confirm.');
      return;
    }
    if (!confirm('Are you sure you want to submit this confirmation? This action cannot be undone.')) {
      return;
    }
    setIsSubmitted(true);
    setShowPrompt(false);
    alert('Document Receipt Confirmation submitted successfully!');
  };

  if (!showPrompt) {
    return (
      <>
        <ClientViewBanner />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <div className="card text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h1 className="text-2xl font-bold text-gray-900">Confirmation Submitted</h1>
            </div>
            <p className="text-gray-600 mb-4">
              Your Document Receipt Confirmation has been submitted successfully.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Submitted by: <strong>{typedName}</strong><br />
              Date: {new Date().toLocaleString()}
            </p>
            <Link to={`/clients/${id}`} className="btn-primary inline-block">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ClientViewBanner />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="mb-6">
          <Link to={`/clients/${id}`} className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
            ← Back to Client Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Document Receipt Confirmation</h1>
          <p className="mt-2 text-sm text-gray-600">
            {entity.entityName} • Tax Year {entity.taxYear}
          </p>
        </div>

        <div className="card">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Optional:</strong> This confirmation is optional and does not affect your tax return preparation or filing.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Acknowledgment</h2>
            <p className="text-gray-700 mb-4">
              By typing your name below, you acknowledge that you have reviewed the documents you have uploaded
              for tax year {entity.taxYear} and believe you have submitted all the tax documents you have available
              for this tax year.
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Items marked "Not Applicable" are considered resolved but are NOT documents.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type your full name to confirm *
              </label>
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-lg"
              />
              <p className="text-xs text-gray-500 mt-2">
                This is a typed acknowledgment, not a drawn signature.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">What this confirmation means:</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>You acknowledge the documents you have uploaded</li>
                <li>This confirmation is optional and does not block any actions</li>
                <li>You can still upload additional documents after confirmation</li>
                <li>This confirmation is recorded immutably with timestamp</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <Link to={`/clients/${id}`} className="btn-secondary flex-1">
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={!typedName.trim()}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Confirmation
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

