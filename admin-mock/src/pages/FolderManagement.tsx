import { useState } from 'react';
import { mockEntities } from '../data/mockData';
import HelpIcon from '../components/HelpIcon';

interface Folder {
  id: string;
  name: string;
  folderType: 'system' | 'accounting' | 'custom';
  parentId: string | null;
  documentCount: number;
  clientVisible: boolean;
  staffOnly: boolean;
  adminOnly: boolean;
  superAdminOnly: boolean;
  restrictedAcl: boolean;
}

interface Document {
  id: string;
  folderId: string;
  displayName: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  version: number | null;
  sourceDocumentId: string | null;
}

const mockFolders: Folder[] = [
  {
    id: '1',
    name: 'Tax Documents',
    folderType: 'system',
    parentId: null,
    documentCount: 12,
    clientVisible: true,
    staffOnly: false,
    adminOnly: false,
    superAdminOnly: false,
    restrictedAcl: false,
  },
  {
    id: '2',
    name: 'Current Year',
    folderType: 'system',
    parentId: null,
    documentCount: 8,
    clientVisible: false,
    staffOnly: true,
    adminOnly: false,
    superAdminOnly: false,
    restrictedAcl: false,
  },
  {
    id: '3',
    name: 'Work Folder',
    folderType: 'system',
    parentId: null,
    documentCount: 5,
    clientVisible: false,
    staffOnly: true,
    adminOnly: false,
    superAdminOnly: false,
    restrictedAcl: false,
  },
  {
    id: '4',
    name: 'Accounting',
    folderType: 'accounting',
    parentId: null,
    documentCount: 20,
    clientVisible: false,
    staffOnly: true,
    adminOnly: false,
    superAdminOnly: false,
    restrictedAcl: false,
  },
  {
    id: '5',
    name: 'Admin',
    folderType: 'system',
    parentId: null,
    documentCount: 3,
    clientVisible: false,
    staffOnly: false,
    adminOnly: true,
    superAdminOnly: false,
    restrictedAcl: false,
  },
  {
    id: '6',
    name: 'Super Admin',
    folderType: 'system',
    parentId: null,
    documentCount: 2,
    clientVisible: false,
    staffOnly: false,
    adminOnly: false,
    superAdminOnly: true,
    restrictedAcl: false,
  },
];

const mockDocuments: Document[] = [
  {
    id: '1',
    folderId: '1',
    displayName: 'Engagement Letter 2023',
    fileName: 'engagement_letter_2023.pdf',
    fileSize: 245678,
    uploadedAt: '2024-01-10T09:00:00Z',
    uploadedBy: 'System',
    version: 1,
    sourceDocumentId: null,
  },
  {
    id: '2',
    folderId: '1',
    displayName: 'W-2 Form - Employer A',
    fileName: 'w2_employer_a_2023.pdf',
    fileSize: 123456,
    uploadedAt: '2024-01-15T10:30:00Z',
    uploadedBy: 'John Smith',
    version: null,
    sourceDocumentId: null,
  },
  {
    id: '3',
    folderId: '1',
    displayName: '1099-INT Bank',
    fileName: '1099_int_bank_2023.pdf',
    fileSize: 98765,
    uploadedAt: '2024-01-16T14:20:00Z',
    uploadedBy: 'John Smith',
    version: null,
    sourceDocumentId: null,
  },
  {
    id: '4',
    folderId: '2',
    displayName: 'Tax Return Draft 2023',
    fileName: 'tax_return_draft_2023.pdf',
    fileSize: 567890,
    uploadedAt: '2024-01-18T11:00:00Z',
    uploadedBy: 'Admin User',
    version: null,
    sourceDocumentId: null,
  },
];

export default function FolderManagement() {
  const [selectedEntity, setSelectedEntity] = useState('1');
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'system' | 'accounting'>('all');

  const entity = mockEntities.find(e => e.id === selectedEntity);
  const filteredFolders = mockFolders.filter(folder => {
    if (filter === 'all') return true;
    if (filter === 'system') return folder.folderType === 'system';
    if (filter === 'accounting') return folder.folderType === 'accounting';
    return true;
  });

  const folderDocuments = selectedFolder
    ? mockDocuments.filter(d => d.folderId === selectedFolder.id)
    : [];

  const getFolderTypeLabel = (type: string) => {
    switch (type) {
      case 'system': return 'System Folder';
      case 'accounting': return 'Accounting Folder';
      case 'custom': return 'Custom Folder';
      default: return type;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Folder & Document Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Organize and manage documents in system folders
          </p>
        </div>
        {selectedFolder && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary"
          >
            Upload Document
          </button>
        )}
      </div>

      {/* Entity Selection */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Entity
            </label>
            <select
              value={selectedEntity}
              onChange={(e) => {
                setSelectedEntity(e.target.value);
                setSelectedFolder(null);
              }}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {mockEntities.map(entity => (
                <option key={entity.id} value={entity.id}>
                  {entity.entityName} ({entity.taxYear})
                </option>
              ))}
            </select>
          </div>
          {entity && (
            <div className="ml-4 text-sm text-gray-600">
              <div>Bookkeeping Enabled: <span className="font-medium">{entity.bookkeepingEnabled ? 'Yes' : 'No'}</span></div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Folders List */}
        <div className="md:col-span-1">
          <div className="card mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Folders</h2>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="system">System</option>
                <option value="accounting">Accounting</option>
              </select>
            </div>
            <div className="space-y-2">
              {filteredFolders.map((folder) => (
                <div
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedFolder?.id === folder.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-sm">{folder.name}</div>
                    <span className="text-xs text-gray-500">{folder.documentCount}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-xs text-gray-500">{getFolderTypeLabel(folder.folderType)}</span>
                    {folder.clientVisible && (
                      <span className="badge badge-info text-xs">Client Visible</span>
                    )}
                    {folder.staffOnly && (
                      <span className="badge badge-warning text-xs">Staff Only</span>
                    )}
                    {folder.adminOnly && (
                      <span className="badge badge-warning text-xs">Admin Only</span>
                    )}
                    {folder.superAdminOnly && (
                      <span className="badge badge-warning text-xs">Super Admin Only</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="md:col-span-2">
          {selectedFolder ? (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">{selectedFolder.name}</h2>
                  <p className="text-sm text-gray-600">{folderDocuments.length} documents</p>
                </div>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn-primary text-sm"
                >
                  Upload Document
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Document Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Uploaded By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Uploaded
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Version
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {folderDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {doc.displayName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatFileSize(doc.fileSize)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.uploadedBy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.version ? `v${doc.version}` : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-blue-600 hover:text-blue-800 mr-2">
                            View
                          </button>
                          <button className="text-blue-600 hover:text-blue-800 mr-2">
                            Download
                          </button>
                          {doc.version && (
                            <button className="text-gray-600 hover:text-gray-800">
                              Versions
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {folderDocuments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No documents in this folder
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="text-center py-12 text-gray-500">
                Select a folder to view documents
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && selectedFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Upload Document</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Folder
                </label>
                <div className="p-2 bg-gray-50 rounded-md text-sm">
                  {selectedFolder.name}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Name
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter document name..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select File
                </label>
                <input
                  type="file"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  Documents will be stored in: <code className="text-xs">client-files/{selectedEntity}/{selectedFolder.id}/</code>
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Document uploaded successfully!');
                  setShowUploadModal(false);
                }}
                className="btn-primary"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

