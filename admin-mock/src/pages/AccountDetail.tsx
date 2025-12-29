import { useParams, Link } from 'react-router-dom';
import { mockAccounts, mockEntities } from '../data/mockData';
import HelpIcon from '../components/HelpIcon';

export default function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const account = mockAccounts.find(a => a.id === id);
  const accountEntities = mockEntities.filter(e => e.accountId === id);

  if (!account) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <HelpIcon />
        <div className="card">
          <p className="text-gray-500">Account not found</p>
          <Link to="/accounts" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            ← Back to Accounts
          </Link>
        </div>
      </div>
    );
  }

  // Mock account users
  const accountUsers = [
    { id: '1', name: 'John Smith', email: 'john@example.com', role: 'primary_taxpayer' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'spouse' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-6">
        <Link to="/accounts" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
          ← Back to Accounts
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{account.displayName}</h1>
            <p className="mt-2 text-sm text-gray-600">
              Created: {new Date(account.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to={`/accounts/${id}/edit`} className="btn-secondary">
              Edit Account
            </Link>
            <button className="btn-primary">Add Entity</button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Account Information */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Account Information</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">Display Name</span>
                <span className="text-sm font-medium text-gray-900">{account.displayName}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">Account ID</span>
                <span className="text-sm font-mono text-gray-500">{account.id}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">Created At</span>
                <span className="text-sm text-gray-900">
                  {new Date(account.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Total Entities</span>
                <span className="text-sm font-medium text-gray-900">{account.entityCount}</span>
              </div>
            </div>
          </div>

          {/* Associated Entities */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Associated Entities</h2>
              <button className="btn-primary text-sm">Add Entity</button>
            </div>
            {accountEntities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No entities associated with this account.</p>
                <button className="btn-primary mt-4 text-sm">Add First Entity</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Entity Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tax Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {accountEntities.map((entity) => (
                      <tr key={entity.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            to={`/clients/${entity.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            {entity.entityName}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entity.entityType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entity.taxYear}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="badge badge-info">{entity.status}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            to={`/clients/${entity.id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Account Users */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Account Users</h2>
              <button className="btn-primary text-sm">Add User</button>
            </div>
            {accountUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No users associated with this account.</p>
                <button className="btn-primary mt-4 text-sm">Add First User</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {accountUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="badge badge-info">
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            to={`/users/${user.id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Entities</span>
                <span className="text-lg font-semibold text-gray-900">{account.entityCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Entities</span>
                <span className="text-lg font-semibold text-green-600">
                  {accountEntities.filter(e => e.status !== 'filed').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Users</span>
                <span className="text-lg font-semibold text-gray-900">{accountUsers.length}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="btn-secondary w-full text-sm">Add Entity</button>
              <button className="btn-secondary w-full text-sm">Add User</button>
              <button className="btn-secondary w-full text-sm">View Permissions</button>
              <button className="btn-secondary w-full text-sm">Export Data</button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card border-red-200">
            <h2 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h2>
            <p className="text-sm text-gray-600 mb-4">
              Deleting this account will also delete all associated entities and relationships.
            </p>
            <button className="btn-secondary w-full text-sm border-red-300 text-red-600 hover:bg-red-50">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

