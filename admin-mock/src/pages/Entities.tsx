import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockEntities, mockAccounts } from '../data/mockData';
import HelpIcon from '../components/HelpIcon';

const ENTITY_TYPES = [
  'HOUSEHOLD_1040',
  'LLC',
  'S_CORP',
  'C_CORP',
  'PARTNERSHIP',
  'SOLE_PROPRIETORSHIP',
  'TRUST',
  'ESTATE',
  'OTHER',
] as const;

const FILING_STATUSES = ['single', 'mfj', 'mfs', 'hoh', 'qss'] as const;

export default function Entities() {
  const [entities, setEntities] = useState(mockEntities);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntity, setEditingEntity] = useState<typeof mockEntities[0] | null>(null);
  const [formData, setFormData] = useState({
    accountId: '',
    entityName: '',
    entityType: 'HOUSEHOLD_1040' as typeof ENTITY_TYPES[number],
    filingStatus: '' as typeof FILING_STATUSES[number] | '',
    isRestricted: false,
    active: true,
    bookkeepingEnabled: false,
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEntities = entities.filter(entity =>
    entity.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entity.accountName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    if (!formData.entityName.trim() || !formData.accountId) return;
    const account = mockAccounts.find(a => a.id === formData.accountId);
    const newEntity = {
      id: String(entities.length + 1),
      accountId: formData.accountId,
      accountName: account?.displayName || '',
      entityName: formData.entityName,
      entityType: formData.entityType,
      taxYear: 2023,
      status: 'not_started',
      readyForPrep: false,
      extensionRequested: false,
      extensionFiled: false,
    };
    setEntities([...entities, newEntity]);
    setFormData({
      accountId: '',
      entityName: '',
      entityType: 'HOUSEHOLD_1040',
      filingStatus: '',
      isRestricted: false,
      active: true,
      bookkeepingEnabled: false,
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
    });
    setShowCreateModal(false);
  };

  const handleEdit = (entity: typeof mockEntities[0]) => {
    setEditingEntity(entity);
    setFormData({
      accountId: entity.accountId,
      entityName: entity.entityName,
      entityType: entity.entityType as typeof ENTITY_TYPES[number],
      filingStatus: '' as typeof FILING_STATUSES[number] | '',
      isRestricted: false,
      active: true,
      bookkeepingEnabled: false,
      streetAddress: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    });
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    if (!editingEntity || !formData.entityName.trim()) return;
    const account = mockAccounts.find(a => a.id === formData.accountId);
    setEntities(entities.map(e =>
      e.id === editingEntity.id
        ? {
            ...e,
            accountId: formData.accountId,
            accountName: account?.displayName || e.accountName,
            entityName: formData.entityName,
            entityType: formData.entityType,
          }
        : e
    ));
    setShowEditModal(false);
    setEditingEntity(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this entity? This will also delete all associated tax years and documents.')) {
      return;
    }
    setEntities(entities.filter(e => e.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Entities</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage client entities (tax filing units)
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          Create Entity
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search entities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option>All Types</option>
            {ENTITY_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Entities List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tax Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntities.map((entity) => (
                <tr key={entity.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/entities/${entity.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      {entity.entityName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entity.accountName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entity.entityType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entity.taxYear}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="badge badge-info">{entity.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(entity)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entity.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Entity</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account *
                </label>
                <select
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select account</option>
                  {mockAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entity Name *
                </label>
                <input
                  type="text"
                  value={formData.entityName}
                  onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter entity name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entity Type *
                </label>
                <select
                  value={formData.entityType}
                  onChange={(e) => setFormData({ ...formData, entityType: e.target.value as typeof ENTITY_TYPES[number] })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  {ENTITY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              {formData.entityType === 'HOUSEHOLD_1040' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filing Status
                  </label>
                  <select
                    value={formData.filingStatus}
                    onChange={(e) => setFormData({ ...formData, filingStatus: e.target.value as typeof FILING_STATUSES[number] })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select filing status</option>
                    {FILING_STATUSES.map(status => (
                      <option key={status} value={status}>{status.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isRestricted}
                    onChange={(e) => setFormData({ ...formData, isRestricted: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Restricted Client</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.bookkeepingEnabled}
                    onChange={(e) => setFormData({ ...formData, bookkeepingEnabled: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Bookkeeping Enabled</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({
                    accountId: '',
                    entityName: '',
                    entityType: 'HOUSEHOLD_1040',
                    filingStatus: '',
                    isRestricted: false,
                    active: true,
                    bookkeepingEnabled: false,
                    streetAddress: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: 'USA',
                  });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleCreate} className="btn-primary">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingEntity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Entity</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account *
                </label>
                <select
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select account</option>
                  {mockAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entity Name *
                </label>
                <input
                  type="text"
                  value={formData.entityName}
                  onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entity Type *
                </label>
                <select
                  value={formData.entityType}
                  onChange={(e) => setFormData({ ...formData, entityType: e.target.value as typeof ENTITY_TYPES[number] })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  {ENTITY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              {formData.entityType === 'HOUSEHOLD_1040' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filing Status
                  </label>
                  <select
                    value={formData.filingStatus}
                    onChange={(e) => setFormData({ ...formData, filingStatus: e.target.value as typeof FILING_STATUSES[number] })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select filing status</option>
                    {FILING_STATUSES.map(status => (
                      <option key={status} value={status}>{status.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isRestricted}
                    onChange={(e) => setFormData({ ...formData, isRestricted: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Restricted Client</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.bookkeepingEnabled}
                    onChange={(e) => setFormData({ ...formData, bookkeepingEnabled: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Bookkeeping Enabled</span>
                </label>
              </div>
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Address</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.streetAddress}
                      onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="123 Main St"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="NY"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="10001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="USA"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEntity(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleUpdate} className="btn-primary">
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

