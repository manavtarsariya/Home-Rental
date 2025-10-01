import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { propertyService } from '../../services/propertyService'
import { bookingService } from '../../services/bookingService'
import { paymentService } from '../../services/paymentService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  BuildingOfficeIcon,
  CurrencyRupeeIcon,
  UsersIcon,
  PlusIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const OwnerDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeProperties: 0,
    pendingProperties: 0,
    totalBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  })
  const [properties, setProperties] = useState([])
  const [recentBookings, setRecentBookings] = useState([])
  const [revenueData, setRevenueData] = useState({ labels: [], datasets: [] })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch properties
      const propertiesResponse = await propertyService.getOwnerProperties()
      const propertiesData = propertiesResponse.data || []
      setProperties(propertiesData.slice(0, 5)) // Show latest 5

      // Fetch bookings
      const bookingsResponse = await bookingService.getBookings()
      const bookingsData = bookingsResponse.data || []
      setRecentBookings(bookingsData.slice(0, 5))

      // Fetch payment stats
      const paymentStats = await paymentService.getPaymentStats()
      const paymentData = paymentStats.data || {}

      // Calculate stats
      const totalProperties = propertiesData.length
      const activeProperties = propertiesData.filter(p => p.status === 'Approved' && p.isAvailable).length
      const pendingProperties = propertiesData.filter(p => p.status === 'Pending').length
      const totalBookings = bookingsData.length
      const totalRevenue = paymentData.overview?.totalRevenue || 0
      
      // Calculate this month's revenue
      const currentMonth = new Date().getMonth() + 1
      const monthlyRevenue = paymentData.monthlyRevenue?.find(m => m._id === currentMonth)?.revenue || 0

      setStats({
        totalProperties,
        activeProperties,
        pendingProperties,
        totalBookings,
        totalRevenue,
        monthlyRevenue
      })

      // Prepare revenue chart data
      if (paymentData.monthlyRevenue) {
        const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const revenueByMonth = Array(12).fill(0)
        
        paymentData.monthlyRevenue.forEach(item => {
          revenueByMonth[item._id - 1] = item.revenue
        })

        setRevenueData({
          labels,
          datasets: [
            {
              label: 'Monthly Revenue (₹)',
              data: revenueByMonth,
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              fill: true,
            },
          ],
        })
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const propertyStatusData = {
    labels: ['Active', 'Rented', 'Pending', 'Rejected'],
    datasets: [
      {
        data: [
          properties.filter(p => p.status === 'Approved' && p.isAvailable).length,
          properties.filter(p => p.status === 'Approved' && !p.isAvailable).length,
          properties.filter(p => p.status === 'Pending').length,
          properties.filter(p => p.status === 'Rejected').length,
        ],
        backgroundColor: [
          '#10B981', // Green for Active
          '#3B82F6', // Blue for Rented
          '#F59E0B', // Amber for Pending
          '#EF4444', // Red for Rejected
        ],
        borderWidth: 0,
      },
    ],
  }

  const getStatusBadge = (status, isAvailable) => {
    if (status === 'Pending') {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
    }
    if (status === 'Rejected') {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>
    }
    if (status === 'Approved' && !isAvailable) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Rented</span>
    }
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
  }

  const getBookingStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'Rejected':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-yellow-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name}! Here's your property overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-full">
              <BuildingOfficeIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <EyeIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Listings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeProperties}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <CurrencyRupeeIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.monthlyRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
            <span className="text-sm text-gray-500">2024</span>
          </div>
          {revenueData.labels.length > 0 ? (
            <Line
              data={revenueData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '₹' + value.toLocaleString()
                      }
                    }
                  },
                },
              }}
              height={100}
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No revenue data available
            </div>
          )}
        </div>

        {/* Property Status Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Status</h2>
          {properties.length > 0 ? (
            <div className="flex items-center">
              <div className="w-40 h-40">
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
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Active ({properties.filter(p => p.status === 'Approved' && p.isAvailable).length})</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Rented ({properties.filter(p => p.status === 'Approved' && !p.isAvailable).length})</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Pending ({properties.filter(p => p.status === 'Pending').length})</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Rejected ({properties.filter(p => p.status === 'Rejected').length})</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-500">
              No properties to display
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/owner/properties/add"
            className="flex items-center justify-center p-4 border-2 border-dashed border-primary-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors duration-200"
          >
            <PlusIcon className="w-8 h-8 text-primary-600 mr-2" />
            <span className="text-primary-600 font-semibold">Add New Property</span>
          </Link>
          
          <Link
            to="/owner/properties"
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <BuildingOfficeIcon className="w-8 h-8 text-gray-600 mr-2" />
            <span className="text-gray-700 font-semibold">Manage Properties</span>
          </Link>
          
          <Link
            to="/owner/bookings"
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <UsersIcon className="w-8 h-8 text-gray-600 mr-2" />
            <span className="text-gray-700 font-semibold">View Bookings</span>
          </Link>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Properties */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Properties</h2>
            <Link to="/owner/properties" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
              View All
            </Link>
          </div>
          
          {properties.length > 0 ? (
            <div className="space-y-4">
              {properties.map((property) => (
                <div key={property._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 truncate">{property.title}</h3>
                    <p className="text-sm text-gray-500">{property.address.city}, {property.address.state}</p>
                    <p className="text-sm font-semibold text-primary-600">₹{property.rent.toLocaleString()}/month</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(property.status, property.isAvailable)}
                    <Link
                      to={`/properties/${property._id}`}
                      className="text-primary-600 hover:text-primary-500"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No properties yet</p>
              <Link
                to="/owner/properties/add"
                className="mt-2 inline-block text-primary-600 hover:text-primary-500 font-medium"
              >
                Add your first property
              </Link>
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            <Link to="/owner/bookings" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
              View All
            </Link>
          </div>
          
          {recentBookings.length > 0 ? (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{booking.tenant?.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{booking.property?.title}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getBookingStatusIcon(booking.status)}
                    <span className="text-sm font-medium capitalize">{booking.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No bookings yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OwnerDashboard
