import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockAccounts } from '../data/mockData';
import HelpIcon from '../components/HelpIcon';

export default function Accounts() {
  const [accounts, setAccounts] = useState(mockAccounts);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<typeof mockAccounts[0] | null>(null);
  const [formData, setFormData] = useState({ displayName: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAccounts = accounts.filter(account =>
    account.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    if (!formData.displayName.trim()) return;
    const newAccount = {
      id: String(accounts.length + 1),
      displayName: formData.displayName,
      createdAt: new Date().toISOString(),
      entityCount: 0,
    };
    setAccounts([...accounts, newAccount]);
    setFormData({ displayName: '' });
    setShowCreateModal(false);
  };

  const handleEdit = (account: typeof mockAccounts[0]) => {
    setEditingAccount(account);
    setFormData({ displayName: account.displayName });
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    if (!editingAccount || !formData.displayName.trim()) return;
    setAccounts(accounts.map(a => 
      a.id === editingAccount.id 
        ? { ...a, displayName: formData.displayName }
        : a
    ));
    setShowEditModal(false);
    setEditingAccount(null);
    setFormData({ displayName: '' });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this account? This will also delete all associated entities.')) {
      return;
    }
    setAccounts(accounts.filter(a => a.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage client accounts (households/organizations)
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              const csv = [
                ['Display Name', 'Entity Count', 'Created At'].join(','),
                ...accounts.map(a => [
                  a.displayName,
                  a.entityCount,
                  a.createdAt,
                ].join(',')),
              ].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `accounts-export-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
            }}
            className="btn-secondary"
          >
            Export CSV
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create Account
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <input
          type="text"
          placeholder="Search accounts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      {/* Accounts List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Display Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entities
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/accounts/${account.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      {account.displayName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {account.entityCount} entities
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(account.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(account)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
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
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create Account</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name *
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ displayName: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Enter account name"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({ displayName: '' });
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
      {showEditModal && editingAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Account</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name *
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ displayName: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingAccount(null);
                  setFormData({ displayName: '' });
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

