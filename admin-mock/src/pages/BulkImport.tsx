import { useState } from 'react';
import HelpIcon from '../components/HelpIcon';

interface ImportMapping {
  csvColumn: string;
  dbField: string;
}

const availableFields = [
  { value: 'account_display_name', label: 'Account Display Name' },
  { value: 'user_email', label: 'User Email' },
  { value: 'user_full_name', label: 'User Full Name' },
  { value: 'client_role', label: 'Client Role (primary_taxpayer, spouse, member, authorized_rep)' },
  { value: 'entity_name', label: 'Entity Name' },
  { value: 'entity_type', label: 'Entity Type' },
  { value: 'filing_status', label: 'Filing Status (single, mfj, mfs, hoh, qss)' },
  { value: 'is_restricted', label: 'Is Restricted (true/false)' },
  { value: 'bookkeeping_enabled', label: 'Bookkeeping Enabled (true/false)' },
  { value: 'street_address', label: 'Street Address' },
  { value: 'city', label: 'City' },
  { value: 'state', label: 'State' },
  { value: 'zip_code', label: 'ZIP Code' },
  { value: 'country', label: 'Country' },
];

const mockCsvColumns = [
  'Account Name',
  'Email',
  'Full Name',
  'Role',
  'Entity Name',
  'Entity Type',
  'Filing Status',
  'Address',
  'City',
  'State',
  'ZIP',
];

export default function BulkImport() {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'results'>('upload');
  const [mappings, setMappings] = useState<ImportMapping[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importResults, setImportResults] = useState<{
    total: number;
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate CSV parsing
      setPreviewData([
        {
          account_display_name: 'Smith Family',
          user_email: 'john@example.com',
          user_full_name: 'John Smith',
          client_role: 'primary_taxpayer',
          entity_name: 'John & Jane Smith - 1040',
          entity_type: 'HOUSEHOLD_1040',
          filing_status: 'mfj',
        },
        {
          account_display_name: 'Smith Family',
          user_email: 'jane@example.com',
          user_full_name: 'Jane Smith',
          client_role: 'spouse',
          entity_name: 'John & Jane Smith - 1040',
          entity_type: 'HOUSEHOLD_1040',
          filing_status: 'mfj',
        },
      ]);
      setMappings(
        mockCsvColumns.map(col => ({
          csvColumn: col,
          dbField: availableFields.find(f => f.label.toLowerCase().includes(col.toLowerCase()))?.value || '',
        }))
      );
      setStep('mapping');
    }
  };

  const handleImport = () => {
    // Simulate import
    setImportResults({
      total: previewData.length,
      success: previewData.length - 1,
      failed: 1,
      errors: ['Row 2: Invalid email format'],
    });
    setStep('results');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bulk Client Import</h1>
        <p className="mt-2 text-sm text-gray-600">
          Import existing clients from CSV file
        </p>
      </div>

      {/* Step Indicator */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${step === 'upload' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="ml-2 font-medium">Upload</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step !== 'upload' ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`flex items-center ${step === 'mapping' ? 'text-blue-600' : step === 'preview' || step === 'results' ? 'text-gray-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'mapping' || step === 'preview' || step === 'results' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="ml-2 font-medium">Mapping</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step === 'preview' || step === 'results' ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`flex items-center ${step === 'preview' ? 'text-blue-600' : step === 'results' ? 'text-gray-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'preview' || step === 'results' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="ml-2 font-medium">Preview</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step === 'results' ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`flex items-center ${step === 'results' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'results' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              4
            </div>
            <span className="ml-2 font-medium">Results</span>
          </div>
        </div>
      </div>

      {/* Upload Step */}
      {step === 'upload' && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Upload CSV File</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
            <p className="text-xs text-gray-500 mt-2">
              Supported format: CSV (comma-separated values)
            </p>
          </div>
          <div className="mb-4">
            <button className="btn-secondary text-sm">Download Template</button>
          </div>
          <div className="p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Bulk-imported clients are existing clients. No onboarding required.
              Tax Season Start invite action initiates tax-year work and makes Engagement Letter + checklist visible immediately upon login.
            </p>
          </div>
        </div>
      )}

      {/* Mapping Step */}
      {step === 'mapping' && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Map CSV Columns to Database Fields</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    CSV Column
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Database Field
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mappings.map((mapping, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {mapping.csvColumn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={mapping.dbField}
                        onChange={(e) => {
                          const newMappings = [...mappings];
                          newMappings[index].dbField = e.target.value;
                          setMappings(newMappings);
                        }}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="">Select field...</option>
                        {availableFields.map(field => (
                          <option key={field.value} value={field.value}>
                            {field.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2 justify-end mt-6">
            <button onClick={() => setStep('upload')} className="btn-secondary">
              Back
            </button>
            <button onClick={() => setStep('preview')} className="btn-primary">
              Continue to Preview
            </button>
          </div>
        </div>
      )}

      {/* Preview Step */}
      {step === 'preview' && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Preview Import Data</h2>
          <div className="mb-4 p-3 bg-yellow-50 rounded-md">
            <p className="text-sm text-yellow-800">
              Review the data below. Invalid rows will be skipped during import.
            </p>
          </div>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {row.account_display_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {row.user_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {row.user_full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {row.entity_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {row.client_role}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setStep('mapping')} className="btn-secondary">
              Back
            </button>
            <button onClick={handleImport} className="btn-primary">
              Import {previewData.length} Records
            </button>
          </div>
        </div>
      )}

      {/* Results Step */}
      {step === 'results' && importResults && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Import Results</h2>
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="text-2xl font-bold text-gray-900">{importResults.total}</div>
                <div className="text-sm text-gray-600">Total Records</div>
              </div>
              <div className="p-4 bg-green-50 rounded-md">
                <div className="text-2xl font-bold text-green-600">{importResults.success}</div>
                <div className="text-sm text-gray-600">Successfully Imported</div>
              </div>
              <div className="p-4 bg-red-50 rounded-md">
                <div className="text-2xl font-bold text-red-600">{importResults.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>
          </div>
          {importResults.errors.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Errors:</h3>
              <ul className="list-disc list-inside text-sm text-red-600">
                {importResults.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <button onClick={() => setStep('upload')} className="btn-secondary">
              Import Another File
            </button>
            <button onClick={() => window.location.href = '/clients'} className="btn-primary">
              View Clients
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

