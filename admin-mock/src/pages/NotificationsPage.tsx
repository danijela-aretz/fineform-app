import { useState } from 'react';
import { Link } from 'react-router-dom';
import HelpIcon from '../components/HelpIcon';

interface Notification {
  id: string;
  type: 'message' | 'return_published' | 'reminder' | 'action_needed' | 'system';
  title: string;
  message: string;
  entityId?: string;
  entityName?: string;
  createdAt: string;
  read: boolean;
  link?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'message',
    title: 'New Message',
    message: 'John Smith sent a new message',
    entityId: '1',
    entityName: 'John & Jane Smith - 1040',
    createdAt: '2024-01-15T10:30:00Z',
    read: false,
    link: '/clients/1/messages',
  },
  {
    id: '2',
    type: 'return_published',
    title: 'Tax Return Published',
    message: '2023 1040 Client Copy published for Johnson Corp',
    entityId: '3',
    entityName: 'Johnson Corp',
    createdAt: '2024-01-14T14:00:00Z',
    read: false,
    link: '/clients/3/tax-returns',
  },
  {
    id: '3',
    type: 'reminder',
    title: 'Reminder Sent',
    message: 'Checklist reminder sent to Smith Business LLC',
    entityId: '2',
    entityName: 'Smith Business LLC',
    createdAt: '2024-01-14T09:00:00Z',
    read: true,
    link: '/reminders',
  },
  {
    id: '4',
    type: 'action_needed',
    title: 'Action Needed',
    message: 'E-File Authorization required for Johnson Corp',
    entityId: '3',
    entityName: 'Johnson Corp',
    createdAt: '2024-01-13T15:30:00Z',
    read: false,
    link: '/action-needed',
  },
  {
    id: '5',
    type: 'system',
    title: 'System Update',
    message: 'New features available in the latest update',
    createdAt: '2024-01-12T08:00:00Z',
    read: true,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return '💬';
      case 'return_published':
        return '📄';
      case 'reminder':
        return '⏰';
      case 'action_needed':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-blue-100 text-blue-800';
      case 'return_published':
        return 'bg-green-100 text-green-800';
      case 'reminder':
        return 'bg-yellow-100 text-yellow-800';
      case 'action_needed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-2 text-sm text-gray-600">
            Stay updated on messages, returns, reminders, and actions
          </p>
        </div>
        <div className="flex gap-3">
          {notifications.filter(n => !n.read).length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="btn-secondary"
            >
              Mark All as Read
            </button>
          )}
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
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Unread ({notifications.filter(n => !n.read).length})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'read' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Read ({notifications.filter(n => n.read).length})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No notifications found</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`card ${!notification.read ? 'border-l-4 border-blue-500' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xl ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      {notification.entityName && (
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.entityName}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {notification.link && (
                    <div className="mt-4">
                      <Link
                        to={notification.link}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

