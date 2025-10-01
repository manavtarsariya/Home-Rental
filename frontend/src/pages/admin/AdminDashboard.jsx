import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminService } from '../../services/adminService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  UsersIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    overview: {
      totalUsers: 0,
      totalProperties: 0,
      totalBookings: 0,
      totalPayments: 0,
      totalRevenue: 0,
      averagePayment: 0
    },
    usersByRole: [],
    propertiesByStatus: [],
    bookingsByStatus: [],
    recentActivities: {
      users: [],
      properties: [],
      bookings: []
    }
  })

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await adminService.getDashboardStats()
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Prepare chart data
  const userRoleData = {
    labels: stats.usersByRole.map(item => item._id),
    datasets: [
      {
        data: stats.usersByRole.map(item => item.count),
        backgroundColor: [
          '#EF4444', // Red for Admin
          '#3B82F6', // Blue for Owner  
          '#10B981', // Green for Tenant
        ],
        borderWidth: 0,
      },
    ],
  }

  const propertyStatusData = {
    labels: stats.propertiesByStatus.map(item => item._id),
    datasets: [
      {
        data: stats.propertiesByStatus.map(item => item.count),
        backgroundColor: [
          '#10B981', // Green for Approved
          '#F59E0B', // Amber for Pending
          '#EF4444', // Red for Rejected
          '#6B7280', // Gray for others
        ],
        borderWidth: 0,
      },
    ],
  }

  const bookingStatusData = {
    labels: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
    datasets: [
      {
        label: 'Bookings',
        data: [
          stats.bookingsByStatus.find(item => item._id === 'Pending')?.count || 0,
          stats.bookingsByStatus.find(item => item._id === 'Approved')?.count || 0,
          stats.bookingsByStatus.find(item => item._id === 'Rejected')?.count || 0,
          stats.bookingsByStatus.find(item => item._id === 'Cancelled')?.count || 0,
        ],
        backgroundColor: [
          '#F59E0B', // Amber for Pending
          '#10B981', // Green for Approved
          '#EF4444', // Red for Rejected
          '#6B7280', // Gray for Cancelled
        ],
        borderRadius: 4,
      },
    ],
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      case 'Rejected':
        return <XCircleIcon className="w-4 h-4 text-red-500" />
      case 'Pending':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />
      default:
        return <ClockIcon className="w-4 h-4 text-gray-500" />
    }
  }

  const getRoleBadge = (role) => {
    const badges = {
      'Admin': 'bg-red-100 text-red-800',
      'Owner': 'bg-blue-100 text-blue-800',
      'Tenant': 'bg-green-100 text-green-800'
    }
    return badges[role] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading admin dashboard..." />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor and manage the entire PropertyRent platform</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <BuildingOfficeIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview.totalProperties}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <CalendarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <CurrencyRupeeIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.overview.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Users by Role */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Users by Role</h2>
          {stats.usersByRole.length > 0 ? (
            <div className="flex items-center">
              <div className="w-32 h-32">
                <Doughnut
                  data={userRoleData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
              </div>
              <div className="ml-6 space-y-2">
                {stats.usersByRole.map((item, index) => (
                  <div key={item._id} className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      index === 0 ? 'bg-red-500' : 
                      index === 1 ? 'bg-blue-500' : 'bg-green-500'
                    }`}></div>
                    <span className="text-sm text-gray-600">{item._id} ({item.count})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-gray-500">
              No user data available
            </div>
          )}
        </div>

        {/* Properties by Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Status</h2>
          {stats.propertiesByStatus.length > 0 ? (
            <div className="flex items-center">
              <div className="w-32 h-32">
                <Doughnut
                  data={propertyStatusData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
              </div>
              <div className="ml-6 space-y-2">
                {stats.propertiesByStatus.map((item, index) => (
                  <div key={item._id} className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      item._id === 'Approved' ? 'bg-green-500' :
                      item._id === 'Pending' ? 'bg-yellow-500' :
                      item._id === 'Rejected' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-sm text-gray-600">{item._id} ({item.count})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-gray-500">
              No property data available
            </div>
          )}
        </div>

        {/* Bookings Status */}
        <div className="bg-white h-96 rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h2>
          <Bar
            data={bookingStatusData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                  },
                },
              },
            }}
            height={140}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            to="/admin/users"
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <UsersIcon className="w-8 h-8 text-gray-600 mr-2" />
            <span className="text-gray-700 font-semibold">Manage Users</span>
          </Link>
          
          <Link
            to="/admin/properties"
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <BuildingOfficeIcon className="w-8 h-8 text-gray-600 mr-2" />
            <span className="text-gray-700 font-semibold">Manage Properties</span>
          </Link>
          
          <Link
            to="/admin/bookings"
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <CalendarIcon className="w-8 h-8 text-gray-600 mr-2" />
            <span className="text-gray-700 font-semibold">Manage Bookings</span>
          </Link>
          
          <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <ChartBarIcon className="w-8 h-8 text-gray-600 mr-2" />
            <span className="text-gray-700 font-semibold">View Reports</span>
          </button>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
            <Link to="/admin/users" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {stats.recentActivities.users.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Properties */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Properties</h2>
            <Link to="/admin/properties" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {stats.recentActivities.properties.map((property) => (
              <div key={property._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 truncate">{property.title}</h3>
                  <p className="text-sm text-gray-500">{property.owner?.name}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(property.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(property.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            <Link to="/admin/bookings" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {stats.recentActivities.bookings.map((booking) => (
              <div key={booking._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{booking.tenant?.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{booking.property?.title}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(booking.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Alerts */}
      {stats.propertiesByStatus.find(item => item._id === 'Pending')?.count > 0 && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Pending Property Approvals</h3>
              <p className="mt-2 text-sm text-yellow-700">
                You have {stats.propertiesByStatus.find(item => item._id === 'Pending').count} properties waiting for approval.
              </p>
              <div className="mt-4">
                <Link
                  to="/admin/properties"
                  className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md hover:bg-yellow-200 transition-colors duration-200"
                >
                  Review Properties
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
