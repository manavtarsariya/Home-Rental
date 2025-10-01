import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { bookingService } from '../../services/bookingService'
import { paymentService } from '../../services/paymentService'
import { feedbackService } from '../../services/feedbackService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

const TenantDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    totalPayments: 0,
    totalSpent: 0,
    feedbackGiven: 0
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [recentPayments, setRecentPayments] = useState([])
  const [myFeedback, setMyFeedback] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch bookings
      const bookingsResponse = await bookingService.getBookings()
      const bookingsData = bookingsResponse.data || []
      setRecentBookings(bookingsData.slice(0, 5))

      // Fetch payments
      const paymentsResponse = await paymentService.getPayments()
      const paymentsData = paymentsResponse.data || []
      setRecentPayments(paymentsData.slice(0, 5))

      // Fetch feedback
      const feedbackResponse = await feedbackService.getMyFeedback()
      const feedbackData = feedbackResponse.data || []
      setMyFeedback(feedbackData.slice(0, 3))

      // Calculate stats
      const totalBookings = bookingsData.length
      const pendingBookings = bookingsData.filter(b => b.status === 'Pending').length
      const approvedBookings = bookingsData.filter(b => b.status === 'Approved').length
      const totalPayments = paymentsData.length
      const totalSpent = paymentsData
        .filter(p => p.status === 'Completed')
        .reduce((sum, p) => sum + p.amount, 0)
      const feedbackGiven = feedbackData.length

      setStats({
        totalBookings,
        pendingBookings,
        approvedBookings,
        totalPayments,
        totalSpent,
        feedbackGiven
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      'Pending': { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      'Approved': { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      'Rejected': { color: 'bg-red-100 text-red-800', icon: XCircleIcon },
      'Cancelled': { color: 'bg-gray-100 text-gray-800', icon: XCircleIcon }
    }
    
    const badge = badges[status] || badges['Pending']
    const Icon = badge.icon
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    )
  }

  const getPaymentStatusBadge = (status) => {
    const badges = {
      'Completed': { color: 'bg-green-100 text-green-800' },
      'Pending': { color: 'bg-yellow-100 text-yellow-800' },
      'Failed': { color: 'bg-red-100 text-red-800' }
    }
    
    const badge = badges[status] || badges['Pending']
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {status}
      </span>
    )
  }

  const getPaymentTypeColor = (type) => {
    const colors = {
      'Rent': 'text-blue-600',
      'Security Deposit': 'text-purple-600',
      'Maintenance': 'text-orange-600',
      'Late Fee': 'text-red-600'
    }
    return colors[type] || 'text-gray-600'
  }

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const getUpcomingPayments = () => {
    // This is a placeholder - in a real app, you'd calculate this based on lease agreements
    const approvedBooking = recentBookings.find(b => b.status === 'Approved')
    if (approvedBooking) {
      const nextPaymentDate = new Date()
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)
      return [{
        property: approvedBooking.property?.title,
        amount: approvedBooking.monthlyRent,
        dueDate: nextPaymentDate,
        type: 'Rent'
      }]
    }
    return []
  }

  const upcomingPayments = getUpcomingPayments()

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
        <h1 className="text-3xl font-bold text-gray-900">Tenant Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name}! Here's your rental overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
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
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approvedBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <CurrencyRupeeIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Payments Alert */}
      {upcomingPayments.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Upcoming Payment</h3>
              <div className="mt-2 text-sm text-yellow-700">
                {upcomingPayments.map((payment, index) => (
                  <p key={index}>
                    {payment.type} payment of ₹{payment.amount.toLocaleString()} for {payment.property} is due on{' '}
                    {payment.dueDate.toLocaleDateString()}
                  </p>
                ))}
              </div>
              <div className="mt-4">
                <Link
                  to="/tenant/payments"
                  className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md hover:bg-yellow-200 transition-colors duration-200"
                >
                  Make Payment
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            to="/properties"
            className="flex items-center justify-center p-4 border-2 border-dashed border-primary-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors duration-200"
          >
            <MagnifyingGlassIcon className="w-8 h-8 text-primary-600 mr-2" />
            <span className="text-primary-600 font-semibold">Search Properties</span>
          </Link>
          
          <Link
            to="/tenant/bookings"
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <CalendarIcon className="w-8 h-8 text-gray-600 mr-2" />
            <span className="text-gray-700 font-semibold">My Bookings</span>
          </Link>
          
          <Link
            to="/tenant/payments"
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <CurrencyRupeeIcon className="w-8 h-8 text-gray-600 mr-2" />
            <span className="text-gray-700 font-semibold">Payments</span>
          </Link>
          
          <Link
            to="/tenant/feedback"
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <StarIcon className="w-8 h-8 text-gray-600 mr-2" />
            <span className="text-gray-700 font-semibold">My Reviews</span>
          </Link>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            <Link to="/tenant/bookings" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
              View All
            </Link>
          </div>
          
          {recentBookings.length > 0 ? (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 truncate">{booking.property?.title}</h3>
                    <p className="text-sm text-gray-500">₹{booking.monthlyRent?.toLocaleString()}/month</p>
                    <p className="text-xs text-gray-400">
                      Booked on {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-4">
                    {getStatusBadge(booking.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No bookings yet</p>
              <Link
                to="/properties"
                className="mt-2 inline-block text-primary-600 hover:text-primary-500 font-medium"
              >
                Browse properties
              </Link>
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
            <Link to="/tenant/payments" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
              View All
            </Link>
          </div>
          
          {recentPayments.length > 0 ? (
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div key={payment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="font-medium text-gray-900">₹{payment.amount.toLocaleString()}</h3>
                      <span className={`ml-2 text-sm font-medium ${getPaymentTypeColor(payment.paymentType)}`}>
                        {payment.paymentType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{payment.property?.title}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-4">
                    {getPaymentStatusBadge(payment.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CurrencyRupeeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No payments yet</p>
            </div>
          )}
        </div>
      </div>

      {/* My Reviews */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">My Reviews</h2>
          <Link to="/tenant/feedback" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
            View All
          </Link>
        </div>
        
        {myFeedback.length > 0 ? (
          <div className="space-y-4">
            {myFeedback.map((feedback) => (
              <div key={feedback._id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 truncate">{feedback.property?.title}</h3>
                    <div className="flex items-center mt-1">
                      {renderStars(feedback.rating)}
                      <span className="ml-2 text-sm text-gray-600">{feedback.rating}/5</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {feedback.comment && (
                  <p className="text-sm text-gray-600 mt-2">"{feedback.comment}"</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <StarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No reviews written yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Write reviews for properties you've rented to help other tenants
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TenantDashboard
