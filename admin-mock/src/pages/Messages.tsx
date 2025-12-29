import { useState } from 'react';
import HelpIcon from '../components/HelpIcon';

interface Message {
  id: string;
  threadId: string;
  senderName: string;
  senderRole: 'client' | 'staff';
  content: string;
  createdAt: string;
  unread: boolean;
}

interface InternalNote {
  id: string;
  threadId: string;
  content: string;
  createdAt: string;
  createdBy: string;
  markedResponded: boolean;
  respondedAt: string | null;
}

interface Thread {
  id: string;
  entityName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  clientResponseTime: number | null; // hours since last client message
  slaStatus: 'ok' | 'warning' | 'critical'; // 48h warning, 72h critical
}

const mockMessages: Message[] = [
  {
    id: '1',
    threadId: '1',
    senderName: 'John Smith',
    senderRole: 'client',
    content: 'I have a question about my W-2. Should I upload it again?',
    createdAt: '2024-01-15T10:30:00Z',
    unread: true,
  },
  {
    id: '2',
    threadId: '1',
    senderName: 'Admin User',
    senderRole: 'staff',
    content: 'No need to upload again. We have received your W-2 and are processing it.',
    createdAt: '2024-01-15T11:00:00Z',
    unread: false,
  },
  {
    id: '3',
    threadId: '2',
    senderName: 'Jane Johnson',
    senderRole: 'client',
    content: 'When will my return be ready?',
    createdAt: '2024-01-14T14:20:00Z',
    unread: true,
  },
];

const mockThreads: Thread[] = [
  {
    id: '1',
    entityName: 'John & Jane Smith - 1040',
    lastMessage: 'I have a question about my W-2. Should I upload it again?',
    lastMessageAt: '2024-01-15T10:30:00Z',
    unreadCount: 1,
    clientResponseTime: 25, // hours
    slaStatus: 'ok',
  },
  {
    id: '2',
    entityName: 'Jane Johnson - 1040',
    lastMessage: 'When will my return be ready?',
    lastMessageAt: '2024-01-13T14:20:00Z',
    unreadCount: 1,
    clientResponseTime: 52, // hours - warning
    slaStatus: 'warning',
  },
  {
    id: '3',
    entityName: 'Smith Business LLC',
    lastMessage: 'I need to update my address information.',
    lastMessageAt: '2024-01-11T09:00:00Z',
    unreadCount: 0,
    clientResponseTime: 75, // hours - critical
    slaStatus: 'critical',
  },
];

const mockInternalNotes: InternalNote[] = [
  {
    id: '1',
    threadId: '2',
    content: 'Client asked about return status. Need to check with preparer.',
    createdAt: '2024-01-14T15:00:00Z',
    createdBy: 'Admin User',
    markedResponded: false,
    respondedAt: null,
  },
  {
    id: '2',
    threadId: '3',
    content: 'Address update requested. Waiting for client to provide new address.',
    createdAt: '2024-01-11T10:00:00Z',
    createdBy: 'Tax Assistant',
    markedResponded: true,
    respondedAt: '2024-01-12T14:00:00Z',
  },
];

