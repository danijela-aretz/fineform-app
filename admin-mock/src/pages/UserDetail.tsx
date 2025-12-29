import { useParams, Link } from 'react-router-dom';
import HelpIcon from '../components/HelpIcon';

interface User {
  id: string;
  fullName: string;
  email: string;
  userType: 'staff' | 'client';
  staffRole?: 'super_admin' | 'admin' | 'staff';
  staffTeamReporting?: 'fine_form' | 'fin_group';
  jobTitle?: string;
  active: boolean;
}

const mockUsers: User[] = [
  {
    id: '1',
    fullName: 'Admin User',
    email: 'admin@fineform.com',
    userType: 'staff',
    staffRole: 'admin',
    staffTeamReporting: 'fine_form',
    jobTitle: 'Tax Administrator',
    active: true,
  },
  {
    id: '2',
    fullName: 'John Smith',
    email: 'john@example.com',
    userType: 'client',
    active: true,
  },
  {
    id: '3',
    fullName: 'Jane Assistant',
    email: 'jane@fineform.com',
    userType: 'staff',
    staffRole: 'staff',
    staffTeamReporting: 'fine_form',
    jobTitle: 'Tax Assistant',
    active: true,
  },
];

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const user = mockUsers.find(u => u.id === id);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <HelpIcon />
        <div className="card">
          <p className="text-gray-500">User not found</p>
          <Link to="/users" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            ← Back to Users
          </Link>
        </div>
      </div>
    );
  }

  // Mock account memberships
  const accountMemberships = user.userType === 'client' 
    ? [
        { accountId: '1', accountName: 'Smith Family', role: 'primary_taxpayer' },
      ]
    : [];

  // Mock permissions/assignments (for staff)
  const staffAssignments = user.userType === 'staff'
    ? [
        { entityId: '1', entityName: 'John & Jane Smith - 1040', type: 'assignment' },
        { entityId: '2', entityName: 'Smith Business LLC', type: 'tax_access' },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-6">
        <Link to="/users" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
          ← Back to Users
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{user.fullName}</h1>
            <p className="mt-2 text-sm text-gray-600">
              {user.email} • {user.userType === 'staff' ? 'Staff' : 'Client'}
            </p>
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary">Edit User</button>
            <button className="btn-primary">Send Password Reset</button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* User Information */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">User Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase">Full Name</label>
                <p className="text-sm font-medium text-gray-900 mt-1">{user.fullName}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">Email</label>
                <p className="text-sm font-medium text-gray-900 mt-1">{user.email}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">User Type</label>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {user.userType === 'staff' ? 'Staff' : 'Client'}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">Status</label>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {user.active ? (
                    <span className="badge badge-success">Active</span>
                  ) : (
                    <span className="badge badge-warning">Inactive</span>
                  )}
                </p>
              </div>
              {user.userType === 'staff' && (
                <>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Staff Role</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {user.staffRole?.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Team</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {user.staffTeamReporting?.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                  {user.jobTitle && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Job Title</label>
                      <p className="text-sm font-medium text-gray-900 mt-1">{user.jobTitle}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Account Memberships (for clients) */}
          {user.userType === 'client' && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Account Memberships</h2>
                <button className="btn-primary text-sm">Add to Account</button>
              </div>
              {accountMemberships.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>This user is not associated with any accounts.</p>
                  <button className="btn-primary mt-4 text-sm">Add to Account</button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Account
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
                      {accountMemberships.map((membership) => (
                        <tr key={membership.accountId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              to={`/accounts/${membership.accountId}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                              {membership.accountName}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="badge badge-info">
                              {membership.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button className="text-red-600 hover:text-red-800">
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Staff Assignments (for staff) */}
          {user.userType === 'staff' && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Client Assignments</h2>
                <button className="btn-primary text-sm">Add Assignment</button>
              </div>
              {staffAssignments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>This staff member has no client assignments.</p>
                  <button className="btn-primary mt-4 text-sm">Add Assignment</button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Client Entity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {staffAssignments.map((assignment) => (
                        <tr key={assignment.entityId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              to={`/clients/${assignment.entityId}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                              {assignment.entityName}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="badge badge-info">
                              {assignment.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button className="text-red-600 hover:text-red-800">
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
            <div className="space-y-3">
              {user.userType === 'client' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Accounts</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {accountMemberships.length}
                    </span>
                  </div>
                </>
              )}
              {user.userType === 'staff' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Assignments</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {staffAssignments.length}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="btn-secondary w-full text-sm">Edit User</button>
              <button className="btn-secondary w-full text-sm">Send Password Reset</button>
              {user.userType === 'client' && (
                <button className="btn-secondary w-full text-sm">Add to Account</button>
              )}
              {user.userType === 'staff' && (
                <button className="btn-secondary w-full text-sm">Add Assignment</button>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card border-red-200">
            <h2 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h2>
            <p className="text-sm text-gray-600 mb-4">
              {user.userType === 'staff'
                ? 'Deleting this user will remove all staff assignments and permissions.'
                : 'Deleting this user will remove all account memberships.'}
            </p>
            <button className="btn-secondary w-full text-sm border-red-300 text-red-600 hover:bg-red-50">
              Delete User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

