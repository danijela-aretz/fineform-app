import { useState } from 'react';
import HelpIcon from '../components/HelpIcon';

interface ChecklistItem {
  id: string;
  itemName: string;
  description?: string;
  status: 'pending' | 'received' | 'n_a';
  documentCount: number;
}

const mockChecklistItems: ChecklistItem[] = [
  {
    id: '1',
    itemName: 'W-2 Forms',
    description: 'All W-2 forms from employers',
    status: 'received',
    documentCount: 2,
  },
  {
    id: '2',
    itemName: '1099-INT',
    description: 'Interest income statements',
    status: 'pending',
    documentCount: 0,
  },
  {
    id: '3',
    itemName: '1099-DIV',
    description: 'Dividend income statements',
    status: 'received',
    documentCount: 1,
  },
  {
    id: '4',
    itemName: '1099-MISC',
    description: 'Miscellaneous income',
    status: 'n_a',
    documentCount: 0,
  },
];

export default function Checklist() {
  const [items, setItems] = useState(mockChecklistItems);
  const [selectedEntity, setSelectedEntity] = useState('1');
  const [showProformaUpload, setShowProformaUpload] = useState(false);

  const handleStatusChange = (id: string, newStatus: ChecklistItem['status']) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, status: newStatus } : item
    ));
  };

  const handleGenerateBaseline = () => {
    // Simulate baseline checklist generation
    alert('Baseline checklist generated for selected entity type');
  };

  const handleProformaUpload = () => {
    setShowProformaUpload(true);
  };

  // Unused state variables - kept for future implementation
  // const [proformaFile, setProformaFile] = useState<File | null>(null);
  // const [generatedItems, setGeneratedItems] = useState<ChecklistItem[]>([]);
  // const [showGeneratedReview, setShowGeneratedReview] = useState(false);

  const receivedCount = items.filter(i => i.status === 'received').length;
  const requiredCount = items.filter(i => i.status !== 'n_a').length;
  const completionPercentage = requiredCount > 0 ? (receivedCount / requiredCount) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Checklist Control</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage tax document checklists for client entities
        </p>
      </div>

      {/* Entity Selection and Actions */}
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
              <option value="1">John & Jane Smith - 1040 (2023)</option>
              <option value="2">Smith Business LLC (2023)</option>
              <option value="3">Johnson Corp (2023)</option>
            </select>
          </div>
          <div className="flex gap-2 ml-4">
            <button onClick={handleGenerateBaseline} className="btn-secondary">
              Generate Baseline
            </button>
            <button onClick={handleProformaUpload} className="btn-primary">
              Upload Proforma
            </button>
          </div>
        </div>
      </div>

      {/* Checklist Progress */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Checklist Progress</h2>
          <div className="text-sm text-gray-600">
            {receivedCount} of {requiredCount} received ({Math.round(completionPercentage)}%)
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Checklist Items</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900">{item.itemName}</h3>
                    {item.status === 'received' && (
                      <span className="badge badge-success">Received</span>
                    )}
                    {item.status === 'pending' && (
                      <span className="badge badge-warning">Pending</span>
                    )}
                    {item.status === 'n_a' && (
                      <span className="badge badge-info">N/A</span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {item.documentCount} document{item.documentCount !== 1 ? 's' : ''} uploaded
                  </p>
                </div>
                <div className="flex gap-2">
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value as ChecklistItem['status'])}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="received">Received</option>
                    <option value="n_a">Not Applicable</option>
                  </select>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    View Docs
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Proforma Upload Modal */}
      {showProformaUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Upload Proforma</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Proforma File
              </label>
              <input
                type="file"
                accept=".pdf,.xlsx,.xls"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, Excel (.xlsx, .xls)
              </p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Uploading a proforma will trigger automatic checklist generation via n8n.
                The system will parse the proforma and create checklist items based on the detected documents.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowProformaUpload(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Proforma uploaded! Checklist generation triggered.');
                  setShowProformaUpload(false);
                }}
                className="btn-primary"
              >
                Upload & Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

