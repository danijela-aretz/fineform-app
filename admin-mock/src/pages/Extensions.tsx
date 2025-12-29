import { useState } from 'react';
import { mockEntities } from '../data/mockData';
import HelpIcon from '../components/HelpIcon';

interface Extension {
  entityId: string;
  entityName: string;
  taxYear: number;
  extensionRequested: boolean;
  extensionRequestedAt?: string;
  extensionFiled: boolean;
  extensionFiledAt?: string;
  extendedDueDate?: string;
  documentPath?: string;
}

const mockExtensions: Extension[] = [
  {
    entityId: '2',
    entityName: 'Smith Business LLC',
    taxYear: 2023,
    extensionRequested: true,
    extensionRequestedAt: '2024-03-15T10:00:00Z',
    extensionFiled: false,
  },
  {
    entityId: '4',
    entityName: 'Williams Partnership',
    taxYear: 2023,
    extensionRequested: true,
    extensionRequestedAt: '2024-03-20T14:00:00Z',
    extensionFiled: true,
    extensionFiledAt: '2024-04-01T09:00:00Z',
    extendedDueDate: '2024-09-15',
    documentPath: '/documents/extension-2023.pdf',
  },
];

// Unused interface - kept for future implementation
// interface ExtensionHistory {
//   id: string;
//   entityId: string;
//   extensionType: 'federal' | 'state';
//   originalDueDate: string;
//   extendedDueDate: string;
//   filedAt: string | null;
//   acceptancePdfUrl: string | null;
//   recalculatedDueDate: string | null;
// }

export default function Extensions() {
  const [extensions, setExtensions] = useState(mockExtensions);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [showFileModal, setShowFileModal] = useState(false);
  const [fileData, setFileData] = useState({ document: null as File | null });

  const handleFileExtension = () => {
    if (!selectedEntity || !fileData.document) return;
    const entity = mockEntities.find(e => e.id === selectedEntity);
    if (!entity) return;

    const entityType = entity.entityType;
    let extendedDueDate = '';
    
    // Calculate extended due date based on entity type
    if (entityType === 'HOUSEHOLD_1040' || entityType === 'C_CORP') {
      extendedDueDate = '2024-10-15'; // October 15
    } else if (entityType === 'PARTNERSHIP' || entityType === 'S_CORP') {
      extendedDueDate = '2024-09-15'; // September 15
    }

    const newExtension: Extension = {
      entityId: selectedEntity,
      entityName: entity.entityName,
      taxYear: 2023,
      extensionRequested: true,
      extensionRequestedAt: new Date().toISOString(),
      extensionFiled: true,
      extensionFiledAt: new Date().toISOString(),
      extendedDueDate,
      documentPath: fileData.document.name,
    };

    setExtensions([...extensions, newExtension]);
    setShowFileModal(false);
    setSelectedEntity('');
    setFileData({ document: null });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Extensions & Filing Operations</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage extension requests and filing operations
        </p>
      </div>

      {/* File Extension Section */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">File Extension</h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Entity
            </label>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Select entity with extension request</option>
              {mockEntities
                .filter(e => e.extensionRequested && !e.extensionFiled)
                .map(entity => (
                  <option key={entity.id} value={entity.id}>
                    {entity.entityName} ({entity.taxYear})
                  </option>
                ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setShowFileModal(true)}
              disabled={!selectedEntity}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              File Extension
            </button>
          </div>
        </div>
      </div>

      {/* Extensions List */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Extension Status</h2>
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
                  Requested
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Filed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Extended Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {extensions.map((extension) => (
                <tr key={extension.entityId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {extension.entityName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {extension.taxYear}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {extension.extensionRequested ? (
                      <div>
                        <span className="badge badge-warning">Requested</span>
                        {extension.extensionRequestedAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(extension.extensionRequestedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {extension.extensionFiled ? (
                      <div>
                        <span className="badge badge-success">Filed</span>
                        {extension.extensionFiledAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(extension.extensionFiledAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {extension.extendedDueDate ? (
                      <div>
                        <div className="font-medium text-green-600">
                          {new Date(extension.extendedDueDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Original: {extension.taxYear === 2023 ? 'Apr 15, 2024' : 'Apr 15, 2023'}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-gray-500">
                          {extension.taxYear === 2023 ? 'Apr 15, 2024' : 'Apr 15, 2023'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Original due date</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {extension.documentPath && (
                      <button className="text-blue-600 hover:text-blue-800">
                        View Document
                      </button>
                    )}
                    {extension.extensionFiled && (
                      <button className="text-gray-600 hover:text-gray-800 ml-2">
                        View History
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* File Extension Modal */}
      {showFileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">File Extension</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Extension Acceptance PDF *
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFileData({ document: e.target.files?.[0] || null })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The extended due date will be calculated automatically based on the entity type:
              </p>
              <ul className="text-sm text-blue-700 mt-2 list-disc list-inside">
                <li>1040 / 1120 → October 15</li>
                <li>1065 / 1120S → September 15</li>
              </ul>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowFileModal(false);
                  setFileData({ document: null });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleFileExtension}
                disabled={!fileData.document}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                File Extension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

