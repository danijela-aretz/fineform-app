import { useParams, Link } from 'react-router-dom';
import { mockEntities, mockMessages } from '../../data/mockData';
import ClientViewBanner from '../../components/ClientViewBanner';
import HelpIcon from '../../components/HelpIcon';

export default function ClientMessages() {
  const { id } = useParams<{ id: string }>();
  const entity = mockEntities.find(e => e.id === id);
  const threadMessages = mockMessages.filter(m => m.threadId === '1');

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
      <div className="mb-6">
        <Link to={`/clients/${id}`} className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
          ← Back to Client
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="mt-2 text-sm text-gray-600">
          {entity.entityName} • {entity.taxYear}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Messages */}
        <div className="md:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Message Thread</h2>
              <span className="badge badge-info">
                {threadMessages.filter(m => m.unread).length} unread
              </span>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {threadMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg ${
                    message.senderRole === 'client'
                      ? 'bg-gray-100'
                      : 'bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{message.senderName}</p>
                      <p className="text-xs text-gray-500">
                        {message.senderRole === 'client' ? 'Client' : 'Staff'}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{message.content}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="Type your message..."
                rows={3}
              />
              <button className="btn-primary mt-2">Send Message</button>
            </div>
          </div>
        </div>

        {/* Internal Notes */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Internal Notes</h2>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-yellow-800">Phone Call</span>
                  <span className="text-xs text-yellow-600">Jan 15, 2024</span>
                </div>
                <p className="text-sm text-yellow-900">
                  Client called to confirm receipt of documents. All set.
                </p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-blue-800">Email</span>
                  <span className="text-xs text-blue-600">Jan 12, 2024</span>
                </div>
                <p className="text-sm text-blue-900">
                  Sent follow-up email about missing W-2.
                </p>
              </div>
            </div>
            <button className="btn-secondary w-full mt-4 text-sm">Add Internal Note</button>
          </div>

          {/* Response SLA */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Response SLA</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Last Client Message:</span>
                <span className="font-medium">Jan 15, 2024 10:30 AM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Firm Response:</span>
                <span className="font-medium">Jan 15, 2024 11:00 AM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="badge badge-success">On Time</span>
              </div>
            </div>
            <button className="btn-secondary w-full mt-4 text-sm">
              Mark as Responded Externally
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

