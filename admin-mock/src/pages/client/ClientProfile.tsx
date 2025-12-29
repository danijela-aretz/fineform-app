import { useParams, Link } from 'react-router-dom';
import { mockEntities } from '../../data/mockData';
import HelpIcon from '../../components/HelpIcon';
import ClientViewBanner from '../../components/ClientViewBanner';

export default function ClientProfile() {
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
      <div className="mb-6">
        <Link to={`/clients/${id}`} className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
          ← Back to Client
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Client Profile</h1>
        <p className="mt-2 text-sm text-gray-600">
          {entity.entityName} • {entity.taxYear}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Core Client Information */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Core Client Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Entity Name</label>
              <p className="text-sm text-gray-900 mt-1">{entity.entityName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Account</label>
              <p className="text-sm text-gray-900 mt-1">{entity.accountName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Entity Type</label>
              <p className="text-sm text-gray-900 mt-1">{entity.entityType}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Tax Year</label>
              <p className="text-sm text-gray-900 mt-1">{entity.taxYear}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <p className="text-sm text-gray-900 mt-1">{entity.status}</p>
            </div>
          </div>
        </div>

        {/* ID Information */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">ID Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">ID Status</label>
              <p className="text-sm text-gray-900 mt-1">
                <span className="badge badge-success">Valid</span>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">ID Type</label>
              <p className="text-sm text-gray-900 mt-1">Driver's License</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">ID Number</label>
              <p className="text-sm text-gray-900 mt-1">D1234567</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Issuing State</label>
              <p className="text-sm text-gray-900 mt-1">NY</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Expiration Date</label>
              <p className="text-sm text-gray-900 mt-1">2025-12-31</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <Link
              to={`/clients/${id}/id-info`}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View Full ID Information →
            </Link>
          </div>
        </div>

        {/* Audit History */}
        <div className="card md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Audit History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Changed By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Jan 15, 2024 10:00 AM
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    Status Changed
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Admin User
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    waiting_on_documents → in_preparation
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Jan 10, 2024 09:00 AM
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    Permission Granted
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Admin User
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Tax access granted to Jane Assistant
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

