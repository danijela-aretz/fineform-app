import { useState } from 'react';
import HelpIcon from '../components/HelpIcon';

interface EmailDelivery {
  id: string;
  entityId: string;
  entityName: string;
  emailType: 'invite' | 'reminder_checklist' | 'reminder_engagement' | 'reminder_filing' | 'message_notification' | 'return_published';
  recipientEmail: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  sentAt: string | null;
  deliveredAt: string | null;
  errorMessage: string | null;
  attemptCount: number;
  createdAt: string;
}

const mockEmailDeliveries: EmailDelivery[] = [
  {
    id: '1',
    entityId: '1',
    entityName: 'John & Jane Smith - 1040',
    emailType: 'invite',
    recipientEmail: 'john@example.com',
    status: 'delivered',
    sentAt: '2024-01-10T09:00:00Z',
    deliveredAt: '2024-01-10T09:00:05Z',
    errorMessage: null,
    attemptCount: 1,
    createdAt: '2024-01-10T09:00:00Z',
  },
  {
    id: '2',
    entityId: '2',
    entityName: 'Smith Business LLC',
    emailType: 'invite',
    recipientEmail: 'john@example.com',
    status: 'sent',
    sentAt: '2024-01-12T14:00:00Z',
    deliveredAt: null,
    errorMessage: null,
    attemptCount: 1,
    createdAt: '2024-01-12T14:00:00Z',
  },
  {
    id: '3',
    entityId: '3',
    entityName: 'Johnson Corp',
    emailType: 'invite',
    recipientEmail: 'jane.johnson@example.com',
    status: 'failed',
    sentAt: null,
    deliveredAt: null,
    errorMessage: 'Invalid email address',
    attemptCount: 3,
    createdAt: '2024-01-08T10:00:00Z',
  },
  {
    id: '4',
    entityId: '1',
    entityName: 'John & Jane Smith - 1040',
    emailType: 'reminder_checklist',
    recipientEmail: 'john@example.com',
    status: 'delivered',
    sentAt: '2024-01-15T08:00:00Z',
    deliveredAt: '2024-01-15T08:00:03Z',
    errorMessage: null,
    attemptCount: 1,
    createdAt: '2024-01-15T08:00:00Z',
  },
];

export default function EmailDeliveryLog() {
  const [deliveries, setDeliveries] = useState(mockEmailDeliveries);
  const [filter, setFilter] = useState<'all' | 'invite' | 'reminder' | 'failed'>('all');
  const [selectedDelivery, setSelectedDelivery] = useState<EmailDelivery | null>(null);

  const filteredDeliveries = deliveries.filter(delivery => {
    if (filter === 'all') return true;
    if (filter === 'invite') return delivery.emailType === 'invite';
    if (filter === 'reminder') return delivery.emailType.startsWith('reminder_');
    if (filter === 'failed') return delivery.status === 'failed';
    return true;
  });

  const handleRetry = (id: string) => {
    setDeliveries(deliveries.map(d =>
      d.id === id
        ? { ...d, attemptCount: d.attemptCount + 1, status: 'pending' as const }
        : d
    ));
    alert('Email retry queued');
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    bounced: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    sent: 'Sent',
    delivered: 'Delivered',
    failed: 'Failed',
    bounced: 'Bounced',
  };

  const emailTypeLabels: Record<string, string> = {
    invite: 'Tax Season Start Invite',
    reminder_checklist: 'Checklist Reminder',
    reminder_engagement: 'Engagement Reminder',
    reminder_filing: 'Filing Reminder',
    message_notification: 'Message Notification',
    return_published: 'Return Published',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Email Delivery Log</h1>
        <p className="mt-2 text-sm text-gray-600">
          Track email delivery status for invites, reminders, and notifications
        </p>
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
            onClick={() => setFilter('invite')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'invite' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Invites
          </button>
          <button
            onClick={() => setFilter('reminder')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'reminder' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Reminders
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'failed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Failed
          </button>
        </div>
      </div>

      {/* Email Deliveries List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Recipient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Delivered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Attempts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDeliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {delivery.entityName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {emailTypeLabels[delivery.emailType]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {delivery.recipientEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${statusColors[delivery.status]}`}>
                      {statusLabels[delivery.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {delivery.sentAt ? new Date(delivery.sentAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {delivery.deliveredAt ? new Date(delivery.deliveredAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {delivery.attemptCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {delivery.status === 'failed' && (
                      <button
                        onClick={() => handleRetry(delivery.id)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        Retry
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedDelivery(delivery)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delivery Details Modal */}
      {selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Email Delivery Details</h2>
              <button
                onClick={() => setSelectedDelivery(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Entity: </span>
                <span className="text-sm text-gray-600">{selectedDelivery.entityName}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Email Type: </span>
                <span className="text-sm text-gray-600">{emailTypeLabels[selectedDelivery.emailType]}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Recipient: </span>
                <span className="text-sm text-gray-600">{selectedDelivery.recipientEmail}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Status: </span>
                <span className={`badge ${statusColors[selectedDelivery.status]}`}>
                  {statusLabels[selectedDelivery.status]}
                </span>
              </div>
              {selectedDelivery.sentAt && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Sent: </span>
                  <span className="text-sm text-gray-600">
                    {new Date(selectedDelivery.sentAt).toLocaleString()}
                  </span>
                </div>
              )}
              {selectedDelivery.deliveredAt && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Delivered: </span>
                  <span className="text-sm text-gray-600">
                    {new Date(selectedDelivery.deliveredAt).toLocaleString()}
                  </span>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-700">Attempts: </span>
                <span className="text-sm text-gray-600">{selectedDelivery.attemptCount}</span>
              </div>
              {selectedDelivery.errorMessage && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Error: </span>
                  <span className="text-sm text-red-600">{selectedDelivery.errorMessage}</span>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-700">Created: </span>
                <span className="text-sm text-gray-600">
                  {new Date(selectedDelivery.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              {selectedDelivery.status === 'failed' && (
                <button
                  onClick={() => {
                    handleRetry(selectedDelivery.id);
                    setSelectedDelivery(null);
                  }}
                  className="btn-primary"
                >
                  Retry Delivery
                </button>
              )}
              <button
                onClick={() => setSelectedDelivery(null)}
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

