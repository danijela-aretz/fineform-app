import { Link } from 'react-router-dom';
import { Tooltip } from 'primereact/tooltip';
import { mockEntities, statusColors, statusLabels } from '../data/mockData';
import HelpIcon from '../components/HelpIcon';

export default function Clients() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage client entities and tax returns
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              const csv = [
                ['Entity Name', 'Account', 'Type', 'Tax Year', 'Status'].join(','),
                ...mockEntities.map(e => [
                  e.entityName,
                  e.accountName,
                  e.entityType,
                  e.taxYear,
                  e.status,
                ].join(',')),
              ].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `clients-export-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
            }}
            className="btn-secondary"
          >
            Export CSV
          </button>
          <button className="btn-primary">Add Client</button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search clients..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option>All Statuses</option>
              <option>Not Started</option>
              <option>Waiting on Documents</option>
              <option>In Preparation</option>
              <option>Ready to File</option>
              <option>Filed</option>
            </select>
          </div>
          <div>
            <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option>All Tax Years</option>
              <option>2023</option>
              <option>2022</option>
            </select>
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tax Year
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
              {mockEntities.map((entity) => (
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
                    {entity.accountName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entity.entityType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entity.taxYear}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${statusColors[entity.status] || 'bg-gray-100 text-gray-800'}`}>
                      {statusLabels[entity.status] || entity.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/clients/${entity.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View Details
                      </Link>
                      <span className="text-gray-300">|</span>
                      <Tooltip target=".client-view-link" />
                      <Link
                        to={`/clients/${entity.id}/status`}
                        className="client-view-link text-purple-600 hover:text-purple-800 text-xs"
                        data-pr-tooltip="Preview the client-facing status view for this entity"
                        data-pr-position="top"
                      >
                        📱 Client View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

