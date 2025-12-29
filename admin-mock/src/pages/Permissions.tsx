import { useState } from 'react';
import HelpIcon from '../components/HelpIcon';

interface Permission {
  id: string;
  clientEntityId: string;
  clientEntityName: string;
  staffUserId: string;
  staffUserName: string;
  permissionType: 'acl' | 'tax_access' | 'assignment';
  granted: boolean;
  grantedAt?: string;
  grantedBy?: string;
}

const mockPermissions: Permission[] = [
  {
    id: '1',
    clientEntityId: '1',
    clientEntityName: 'John & Jane Smith - 1040',
    staffUserId: '3',
    staffUserName: 'Jane Assistant',
    permissionType: 'assignment',
    granted: true,
    grantedAt: '2024-01-10T09:00:00Z',
    grantedBy: 'Admin User',
  },
  {
    id: '2',
    clientEntityId: '2',
    clientEntityName: 'Smith Business LLC',
    staffUserId: '3',
    staffUserName: 'Jane Assistant',
    permissionType: 'tax_access',
    granted: true,
    grantedAt: '2024-01-10T09:00:00Z',
    grantedBy: 'Admin User',
  },
];

const mockStaff = [
  { id: '1', name: 'Admin User', role: 'admin' },
  { id: '3', name: 'Jane Assistant', role: 'staff' },
];

export default function Permissions() {
  const [permissions, setPermissions] = useState(mockPermissions);
  const [selectedClient, setSelectedClient] = useState('');
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantType, setGrantType] = useState<'acl' | 'tax_access' | 'assignment'>('assignment');
  const [selectedStaff, setSelectedStaff] = useState('');

  const handleGrant = () => {
    if (!selectedClient || !selectedStaff) return;
    const staff = mockStaff.find(s => s.id === selectedStaff);
    const newPermission: Permission = {
      id: String(permissions.length + 1),
      clientEntityId: selectedClient,
      clientEntityName: 'Selected Client',
      staffUserId: selectedStaff,
      staffUserName: staff?.name || '',
      permissionType: grantType,
      granted: true,
      grantedAt: new Date().toISOString(),
      grantedBy: 'Current User',
    };
    setPermissions([...permissions, newPermission]);
    setShowGrantModal(false);
    setSelectedClient('');
    setSelectedStaff('');
  };

  const handleRevoke = (id: string) => {
    if (!confirm('Are you sure you want to revoke this permission?')) return;
    setPermissions(permissions.filter(p => p.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Permissions Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage client ACL, tax access grants, and staff assignments
          </p>
        </div>
        <button
          onClick={() => setShowGrantModal(true)}
          className="btn-primary"
        >
          Grant Permission
        </button>
      </div>

      {/* Permission Types Tabs */}
      <div className="card mb-6">
        <div className="flex gap-2 border-b border-gray-200">
          <button className="px-4 py-2 border-b-2 border-blue-600 text-blue-600 font-medium">
            All Permissions
          </button>
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
            Restricted ACL
          </button>
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
            Tax Access
          </button>
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
            Assignments
          </button>
        </div>
      </div>

      {/* Permissions List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Client Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Permission Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Granted At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Granted By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {permissions.map((permission) => (
                <tr key={permission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {permission.clientEntityName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {permission.staffUserName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="badge badge-info">
                      {permission.permissionType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {permission.grantedAt
                      ? new Date(permission.grantedAt).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {permission.grantedBy || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleRevoke(permission.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grant Permission Modal */}
      {showGrantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Grant Permission</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permission Type *
                </label>
                <select
                  value={grantType}
                  onChange={(e) => setGrantType(e.target.value as typeof grantType)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="assignment">Staff Assignment</option>
                  <option value="tax_access">Tax Access</option>
                  <option value="acl">Restricted ACL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Entity *
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select client entity</option>
                  <option value="1">John & Jane Smith - 1040</option>
                  <option value="2">Smith Business LLC</option>
                  <option value="3">Johnson Corp</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Staff Member *
                </label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select staff member</option>
                  {mockStaff.map(staff => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} ({staff.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowGrantModal(false);
                  setSelectedClient('');
                  setSelectedStaff('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleGrant} className="btn-primary">
                Grant Permission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

