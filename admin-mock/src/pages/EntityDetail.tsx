import { useParams, Link } from 'react-router-dom';
import { Tooltip } from 'primereact/tooltip';
import { mockEntities, mockAccounts, statusColors, statusLabels } from '../data/mockData';
import HelpIcon from '../components/HelpIcon';

export default function EntityDetail() {
  const { id } = useParams<{ id: string }>();
  const entity = mockEntities.find(e => e.id === id);
  const account = entity ? mockAccounts.find(a => a.id === entity.accountId) : null;
  
  // Add missing properties for entity if needed
  const entityWithDefaults = entity ? {
    ...entity,
    isRestricted: false,
    active: true,
    bookkeepingEnabled: false,
  } : null;

  if (!entity || !entityWithDefaults) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <HelpIcon />
        <div className="card">
          <p className="text-gray-500">Entity not found</p>
          <Link to="/entities" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            ← Back to Entities
          </Link>
        </div>
      </div>
    );
  }

  // Mock tax years
  const taxYears = [
    { year: 2023, status: entity.status, readyForPrep: entity.readyForPrep },
    { year: 2022, status: 'filed', readyForPrep: true },
    { year: 2021, status: 'filed', readyForPrep: true },
  ];

  // Mock documents summary
  const documentsSummary = {
    total: 24,
    byType: {
      regular: 18,
      engagement_letter: 1,
      tax_return: 2,
      notice: 3,
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-6">
        <Link to="/entities" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
          ← Back to Entities
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{entity.entityName}</h1>
            <p className="mt-2 text-sm text-gray-600">
              {account?.displayName} • {entity.entityType} • Tax Year {entity.taxYear}
            </p>
          </div>
          <div className="flex gap-3">
            <Tooltip target=".entity-header-client-link" />
            <Link 
              to={`/clients/${id}`} 
              className="entity-header-client-link btn-secondary"
              data-pr-tooltip="View the client detail page for this entity"
              data-pr-position="top"
            >
              View Client Detail
            </Link>
            <button className="btn-primary">Edit Entity</button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Entity Information */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Entity Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase">Entity Name</label>
                <p className="text-sm font-medium text-gray-900 mt-1">{entity.entityName}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">Entity Type</label>
                <p className="text-sm font-medium text-gray-900 mt-1">{entity.entityType}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">Account</label>
                <p className="text-sm font-medium text-gray-900 mt-1">{entity.accountName}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">Filing Status</label>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {entity.entityType === 'HOUSEHOLD_1040' ? 'MFJ' : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">Restricted</label>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {entityWithDefaults.isRestricted ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">Active</label>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {entityWithDefaults.active ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">Bookkeeping Enabled</label>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {entityWithDefaults.bookkeepingEnabled ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>

          {/* Tax Years */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Tax Years</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tax Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ready for Prep
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {taxYears.map((ty) => (
                    <tr key={ty.year} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ty.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${statusColors[ty.status] || 'bg-gray-100 text-gray-800'}`}>
                          {statusLabels[ty.status] || ty.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ty.readyForPrep ? (
                          <span className="badge badge-success">Ready</span>
                        ) : (
                          <span className="badge badge-warning">Not Ready</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/clients/${id}`}
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
          </div>

          {/* Documents Summary */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Documents Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-xs text-gray-500 uppercase">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{documentsSummary.total}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-xs text-gray-500 uppercase">Regular Documents</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {documentsSummary.byType.regular}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-xs text-gray-500 uppercase">Tax Returns</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {documentsSummary.byType.tax_return}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-md">
                <p className="text-xs text-gray-500 uppercase">Notices</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">
                  {documentsSummary.byType.notice}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link to={`/clients/${id}/documents`} className="btn-secondary text-sm">
                View All Documents
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Status */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Current Status</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 uppercase">Internal Status</label>
                <div className="mt-1">
                  <span className={`badge ${statusColors[entity.status] || 'bg-gray-100 text-gray-800'}`}>
                    {statusLabels[entity.status] || entity.status}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">Ready for Prep</label>
                <div className="mt-1">
                  {entity.readyForPrep ? (
                    <span className="badge badge-success">Ready</span>
                  ) : (
                    <span className="badge badge-warning">Not Ready</span>
                  )}
                </div>
              </div>
              {entity.blockingReasons && entity.blockingReasons.length > 0 && (
                <div>
                  <label className="text-xs text-gray-500 uppercase">Blocking Reasons</label>
                  <ul className="mt-1 space-y-1">
                    {entity.blockingReasons.map((reason, idx) => (
                      <li key={idx} className="text-xs text-red-600">• {reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Tooltip target=".entity-client-link" />
              <Link 
                to={`/clients/${id}`} 
                className="entity-client-link btn-secondary w-full text-sm"
                data-pr-tooltip="View the client detail page for this entity"
                data-pr-position="top"
              >
                View Client Detail
              </Link>
              <Link 
                to={`/clients/${id}/documents`} 
                className="entity-client-link btn-secondary w-full text-sm"
                data-pr-tooltip="View documents for this client entity"
                data-pr-position="top"
              >
                View Documents
              </Link>
              <Link 
                to={`/clients/${id}/messages`} 
                className="entity-client-link btn-secondary w-full text-sm"
                data-pr-tooltip="View messages for this client entity"
                data-pr-position="top"
              >
                View Messages
              </Link>
              <Link to={`/permissions`} className="btn-secondary w-full text-sm">
                Manage Permissions
              </Link>
            </div>
          </div>

          {/* Permissions Overview */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Permissions Overview</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Restricted Client</span>
                <span className={entityWithDefaults.isRestricted ? 'text-red-600' : 'text-green-600'}>
                  {entityWithDefaults.isRestricted ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Staff Assignments</span>
                <span className="text-gray-900">2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tax Access Grants</span>
                <span className="text-gray-900">1</span>
              </div>
            </div>
            <Link to={`/permissions`} className="btn-secondary w-full mt-4 text-sm">
              View All Permissions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

