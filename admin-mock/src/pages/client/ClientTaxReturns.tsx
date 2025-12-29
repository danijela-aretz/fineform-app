import { useParams, Link } from 'react-router-dom';
import { mockEntities } from '../../data/mockData';
import HelpIcon from '../../components/HelpIcon';
import ClientViewBanner from '../../components/ClientViewBanner';

interface TaxReturn {
  id: string;
  returnType: 'internal_preparer' | 'client_copy';
  displayName: string;
  taxYear: number;
  publishedAt?: string;
  publishedBy?: string;
  downloadCount: number;
}

const mockClientReturns: TaxReturn[] = [
  {
    id: '1',
    returnType: 'internal_preparer',
    displayName: '2023 1040 - Internal Draft',
    taxYear: 2023,
    downloadCount: 0,
  },
  {
    id: '2',
    returnType: 'client_copy',
    displayName: '2023 1040 - Client Copy',
    taxYear: 2023,
    publishedAt: '2024-02-15T10:00:00Z',
    publishedBy: 'Admin User',
    downloadCount: 2,
  },
];

export default function ClientTaxReturns() {
  const { id } = useParams<{ id: string }>();
  const entity = mockEntities.find(e => e.id === id);

  if (!entity) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
        <div className="card">
          <p className="text-gray-500">Client not found</p>
          <Link to="/clients" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            ← Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <ClientViewBanner />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <HelpIcon />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link to={`/clients/${id}`} className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
            ← Back to Client
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Tax Returns</h1>
          <p className="mt-2 text-sm text-gray-600">
            {entity.entityName} • {entity.taxYear}
          </p>
        </div>
        <button className="btn-primary">Upload Return</button>
      </div>

      {/* Internal/Preparer Returns */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Internal/Preparer Returns</h2>
        <p className="text-sm text-gray-600 mb-4">
          These returns are staff-only and never visible to clients.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Return Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tax Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockClientReturns
                .filter(r => r.returnType === 'internal_preparer')
                .map((returnItem) => (
                  <tr key={returnItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {returnItem.displayName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {returnItem.taxYear}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">Download</button>
                      <button className="text-green-600 hover:text-green-800">
                        Publish to Client Copy
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Copy Returns */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Client Copy Returns</h2>
        <p className="text-sm text-gray-600 mb-4">
          Returns published to clients. Download events are logged.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Return Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tax Year
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
              {mockClientReturns
                .filter(r => r.returnType === 'client_copy')
                .map((returnItem) => (
                  <tr key={returnItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {returnItem.displayName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {returnItem.taxYear}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-800">View Logs</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
}

