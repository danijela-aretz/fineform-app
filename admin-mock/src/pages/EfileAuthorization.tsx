import { useState } from 'react';
import { mockEntities } from '../data/mockData';
import HelpIcon from '../components/HelpIcon';

interface EfileAuthorization {
  id: string;
  entityId: string;
  entityName: string;
  taxYear: number;
  status: 'not_requested' | 'requested' | 'signed';
  requestedAt: string | null;
  signedAt: string | null;
  signedBy: string | null;
  signedByName: string | null;
}

const mockAuthorizations: EfileAuthorization[] = [
  {
    id: '1',
    entityId: '1',
    entityName: 'John & Jane Smith - 1040',
    taxYear: 2023,
    status: 'requested',
    requestedAt: '2024-01-20T10:00:00Z',
    signedAt: null,
    signedBy: null,
    signedByName: null,
  },
  {
    id: '2',
    entityId: '3',
    entityName: 'Johnson Corp',
    taxYear: 2023,
    status: 'signed',
    requestedAt: '2024-01-18T14:00:00Z',
    signedAt: '2024-01-19T09:30:00Z',
    signedBy: 'user-1',
    signedByName: 'Jane Johnson',
  },
  {
    id: '3',
    entityId: '2',
    entityName: 'Smith Business LLC',
    taxYear: 2023,
    status: 'not_requested',
    requestedAt: null,
    signedAt: null,
    signedBy: null,
    signedByName: null,
  },
];

export default function EfileAuthorization() {
  const [authorizations, setAuthorizations] = useState(mockAuthorizations);
  const [selectedAuth, setSelectedAuth] = useState<EfileAuthorization | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState('');

  const handleRequestAuthorization = () => {
    if (!selectedEntity) return;
    const entity = mockEntities.find(e => e.id === selectedEntity);
    if (!entity) return;
    
    const newAuth: EfileAuthorization = {
      id: String(authorizations.length + 1),
      entityId: entity.id,
      entityName: entity.entityName,
      taxYear: 2023,
      status: 'requested',
      requestedAt: new Date().toISOString(),
      signedAt: null,
      signedBy: null,
      signedByName: null,
    };
    setAuthorizations([...authorizations, newAuth]);
    setShowRequestModal(false);
    setSelectedEntity('');
  };

  const statusColors: Record<string, string> = {
    not_requested: 'bg-gray-100 text-gray-800',
    requested: 'bg-yellow-100 text-yellow-800',
    signed: 'bg-green-100 text-green-800',
  };

  const statusLabels: Record<string, string> = {
    not_requested: 'Not Requested',
    requested: 'Awaiting Signature',
    signed: 'Signed',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">E-File Authorization</h1>
          <p className="mt-2 text-sm text-gray-600">
            Request and track e-file authorization signatures
          </p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="btn-primary"
        >
          Request E-File Authorization
        </button>
      </div>

      <div className="mb-4 p-4 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> E-File Authorization is requested when the return is ready for filing.
          This is NON-BLOCKING - clients can still access all features regardless of signature status.
        </p>
      </div>

      {/* Authorizations List */}
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
                  Requested
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Signed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Signed By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {authorizations.map((auth) => (
                <tr key={auth.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {auth.entityName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {auth.taxYear}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${statusColors[auth.status]}`}>
                      {statusLabels[auth.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {auth.requestedAt ? new Date(auth.requestedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {auth.signedAt ? new Date(auth.signedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {auth.signedByName || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedAuth(auth)}
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

      {/* Authorization Details Modal */}
      {selectedAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">E-File Authorization Details</h2>
              <button
                onClick={() => setSelectedAuth(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedAuth.entityName}</h3>
                <p className="text-sm text-gray-600">Tax Year {selectedAuth.taxYear}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Status: </span>
                <span className={`badge ${statusColors[selectedAuth.status]}`}>
                  {statusLabels[selectedAuth.status]}
                </span>
              </div>
              {selectedAuth.requestedAt && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Requested: </span>
                  <span className="text-sm text-gray-600">
                    {new Date(selectedAuth.requestedAt).toLocaleString()}
                  </span>
                </div>
              )}
              {selectedAuth.signedAt && (
                <>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Signed: </span>
                    <span className="text-sm text-gray-600">
                      {new Date(selectedAuth.signedAt).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Signed By: </span>
                    <span className="text-sm text-gray-600">{selectedAuth.signedByName}</span>
                  </div>
                </>
              )}
              <div className="flex gap-2 justify-end pt-4">
                <button
                  onClick={() => setSelectedAuth(null)}
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
            <h2 className="text-xl font-bold mb-4">Request E-File Authorization</h2>
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
                  This will request e-file authorization from the client. The authorization will be visible in their Action Needed tile.
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
              <button onClick={handleRequestAuthorization} className="btn-primary">
                Request Authorization
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

