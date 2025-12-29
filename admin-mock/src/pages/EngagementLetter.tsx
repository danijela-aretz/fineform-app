import { useState } from 'react';
import { mockEntities } from '../data/mockData';
import HelpIcon from '../components/HelpIcon';

interface Signer {
  id: string;
  name: string;
  role: 'primary_taxpayer' | 'spouse';
  signedAt: string | null;
  email: string;
}

interface EngagementLetter {
  id: string;
  entityId: string;
  entityName: string;
  taxYear: number;
  status: 'not_requested' | 'requested' | 'partially_signed' | 'fully_signed';
  requestedAt: string | null;
  signedAt: string | null;
  version: number;
  signers: Signer[];
  filingStatus: 'single' | 'mfj' | 'mfs' | 'hoh' | 'qss';
}

const mockEngagementLetters: EngagementLetter[] = [
  {
    id: '1',
    entityId: '1',
    entityName: 'John & Jane Smith - 1040',
    taxYear: 2023,
    status: 'partially_signed',
    requestedAt: '2024-01-10T09:00:00Z',
    signedAt: null,
    version: 1,
    filingStatus: 'mfj',
    signers: [
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
    ],
  },
  {
    id: '2',
    entityId: '2',
    entityName: 'Smith Business LLC',
    taxYear: 2023,
    status: 'requested',
    requestedAt: '2024-01-12T14:00:00Z',
    signedAt: null,
    version: 1,
    filingStatus: 'single',
    signers: [
      {
        id: '3',
        name: 'John Smith',
        role: 'primary_taxpayer',
        signedAt: null,
        email: 'john@example.com',
      },
    ],
  },
  {
    id: '3',
    entityId: '3',
    entityName: 'Johnson Corp',
    taxYear: 2023,
    status: 'fully_signed',
    requestedAt: '2024-01-08T10:00:00Z',
    signedAt: '2024-01-14T16:00:00Z',
    version: 1,
    filingStatus: 'single',
    signers: [
      {
        id: '4',
        name: 'Jane Johnson',
        role: 'primary_taxpayer',
        signedAt: '2024-01-14T16:00:00Z',
        email: 'jane.johnson@example.com',
      },
    ],
  },
];

export default function EngagementLetter() {
  const [letters, setLetters] = useState(mockEngagementLetters);
  const [selectedLetter, setSelectedLetter] = useState<EngagementLetter | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState('');

  const handleRequestEngagement = () => {
    if (!selectedEntity) return;
    const entity = mockEntities.find(e => e.id === selectedEntity);
    if (!entity) return;
    
    const newLetter: EngagementLetter = {
      id: String(letters.length + 1),
      entityId: entity.id,
      entityName: entity.entityName,
      taxYear: 2023,
      status: 'requested',
      requestedAt: new Date().toISOString(),
      signedAt: null,
      version: 1,
      filingStatus: 'single', // Would come from entity
      signers: [
        {
          id: '1',
          name: 'Primary Taxpayer',
          role: 'primary_taxpayer',
          signedAt: null,
          email: 'taxpayer@example.com',
        },
      ],
    };
    setLetters([...letters, newLetter]);
    setShowRequestModal(false);
    setSelectedEntity('');
  };

  const statusColors: Record<string, string> = {
    not_requested: 'bg-gray-100 text-gray-800',
    requested: 'bg-yellow-100 text-yellow-800',
    partially_signed: 'bg-blue-100 text-blue-800',
    fully_signed: 'bg-green-100 text-green-800',
  };

  const statusLabels: Record<string, string> = {
    not_requested: 'Not Requested',
    requested: 'Requested',
    partially_signed: 'Partially Signed',
    fully_signed: 'Fully Signed',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Engagement Letter Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage engagement letters and track signature status
          </p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="btn-primary"
        >
          Request Engagement Letter
        </button>
      </div>

      <div className="mb-4 p-4 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Engagement Letters are NON-BLOCKING. Clients can access all features (uploads, messaging, checklist) regardless of signature status.
          MFJ entities require two signers (primary_taxpayer + spouse). Single filers require one signer.
        </p>
      </div>

      {/* Engagement Letters List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tax Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Signers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Requested
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Signed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {letters.map((letter) => (
                <tr key={letter.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {letter.entityName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {letter.taxYear}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${statusColors[letter.status]}`}>
                      {statusLabels[letter.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {letter.signers.filter(s => s.signedAt).length} / {letter.signers.length} signed
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {letter.requestedAt ? new Date(letter.requestedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {letter.signedAt ? new Date(letter.signedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedLetter(letter)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Letter Details Modal */}
      {selectedLetter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Engagement Letter Details</h2>
              <button
                onClick={() => setSelectedLetter(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedLetter.entityName}</h3>
                <p className="text-sm text-gray-600">Tax Year {selectedLetter.taxYear}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Status: </span>
                <span className={`badge ${statusColors[selectedLetter.status]}`}>
                  {statusLabels[selectedLetter.status]}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Filing Status: </span>
                <span className="text-sm text-gray-600">{selectedLetter.filingStatus.toUpperCase()}</span>
                {selectedLetter.filingStatus === 'mfj' && (
                  <span className="ml-2 text-xs text-blue-600">(Requires 2 signers)</span>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Signers</h4>
                <div className="space-y-2">
                  {selectedLetter.signers.map((signer) => (
                    <div
                      key={signer.id}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{signer.name}</div>
                          <div className="text-xs text-gray-500">{signer.email}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Role: {signer.role === 'primary_taxpayer' ? 'Primary Taxpayer' : 'Spouse'}
                          </div>
                        </div>
                        <div>
                          {signer.signedAt ? (
                            <div>
                              <span className="badge badge-success text-xs">Signed</span>
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(signer.signedAt).toLocaleString()}
                              </div>
                            </div>
                          ) : (
                            <span className="badge badge-warning text-xs">Pending</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Version History</h4>
                <div className="text-sm text-gray-600">
                  Version {selectedLetter.version} - Created {selectedLetter.requestedAt ? new Date(selectedLetter.requestedAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button
                  onClick={() => setSelectedLetter(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
                <button className="btn-primary">
                  View Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Request Engagement Letter</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Entity *
                </label>
                <select
                  value={selectedEntity}
                  onChange={(e) => setSelectedEntity(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select entity...</option>
                  {mockEntities.map(entity => (
                    <option key={entity.id} value={entity.id}>
                      {entity.entityName} ({entity.taxYear})
                    </option>
                  ))}
                </select>
              </div>
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  This will make the Engagement Letter visible to the client immediately upon their next login.
                  The letter will be stored in the Tax Documents system folder.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setSelectedEntity('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleRequestEngagement} className="btn-primary">
                Request Engagement Letter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