export default function Messages() {
  const [selectedThread, setSelectedThread] = useState<string | null>('1');
  const [showInternalNotes, setShowInternalNotes] = useState(false);
  const [showInternalNoteModal, setShowInternalNoteModal] = useState(false);
  const [internalNoteContent, setInternalNoteContent] = useState('');
  const [threads] = useState(mockThreads);
  const [internalNotes, setInternalNotes] = useState(mockInternalNotes);

  const handleCreateInternalNote = () => {
    if (!selectedThread || !internalNoteContent.trim()) return;
    const newNote: InternalNote = {
      id: String(internalNotes.length + 1),
      threadId: selectedThread,
      content: internalNoteContent,
      createdAt: new Date().toISOString(),
      createdBy: 'Current User',
      markedResponded: false,
      respondedAt: null,
    };
    setInternalNotes([...internalNotes, newNote]);
    setInternalNoteContent('');
    setShowInternalNoteModal(false);
  };

  const handleMarkResponded = (noteId: string) => {
    setInternalNotes(internalNotes.map(note =>
      note.id === noteId
        ? { ...note, markedResponded: true, respondedAt: new Date().toISOString() }
        : note
    ));
  };

  const getSlaColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getSlaLabel = (status: string, hours: number | null) => {
    if (!hours) return 'N/A';
    switch (status) {
      case 'critical': return `Critical: ${hours}h (72h limit)`;
      case 'warning': return `Warning: ${hours}h (48h limit)`;
      default: return `OK: ${hours}h`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="mt-2 text-sm text-gray-600">
            Client communication threads with SLA tracking
          </p>
        </div>
        <button
          onClick={() => setShowInternalNotes(!showInternalNotes)}
          className="btn-secondary"
        >
          {showInternalNotes ? 'Hide' : 'Show'} Internal Notes
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Thread List */}
        <div className="md:col-span-1">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Threads</h2>
            <div className="space-y-2">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThread(thread.id)}
                  className={`p-3 border rounded-lg cursor-pointer ${
                    selectedThread === thread.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-sm">{thread.entityName}</div>
                    {thread.unreadCount > 0 && (
                      <span className="badge bg-red-500 text-white text-xs">
                        {thread.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 truncate mb-1">
                    {thread.lastMessage}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                      {new Date(thread.lastMessageAt).toLocaleDateString()}
                    </div>
                    <span className={`badge text-xs ${getSlaColor(thread.slaStatus)}`}>
                      {getSlaLabel(thread.slaStatus, thread.clientResponseTime)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Message View */}
        <div className="md:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Messages</h2>
              <button
                onClick={() => setShowInternalNoteModal(true)}
                className="btn-secondary text-sm"
              >
                Add Internal Note
              </button>
            </div>
            <div className="space-y-4 mb-6">
              {mockMessages
                .filter(m => m.threadId === selectedThread)
                .map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 border rounded-lg ${
                      message.senderRole === 'staff'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-sm">{message.senderName}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">{message.content}</div>
                  </div>
                ))}
            </div>
            <div className="border-t pt-4">
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2"
                rows={3}
                placeholder="Type your reply..."
              />
              <button className="btn-primary">Send Reply</button>
            </div>
          </div>

          {/* Internal Notes Section */}
          {showInternalNotes && selectedThread && (
            <div className="card mt-6">
              <h2 className="text-lg font-semibold mb-4">Internal Notes (Staff Only)</h2>
              <div className="space-y-3">
                {internalNotes
                  .filter(note => note.threadId === selectedThread)
                  .map((note) => (
                    <div
                      key={note.id}
                      className="p-3 border border-gray-200 rounded-lg bg-yellow-50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{note.content}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {note.createdBy} • {new Date(note.createdAt).toLocaleString()}
                          </div>
                        </div>
                        {note.markedResponded ? (
                          <div>
                            <span className="badge badge-success text-xs">Responded</span>
                            <div className="text-xs text-gray-500 mt-1">
                              {note.respondedAt ? new Date(note.respondedAt).toLocaleDateString() : ''}
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleMarkResponded(note.id)}
                            className="btn-secondary text-xs"
                          >
                            Mark as Responded Externally
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                {internalNotes.filter(note => note.threadId === selectedThread).length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No internal notes for this thread
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Internal Note Modal */}
      {showInternalNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add Internal Note</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note (Staff Only) *
                </label>
                <textarea
                  value={internalNoteContent}
                  onChange={(e) => setInternalNoteContent(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={4}
                  placeholder="Add an internal note about this thread..."
                />
              </div>
              <div className="p-3 bg-yellow-50 rounded-md">
                <p className="text-sm text-yellow-800">
                  Internal notes are only visible to staff members, not clients.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowInternalNoteModal(false);
                  setInternalNoteContent('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleCreateInternalNote} className="btn-primary">
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
