'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { permissionsApi, StaffMember, ClientAcl, TaxPermission, StaffAssignment } from '@/lib/api/permissions'
import apiClient from '@/lib/api/client'

function PermissionsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clientEntityId = searchParams.get('clientId') || ''

  const [entities, setEntities] = useState<any[]>([])
  const [clientEntity, setClientEntity] = useState<any>(null)
  const [acl, setAcl] = useState<ClientAcl[]>([])
  const [taxPermissions, setTaxPermissions] = useState<TaxPermission[]>([])
  const [assignments, setAssignments] = useState<StaffAssignment[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [auditLog, setAuditLog] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingEntities, setLoadingEntities] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [modalType, setModalType] = useState<'acl' | 'tax' | 'assign' | null>(null)
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [selectedRole, setSelectedRole] = useState<'preparer' | 'assistant'>('preparer')

  useEffect(() => {
    fetchEntities()
  }, [])

  const fetchEntities = async () => {
    try {
      setLoadingEntities(true)
      const response = await apiClient.get('/entities')
      setEntities(response.data)
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login')
      }
    } finally {
      setLoadingEntities(false)
    }
  }

  const handleEntityChange = (entityId: string) => {
    router.push(`/permissions?clientId=${entityId}`)
  }

  useEffect(() => {
    if (clientEntityId) {
      loadData()
    }
  }, [clientEntityId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [permissions, staffList, entity, audit] = await Promise.all([
        permissionsApi.getClientPermissions(clientEntityId),
        permissionsApi.getStaff(),
        apiClient.get(`/entities/${clientEntityId}`),
        permissionsApi.getAuditLog(clientEntityId),
      ])

      setAcl(permissions.acl)
      setTaxPermissions(permissions.taxPermissions)
      setAssignments(permissions.assignments)
      setStaff(staffList)
      setClientEntity(entity.data)
      setAuditLog(audit)
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login')
      } else {
        alert(error.response?.data?.message || 'Failed to load permissions')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!selectedStaffId) {
      alert('Please select a staff member')
      return
    }

    try {
      if (modalType === 'acl') {
        await permissionsApi.addClientAcl(clientEntityId, selectedStaffId)
      } else if (modalType === 'tax') {
        await permissionsApi.grantTaxAccess(clientEntityId, selectedStaffId)
      } else if (modalType === 'assign') {
        await permissionsApi.assignStaff(clientEntityId, selectedStaffId, selectedRole)
      }
      await loadData()
      setShowAddModal(false)
      setSelectedStaffId('')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add permission')
    }
  }

  const handleRemove = async (type: 'acl' | 'tax' | 'assign', staffUserId: string) => {
    if (!confirm('Are you sure you want to remove this permission?')) {
      return
    }

    try {
      if (type === 'acl') {
        await permissionsApi.removeClientAcl(clientEntityId, staffUserId)
      } else if (type === 'tax') {
        await permissionsApi.revokeTaxAccess(clientEntityId, staffUserId)
      } else if (type === 'assign') {
        await permissionsApi.unassignStaff(clientEntityId, staffUserId)
      }
      await loadData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to remove permission')
    }
  }

  if (!clientEntityId) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Permissions & Assignments</h1>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Client Entity</h2>
            {loadingEntities ? (
              <div className="text-gray-600">Loading entities...</div>
            ) : entities.length === 0 ? (
              <div className="text-gray-600">
                <p className="mb-4">No entities found. Please create entities first.</p>
                <a href="/entities" className="text-indigo-600 hover:text-indigo-900 underline">
                  Go to Entities page
                </a>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Choose an entity to manage permissions:
                </label>
                <select
                  value=""
                  onChange={(e) => handleEntityChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                >
                  <option value="" className="text-gray-500">Select an entity...</option>
                  {entities.map((entity) => (
                    <option key={entity.id} value={entity.id} className="text-gray-900">
                      {entity.entityName} ({entity.entityType}) - {entity.account?.displayName || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
    )
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Permissions & Assignments - {clientEntity?.entityName}
          </h1>
          <div className="bg-white rounded-lg shadow p-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Change Entity:
            </label>
            <select
              value={clientEntityId}
              onChange={(e) => handleEntityChange(e.target.value)}
              className="w-full md:w-96 border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
            >
              {entities.map((entity) => (
                <option key={entity.id} value={entity.id} className="text-gray-900">
                  {entity.entityName} ({entity.entityType}) - {entity.account?.displayName || 'N/A'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Restricted Client ACL */}
        {clientEntity?.isRestricted && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Restricted Client ACL</h2>
              <button
                onClick={() => {
                  setModalType('acl')
                  setShowAddModal(true)
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Add Staff
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Staff Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {acl.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {entry.staff.profile.fullName}
                        </div>
                        <div className="text-sm text-gray-500">{entry.staff.profile.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleRemove('acl', entry.staffUserId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tax Access Permissions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Tax Access Permissions</h2>
            <button
              onClick={() => {
                setModalType('tax')
                setShowAddModal(true)
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Grant Access
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {taxPermissions.map((perm) => (
                  <tr key={perm.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {perm.staff.profile.fullName}
                      </div>
                      <div className="text-sm text-gray-500">{perm.staff.profile.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          perm.canSeeTaxes
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {perm.canSeeTaxes ? 'Granted' : 'Not Granted'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {perm.canSeeTaxes && (
                        <button
                          onClick={() => handleRemove('tax', perm.staffUserId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Staff Assignments */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Staff Assignments</h2>
            <button
              onClick={() => {
                setModalType('assign')
                setShowAddModal(true)
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Assign Staff
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments
                  .filter((a) => a.active)
                  .map((assignment) => (
                    <tr key={assignment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {assignment.staff.profile.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {assignment.staff.profile.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {assignment.roleOnClient}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            assignment.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {assignment.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleRemove('assign', assignment.staffUserId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Unassign
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Permission Audit Log</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Staff
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Changed By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLog.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.changeType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.staff?.profile?.fullName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.staff?.profile?.fullName || 'System'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {entry.newValue ? JSON.parse(entry.newValue).action : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-xl font-bold mb-4">
                {modalType === 'acl'
                  ? 'Add to ACL'
                  : modalType === 'tax'
                    ? 'Grant Tax Access'
                    : 'Assign Staff'}
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Staff Member
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-900 bg-white"
                >
                  <option value="" className="text-gray-500">Select staff member...</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.userId} className="text-gray-900">
                      {s.profile.fullName} ({s.staffRole})
                    </option>
                  ))}
                </select>
              </div>

              {modalType === 'assign' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as 'preparer' | 'assistant')}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-900 bg-white"
                  >
                    <option value="preparer" className="text-gray-900">Preparer</option>
                    <option value="assistant" className="text-gray-900">Assistant</option>
                  </select>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setSelectedStaffId('')
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PermissionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PermissionsContent />
    </Suspense>
  )
}

