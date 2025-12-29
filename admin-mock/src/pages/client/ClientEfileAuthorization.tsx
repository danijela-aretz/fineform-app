import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockEntities } from '../../data/mockData';
import HelpIcon from '../../components/HelpIcon';
import ClientViewBanner from '../../components/ClientViewBanner';

export default function ClientEfileAuthorization() {
  const { id } = useParams<{ id: string }>();
  const entity = mockEntities.find(e => e.id === id);
  const [signature, setSignature] = useState('');
  const [isSigned, setIsSigned] = useState(false);
  // const [showSignaturePad, setShowSignaturePad] = useState(false);

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

  const handleSign = () => {
    if (!signature.trim()) {
      alert('Please provide your signature.');
      return;
    }
    if (!confirm('Are you sure you want to authorize e-filing for this tax return? This action cannot be undone.')) {
      return;
    }
    setIsSigned(true);
    alert('E-File Authorization submitted successfully!');
  };

  if (isSigned) {
    return (
      <>
        <ClientViewBanner />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <div className="card text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h1 className="text-2xl font-bold text-gray-900">E-File Authorization Signed</h1>
            </div>
            <p className="text-gray-600 mb-4">
              Your e-file authorization has been submitted successfully.
            </p>
            <div className="bg-gray-50 p-4 rounded-md mb-6 text-left">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Tax Return:</strong> {entity.entityName} - {entity.taxYear}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Signed by:</strong> {signature}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Date:</strong> {new Date().toLocaleString()}
              </p>
            </div>
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
          <h1 className="text-3xl font-bold text-gray-900">E-File Authorization</h1>
          <p className="mt-2 text-sm text-gray-600">
            {entity.entityName} • Tax Year {entity.taxYear}
          </p>
        </div>

        <div className="card">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Authorization to E-File</h2>
            <p className="text-gray-700 mb-4">
              By signing below, you authorize FineForm to electronically file your {entity.taxYear} tax return
              with the IRS and applicable state tax agencies.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <p className="text-sm text-blue-700">
                <strong>Important:</strong> This authorization is required for electronic filing. Once signed,
                your tax return will be filed electronically after it has been prepared and reviewed.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taxpayer Name *
              </label>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Enter your full name as it appears on your tax return"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">What you're authorizing:</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Electronic filing of your {entity.taxYear} tax return</li>
                <li>Transmission to IRS and applicable state agencies</li>
                <li>Use of your electronic signature (PIN) for filing</li>
                <li>Receipt of electronic filing confirmation</li>
              </ul>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-md p-8 mb-6 text-center">
              <p className="text-sm text-gray-500 mb-4">Signature Required</p>
              {signature ? (
                <div className="bg-white border border-gray-300 rounded-md p-4">
                  <p className="text-lg font-semibold text-gray-900">{signature}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Typed signature • {new Date().toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <p className="text-gray-400">Enter your name above to sign</p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Link to={`/clients/${id}`} className="btn-secondary flex-1">
              Cancel
            </Link>
            <button
              onClick={handleSign}
              disabled={!signature.trim()}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign and Authorize
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

