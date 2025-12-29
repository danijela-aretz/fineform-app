import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockEntities } from '../../data/mockData';
import HelpIcon from '../../components/HelpIcon';
import ClientViewBanner from '../../components/ClientViewBanner';

interface ChecklistItem {
  id: string;
  displayName: string;
  required: boolean;
  uploaded: boolean;
  uploadCount: number;
  documents: Array<{
    id: string;
    name: string;
    uploadedAt: string;
    size: string;
  }>;
}

const mockChecklistItems: ChecklistItem[] = [
  {
    id: '1',
    displayName: 'W-2 Forms',
    required: true,
    uploaded: true,
    uploadCount: 2,
    documents: [
      { id: '1', name: 'W-2_2023_Employer1.pdf', uploadedAt: '2024-01-15T10:00:00Z', size: '245 KB' },
      { id: '2', name: 'W-2_2023_Employer2.pdf', uploadedAt: '2024-01-15T10:05:00Z', size: '198 KB' },
    ],
  },
  {
    id: '2',
    displayName: '1099-INT (Interest Income)',
    required: false,
    uploaded: true,
    uploadCount: 1,
    documents: [
      { id: '3', name: '1099-INT_2023.pdf', uploadedAt: '2024-01-16T14:30:00Z', size: '189 KB' },
    ],
  },
  {
    id: '3',
    displayName: '1099-DIV (Dividend Income)',
    required: false,
    uploaded: false,
    uploadCount: 0,
    documents: [],
  },
  {
    id: '4',
    displayName: '1099-MISC (Miscellaneous Income)',
    required: false,
    uploaded: false,
    uploadCount: 0,
    documents: [],
  },
  {
    id: '5',
    displayName: 'Mortgage Interest Statement (1098)',
    required: false,
    uploaded: true,
    uploadCount: 1,
    documents: [
      { id: '4', name: '1098_2023.pdf', uploadedAt: '2024-01-17T09:15:00Z', size: '156 KB' },
    ],
  },
  {
    id: '6',
    displayName: 'Other Documents (not listed above)',
    required: false,
    uploaded: false,
    uploadCount: 0,
    documents: [],
  },
];

export default function ClientChecklist() {
  const { id } = useParams<{ id: string }>();
  const entity = mockEntities.find(e => e.id === id);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(mockChecklistItems);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const handleUpload = (itemId: string) => {
    setShowUploadModal(itemId);
  };

  const handleFileSelect = (itemId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      const item = checklistItems.find(i => i.id === itemId);
      if (item) {
        const newDocs = Array.from(files).map((file, idx) => ({
          id: `${itemId}-${Date.now()}-${idx}`,
          name: file.name,
          uploadedAt: new Date().toISOString(),
          size: `${(file.size / 1024).toFixed(0)} KB`,
        }));

        setChecklistItems(items =>
          items.map(i =>
            i.id === itemId
              ? {
                  ...i,
                  uploaded: true,
                  uploadCount: i.uploadCount + files.length,
                  documents: [...i.documents, ...newDocs],
                }
              : i
          )
        );
      }
      setUploading(false);
      setShowUploadModal(null);
    }, 1000);
  };

  const handleSubmit = () => {
    if (!confirm('Are you sure you have uploaded all tax documents you have for this year? You can still upload additional documents later.')) {
      return;
    }
    setIsSubmitted(true);
    alert('Checklist submitted successfully! You can still upload additional documents if needed.');
  };

  const totalItems = checklistItems.length;
  const uploadedItems = checklistItems.filter(item => item.uploaded || item.uploadCount > 0).length;

  return (
    <>
      <ClientViewBanner />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="mb-6">
          <Link to={`/clients/${id}`} className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
            ← Back to Client Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Tax Document Checklist</h1>
          <p className="mt-2 text-sm text-gray-600">
            {entity.entityName} • Tax Year {entity.taxYear}
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Progress: {uploadedItems} of {totalItems} items
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(uploadedItems / totalItems) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {checklistItems.map((item) => (
            <div key={item.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.displayName}</h3>
                    {item.required && (
                      <span className="badge badge-warning text-xs">Required</span>
                    )}
                    {item.uploaded && (
                      <span className="badge badge-success text-xs">
                        {item.uploadCount} file{item.uploadCount !== 1 ? 's' : ''} uploaded
                      </span>
                    )}
                  </div>
                  
                  {item.documents.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {item.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                              <p className="text-xs text-gray-500">
                                {doc.size} • {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleUpload(item.id)}
                  className="btn-primary ml-4 whitespace-nowrap"
                >
                  {item.uploaded ? 'Upload More' : 'Upload'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {!isSubmitted ? (
          <div className="card bg-blue-50 border-2 border-blue-200">
            <div className="text-center">
              <p className="text-gray-700 mb-4">
                Once you have uploaded all the tax documents you have for this year, click the button below.
              </p>
              <button onClick={handleSubmit} className="btn-primary text-lg px-8 py-3">
                I have uploaded all tax documents I have for this year
              </button>
              <p className="text-xs text-gray-600 mt-3">
                Note: You can still upload additional documents after submitting.
              </p>
            </div>
          </div>
        ) : (
          <div className="card bg-green-50 border-2 border-green-200">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-lg font-semibold text-green-800">Checklist Submitted</p>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Submitted on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
              <button
                onClick={() => {
                  const itemId = checklistItems[0]?.id;
                  if (itemId) handleUpload(itemId);
                }}
                className="btn-secondary"
              >
                Upload Additional Documents
              </button>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Upload Documents - {checklistItems.find(i => i.id === showUploadModal)?.displayName}
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select files (multiple files allowed)
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileSelect(showUploadModal, e.target.files)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  disabled={uploading}
                />
              </div>
              {uploading && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-blue-600">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Uploading...</span>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUploadModal(null)}
                  className="btn-secondary flex-1"
                  disabled={uploading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

