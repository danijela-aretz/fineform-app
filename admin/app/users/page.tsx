'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  usersApi,
  User,
  UserType,
  StaffRole,
  CreateUserData,
  UpdateUserData,
  UpdateStaffProfileData,
} from '@/lib/api/users'

const USER_TYPES: UserType[] = ['STAFF', 'CLIENT']

const USER_TYPE_LABELS: Record<UserType, string> = {
  STAFF: 'Staff',
  CLIENT: 'Client',
}

const STAFF_ROLES: StaffRole[] = ['SUPER_ADMIN', 'ADMIN', 'STAFF']

const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  STAFF: 'Staff',
}

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<UserType | ''>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    password: '',
    fullName: '',
    userType: 'STAFF',
    staffRole: 'STAFF',
    jobTitle: '',
    phone: '',
  })
  const [updateData, setUpdateData] = useState<
    UpdateUserData & Omit<UpdateStaffProfileData, 'active'> & { staffActive?: boolean }
  >({
    fullName: '',
    email: '',
    active: true,
    staffRole: 'STAFF',
    jobTitle: '',
    phone: '',
    staffActive: true,
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [filter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const filters = filter ? { userType: filter } : undefined
      const data = await usersApi.getAll(filters)
      setUsers(data)
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login')
      } else {
        setError(error.response?.data?.message || 'Failed to load users')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      setError(null)
      const createData: CreateUserData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        userType: formData.userType,
        ...(formData.userType === 'STAFF' && {
          staffRole: formData.staffRole,
          jobTitle: formData.jobTitle || undefined,
          phone: formData.phone || undefined,
        }),
      }
      await usersApi.create(createData)
      setShowCreateModal(false)
      setFormData({
        email: '',
        password: '',
        fullName: '',
        userType: 'STAFF',
        staffRole: 'STAFF',
        jobTitle: '',
        phone: '',
      })
      await fetchUsers()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create user')
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setUpdateData({
      fullName: user.fullName,
      email: user.email,
      active: user.active,
      ...(user.userType === 'STAFF' && {
        staffRole: user.staffRole || 'STAFF',
        jobTitle: user.jobTitle || '',
        phone: user.phone || '',
        staffActive: user.staffActive ?? true,
      }),
    })
    setShowEditModal(true)
  }

  const handleUpdate = async () => {
    if (!editingUser) return

    try {
      setError(null)
      const userUpdate: UpdateUserData = {
        fullName: updateData.fullName,
        email: updateData.email,
        active: updateData.active,
      }
      await usersApi.update(editingUser.id, userUpdate)

      // Update staff profile if user is staff
      if (editingUser.userType === 'STAFF') {
        const staffUpdate: UpdateStaffProfileData = {
          staffRole: updateData.staffRole,
          jobTitle: updateData.jobTitle || undefined,
          phone: updateData.phone || undefined,
          active: updateData.staffActive,
        }
        await usersApi.updateStaffProfile(editingUser.id, staffUpdate)
      }

      setShowEditModal(false)
      setEditingUser(null)
      await fetchUsers()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update user')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      setError(null)
      await usersApi.delete(id)
      await fetchUsers()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete user')
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
          <h1 className="text-3xl font-bold text-gray-900">Users & Staff</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Create User
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mr-4">
            Filter by Type:
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as UserType | '')}
              className="ml-2 border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
            >
              <option value="">All Users</option>
              {USER_TYPES.map((type) => (
                <option key={type} value={type} className="text-gray-900">
                  {USER_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {users.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No users found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active
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
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{USER_TYPE_LABELS[user.userType]}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.staffRole ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {STAFF_ROLE_LABELS[user.staffRole]}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.active ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create User</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                    <select
                      value={formData.userType}
                      onChange={(e) => {
                        const userType = e.target.value as UserType
                        setFormData({
                          ...formData,
                          userType,
                          staffRole: userType === 'STAFF' ? 'STAFF' : undefined,
                        })
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      required
                    >
                      {USER_TYPES.map((type) => (
                        <option key={type} value={type} className="text-gray-900">
                          {USER_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formData.userType === 'STAFF' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Staff Role
                        </label>
                        <select
                          value={formData.staffRole}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              staffRole: e.target.value as StaffRole,
                            })
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                          required
                        >
                          {STAFF_ROLES.map((role) => (
                            <option key={role} value={role} className="text-gray-900">
                              {STAFF_ROLE_LABELS[role]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Job Title (optional)
                        </label>
                        <input
                          type="text"
                          value={formData.jobTitle}
                          onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone (optional)
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCreateModal(false)
                      setFormData({
                        email: '',
                        password: '',
                        fullName: '',
                        userType: 'STAFF',
                        staffRole: 'STAFF',
                        jobTitle: '',
                        phone: '',
                      })
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    disabled={!formData.email || !formData.password || !formData.fullName}
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={updateData.fullName}
                      onChange={(e) => setUpdateData({ ...updateData, fullName: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={updateData.email}
                      onChange={(e) => setUpdateData({ ...updateData, email: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={updateData.active}
                        onChange={(e) => setUpdateData({ ...updateData, active: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                  {editingUser.userType === 'STAFF' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Staff Role
                        </label>
                        <select
                          value={updateData.staffRole}
                          onChange={(e) =>
                            setUpdateData({ ...updateData, staffRole: e.target.value as StaffRole })
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                          required
                        >
                          {STAFF_ROLES.map((role) => (
                            <option key={role} value={role} className="text-gray-900">
                              {STAFF_ROLE_LABELS[role]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Job Title (optional)
                        </label>
                        <input
                          type="text"
                          value={updateData.jobTitle || ''}
                          onChange={(e) =>
                            setUpdateData({ ...updateData, jobTitle: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone (optional)
                        </label>
                        <input
                          type="tel"
                          value={updateData.phone || ''}
                          onChange={(e) => setUpdateData({ ...updateData, phone: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingUser(null)
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    disabled={!updateData.fullName || !updateData.email}
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

