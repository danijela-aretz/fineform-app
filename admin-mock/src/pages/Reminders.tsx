import { useState } from 'react';
import HelpIcon from '../components/HelpIcon';

interface Reminder {
  id: string;
  entityId: string;
  entityName: string;
  reminderType: 'checklist' | 'engagement' | 'filing_readiness';
  status: 'pending' | 'sent' | 'dismissed';
  dueDate: string | null;
  sentAt: string | null;
  nextSendDate: string | null;
  sendCount: number;
  lastTriggeredBy: 'system' | 'staff';
}

const mockReminders: Reminder[] = [
  {
    id: '1',
    entityId: '1',
    entityName: 'John & Jane Smith - 1040',
    reminderType: 'checklist',
    status: 'sent',
    dueDate: '2024-01-20T00:00:00Z',
    sentAt: '2024-01-15T08:00:00Z',
    nextSendDate: '2024-01-22T08:00:00Z',
    sendCount: 1,
    lastTriggeredBy: 'system',
  },
  {
    id: '2',
    entityId: '2',
    entityName: 'Smith Business LLC',
    reminderType: 'engagement',
    status: 'pending',
    dueDate: '2024-01-25T00:00:00Z',
    sentAt: null,
    nextSendDate: '2024-01-18T08:00:00Z',
    sendCount: 0,
    lastTriggeredBy: 'system',
  },
  {
    id: '3',
    entityId: '3',
    entityName: 'Johnson Corp',
    reminderType: 'filing_readiness',
    status: 'sent',
    dueDate: '2024-02-15T00:00:00Z',
    sentAt: '2024-01-16T10:00:00Z',
    nextSendDate: '2024-01-23T10:00:00Z',
    sendCount: 2,
    lastTriggeredBy: 'system',
  },
  {
    id: '4',
    entityId: '1',
    entityName: 'John & Jane Smith - 1040',
    reminderType: 'engagement',
    status: 'dismissed',
    dueDate: '2024-01-10T00:00:00Z',
    sentAt: '2024-01-08T09:00:00Z',
    nextSendDate: null,
    sendCount: 1,
    lastTriggeredBy: 'staff',
  },
];

export default function Reminders() {
  const [reminders, setReminders] = useState(mockReminders);
  const [filter, setFilter] = useState<'all' | 'checklist' | 'engagement' | 'filing_readiness' | 'pending'>('all');
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);

  const filteredReminders = reminders.filter(reminder => {
    if (filter === 'all') return true;
    if (filter === 'pending') return reminder.status === 'pending';
    return reminder.reminderType === filter;
  });

  const handleDismiss = (id: string) => {
    setReminders(reminders.map(r =>
      r.id === id ? { ...r, status: 'dismissed' as const } : r
    ));
  };

  const handleSendNow = (id: string) => {
    setReminders(reminders.map(r =>
      r.id === id
        ? {
            ...r,
            status: 'sent' as const,
            sentAt: new Date().toISOString(),
            sendCount: r.sendCount + 1,
            lastTriggeredBy: 'staff' as const,
          }
        : r
    ));
    alert('Reminder sent successfully');
  };

  const reminderTypeLabels: Record<string, string> = {
    checklist: 'Checklist Reminder',
    engagement: 'Engagement Letter Reminder',
    filing_readiness: 'Filing Readiness Reminder',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-green-100 text-green-800',
    dismissed: 'bg-gray-100 text-gray-800',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    sent: 'Sent',
    dismissed: 'Dismissed',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reminder Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          View and manage automated reminders for checklist, engagement letters, and filing readiness
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
            onClick={() => setFilter('checklist')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'checklist' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Checklist
          </button>
          <button
            onClick={() => setFilter('engagement')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'engagement' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Engagement
          </button>
          <button
            onClick={() => setFilter('filing_readiness')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'filing_readiness' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Filing Readiness
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {/* Reminders List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reminder Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Last Sent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Next Send
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Send Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Triggered By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReminders.map((reminder) => (
                <tr key={reminder.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {reminder.entityName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reminderTypeLabels[reminder.reminderType]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${statusColors[reminder.status]}`}>
                      {statusLabels[reminder.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reminder.dueDate ? new Date(reminder.dueDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reminder.sentAt ? new Date(reminder.sentAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reminder.nextSendDate ? new Date(reminder.nextSendDate).toLocaleString() : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reminder.sendCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reminder.lastTriggeredBy === 'system' ? 'System' : 'Staff'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {reminder.status === 'pending' && (
                      <button
                        onClick={() => handleSendNow(reminder.id)}
                        className="text-green-600 hover:text-green-800 mr-2"
                      >
                        Send Now
                      </button>
                    )}
                    {reminder.status !== 'dismissed' && (
                      <button
                        onClick={() => handleDismiss(reminder.id)}
                        className="text-gray-600 hover:text-gray-800 mr-2"
                      >
                        Dismiss
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedReminder(reminder)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reminder History Modal */}
      {selectedReminder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Reminder History</h2>
              <button
                onClick={() => setSelectedReminder(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedReminder.entityName}</h3>
                <p className="text-sm text-gray-600">{reminderTypeLabels[selectedReminder.reminderType]}</p>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Status: </span>
                  <span className={`badge ${statusColors[selectedReminder.status]}`}>
                    {statusLabels[selectedReminder.status]}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Due Date: </span>
                  <span className="text-sm text-gray-600">
                    {selectedReminder.dueDate ? new Date(selectedReminder.dueDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Send Count: </span>
                  <span className="text-sm text-gray-600">{selectedReminder.sendCount}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Last Triggered By: </span>
                  <span className="text-sm text-gray-600">
                    {selectedReminder.lastTriggeredBy === 'system' ? 'System (Automated)' : 'Staff (Manual)'}
                  </span>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Send History</h4>
                <div className="space-y-2">
                  {selectedReminder.sentAt ? (
                    <div className="p-3 bg-gray-50 rounded-md">
                      <div className="text-sm font-medium text-gray-900">
                        Sent: {new Date(selectedReminder.sentAt).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Triggered by: {selectedReminder.lastTriggeredBy === 'system' ? 'System' : 'Staff'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No sends yet</div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setSelectedReminder(null)}
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

