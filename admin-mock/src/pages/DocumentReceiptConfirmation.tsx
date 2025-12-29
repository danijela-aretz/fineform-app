import { useState } from 'react';
import { mockEntities } from '../data/mockData';
import HelpIcon from '../components/HelpIcon';

interface Confirmation {
  id: string;
  entityId: string;
  entityName: string;
  taxYear: number;
  signedAt: string | null;
  signedByName: string | null;
  signedByRole: 'client' | 'staff';
  recordedByStaff: string | null;
  documentGenerated: boolean;
  createdAt: string;
}

const mockConfirmations: Confirmation[] = [
  {
    id: '1',
    entityId: '1',
    entityName: 'John & Jane Smith - 1040',
    taxYear: 2023,
    signedAt: '2024-01-16T14:30:00Z',
    signedByName: 'John Smith',
    signedByRole: 'client',
    recordedByStaff: null,
    documentGenerated: true,
    createdAt: '2024-01-16T14:30:00Z',
  },
  {
    id: '2',
    entityId: '3',
    entityName: 'Johnson Corp',
    taxYear: 2023,
    signedAt: '2024-01-15T10:00:00Z',
    signedByName: 'Jane Johnson',
    signedByRole: 'client',
    recordedByStaff: null,
    documentGenerated: true,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '3',
    entityId: '2',
    entityName: 'Smith Business LLC',
    taxYear: 2023,
    signedAt: null,
    signedByName: null,
    signedByRole: 'client',
    recordedByStaff: null,
    documentGenerated: false,
    createdAt: '',
  },
];

export default function DocumentReceiptConfirmation() {
  const [confirmations, setConfirmations] = useState(mockConfirmations);
  const [selectedConfirmation, setSelectedConfirmation] = useState<Confirmation | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [signatureName, setSignatureName] = useState('');

  const handleRecordOnBehalf = () => {
    if (!selectedEntity || !signatureName.trim()) return;
    const entity = mockEntities.find(e => e.id === selectedEntity);
    if (!entity) return;
    
    const newConfirmation: Confirmation = {
      id: String(confirmations.length + 1),
      entityId: entity.id,
      entityName: entity.entityName,
      taxYear: 2023,
      signedAt: new Date().toISOString(),
      signedByName: signatureName,
      signedByRole: 'client',
      recordedByStaff: 'Current User',
      documentGenerated: true,
      createdAt: new Date().toISOString(),
    };
    setConfirmations([...confirmations, newConfirmation]);
    setShowRecordModal(false);
    setSelectedEntity('');
    setSignatureName('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Receipt Confirmation</h1>
          <p className="mt-2 text-sm text-gray-600">
            View and manage document receipt confirmations (staff can record on behalf of clients)
          </p>
        </div>
        <button
          onClick={() => setShowRecordModal(true)}
          className="btn-primary"
        >
          Record on Behalf of Client
        </button>
      </div>

      <div className="mb-4 p-4 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Document Receipt Confirmation is OPTIONAL and NON-BLOCKING. 
          It does NOT affect readiness, uploads, messaging, preparation, review, or filing.
          Staff may record confirmations on behalf of clients when necessary. Records are immutable once created.
        </p>
      </div>

      {/* Confirmations List */}
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
                  Signed By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Recorded By Staff
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Signed Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {confirmations.map((confirmation) => (
                <tr key={confirmation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {confirmation.entityName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {confirmation.taxYear}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {confirmation.signedAt ? (
                      <span className="badge badge-success">Confirmed</span>
                    ) : (
                      <span className="badge badge-warning">Not Confirmed</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {confirmation.signedByName || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {confirmation.recordedByStaff ? (
                      <span className="text-blue-600">{confirmation.recordedByStaff}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {confirmation.signedAt ? new Date(confirmation.signedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {confirmation.signedAt && (
                      <button
                        onClick={() => setSelectedConfirmation(confirmation)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Details Modal */}
      {selectedConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Confirmation Details</h2>
              <button
                onClick={() => setSelectedConfirmation(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedConfirmation.entityName}</h3>
                <p className="text-sm text-gray-600">Tax Year {selectedConfirmation.taxYear}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Status: </span>
                <span className="badge badge-success">Confirmed</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Signed By: </span>
                <span className="text-sm text-gray-600">{selectedConfirmation.signedByName}</span>
              </div>
              {selectedConfirmation.recordedByStaff && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Recorded By Staff: </span>
                  <span className="text-sm text-blue-600">{selectedConfirmation.recordedByStaff}</span>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-700">Signed Date: </span>
                <span className="text-sm text-gray-600">
                  {selectedConfirmation.signedAt ? new Date(selectedConfirmation.signedAt).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Document Generated: </span>
                <span className="text-sm text-gray-600">
                  {selectedConfirmation.documentGenerated ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> This confirmation is immutable (append-only). The document list at the time of acknowledgment,
                  signer identity, and timestamp are stored permanently for audit purposes.
                </p>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button
                  onClick={() => setSelectedConfirmation(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
                <button className="btn-primary">
                  View Confirmation Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record on Behalf Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Record Confirmation on Behalf of Client</h2>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name (as they would sign) *
                </label>
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="Enter client's full name"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div className="p-3 bg-yellow-50 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> This will create an immutable confirmation record. 
                  The confirmation document will be generated with the document list at the time of acknowledgment.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowRecordModal(false);
                  setSelectedEntity('');
                  setSignatureName('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordOnBehalf}
                disabled={!selectedEntity || !signatureName.trim()}
                className={`btn-primary ${!selectedEntity || !signatureName.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Record Confirmation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

