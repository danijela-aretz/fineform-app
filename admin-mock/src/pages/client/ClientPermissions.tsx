import { useParams, Link } from 'react-router-dom';
import { mockEntities } from '../../data/mockData';
import HelpIcon from '../../components/HelpIcon';
import ClientViewBanner from '../../components/ClientViewBanner';

interface Permission {
  id: string;
  staffUserId: string;
  staffUserName: string;
  permissionType: 'acl' | 'tax_access' | 'assignment';
  granted: boolean;
  grantedAt: string;
  grantedBy: string;
}

const mockClientPermissions: Permission[] = [
  {
    id: '1',
    staffUserId: '3',
    staffUserName: 'Jane Assistant',
    permissionType: 'assignment',
    granted: true,
    grantedAt: '2024-01-10T09:00:00Z',
    grantedBy: 'Admin User',
  },
  {
    id: '2',
    staffUserId: '3',
    staffUserName: 'Jane Assistant',
    permissionType: 'tax_access',
    granted: true,
    grantedAt: '2024-01-10T09:00:00Z',
    grantedBy: 'Admin User',
  },
];

export default function ClientPermissions() {
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
          <h1 className="text-3xl font-bold text-gray-900">Permissions</h1>
          <p className="mt-2 text-sm text-gray-600">
            {entity.entityName} • {entity.taxYear}
          </p>
        </div>
        <button className="btn-primary">Grant Permission</button>
      </div>

      {/* Permission Types */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Restricted ACL */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Restricted Client ACL</h2>
          <p className="text-sm text-gray-600 mb-4">
            Staff members with explicit access to this restricted client.
          </p>
          {entity.isRestricted ? (
            <div className="space-y-2">
              {mockClientPermissions
                .filter(p => p.permissionType === 'acl')
                .map((permission) => (
                  <div key={permission.id} className="p-3 border border-gray-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{permission.staffUserName}</span>
                      <button className="text-red-600 hover:text-red-800 text-xs">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              <button className="btn-secondary w-full text-sm mt-2">Add to ACL</button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">This client is not restricted.</p>
          )}
        </div>

        {/* Tax Access */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Tax Access</h2>
          <p className="text-sm text-gray-600 mb-4">
            Staff members with tax visibility for this client.
          </p>
          <div className="space-y-2">
            {mockClientPermissions
              .filter(p => p.permissionType === 'tax_access')
              .map((permission) => (
                <div key={permission.id} className="p-3 border border-gray-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{permission.staffUserName}</span>
                    <button className="text-red-600 hover:text-red-800 text-xs">
                      Revoke
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Granted: {new Date(permission.grantedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            <button className="btn-secondary w-full text-sm mt-2">Grant Tax Access</button>
          </div>
        </div>

        {/* Staff Assignments */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Staff Assignments</h2>
          <p className="text-sm text-gray-600 mb-4">
            Staff members assigned to this client (operational only).
          </p>
          <div className="space-y-2">
            {mockClientPermissions
              .filter(p => p.permissionType === 'assignment')
              .map((permission) => (
                <div key={permission.id} className="p-3 border border-gray-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{permission.staffUserName}</span>
                    <button className="text-red-600 hover:text-red-800 text-xs">
                      Unassign
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Assigned: {new Date(permission.grantedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            <button className="btn-secondary w-full text-sm mt-2">Assign Staff</button>
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="card mt-6">
        <h2 className="text-lg font-semibold mb-4">Permission Audit Log</h2>
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
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Permission Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Changed By
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockClientPermissions.map((permission) => (
                <tr key={permission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(permission.grantedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="badge badge-success">Granted</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {permission.staffUserName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {permission.permissionType.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {permission.grantedBy}
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

