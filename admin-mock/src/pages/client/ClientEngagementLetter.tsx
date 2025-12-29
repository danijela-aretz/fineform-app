import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import HelpIcon from '../../components/HelpIcon';
import ClientViewBanner from '../../components/ClientViewBanner';

interface Signer {
  id: string;
  name: string;
  role: 'primary_taxpayer' | 'spouse';
  signedAt: string | null;
  email: string;
}

export default function ClientEngagementLetter() {
  const { id } = useParams<{ id: string }>();
  const [filingStatus] = useState<'mfj' | 'single'>('mfj'); // Would come from entity
  const [signers, setSigners] = useState<Signer[]>([
    {
      id: '1',
      name: 'John Smith',
      role: 'primary_taxpayer',
      signedAt: '2024-01-15T10:30:00Z',
      email: 'john@example.com',
    },
    {
      id: '2',
      name: 'Jane Smith',
      role: 'spouse',
      signedAt: null,
      email: 'jane@example.com',
    },
  ]);
  const [signature, setSignature] = useState('');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [currentSigner, setCurrentSigner] = useState<Signer | null>(null);

  const requiredSigners = filingStatus === 'mfj' ? 2 : 1;
  const signedCount = signers.filter(s => s.signedAt).length;
  const isFullySigned = signedCount === requiredSigners;
  const currentUserSigner = signers.find(s => s.email === 'john@example.com'); // Would be current user
  // const canSign = currentUserSigner && !currentUserSigner.signedAt;

  const handleSign = () => {
    if (!currentUserSigner || !signature.trim()) return;
    setSigners(signers.map(s =>
      s.id === currentUserSigner.id
        ? { ...s, signedAt: new Date().toISOString() }
        : s
    ));
    setSignature('');
    setShowSignatureModal(false);
    setCurrentSigner(null);
  };

  const handleOpenSignature = (signer: Signer) => {
    if (signer.email === 'john@example.com' && !signer.signedAt) {
      setCurrentSigner(signer);
      setShowSignatureModal(true);
    }
  };

  return (
    <>
      <ClientViewBanner />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <HelpIcon />
      <div className="mb-6">
        <Link to={`/clients/${id}`} className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
          ← Back to Client Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Engagement Letter</h1>
        <p className="mt-2 text-sm text-gray-600">
          Tax Year 2023
        </p>
      </div>

      {/* Status Banner */}
      <div className={`card mb-6 ${isFullySigned ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-2">
              {isFullySigned ? 'Engagement Letter Fully Signed' : 'Signature Required'}
            </h2>
            <p className="text-sm text-gray-600">
              {signedCount} of {requiredSigners} required signer{requiredSigners > 1 ? 's' : ''} signed
              {filingStatus === 'mfj' && ' (MFJ requires both spouses to sign)'}
            </p>
          </div>
          {isFullySigned && (
            <span className="badge badge-success">Fully Signed</span>
          )}
        </div>
      </div>

      {/* Document Viewer */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Engagement Letter Document</h2>
        <div className="border border-gray-200 rounded-lg p-8 bg-gray-50 min-h-[400px] flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">Engagement Letter PDF Preview</p>
            <p className="text-xs text-gray-400 mt-2">Click to view full document</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="btn-secondary">Download PDF</button>
          <button className="btn-secondary">View Full Document</button>
        </div>
      </div>

      {/* Signers Section */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Signatures</h2>
        <div className="space-y-4">
          {signers.map((signer) => (
            <div
              key={signer.id}
              className={`p-4 border rounded-lg ${
                signer.signedAt
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{signer.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {signer.role === 'primary_taxpayer' ? 'Primary Taxpayer' : 'Spouse'}
                  </div>
                  {signer.signedAt && (
                    <div className="text-xs text-gray-500 mt-1">
                      Signed: {new Date(signer.signedAt).toLocaleString()}
                    </div>
                  )}
                </div>
                <div>
                  {signer.signedAt ? (
                    <span className="badge badge-success">Signed</span>
                  ) : (
                    <div>
                      {signer.email === 'john@example.com' ? (
                        <button
                          onClick={() => handleOpenSignature(signer)}
                          className="btn-primary text-sm"
                        >
                          Sign Now
                        </button>
                      ) : (
                        <span className="badge badge-warning">Pending</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="card mt-6 bg-blue-50">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This Engagement Letter is NON-BLOCKING. You can access all features
          (uploads, messaging, checklist) regardless of signature status. However, we encourage you
          to sign the engagement letter to proceed with your tax preparation.
        </p>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && currentSigner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Sign Engagement Letter</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Signing as: <strong>{currentSigner.name}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  By typing your name below, you agree to the terms of the Engagement Letter.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type your full name to sign *
                </label>
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder={currentSigner.name}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div className="p-3 bg-yellow-50 rounded-md">
                <p className="text-sm text-yellow-800">
                  This signature will be recorded with a timestamp and stored immutably for audit purposes.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowSignatureModal(false);
                  setCurrentSigner(null);
                  setSignature('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSign}
                disabled={!signature.trim()}
                className={`btn-primary ${!signature.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Sign Engagement Letter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

