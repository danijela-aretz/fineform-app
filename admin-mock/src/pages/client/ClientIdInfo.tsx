import { useParams, Link } from 'react-router-dom';
import { mockEntities } from '../../data/mockData';
import HelpIcon from '../../components/HelpIcon';
import ClientViewBanner from '../../components/ClientViewBanner';

export default function ClientIdInfo() {
  const { id } = useParams<{ id: string }>();
  const entity = mockEntities.find(e => e.id === id);

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

  return (
    <>
      <ClientViewBanner />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="mb-6">
        <Link to={`/clients/${id}`} className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
          ← Back to Client
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">ID Information</h1>
        <p className="mt-2 text-sm text-gray-600">
          {entity.entityName} • {entity.taxYear}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Primary Taxpayer ID */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Primary Taxpayer</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Status
              </label>
              <span className="badge badge-success">Valid</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Type *
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option>Driver's License</option>
                <option>State ID</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Number *
              </label>
              <input
                type="text"
                defaultValue="D1234567"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issuing State *
              </label>
              <input
                type="text"
                defaultValue="NY"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  defaultValue="2020-01-15"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiration Date *
                </label>
                <input
                  type="date"
                  defaultValue="2025-12-31"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Images
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-gray-300 rounded-md p-4 text-center">
                  <p className="text-sm text-gray-500 mb-2">Front</p>
                  <div className="bg-gray-100 rounded h-32 flex items-center justify-center">
                    <span className="text-xs text-gray-400">ID Front Image</span>
                  </div>
                  <button className="text-xs text-blue-600 mt-2">View</button>
                </div>
                <div className="border border-gray-300 rounded-md p-4 text-center">
                  <p className="text-sm text-gray-500 mb-2">Back (Optional)</p>
                  <div className="bg-gray-100 rounded h-32 flex items-center justify-center">
                    <span className="text-xs text-gray-400">ID Back Image</span>
                  </div>
                  <button className="text-xs text-blue-600 mt-2">View</button>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <button className="btn-primary w-full">Request ID Update</button>
            </div>
          </div>
        </div>

        {/* Spouse ID (if applicable) */}
        {entity.entityType === 'HOUSEHOLD_1040' && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Spouse</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Status
                </label>
                <span className="badge badge-warning">Not Provided</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Type *
                </label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option>Driver's License</option>
                  <option>State ID</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Number *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issuing State *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiration Date *
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Images
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-gray-300 rounded-md p-4 text-center">
                    <p className="text-sm text-gray-500 mb-2">Front</p>
                    <div className="bg-gray-100 rounded h-32 flex items-center justify-center">
                      <span className="text-xs text-gray-400">No image</span>
                    </div>
                    <button className="text-xs text-blue-600 mt-2">Upload</button>
                  </div>
                  <div className="border border-gray-300 rounded-md p-4 text-center">
                    <p className="text-sm text-gray-500 mb-2">Back (Optional)</p>
                    <div className="bg-gray-100 rounded h-32 flex items-center justify-center">
                      <span className="text-xs text-gray-400">No image</span>
                    </div>
                    <button className="text-xs text-blue-600 mt-2">Upload</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audit Trail */}
        <div className="card md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Audit Trail</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Updated By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Changes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Jan 10, 2024 09:00 AM
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    John Smith (Client)
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Updated expiration date
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Dec 15, 2023 14:30 PM
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Admin User (Staff)
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Initial ID information entered
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

