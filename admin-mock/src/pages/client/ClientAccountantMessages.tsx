import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockEntities, mockMessages } from '../../data/mockData';
import HelpIcon from '../../components/HelpIcon';
import ClientViewBanner from '../../components/ClientViewBanner';

interface FirmDocument {
  id: string;
  name: string;
  type: 'engagement_letter' | 'efile_authorization' | 'shared_document' | 'tax_return';
  uploadedAt: string;
  status?: string;
  downloadCount?: number;
}

const mockFirmDocuments: FirmDocument[] = [
  {
    id: '1',
    name: 'Engagement Letter - 2023',
    type: 'engagement_letter',
    uploadedAt: '2024-01-10T09:00:00Z',
    status: 'fully_signed',
  },
  {
    id: '2',
    name: 'E-File Authorization Form',
    type: 'efile_authorization',
    uploadedAt: '2024-01-15T10:00:00Z',
    status: 'pending',
  },
  {
    id: '3',
    name: 'Tax Planning Summary 2023',
    type: 'shared_document',
    uploadedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: '4',
    name: '2023 1040 - Client Copy',
    type: 'tax_return',
    uploadedAt: '2024-02-15T10:00:00Z',
    downloadCount: 2,
  },
];

export default function ClientAccountantMessages() {
  const { id } = useParams<{ id: string }>();
  const entity = mockEntities.find(e => e.id === id);
  const [activeTab, setActiveTab] = useState<'messages' | 'signature' | 'documents' | 'returns'>('messages');
  const threadMessages = mockMessages.filter(m => m.threadId === '1');
  const [newMessage, setNewMessage] = useState('');

  if (!entity) {
    return (
      <>
        <ClientViewBanner />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <HelpIcon />
        <HelpIcon />
          <div className="card">
            <p className="text-gray-500">Client not found</p>
            <Link to="/clients" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
              ← Back to Clients
            </Link>
          </div>
        </div>
      </>
    );
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    alert('Message sent! (Mock)');
    setNewMessage('');
  };

  // Unused function - kept for future implementation
  // const getDocumentTypeLabel = (type: string) => {
  //   switch (type) {
  //     case 'engagement_letter':
  //       return 'Engagement Letter';
  //     case 'efile_authorization':
  //       return 'E-File Authorization';
  //     case 'shared_document':
  //       return 'Firm Document';
  //     case 'tax_return':
  //       return 'Tax Return';
  //     default:
  //       return 'Document';
  //   }
  // };

  const getDocumentTypeBadge = (type: string) => {
    switch (type) {
      case 'engagement_letter':
        return <span className="badge badge-info">Engagement Letter</span>;
      case 'efile_authorization':
        return <span className="badge badge-warning">E-File Authorization</span>;
      case 'shared_document':
        return <span className="badge badge-secondary">Firm Document</span>;
      case 'tax_return':
        return <span className="badge badge-success">Tax Return</span>;
      default:
        return <span className="badge badge-info">Document</span>;
    }
  };

  return (
    <>
      <ClientViewBanner />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="mb-6">
          <Link to={`/clients/${id}`} className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
            ← Back to Client Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Accountant Messages and Documents</h1>
          <p className="mt-2 text-sm text-gray-600">
            {entity.entityName} • Tax Year {entity.taxYear}
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('messages')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'messages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Messages
              {threadMessages.filter(m => m.unread).length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
                  {threadMessages.filter(m => m.unread).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('signature')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'signature'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Signature Required
              {mockFirmDocuments.filter(d => d.type === 'engagement_letter' || d.type === 'efile_authorization').filter(d => d.status !== 'fully_signed' && d.status !== 'signed').length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
                  {mockFirmDocuments.filter(d => d.type === 'engagement_letter' || d.type === 'efile_authorization').filter(d => d.status !== 'fully_signed' && d.status !== 'signed').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Firm Documents
            </button>
            <button
              onClick={() => setActiveTab('returns')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'returns'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tax Returns
            </button>
          </nav>
        </div>

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Message Thread</h2>
              <span className="badge badge-info">
                {threadMessages.filter(m => m.unread).length} unread
              </span>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
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
                        {message.senderRole === 'client' ? 'You' : 'Firm Staff'}
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
            <div className="border-t pt-4">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="Type your message..."
                rows={3}
              />
              <button onClick={handleSendMessage} className="btn-primary mt-2">
                Send Message
              </button>
            </div>
          </div>
        )}

        {/* Signature Required Tab */}
        {activeTab === 'signature' && (
          <div className="space-y-4">
            {mockFirmDocuments
              .filter(d => d.type === 'engagement_letter' || d.type === 'efile_authorization')
              .map((doc) => (
                <div key={doc.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getDocumentTypeBadge(doc.type)}
                        {doc.status === 'fully_signed' || doc.status === 'signed' ? (
                          <span className="badge badge-success">Signed</span>
                        ) : (
                          <span className="badge badge-warning">Signature Required</span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{doc.name}</h3>
                      <p className="text-sm text-gray-500">
                        Shared: {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-secondary text-sm">View</button>
                      {doc.status !== 'fully_signed' && doc.status !== 'signed' && (
                        <Link
                          to={doc.type === 'engagement_letter' 
                            ? `/clients/${id}/engagement-letter`
                            : `/clients/${id}/efile-authorization`}
                          className="btn-primary text-sm"
                        >
                          Sign
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Firm Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            {mockFirmDocuments
              .filter(d => d.type === 'shared_document')
              .map((doc) => (
                <div key={doc.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getDocumentTypeBadge(doc.type)}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{doc.name}</h3>
                      <p className="text-sm text-gray-500">
                        Shared: {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button className="btn-primary text-sm">Download</button>
                  </div>
                </div>
              ))}
            {mockFirmDocuments.filter(d => d.type === 'shared_document').length === 0 && (
              <div className="card text-center py-12">
                <p className="text-gray-500">No firm documents shared yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Tax Returns Tab */}
        {activeTab === 'returns' && (
          <div className="space-y-4">
            {mockFirmDocuments
              .filter(d => d.type === 'tax_return')
              .map((doc) => (
                <div key={doc.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getDocumentTypeBadge(doc.type)}
                        <span className="badge badge-info">Client Copy</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{doc.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        Published: {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                      {doc.downloadCount !== undefined && (
                        <p className="text-xs text-gray-400">
                          Downloaded {doc.downloadCount} time{doc.downloadCount !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-secondary text-sm">View</button>
                      <button className="btn-primary text-sm">Download</button>
                    </div>
                  </div>
                </div>
              ))}
            {mockFirmDocuments.filter(d => d.type === 'tax_return').length === 0 && (
              <div className="card text-center py-12">
                <p className="text-gray-500">No tax returns available yet.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Your tax returns will appear here once they are published.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

