import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  HomeIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  UserGroupIcon,
  StarIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

const Sidebar = () => {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return null

  // ✅ Only exact match (no .startsWith)
  const isActive = (path) => {
    return location.pathname === path
  }

  const getLinkClass = (path) => {
    return `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      isActive(path)
        ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`
  }

  const getMenuItems = () => {
    switch (user.role) {
      case 'Admin':
        return [
          { icon: HomeIcon, label: 'Dashboard', path: '/admin/dashboard' },
          { icon: UserGroupIcon, label: 'Manage Users', path: '/admin/users' },
          { icon: BuildingOfficeIcon, label: 'Manage Properties', path: '/admin/properties' },
          { icon: CalendarIcon, label: 'Manage Bookings', path: '/admin/bookings' },
          // { icon: ChartBarIcon, label: 'Analytics', path: '/admin/analytics' },
        ]
      
      case 'Owner':
        return [
          { icon: HomeIcon, label: 'Dashboard', path: '/owner/dashboard' },
          { icon: BuildingOfficeIcon, label: 'My Properties', path: '/owner/properties' },
          { icon: PlusIcon, label: 'Add Property', path: '/owner/properties/add' },
          { icon: CalendarIcon, label: 'Bookings', path: '/owner/bookings' },
          // { icon: CurrencyRupeeIcon, label: 'Payments', path: '/owner/payments' },
          // { icon: ChartBarIcon, label: 'Analytics', path: '/owner/analytics' },
        ]
      
      case 'Tenant':
        return [
          { icon: HomeIcon, label: 'Dashboard', path: '/tenant/dashboard' },
          { icon: EyeIcon, label: 'Browse Properties', path: '/properties' },
          { icon: CalendarIcon, label: 'My Bookings', path: '/tenant/bookings' },
          // { icon: CurrencyRupeeIcon, label: 'My Payments', path: '/tenant/payments' },
          { icon: StarIcon, label: 'My Reviews', path: '/tenant/feedback' },
        ]
      
      default:
        return []
    }
  }

  const menuItems = getMenuItems()

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <div className="flex flex-col h-full">
        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={user.profileImage?.startsWith('http') 
                ? user.profileImage 
                : user.profileImage 
                  ? `/uploads/profiles/${user.profileImage}`
                  : 'https://via.placeholder.com/40x40?text=U'
              }
              alt={user.name}
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={getLinkClass(item.path)}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Settings */}
        <div className="p-4 border-t border-gray-200">
          <Link
            to="/profile"
            className={getLinkClass('/profile')}
          >
            <Cog6ToothIcon className="h-5 w-5 mr-3" />
            Settings
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
