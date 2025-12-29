'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  accountsApi,
  Account,
  ClientUser,
  ClientRole,
  CreateAccountData,
  UpdateAccountData,
  AddUserToAccountData,
} from '@/lib/api/accounts'

const CLIENT_ROLES: ClientRole[] = ['ADMIN', 'ASSISTANT']

const CLIENT_ROLE_LABELS: Record<ClientRole, string> = {
  ADMIN: 'Admin',
  ASSISTANT: 'Assistant',
}

export default function AccountsPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [clientUsers, setClientUsers] = useState<ClientUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [formData, setFormData] = useState<CreateAccountData>({
    displayName: '',
  })
  const [addUserData, setAddUserData] = useState<AddUserToAccountData>({
    userId: '',
    clientRole: 'ASSISTANT',
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [accountsData, clientUsersData] = await Promise.all([
        accountsApi.getAll(),
        accountsApi.getClientUsers(),
      ])
      setAccounts(accountsData)
      setClientUsers(clientUsersData)
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login')
      } else {
        setError(error.response?.data?.message || 'Failed to load accounts')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      setError(null)
      await accountsApi.create(formData)
      setShowCreateModal(false)
      setFormData({ displayName: '' })
      await fetchData()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create account')
    }
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setFormData({ displayName: account.displayName })
    setShowEditModal(true)
  }

  const handleUpdate = async () => {
    if (!editingAccount) return

    try {
      setError(null)
      const updateData: UpdateAccountData = {
        displayName: formData.displayName,
      }
      await accountsApi.update(editingAccount.id, updateData)
      setShowEditModal(false)
      setEditingAccount(null)
      await fetchData()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update account')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      return
    }

    try {
      setError(null)
      await accountsApi.delete(id)
      await fetchData()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete account')
    }
  }

  const handleAddUser = (account: Account) => {
    setSelectedAccount(account)
    setAddUserData({ userId: '', clientRole: 'ASSISTANT' })
    setShowAddUserModal(true)
  }

  const handleAddUserSubmit = async () => {
    if (!selectedAccount) return

    try {
      setError(null)
      await accountsApi.addUser(selectedAccount.id, addUserData)
      setShowAddUserModal(false)
      setSelectedAccount(null)
      await fetchData()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to add user to account')
    }
  }

  const handleRemoveUser = async (accountId: string, userId: string) => {
    if (!confirm('Are you sure you want to remove this user from the account?')) {
      return
    }

    try {
      setError(null)
      await accountsApi.removeUser(accountId, userId)
      await fetchData()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to remove user from account')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {accounts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No accounts found. Create your first account to get started.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entities
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{account.displayName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {account.accountUsers?.length || 0} user{account.accountUsers?.length !== 1 ? 's' : ''}
                        {account.accountUsers && account.accountUsers.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {account.accountUsers.map((au) => (
                              <div key={au.id} className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">
                                  {au.profile?.fullName || 'Unknown'}
                                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                                    {CLIENT_ROLE_LABELS[au.clientRole]}
                                  </span>
                                </span>
                                <button
                                  onClick={() => handleRemoveUser(account.id, au.userId)}
                                  className="text-red-600 hover:text-red-900 text-xs ml-2"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{account.entities?.length || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(account.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleAddUser(account)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Add User
                      </button>
                      <button
                        onClick={() => handleEdit(account)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create Account</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCreateModal(false)
                      setFormData({ displayName: '' })
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    disabled={!formData.displayName}
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingAccount && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Account</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingAccount(null)
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    disabled={!formData.displayName}
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddUserModal && selectedAccount && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Add User to {selectedAccount.displayName}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                    <select
                      value={addUserData.userId}
                      onChange={(e) => setAddUserData({ ...addUserData, userId: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      required
                    >
                      <option value="" className="text-gray-500">Select a user</option>
                      {clientUsers
                        .filter(
                          (user) =>
                            !selectedAccount.accountUsers?.some((au) => au.userId === user.id)
                        )
                        .map((user) => (
                          <option key={user.id} value={user.id} className="text-gray-900">
                            {user.profile.fullName} ({user.profile.email})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={addUserData.clientRole}
                      onChange={(e) =>
                        setAddUserData({ ...addUserData, clientRole: e.target.value as ClientRole })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      required
                    >
                      {CLIENT_ROLES.map((role) => (
                        <option key={role} value={role} className="text-gray-900">
                          {CLIENT_ROLE_LABELS[role]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowAddUserModal(false)
                      setSelectedAccount(null)
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddUserSubmit}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    disabled={!addUserData.userId}
                  >
                    Add User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

