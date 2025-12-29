import { useParams, Link } from 'react-router-dom';
import { mockEntities } from '../../data/mockData';
import ClientViewBanner from '../../components/ClientViewBanner';
import HelpIcon from '../../components/HelpIcon';

interface Document {
  id: string;
  displayName: string;
  type: string;
  folderName: string;
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  version?: number;
}

const mockDocuments: Document[] = [
  {
    id: '1',
    displayName: 'W-2 Form 2023.pdf',
    type: 'regular',
    folderName: 'Tax Documents',
    uploadedBy: 'John Smith',
    uploadedAt: '2024-01-15T10:00:00Z',
    size: '245 KB',
  },
  {
    id: '2',
    displayName: '1099-INT 2023.pdf',
    type: 'regular',
    folderName: 'Tax Documents',
    uploadedBy: 'John Smith',
    uploadedAt: '2024-01-16T14:30:00Z',
    size: '189 KB',
  },
  {
    id: '3',
    displayName: 'Engagement Letter - Signed.pdf',
    type: 'engagement_letter',
    folderName: 'Tax Documents',
    uploadedBy: 'System',
    uploadedAt: '2024-01-10T09:00:00Z',
    size: '156 KB',
    version: 1,
  },
];

export default function ClientDocuments() {
  const { id } = useParams<{ id: string }>();
  const entity = mockEntities.find(e => e.id === id);

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

  const getDocumentTypeBadge = (type: string) => {
    switch (type) {
      case 'engagement_letter':
        return <span className="badge badge-info">Engagement Letter</span>;
      case 'tax_return':
        return <span className="badge badge-success">Tax Return</span>;
      case 'notice':
        return <span className="badge badge-warning">Notice</span>;
      default:
        return <span className="badge badge-info">Document</span>;
    }
  };

  return (
    <>
      <ClientViewBanner />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <HelpIcon />
      <div className="mb-6">
        <Link to={`/clients/${id}`} className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
          ← Back to Client
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
        <p className="mt-2 text-sm text-gray-600">
          {entity.entityName} • {entity.taxYear}
        </p>
      </div>

      {/* Folder Navigation */}
      <div className="card mb-6">
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium">
            Tax Documents
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300">
            Current Year
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300">
            Work Folder
          </button>
        </div>
      </div>

      {/* Documents List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Tax Documents Folder</h2>
          <button className="btn-primary text-sm">Upload Document</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Document Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Uploaded By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Uploaded At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doc.displayName}</div>
                        {doc.version && (
                          <div className="text-xs text-gray-500">Version {doc.version}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getDocumentTypeBadge(doc.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doc.uploadedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doc.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">Download</button>
                    <button className="text-gray-600 hover:text-gray-800">View</button>
                    {doc.type === 'engagement_letter' && (
                      <button className="text-gray-600 hover:text-gray-800">View History</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
}

