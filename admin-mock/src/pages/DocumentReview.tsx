import { useState } from 'react';
import { mockEntities } from '../data/mockData';
import HelpIcon from '../components/HelpIcon';

interface ChecklistItem {
  id: string;
  itemName: string;
  status: 'pending' | 'received' | 'n_a';
  documents: Document[];
}

interface Document {
  id: string;
  displayName: string;
  uploadedAt: string;
  uploadedBy: string;
  matched: boolean;
}

const mockChecklistItems: ChecklistItem[] = [
  {
    id: '1',
    itemName: 'W-2 Forms',
    status: 'received',
    documents: [
      {
        id: '1',
        displayName: 'W-2 2023 - Employer A.pdf',
        uploadedAt: '2024-01-15T10:00:00Z',
        uploadedBy: 'John Smith',
        matched: true,
      },
      {
        id: '2',
        displayName: 'W-2 2023 - Employer B.pdf',
        uploadedAt: '2024-01-16T14:30:00Z',
        uploadedBy: 'John Smith',
        matched: true,
      },
    ],
  },
  {
    id: '2',
    itemName: '1099-INT',
    status: 'received',
    documents: [
      {
        id: '3',
        displayName: '1099-INT Bank.pdf',
        uploadedAt: '2024-01-17T09:15:00Z',
        uploadedBy: 'John Smith',
        matched: true,
      },
    ],
  },
  {
    id: '3',
    itemName: '1099-DIV',
    status: 'pending',
    documents: [],
  },
  {
    id: '4',
    itemName: 'Other Documents',
    status: 'received',
    documents: [
      {
        id: '4',
        displayName: 'Misc Document.pdf',
        uploadedAt: '2024-01-18T11:00:00Z',
        uploadedBy: 'John Smith',
        matched: false,
      },
    ],
  },
];

export default function DocumentReview() {
  const [selectedEntity, setSelectedEntity] = useState('1');
  const [items, setItems] = useState(mockChecklistItems);
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);

  const handleMatchDocument = (itemId: string, docId: string) => {
    setItems(items.map(item =>
      item.id === itemId
        ? {
            ...item,
            documents: item.documents.map(doc =>
              doc.id === docId ? { ...doc, matched: true } : doc
            ),
          }
        : item
    ));
  };

  const handleUnmatchDocument = (itemId: string, docId: string) => {
    setItems(items.map(item =>
      item.id === itemId
        ? {
            ...item,
            documents: item.documents.map(doc =>
              doc.id === docId ? { ...doc, matched: false } : doc
            ),
          }
        : item
    ));
  };

  const entity = mockEntities.find(e => e.id === selectedEntity);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Document Review</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review and match documents to checklist items
        </p>
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
              onChange={(e) => setSelectedEntity(e.target.value)}
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
              <div>Status: <span className="font-medium">{entity.status}</span></div>
              <div>Ready for Prep: <span className="font-medium">{entity.readyForPrep ? 'Yes' : 'No'}</span></div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Checklist Items */}
        <div className="md:col-span-2">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Checklist Items</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.itemName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {item.status === 'received' && (
                          <span className="badge badge-success">Received</span>
                        )}
                        {item.status === 'pending' && (
                          <span className="badge badge-warning">Pending</span>
                        )}
                        <span className="text-xs text-gray-500">
                          {item.documents.length} document{item.documents.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Documents
                    </button>
                  </div>
                  {item.documents.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {item.documents.slice(0, 2).map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div className="flex items-center gap-2">
                            {doc.matched ? (
                              <span className="badge badge-success text-xs">Matched</span>
                            ) : (
                              <span className="badge badge-warning text-xs">Unmatched</span>
                            )}
                            <span className="text-sm text-gray-700">{doc.displayName}</span>
                          </div>
                          <button
                            onClick={() => doc.matched ? handleUnmatchDocument(item.id, doc.id) : handleMatchDocument(item.id, doc.id)}
                            className={`text-xs ${doc.matched ? 'text-orange-600' : 'text-green-600'} hover:underline`}
                          >
                            {doc.matched ? 'Unmatch' : 'Match'}
                          </button>
                        </div>
                      ))}
                      {item.documents.length > 2 && (
                        <p className="text-xs text-gray-500">
                          +{item.documents.length - 2} more document{item.documents.length - 2 !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Document Details */}
        <div className="space-y-6">
          {selectedItem ? (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{selectedItem.itemName}</h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                {selectedItem.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{doc.displayName}</span>
                      {doc.matched ? (
                        <span className="badge badge-success text-xs">Matched</span>
                      ) : (
                        <span className="badge badge-warning text-xs">Unmatched</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      By: {doc.uploadedBy}
                    </div>
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 text-xs">
                        View
                      </button>
                      <button className="text-blue-600 hover:text-blue-800 text-xs">
                        Download
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 text-xs">
                        Version History
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card">
              <p className="text-sm text-gray-500 text-center py-8">
                Select a checklist item to view documents
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

