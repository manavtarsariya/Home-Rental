import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PencilIcon,
  CalendarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

const Profile = () => {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your profile</h2>
          <Link to="/login" className="text-primary-600 hover:text-primary-500">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800'
      case 'Owner':
        return 'bg-blue-100 text-blue-800'
      case 'Tenant':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img
                className="h-20 w-20 rounded-full border-4 border-white object-cover"
                src={user.profileImage?.startsWith('http') 
                  ? user.profileImage 
                  : user.profileImage 
                    ? `/uploads/profiles/${user.profileImage}`
                    : 'https://via.placeholder.com/80x80?text=U'
                }
                alt={user.name}
              />
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              <p className="text-primary-100">{user.email}</p>
              <div className="mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                  {user.role === 'Admin' && <ShieldCheckIcon className="w-4 h-4 mr-1" />}
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <CalendarIcon className="w-4 h-4 mr-1" />
              <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <Link
              to="/profile/edit"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-gray-900 font-medium">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center">
              <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>
            </div>

            {user.contactNumber && (
              <div className="flex items-center">
                <PhoneIcon className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Contact Number</p>
                  <p className="text-gray-900 font-medium">{user.contactNumber}</p>
                </div>
              </div>
            )}

            {user.address && (
              <div className="flex items-start">
                <MapPinIcon className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <div className="text-gray-900 font-medium">
                    {user.address.street && <p>{user.address.street}</p>}
                    <p>
                      {user.address.city && `${user.address.city}, `}
                      {user.address.state && `${user.address.state} `}
                      {user.address.zipCode && user.address.zipCode}
                    </p>
                    {user.address.country && <p>{user.address.country}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Account Status</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Email Verified</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Verified
                </span>
              </div>
            </div>

            {user.lastLogin && (
              <div>
                <p className="text-sm text-gray-500">Last Login</p>
                <p className="text-gray-900 font-medium">
                  {new Date(user.lastLogin).toLocaleString()}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="text-gray-900 font-medium">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/profile/edit"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <PencilIcon className="w-5 h-5 mr-2 text-gray-600" />
            <span className="text-gray-700 font-medium">Edit Profile</span>
          </Link>

          {user.role === 'Owner' && (
            <Link
              to="/owner/properties/add"
              className="flex items-center justify-center px-4 py-3 border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 transition-colors duration-200"
            >
              <span className="font-medium">Add New Property</span>
            </Link>
          )}

          {user.role === 'Tenant' && (
            <Link
              to="/properties"
              className="flex items-center justify-center px-4 py-3 border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 transition-colors duration-200"
            >
              <span className="font-medium">Browse Properties</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
