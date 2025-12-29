'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api/client'
import { invitesApi, InviteQueueItem } from '@/lib/api/invites'

export default function InvitesPage() {
  const router = useRouter()
  const [queue, setQueue] = useState<InviteQueueItem[]>([])
  const [entities, setEntities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEntities, setSelectedEntities] = useState<string[]>([])
  const [taxYear, setTaxYear] = useState(new Date().getFullYear() - 1) // Previous year
  const [filterStatus, setFilterStatus] = useState<string>('')

  useEffect(() => {
    fetchEntities()
    fetchQueue()
  }, [filterStatus, taxYear])

  const fetchEntities = async () => {
    try {
      const response = await apiClient.get('/entities')
      setEntities(response.data)
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login')
      }
    }
  }

  const fetchQueue = async () => {
    try {
      const data = await invitesApi.getQueue(filterStatus || undefined, taxYear)
      setQueue(data)
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleQueueEntities = async () => {
    if (selectedEntities.length === 0) {
      alert('Please select at least one entity')
      return
    }

    try {
      await invitesApi.queueEntities(selectedEntities, taxYear)
      setSelectedEntities([])
      fetchQueue()
      fetchEntities()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to queue entities')
    }
  }

  const handleSendWave = async () => {
    const queuedItems = queue.filter((item) => item.inviteStatus === 'QUEUED')
    
    if (queuedItems.length === 0) {
      alert('No queued entities to send')
      return
    }

    if (!confirm(`Send invites to ${queuedItems.length} entities?`)) {
      return
    }

    try {
      const entityTaxYearIds = queuedItems.map((item) => item.id)
      await invitesApi.sendWave(entityTaxYearIds)
      fetchQueue()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send invites')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'bg-green-100 text-green-800'
      case 'QUEUED':
        return 'bg-yellow-100 text-yellow-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tax Season Invite Queue</h1>

        {/* Queue New Entities */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Queue Entities for Invite</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Tax Year
            </label>
            <input
              type="number"
              value={taxYear}
              onChange={(e) => setTaxYear(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Select Entities
            </label>
            <div className="border border-gray-300 rounded-md max-h-60 overflow-y-auto">
              {entities.map((entity) => (
                <label key={entity.id} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedEntities.includes(entity.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEntities([...selectedEntities, entity.id])
                      } else {
                        setSelectedEntities(selectedEntities.filter((id) => id !== entity.id))
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-gray-900 font-medium">{entity.entityName} <span className="text-gray-600 font-normal">({entity.entityType})</span></span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleQueueEntities}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium"
          >
            Queue Selected Entities
          </button>
        </div>

        {/* Queue Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Invite Queue</h2>
            
            <div className="flex gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
              >
                <option value="" className="text-gray-500">All Statuses</option>
                <option value="QUEUED" className="text-gray-900">Queued</option>
                <option value="SENT" className="text-gray-900">Sent</option>
                <option value="FAILED" className="text-gray-900">Failed</option>
              </select>

              {queue.filter((item) => item.inviteStatus === 'QUEUED').length > 0 && (
                <button
                  onClick={handleSendWave}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Send Wave ({queue.filter((item) => item.inviteStatus === 'QUEUED').length})
                </button>
              )}
            </div>
          </div>

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
                    Sent At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Attempts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Error
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {queue.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.clientEntity.entityName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.clientEntity.account.displayName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.taxYear}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.inviteStatus)}`}>
                        {item.inviteStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.inviteSentAt
                        ? new Date(item.inviteSentAt).toLocaleString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.attemptCount}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600">
                      {item.lastError || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

