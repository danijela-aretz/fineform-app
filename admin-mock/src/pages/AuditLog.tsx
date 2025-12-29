import { useState } from 'react';
import { mockEntities } from '../data/mockData';
import HelpIcon from '../components/HelpIcon';

interface AuditEntry {
  id: string;
  entityId: string;
  entityName: string;
  auditType: 'status_change' | 'permission_change' | 'document_event' | 'user_action';
  action: string;
  oldValue: string | null;
  newValue: string | null;
  performedBy: string;
  performedAt: string;
  details: string | null;
}

const mockAuditEntries: AuditEntry[] = [
  {
    id: '1',
    entityId: '1',
    entityName: 'John & Jane Smith - 1040',
    auditType: 'status_change',
    action: 'Status Transition',
    oldValue: 'waiting_on_documents',
    newValue: 'in_preparation',
    performedBy: 'Admin User',
    performedAt: '2024-01-15T10:00:00Z',
    details: 'All documents received',
  },
  {
    id: '2',
    entityId: '1',
    entityName: 'John & Jane Smith - 1040',
    auditType: 'permission_change',
    action: 'Grant Tax Access',
    oldValue: null,
    newValue: 'Jane Assistant',
    performedBy: 'Admin User',
    performedAt: '2024-01-10T09:00:00Z',
    details: 'Granted tax access to Jane Assistant',
  },
  {
    id: '3',
    entityId: '2',
    entityName: 'Smith Business LLC',
    auditType: 'document_event',
    action: 'Document Uploaded',
    oldValue: null,
    newValue: 'W-2 Form - Employer A.pdf',
    performedBy: 'John Smith',
    performedAt: '2024-01-15T10:30:00Z',
    details: 'Uploaded to Tax Documents folder',
  },
  {
    id: '4',
    entityId: '1',
    entityName: 'John & Jane Smith - 1040',
    auditType: 'status_change',
    action: 'Status Transition',
    oldValue: 'not_started',
    newValue: 'waiting_on_documents',
    performedBy: 'System',
    performedAt: '2024-01-10T09:00:00Z',
    details: 'Checklist created',
  },
  {
    id: '5',
    entityId: '3',
    entityName: 'Johnson Corp',
    auditType: 'document_event',
    action: 'Document Published',
    oldValue: null,
    newValue: 'Tax Return 2023 - Client Copy.pdf',
    performedBy: 'Admin User',
    performedAt: '2024-01-19T14:00:00Z',
    details: 'Published to Client Copy',
  },
  {
    id: '6',
    entityId: '1',
    entityName: 'John & Jane Smith - 1040',
    auditType: 'user_action',
    action: 'Engagement Letter Requested',
    oldValue: null,
    newValue: 'requested',
    performedBy: 'Admin User',
    performedAt: '2024-01-10T09:00:00Z',
    details: 'Engagement letter requested for 2023 tax year',
  },
];

export default function AuditLog() {
  const [entries] = useState(mockAuditEntries);
  const [filter, setFilter] = useState<'all' | 'status_change' | 'permission_change' | 'document_event' | 'user_action'>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  const filteredEntries = entries.filter(entry => {
    if (filter !== 'all' && entry.auditType !== filter) return false;
    if (entityFilter !== 'all' && entry.entityId !== entityFilter) return false;
    if (dateRange !== 'all') {
      const entryDate = new Date(entry.performedAt);
      const now = new Date();
      if (dateRange === 'today') {
        if (entryDate.toDateString() !== now.toDateString()) return false;
      } else if (dateRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (entryDate < weekAgo) return false;
      } else if (dateRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (entryDate < monthAgo) return false;
      }
    }
    return true;
  });

  const auditTypeLabels: Record<string, string> = {
    status_change: 'Status Change',
    permission_change: 'Permission Change',
    document_event: 'Document Event',
    user_action: 'User Action',
  };

  const auditTypeColors: Record<string, string> = {
    status_change: 'bg-blue-100 text-blue-800',
    permission_change: 'bg-purple-100 text-purple-800',
    document_event: 'bg-green-100 text-green-800',
    user_action: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
        <p className="mt-2 text-sm text-gray-600">
          Complete audit trail of all system actions and changes
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audit Type
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Types</option>
              <option value="status_change">Status Changes</option>
              <option value="permission_change">Permission Changes</option>
              <option value="document_event">Document Events</option>
              <option value="user_action">User Actions</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entity
            </label>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Entities</option>
              {mockEntities.map(entity => (
                <option key={entity.id} value={entity.id}>
                  {entity.entityName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Entries */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date/Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Old Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  New Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Performed By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(entry.performedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {entry.entityName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${auditTypeColors[entry.auditType]}`}>
                      {auditTypeLabels[entry.auditType]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {entry.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.oldValue || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {entry.newValue || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.performedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {entry.details && (
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEntries.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No audit entries found matching the filters
            </div>
          )}
        </div>
      </div>

      {/* Entry Details Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Audit Entry Details</h2>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Entity: </span>
                <span className="text-sm text-gray-600">{selectedEntry.entityName}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Type: </span>
                <span className={`badge ${auditTypeColors[selectedEntry.auditType]}`}>
                  {auditTypeLabels[selectedEntry.auditType]}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Action: </span>
                <span className="text-sm text-gray-600">{selectedEntry.action}</span>
              </div>
              {selectedEntry.oldValue && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Old Value: </span>
                  <span className="text-sm text-gray-600">{selectedEntry.oldValue}</span>
                </div>
              )}
              {selectedEntry.newValue && (
                <div>
                  <span className="text-sm font-medium text-gray-700">New Value: </span>
                  <span className="text-sm text-gray-600">{selectedEntry.newValue}</span>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-700">Performed By: </span>
                <span className="text-sm text-gray-600">{selectedEntry.performedBy}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Performed At: </span>
                <span className="text-sm text-gray-600">
                  {new Date(selectedEntry.performedAt).toLocaleString()}
                </span>
              </div>
              {selectedEntry.details && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Details: </span>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                    {selectedEntry.details}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedEntry(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

