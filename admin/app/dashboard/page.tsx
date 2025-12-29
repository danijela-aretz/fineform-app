'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { dashboardApi, EntityTaxYear } from '@/lib/api/dashboard'

const INTERNAL_STATUSES = [
  'INVITED',
  'ENGAGED',
  'COLLECTING_DOCS',
  'AWAITING_CONFIRMATION',
  'READY_FOR_PREP',
  'IN_PREP',
  'AWAITING_EFILE_AUTH',
  'FILED',
]

export default function DashboardPage() {
  const router = useRouter()
  const [entities, setEntities] = useState<EntityTaxYear[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    taxYear: new Date().getFullYear() - 1,
    status: '',
    extensionRequested: false,
    extensionFiled: false,
  })
  const [selectedEntity, setSelectedEntity] = useState<EntityTaxYear | null>(null)

  useEffect(() => {
    fetchEntities()
  }, [filters])

  const fetchEntities = async () => {
    try {
      setLoading(true)
      const data = await dashboardApi.getList(filters)
      setEntities(data)
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login')
      } else {
        alert(error.response?.data?.message || 'Failed to load dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (entityId: string, newStatus: string) => {
    if (!confirm(`Change status to ${newStatus}?`)) {
      return
    }

    try {
      const allowSoftWarnings = confirm(
        'Allow soft warnings (proceed even if not Ready for Prep)?'
      )
      await dashboardApi.transitionStatus(entityId, newStatus, undefined, allowSoftWarnings)
      await fetchEntities()
      if (selectedEntity?.id === entityId) {
        const updated = await dashboardApi.getDetail(entityId)
        setSelectedEntity(updated)
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to change status')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      INVITED: 'bg-gray-100 text-gray-800',
      ENGAGED: 'bg-blue-100 text-blue-800',
      COLLECTING_DOCS: 'bg-yellow-100 text-yellow-800',
      AWAITING_CONFIRMATION: 'bg-orange-100 text-orange-800',
      READY_FOR_PREP: 'bg-green-100 text-green-800',
      IN_PREP: 'bg-purple-100 text-purple-800',
      AWAITING_EFILE_AUTH: 'bg-indigo-100 text-indigo-800',
      FILED: 'bg-gray-200 text-gray-900',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Internal Dashboard</h1>

        {entities.length === 0 && !loading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-yellow-800">
              No entity tax years found. You may need to:
              <ul className="list-disc list-inside mt-2 ml-4">
                <li>Create client entities in the database</li>
                <li>Queue entities for invites using the <Link href="/invites" className="underline">Invites page</Link></li>
                <li>Adjust the tax year filter (currently: {filters.taxYear})</li>
              </ul>
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax Year</label>
              <input
                type="number"
                value={filters.taxYear}
                onChange={(e) => setFilters({ ...filters, taxYear: parseInt(e.target.value) })}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
              >
                <option value="">All Statuses</option>
                {INTERNAL_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.extensionRequested}
                  onChange={(e) =>
                    setFilters({ ...filters, extensionRequested: e.target.checked })
                  }
                  className="mr-2"
                />
                Extension Requested
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.extensionFiled}
                  onChange={(e) => setFilters({ ...filters, extensionFiled: e.target.checked })}
                  className="mr-2"
                />
                Extension Filed
              </label>
            </div>
          </div>
        </div>

        {/* Entity List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tax Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Extension
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entities.map((entity) => (
                  <tr key={entity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {entity.clientEntity.entityName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {entity.clientEntity.account.displayName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entity.taxYear}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          entity.internalStatus
                        )}`}
                      >
                        {formatStatus(entity.internalStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entity.extensionFiled ? (
                        <span className="text-green-600">
                          Filed
                          {entity.extendedDueDate &&
                            ` (Due ${new Date(entity.extendedDueDate).toLocaleDateString()})`}
                        </span>
                      ) : entity.extensionRequested ? (
                        <span className="text-yellow-600">Requested</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedEntity(entity)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Entity Detail Modal */}
        {selectedEntity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">
                    {selectedEntity.clientEntity.entityName} - {selectedEntity.taxYear}
                  </h2>
                  <button
                    onClick={() => setSelectedEntity(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                {/* Blocking Indicators */}
                {selectedEntity.blockingReasons && selectedEntity.blockingReasons.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-red-800 mb-2">Blocking Reasons:</h3>
                    <ul className="list-disc list-inside text-red-700">
                      {selectedEntity.blockingReasons.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Status Transition */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Change Status
                  </label>
                  <div className="flex gap-2">
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          handleStatusChange(selectedEntity.id, e.target.value)
                          e.target.value = ''
                        }
                      }}
                      className="border border-gray-300 rounded-md px-3 py-2 flex-1"
                    >
                      <option value="">Select new status...</option>
                      {INTERNAL_STATUSES.filter((s) => s !== selectedEntity.internalStatus).map(
                        (status) => (
                          <option key={status} value={status}>
                            {formatStatus(status)}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                {/* Current Status */}
                <div className="mb-4">
                  <div className="text-sm text-gray-600">Current Status:</div>
                  <div className="text-lg font-semibold">
                    {formatStatus(selectedEntity.internalStatus)}
                  </div>
                </div>

                {/* Extension Info */}
                {selectedEntity.extensionRequested && (
                  <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
                    <div className="text-sm font-semibold text-yellow-800">Extension</div>
                    <div className="text-sm text-yellow-700">
                      {selectedEntity.extensionFiled
                        ? `Filed - Due ${selectedEntity.extendedDueDate ? new Date(selectedEntity.extendedDueDate).toLocaleDateString() : 'N/A'}`
                        : 'Requested (not yet filed)'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
