import { useState } from 'react';
import HelpIcon from '../components/HelpIcon';

interface TaxReturn {
  id: string;
  entityId: string;
  entityName: string;
  taxYear: number;
  returnType: 'internal_preparer' | 'client_copy';
  displayName: string;
  publishedAt?: string;
  publishedBy?: string;
  downloadCount: number;
}

const mockTaxReturns: TaxReturn[] = [
  {
    id: '1',
    entityId: '1',
    entityName: 'John & Jane Smith - 1040',
    taxYear: 2023,
    returnType: 'internal_preparer',
    displayName: '2023 1040 - Internal Draft',
    downloadCount: 0,
  },
  {
    id: '2',
    entityId: '1',
    entityName: 'John & Jane Smith - 1040',
    taxYear: 2023,
    returnType: 'client_copy',
    displayName: '2023 1040 - Client Copy',
    publishedAt: '2024-02-15T10:00:00Z',
    publishedBy: 'Admin User',
    downloadCount: 2,
  },
  {
    id: '3',
    entityId: '3',
    entityName: 'Johnson Corp',
    taxYear: 2023,
    returnType: 'internal_preparer',
    displayName: '2023 1120 - Internal Draft',
    downloadCount: 0,
  },
];

export default function TaxReturns() {
  const [returns, setReturns] = useState(mockTaxReturns);
  const [filter, setFilter] = useState<'all' | 'internal_preparer' | 'client_copy'>('all');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<TaxReturn | null>(null);

  const filteredReturns = returns.filter(r => {
    if (filter === 'all') return true;
    return r.returnType === filter;
  });

  const handlePublish = () => {
    if (!selectedReturn) return;
    setReturns(returns.map(r =>
      r.id === selectedReturn.id
        ? {
            ...r,
            returnType: 'client_copy',
            publishedAt: new Date().toISOString(),
            publishedBy: 'Current User',
          }
        : r
    ));
    setShowPublishModal(false);
    setSelectedReturn(null);
    alert('Tax return published to Client Copy! Client will be notified.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tax Returns</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage Internal/Preparer returns and Client Copy tax returns
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded text-sm font-medium ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            All Returns
          </button>
          <button
            onClick={() => setFilter('internal_preparer')}
            className={`px-4 py-2 rounded text-sm font-medium ${
              filter === 'internal_preparer' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Internal/Preparer
          </button>
          <button
            onClick={() => setFilter('client_copy')}
            className={`px-4 py-2 rounded text-sm font-medium ${
              filter === 'client_copy' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Client Copy
          </button>
        </div>
      </div>

      {/* Returns List */}
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
                  Return Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Published
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Downloads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReturns.map((returnItem) => (
                <tr key={returnItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {returnItem.entityName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {returnItem.taxYear}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {returnItem.displayName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {returnItem.returnType === 'internal_preparer' ? (
                      <span className="badge badge-warning">Internal/Preparer</span>
                    ) : (
                      <span className="badge badge-success">Client Copy</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {returnItem.publishedAt ? (
                      <div>
                        <div>{new Date(returnItem.publishedAt).toLocaleDateString()}</div>
                        {returnItem.publishedBy && (
                          <div className="text-xs text-gray-400">{returnItem.publishedBy}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">Not published</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {returnItem.downloadCount} download{returnItem.downloadCount !== 1 ? 's' : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      Download
                    </button>
                    {returnItem.returnType === 'internal_preparer' && (
                      <button
                        onClick={() => {
                          setSelectedReturn(returnItem);
                          setShowPublishModal(true);
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        Publish to Client Copy
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Publish Modal */}
      {showPublishModal && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Publish to Client Copy</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Are you sure you want to publish this return to Client Copy?
              </p>
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-sm font-medium text-blue-900">{selectedReturn.displayName}</p>
                <p className="text-xs text-blue-700 mt-1">
                  {selectedReturn.entityName} • {selectedReturn.taxYear}
                </p>
              </div>
            </div>
            <div className="mb-4 p-3 bg-yellow-50 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Publishing to Client Copy will:
              </p>
              <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
                <li>Make the return visible to the client</li>
                <li>Send an in-app notification to the client</li>
                <li>Send an email notification (no PDF attachment)</li>
                <li>Log download events when the client accesses it</li>
              </ul>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowPublishModal(false);
                  setSelectedReturn(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handlePublish} className="btn-primary">
                Publish to Client Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

