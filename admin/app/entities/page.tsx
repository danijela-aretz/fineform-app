'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { entitiesApi, ClientEntity, Account, EntityType, CreateEntityData, UpdateEntityData } from '@/lib/api/entities'

const ENTITY_TYPES: EntityType[] = [
  'HOUSEHOLD_1040',
  'LLC',
  'S_CORP',
  'C_CORP',
  'PARTNERSHIP',
  'SOLE_PROPRIETORSHIP',
  'TRUST',
  'ESTATE',
  'OTHER',
]

const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  HOUSEHOLD_1040: 'Household 1040',
  LLC: 'LLC',
  S_CORP: 'S-Corp',
  C_CORP: 'C-Corp',
  PARTNERSHIP: 'Partnership',
  SOLE_PROPRIETORSHIP: 'Sole Proprietorship',
  TRUST: 'Trust',
  ESTATE: 'Estate',
  OTHER: 'Other',
}

export default function EntitiesPage() {
  const router = useRouter()
  const [entities, setEntities] = useState<ClientEntity[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingEntity, setEditingEntity] = useState<ClientEntity | null>(null)
  const [formData, setFormData] = useState<CreateEntityData>({
    accountId: '',
    entityName: '',
    entityType: 'HOUSEHOLD_1040',
    status: '',
    isRestricted: false,
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [entitiesData, accountsData] = await Promise.all([
        entitiesApi.getAll(),
        entitiesApi.getAccounts(),
      ])
      setEntities(entitiesData)
      setAccounts(accountsData)
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login')
      } else {
        setError(error.response?.data?.message || 'Failed to load entities')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      setError(null)
      await entitiesApi.create(formData)
      setShowCreateModal(false)
      setFormData({
        accountId: '',
        entityName: '',
        entityType: 'HOUSEHOLD_1040',
        status: '',
        isRestricted: false,
      })
      await fetchData()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create entity')
    }
  }

  const handleEdit = (entity: ClientEntity) => {
    setEditingEntity(entity)
    setFormData({
      accountId: entity.accountId,
      entityName: entity.entityName,
      entityType: entity.entityType,
      status: entity.status || '',
      isRestricted: entity.isRestricted,
    })
    setShowEditModal(true)
  }

  const handleUpdate = async () => {
    if (!editingEntity) return

    try {
      setError(null)
      const updateData: UpdateEntityData = {
        entityName: formData.entityName,
        entityType: formData.entityType,
        status: formData.status || undefined,
        isRestricted: formData.isRestricted,
      }
      await entitiesApi.update(editingEntity.id, updateData)
      setShowEditModal(false)
      setEditingEntity(null)
      await fetchData()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update entity')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entity? This action cannot be undone.')) {
      return
    }

    try {
      setError(null)
      await entitiesApi.delete(id)
      await fetchData()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete entity')
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
          <h1 className="text-3xl font-bold text-gray-900">Client Entities</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Create Entity
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {entities.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No entities found. Create your first entity to get started.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restricted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tax Years
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entities.map((entity) => (
                  <tr key={entity.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{entity.entityName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{ENTITY_TYPE_LABELS[entity.entityType]}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{entity.account?.displayName || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{entity.status || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          entity.isRestricted
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {entity.isRestricted ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {entity.entityTaxYears?.length || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(entity)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(entity.id)}
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create Entity</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                    <select
                      value={formData.accountId}
                      onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      style={{ color: '#111827' }}
                      required
                    >
                      <option value="" style={{ color: '#6b7280' }}>Select an account</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id} style={{ color: '#111827' }}>
                          {account.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Entity Name</label>
                    <input
                      type="text"
                      value={formData.entityName}
                      onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
                    <select
                      value={formData.entityType}
                      onChange={(e) => setFormData({ ...formData, entityType: e.target.value as EntityType })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      required
                    >
                      {ENTITY_TYPES.map((type) => (
                        <option key={type} value={type} className="text-gray-900">
                          {ENTITY_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status (optional)</label>
                    <input
                      type="text"
                      value={formData.status || ''}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isRestricted}
                        onChange={(e) => setFormData({ ...formData, isRestricted: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Restricted Client</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCreateModal(false)
                      setFormData({
                        accountId: '',
                        entityName: '',
                        entityType: 'HOUSEHOLD_1040',
                        status: '',
                        isRestricted: false,
                      })
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    disabled={!formData.accountId || !formData.entityName}
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingEntity && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Entity</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Entity Name</label>
                    <input
                      type="text"
                      value={formData.entityName}
                      onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
                    <select
                      value={formData.entityType}
                      onChange={(e) => setFormData({ ...formData, entityType: e.target.value as EntityType })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      required
                    >
                      {ENTITY_TYPES.map((type) => (
                        <option key={type} value={type} className="text-gray-900">
                          {ENTITY_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status (optional)</label>
                    <input
                      type="text"
                      value={formData.status || ''}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isRestricted}
                        onChange={(e) => setFormData({ ...formData, isRestricted: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Restricted Client</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingEntity(null)
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    disabled={!formData.entityName}
                  >
                    Update
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

