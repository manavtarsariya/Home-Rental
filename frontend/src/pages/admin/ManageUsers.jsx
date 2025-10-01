import React, { useState, useEffect, useCallback } from 'react'
import { adminService } from '../../services/adminService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  UsersIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const ManageUsers = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const filterUsers = useCallback(() => {
    let filtered = users

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.contactNumber && user.contactNumber.includes(searchTerm))
      )
    }

    // Role filter
    if (roleFilter !== 'All') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Status filter
    if (statusFilter !== 'All') {
      if (statusFilter === 'Active') {
        filtered = filtered.filter(user => user.isActive)
      } else {
        filtered = filtered.filter(user => !user.isActive)
      }
    }

    // Sort by most recent first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter, statusFilter])

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [filterUsers])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await adminService.getUsers()
      setUsers(response.data || [])
    } catch (error) {
      toast.error('Failed to load users')
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error fetching users:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUserStatus = async (userId, isActive) => {
    try {
      setActionLoading(true)
      await adminService.updateUserStatus(userId, { isActive })
      
      const action = isActive ? 'activated' : 'deactivated'
      toast.success(`User ${action} successfully`)
      fetchUsers()
    } catch (error) {
      toast.error('Failed to update user status')
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error updating user status:', error)
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      setActionLoading(true)
      await adminService.deleteUser(userId)
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error) {
      toast.error('Failed to delete user')
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error deleting user:', error)
      }
    } finally {
      setActionLoading(false)
    }
  }

  const getRoleBadge = (role) => {
    const badges = {
      'Admin': 'bg-red-100 text-red-800 border-red-200',
      'Owner': 'bg-blue-100 text-blue-800 border-blue-200',
      'Tenant': 'bg-green-100 text-green-800 border-green-200'
    }
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${badges[role] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {role === 'Admin' && <ShieldCheckIcon className="w-3 h-3 mr-1" />}
        {role}
      </span>
    )
  }

  const getStatusBadge = (isActive) => {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    )
  }

  const UserDetailModal = ({ user, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">User Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* User Avatar and Basic Info */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <img
              className="h-16 w-16 rounded-full object-cover"
              src={user.profileImage?.startsWith('http') 
                ? user.profileImage 
                : user.profileImage 
                  ? `/uploads/profiles/${user.profileImage}`
                  : 'https://via.placeholder.com/64x64?text=U'
              }
              alt={user.name}
            />
            <div>
              <h4 className="text-lg font-medium text-gray-900">{user.name}</h4>
              <div className="flex items-center space-x-2 mt-1">
                {getRoleBadge(user.role)}
                {getStatusBadge(user.isActive)}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <EnvelopeIcon className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">{user.email}</span>
              </div>
              {user.contactNumber && (
                <div className="flex items-center">
                  <PhoneIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{user.contactNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Address Information */}
          {user.address && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Address</h4>
              <div className="text-sm text-gray-600">
                {user.address.street && <p>{user.address.street}</p>}
                <p>
                  {user.address.city && `${user.address.city}, `}
                  {user.address.state && `${user.address.state} `}
                  {user.address.zipCode && user.address.zipCode}
                </p>
                {user.address.country && <p>{user.address.country}</p>}
              </div>
            </div>
          )}

          {/* Account Information */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Account Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Member Since</p>
                <p className="font-medium text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Last Updated</p>
                <p className="font-medium text-gray-900">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </p>
              </div>
              {user.lastLogin && (
                <div>
                  <p className="text-gray-500">Last Login</p>
                  <p className="font-medium text-gray-900">
                    {new Date(user.lastLogin).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => handleUpdateUserStatus(user._id, !user.isActive)}
            disabled={actionLoading}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              user.isActive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            } disabled:opacity-50`}
          >
            {user.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )

  const UserCard = ({ user }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            className="h-12 w-12 rounded-full object-cover"
            src={user.profileImage?.startsWith('http') 
              ? user.profileImage 
              : user.profileImage 
                ? `/uploads/profiles/${user.profileImage}`
                : 'https://via.placeholder.com/48x48?text=U'
            }
            alt={user.name}
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {getRoleBadge(user.role)}
          {getStatusBadge(user.isActive)}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {user.contactNumber && (
          <div className="flex items-center text-sm text-gray-600">
            <PhoneIcon className="w-4 h-4 mr-2" />
            <span>{user.contactNumber}</span>
          </div>
        )}
        <div className="flex items-center text-sm text-gray-600">
          <CalendarIcon className="w-4 h-4 mr-2" />
          <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          onClick={() => {
            setSelectedUser(user)
            setShowUserModal(true)
          }}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          title="View Details"
        >
          <EyeIcon className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => handleUpdateUserStatus(user._id, !user.isActive)}
          disabled={actionLoading}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            user.isActive
              ? 'text-gray-600 hover:text-red-600 hover:bg-gray-100'
              : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
          }`}
          title={user.isActive ? 'Deactivate User' : 'Activate User'}
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        
        {user.role !== 'Admin' && (
          <button
            onClick={() => handleDeleteUser(user._id)}
            disabled={actionLoading}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Delete User"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading users..." />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
        <p className="text-gray-600 mt-2">View and manage all platform users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Owners</p>
          <p className="text-2xl font-bold text-blue-600">
            {users.filter(u => u.role === 'Owner').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Tenants</p>
          <p className="text-2xl font-bold text-green-600">
            {users.filter(u => u.role === 'Tenant').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Active Users</p>
          <p className="text-2xl font-bold text-purple-600">
            {users.filter(u => u.isActive).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className='text-black text-sm'>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-5 text-sm py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Owner">Owner</option>
              <option value="Tenant">Tenant</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className='text-black'>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-5 text-sm py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <UserCard key={user._id} user={user} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {users.length === 0 ? 'No users found' : 'No matching users found'}
          </h3>
          <p className="text-gray-600">
            {users.length === 0 
              ? 'No users have registered yet' 
              : 'Try adjusting your search criteria'
            }
          </p>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => {
            setShowUserModal(false)
            setSelectedUser(null)
          }}
        />
      )}
    </div>
  )
}

export default ManageUsers
