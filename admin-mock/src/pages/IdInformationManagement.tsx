import { useState } from 'react';
import { mockEntities } from '../data/mockData';
import HelpIcon from '../components/HelpIcon';

interface IdInfo {
  id: string;
  entityId: string;
  entityName: string;
  taxpayerType: 'primary' | 'spouse';
  idType: 'drivers_license' | 'state_id';
  idNumber: string;
  issuingState: string;
  issueDate: string;
  expirationDate: string;
  frontImageUrl: string | null;
  backImageUrl: string | null;
  status: 'active' | 'expired' | 'missing';
  lastUpdated: string;
  lastUpdatedBy: string;
}

const mockIdInfo: IdInfo[] = [
  {
    id: '1',
    entityId: '1',
    entityName: 'John & Jane Smith - 1040',
    taxpayerType: 'primary',
    idType: 'drivers_license',
    idNumber: 'D123456789',
    issuingState: 'CA',
    issueDate: '2020-01-15',
    expirationDate: '2025-01-15',
    frontImageUrl: '/id-front.jpg',
    backImageUrl: '/id-back.jpg',
    status: 'active',
    lastUpdated: '2024-01-10T10:00:00Z',
    lastUpdatedBy: 'John Smith',
  },
  {
    id: '2',
    entityId: '1',
    entityName: 'John & Jane Smith - 1040',
    taxpayerType: 'spouse',
    idType: 'drivers_license',
    idNumber: 'D987654321',
    issuingState: 'CA',
    issueDate: '2019-06-20',
    expirationDate: '2024-06-20',
    frontImageUrl: '/id-front-2.jpg',
    backImageUrl: null,
    status: 'expired',
    lastUpdated: '2023-12-15T14:30:00Z',
    lastUpdatedBy: 'Jane Smith',
  },
  {
    id: '3',
    entityId: '2',
    entityName: 'Smith Business LLC',
    taxpayerType: 'primary',
    idType: 'state_id',
    idNumber: '',
    issuingState: '',
    issueDate: '',
    expirationDate: '',
    frontImageUrl: null,
    backImageUrl: null,
    status: 'missing',
    lastUpdated: '',
    lastUpdatedBy: '',
  },
];

export default function IdInformationManagement() {
  const [idInfo] = useState(mockIdInfo);
  const [selectedId, setSelectedId] = useState<IdInfo | null>(null);
  const [showRequestUpdateModal, setShowRequestUpdateModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState('');

  const handleRequestUpdate = () => {
    if (!selectedEntity) return;
    alert(`ID update request created for entity. This will create an Action Needed task for the client.`);
    setShowRequestUpdateModal(false);
    setSelectedEntity('');
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    expired: 'bg-red-100 text-red-800',
    missing: 'bg-yellow-100 text-yellow-800',
  };

  const statusLabels: Record<string, string> = {
    active: 'Active',
    expired: 'Expired',
    missing: 'Missing',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ID Information Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            View and manage client ID information, request updates
          </p>
        </div>
        <button
          onClick={() => setShowRequestUpdateModal(true)}
          className="btn-primary"
        >
          Request ID Update
        </button>
      </div>

      <div className="mb-4 p-4 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Requesting an ID update creates a manual Action Needed task for the client.
          ID information applies to primary taxpayer (and spouse if applicable). Dependents do NOT upload ID.
        </p>
      </div>

      {/* ID Information List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Taxpayer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Expiration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {idInfo.map((info) => (
                <tr key={info.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {info.entityName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {info.taxpayerType === 'primary' ? 'Primary Taxpayer' : 'Spouse'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {info.idType === 'drivers_license' ? "Driver's License" : 'State ID'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {info.idNumber || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {info.expirationDate ? new Date(info.expirationDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${statusColors[info.status]}`}>
                      {statusLabels[info.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {info.lastUpdated ? new Date(info.lastUpdated).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedId(info)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View/Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ID Details Modal */}
      {selectedId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">ID Information</h2>
              <button
                onClick={() => setSelectedId(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedId.entityName}</h3>
                <p className="text-sm text-gray-600">
                  {selectedId.taxpayerType === 'primary' ? 'Primary Taxpayer' : 'Spouse'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Type
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={selectedId.idType}
                  >
                    <option value="drivers_license">Driver's License</option>
                    <option value="state_id">State ID</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Number
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={selectedId.idNumber}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issuing State
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={selectedId.issuingState}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={selectedId.issueDate}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={selectedId.expirationDate}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <span className={`badge ${statusColors[selectedId.status]}`}>
                    {statusLabels[selectedId.status]}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Images
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Front</p>
                    {selectedId.frontImageUrl ? (
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-center">
                        <p className="text-sm text-gray-500">ID Front Image</p>
                        <button className="text-blue-600 hover:text-blue-800 text-sm mt-2">
                          View Image
                        </button>
                      </div>
                    ) : (
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-center text-sm text-gray-500">
                        No image uploaded
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Back (Optional)</p>
                    {selectedId.backImageUrl ? (
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-center">
                        <p className="text-sm text-gray-500">ID Back Image</p>
                        <button className="text-blue-600 hover:text-blue-800 text-sm mt-2">
                          View Image
                        </button>
                      </div>
                    ) : (
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-center text-sm text-gray-500">
                        No image uploaded
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  Last updated: {selectedId.lastUpdated ? new Date(selectedId.lastUpdated).toLocaleString() : 'Never'} by {selectedId.lastUpdatedBy || 'N/A'}
                </p>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button
                  onClick={() => setSelectedId(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
                <button className="btn-primary">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Update Modal */}
      {showRequestUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Request ID Update</h2>
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
              <div className="p-3 bg-yellow-50 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This will create a manual Action Needed task for the client.
                  The client will see this in their Action Needed tile and can update their ID information.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowRequestUpdateModal(false);
                  setSelectedEntity('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestUpdate}
                disabled={!selectedEntity}
                className={`btn-primary ${!selectedEntity ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Request ID Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

