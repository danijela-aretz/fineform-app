import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockAccounts } from '../data/mockData';
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

export default function Users() {
  const [users, setUsers] = useState(mockUsers);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filter, setFilter] = useState<'all' | 'staff' | 'client'>('all');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    userType: 'staff' as 'staff' | 'client',
    staffRole: 'staff' as 'super_admin' | 'admin' | 'staff',
    staffTeamReporting: 'fine_form' as 'fine_form' | 'fin_group',
    jobTitle: '',
    active: true,
  });

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    return user.userType === filter;
  });

  const handleCreate = () => {
    if (!formData.fullName.trim() || !formData.email.trim()) return;
    const newUser: User = {
      id: String(users.length + 1),
      fullName: formData.fullName,
      email: formData.email,
      userType: formData.userType,
      active: formData.active,
      ...(formData.userType === 'staff' && {
        staffRole: formData.staffRole,
        staffTeamReporting: formData.staffTeamReporting,
        jobTitle: formData.jobTitle,
      }),
    };
    setUsers([...users, newUser]);
    setFormData({
      fullName: '',
      email: '',
      userType: 'staff',
      staffRole: 'staff',
      staffTeamReporting: 'fine_form',
      jobTitle: '',
      active: true,
    });
    setShowCreateModal(false);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      userType: user.userType,
      staffRole: user.staffRole || 'staff',
      staffTeamReporting: user.staffTeamReporting || 'fine_form',
      jobTitle: user.jobTitle || '',
      active: user.active,
    });
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    if (!editingUser || !formData.fullName.trim() || !formData.email.trim()) return;
    setUsers(users.map(u =>
      u.id === editingUser.id
        ? {
            ...u,
            fullName: formData.fullName,
            email: formData.email,
            active: formData.active,
            ...(formData.userType === 'staff' && {
              staffRole: formData.staffRole,
              staffTeamReporting: formData.staffTeamReporting,
              jobTitle: formData.jobTitle,
            }),
          }
        : u
    ));
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }
    setUsers(users.filter(u => u.id !== id));
  };

  const [showAccountMembershipModal, setShowAccountMembershipModal] = useState(false);
  const [selectedUserForMembership, setSelectedUserForMembership] = useState<User | null>(null);
  const [membershipFormData, setMembershipFormData] = useState({
    accountId: '',
    clientRole: 'primary_taxpayer' as 'primary_taxpayer' | 'spouse' | 'member' | 'authorized_rep',
  });

  const handleAddAccountMembership = (user: User) => {
    setSelectedUserForMembership(user);
    setMembershipFormData({ accountId: '', clientRole: 'primary_taxpayer' });
    setShowAccountMembershipModal(true);
  };

  const handleSaveMembership = () => {
    if (!selectedUserForMembership || !membershipFormData.accountId) return;
    alert(`User ${selectedUserForMembership.fullName} added to account with role ${membershipFormData.clientRole}`);
    setShowAccountMembershipModal(false);
    setSelectedUserForMembership(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users & Staff</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage users and staff members
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              const csv = [
                ['Name', 'Email', 'Type', 'Role', 'Status'].join(','),
                ...users.map(u => [
                  u.fullName,
                  u.email,
                  u.userType,
                  u.staffRole || '',
                  u.active ? 'Active' : 'Inactive',
                ].join(',')),
              ].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
            }}
            className="btn-secondary"
          >
            Export CSV
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('staff')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'staff' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Staff
          </button>
          <button
            onClick={() => setFilter('client')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'client' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Clients
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/users/${user.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      {user.fullName}
                    </Link>
                    {user.jobTitle && (
                      <div className="text-sm text-gray-500">{user.jobTitle}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="badge badge-info">
                      {user.userType === 'staff' ? 'Staff' : 'Client'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.staffRole && (
                      <div>
                        <div>{user.staffRole.replace('_', ' ')}</div>
                        {user.staffTeamReporting && (
                          <div className="text-xs text-gray-400">{user.staffTeamReporting}</div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.active ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-warning">Inactive</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    {user.userType === 'client' && (
                      <button
                        onClick={() => handleAddAccountMembership(user)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Manage Accounts
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Type *
                </label>
                <select
                  value={formData.userType}
                  onChange={(e) => setFormData({ ...formData, userType: e.target.value as 'staff' | 'client' })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="staff">Staff</option>
                  <option value="client">Client</option>
                </select>
              </div>
              {formData.userType === 'staff' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Staff Role *
                    </label>
                    <select
                      value={formData.staffRole}
                      onChange={(e) => setFormData({ ...formData, staffRole: e.target.value as typeof formData.staffRole })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team Reporting
                    </label>
                    <select
                      value={formData.staffTeamReporting}
                      onChange={(e) => setFormData({ ...formData, staffTeamReporting: e.target.value as typeof formData.staffTeamReporting })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="fine_form">Fine Form</option>
                      <option value="fin_group">Fin Group</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({
                    fullName: '',
                    email: '',
                    userType: 'staff',
                    staffRole: 'staff',
                    staffTeamReporting: 'fine_form',
                    jobTitle: '',
                    active: true,
                  });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleCreate} className="btn-primary">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              {editingUser.userType === 'staff' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Staff Role *
                    </label>
                    <select
                      value={formData.staffRole}
                      onChange={(e) => setFormData({ ...formData, staffRole: e.target.value as typeof formData.staffRole })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleUpdate} className="btn-primary">
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Membership Modal */}
      {showAccountMembershipModal && selectedUserForMembership && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Manage Account Membership</h2>
            <p className="text-sm text-gray-600 mb-4">
              User: <strong>{selectedUserForMembership.fullName}</strong>
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account *
                </label>
                <select
                  value={membershipFormData.accountId}
                  onChange={(e) => setMembershipFormData({ ...membershipFormData, accountId: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select account</option>
                  {mockAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Role *
                </label>
                <select
                  value={membershipFormData.clientRole}
                  onChange={(e) => setMembershipFormData({ ...membershipFormData, clientRole: e.target.value as typeof membershipFormData.clientRole })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="primary_taxpayer">Primary Taxpayer</option>
                  <option value="spouse">Spouse</option>
                  <option value="member">Member</option>
                  <option value="authorized_rep">Authorized Representative</option>
                </select>
              </div>
            </div>
            <div className="mt-6 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> A single user can belong to multiple accounts. Each account membership is independent.
              </p>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowAccountMembershipModal(false);
                  setSelectedUserForMembership(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleSaveMembership} className="btn-primary">
                Add Membership
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

