import { useState } from 'react';
import { mockEntities } from '../data/mockData';
import HelpIcon from '../components/HelpIcon';

interface InviteQueue {
  entityId: string;
  entityName: string;
  accountName: string;
  taxYear: number;
  status: 'queued' | 'sent' | 'failed';
  inviteSentAt?: string;
  lastError?: string;
  attemptCount: number;
}

const mockQueue: InviteQueue[] = [
  {
    entityId: '1',
    entityName: 'John & Jane Smith - 1040',
    accountName: 'Smith Family',
    taxYear: 2024,
    status: 'queued',
    attemptCount: 0,
  },
  {
    entityId: '2',
    entityName: 'Smith Business LLC',
    accountName: 'Smith Family',
    taxYear: 2024,
    status: 'sent',
    inviteSentAt: '2024-01-15T10:00:00Z',
    attemptCount: 1,
  },
  {
    entityId: '3',
    entityName: 'Johnson Corp',
    accountName: 'Johnson Enterprises',
    taxYear: 2024,
    status: 'failed',
    lastError: 'Email delivery failed',
    attemptCount: 2,
  },
];

export default function Invites() {
  const [queue, setQueue] = useState(mockQueue);
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'queued' | 'sent' | 'failed'>('all');

  const filteredQueue = queue.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const handleSelectEntity = (entityId: string) => {
    setSelectedEntities(prev =>
      prev.includes(entityId)
        ? prev.filter(id => id !== entityId)
        : [...prev, entityId]
    );
  };

  const handleQueueSelected = () => {
    if (selectedEntities.length === 0) return;
    const newItems: InviteQueue[] = selectedEntities.map(entityId => {
      const entity = mockEntities.find(e => e.id === entityId);
      return {
        entityId,
        entityName: entity?.entityName || '',
        accountName: entity?.accountName || '',
        taxYear: 2024,
        status: 'queued',
        attemptCount: 0,
      };
    });
    setQueue([...queue, ...newItems]);
    setSelectedEntities([]);
  };

  const handleSendWave = () => {
    const queuedItems = queue.filter(item => item.status === 'queued');
    setQueue(queue.map(item =>
      queuedItems.some(q => q.entityId === item.entityId)
        ? {
            ...item,
            status: 'sent',
            inviteSentAt: new Date().toISOString(),
            attemptCount: item.attemptCount + 1,
          }
        : item
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tax Season Start</h1>
        <p className="mt-2 text-sm text-gray-600">
          Initiate tax season for existing clients by sending Tax Season Start Emails
        </p>
      </div>

      {/* Entity Selection */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Select Entities to Invite</h2>
        <div className="mb-4">
          <div className="overflow-x-auto max-h-64 border border-gray-200 rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedEntities.length === mockEntities.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEntities(mockEntities.map(e => e.id));
                        } else {
                          setSelectedEntities([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Entity Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Account
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Tax Year
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockEntities.map((entity) => (
                  <tr key={entity.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedEntities.includes(entity.id)}
                        onChange={() => handleSelectEntity(entity.id)}
                      />
                    </td>
                    <td className="px-4 py-2 text-sm">{entity.entityName}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{entity.accountName}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{entity.taxYear}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <button
          onClick={handleQueueSelected}
          disabled={selectedEntities.length === 0}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Queue Selected ({selectedEntities.length})
        </button>
      </div>

      {/* Queue Dashboard */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Invite Queue</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('queued')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'queued' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Queued
            </button>
            <button
              onClick={() => setFilter('sent')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'sent' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Sent
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'failed' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Failed
            </button>
          </div>
        </div>
        <div className="mb-4">
          <button
            onClick={handleSendWave}
            disabled={queue.filter(q => q.status === 'queued').length === 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Wave ({queue.filter(q => q.status === 'queued').length} queued)
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tax Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sent At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Attempts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Error
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQueue.map((item) => (
                <tr key={item.entityId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {item.entityName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.taxYear}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.status === 'queued' && (
                      <span className="badge badge-warning">Queued</span>
                    )}
                    {item.status === 'sent' && (
                      <span className="badge badge-success">Sent</span>
                    )}
                    {item.status === 'failed' && (
                      <span className="badge badge-danger">Failed</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.inviteSentAt
                      ? new Date(item.inviteSentAt).toLocaleString()
                      : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.attemptCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {item.lastError || '—'}
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

