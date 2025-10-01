import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bookingService } from '../../services/bookingService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  HomeIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const MyBookings = () => {
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, statusFilter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await bookingService.getBookings()
      setBookings(response.data || [])
    } catch (error) {
      toast.error('Failed to load bookings')
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = bookings

    if (statusFilter !== 'All') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    // Sort by most recent first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    setFilteredBookings(filtered)
  }

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) {
      return
    }

    try {
      await bookingService.cancelBooking(bookingId)
      toast.success('Booking cancelled successfully')
      fetchBookings()
    } catch (error) {
      toast.error('Failed to cancel booking')
      console.error('Error cancelling booking:', error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'Rejected':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      case 'Cancelled':
        return <XCircleIcon className="w-5 h-5 text-gray-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Cancelled': 'bg-gray-100 text-gray-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badges[status] || badges['Pending']}`}>
        {getStatusIcon(status)}
        <span className="ml-1">{status}</span>
      </span>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'border-green-200 bg-green-50'
      case 'Rejected':
        return 'border-red-200 bg-red-50'
      case 'Cancelled':
        return 'border-gray-200 bg-gray-50'
      default:
        return 'border-yellow-200 bg-yellow-50'
    }
  }

  const BookingCard = ({ booking }) => (
    <div className={`bg-white rounded-lg border-l-4 shadow-sm border border-gray-200 ${getStatusColor(booking.status)} p-6 hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900 mr-2">
              {booking.property?.title || 'Property Not Available'}
            </h3>
            {getStatusBadge(booking.status)}
          </div>
          
          {booking.property && (
            <div className="flex items-center text-gray-600 mb-2">
              <MapPinIcon className="w-4 h-4 mr-1" />
              <span className="text-sm">
                {booking.property.address?.city}, {booking.property.address?.state}
              </span>
            </div>
          )}
          
          <div className="flex items-center text-primary-600 font-semibold">
            <CurrencyRupeeIcon className="w-4 h-4 mr-1" />
            <span>₹{booking.monthlyRent?.toLocaleString()}/month</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {booking.property && (
            <Link
              to={`/properties/${booking.property._id}`}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-white rounded-lg transition-colors duration-200"
              title="View Property"
            >
              <EyeIcon className="w-4 h-4" />
            </Link>
          )}
          
          {booking.status === 'Pending' && (
            <button
              onClick={() => handleCancelBooking(booking._id)}
              className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors duration-200"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Booking Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Move-in Date</p>
          <p className="font-medium text-gray-900">
            {new Date(booking.moveInDate).toLocaleDateString()}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Lease Duration</p>
          <p className="font-medium text-gray-900">{booking.leaseDuration} months</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Security Deposit</p>
          <p className="font-medium text-gray-900">₹{booking.securityDeposit?.toLocaleString()}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="font-medium text-gray-900">₹{booking.totalAmount?.toLocaleString()}</p>
        </div>
      </div>

      {/* Message */}
      {booking.message && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Your Message</p>
          <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border italic">
            "{booking.message}"
          </p>
        </div>
      )}

      {/* Owner Response */}
      {booking.ownerResponse && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Owner Response</p>
          <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
            {booking.ownerResponse.message}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Responded on {new Date(booking.ownerResponse.respondedAt).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Visit Details */}
      {booking.visitScheduled?.isScheduled && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Scheduled Visit</p>
          <div className="flex items-center text-sm text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
            <CalendarIcon className="w-4 h-4 mr-2" />
            <span>
              {new Date(booking.visitScheduled.visitDate).toLocaleDateString()} at {booking.visitScheduled.visitTime}
            </span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
              booking.visitScheduled.visitStatus === 'Completed' ? 'bg-green-100 text-green-800' :
              booking.visitScheduled.visitStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {booking.visitScheduled.visitStatus}
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Requested on {new Date(booking.createdAt).toLocaleDateString()}
        </p>
        
        {booking.status === 'Approved' && (
          <div className="flex space-x-2">
            <Link
              to={`/tenant/payments`}
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              Make Payment
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to={`/tenant/feedback`}
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              Leave Review
            </Link>
          </div>
        )}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading your bookings..." />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-600 mt-2">Track your property booking requests and their status</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Bookings</p>
          <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {bookings.filter(b => b.status === 'Pending').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {bookings.filter(b => b.status === 'Approved').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Rejected</p>
          <p className="text-2xl font-bold text-red-600">
            {bookings.filter(b => b.status === 'Rejected').length}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          
          <div className="ml-auto text-sm text-gray-600">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-6">
          {filteredBookings.map((booking) => (
            <BookingCard key={booking._id} booking={booking} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {bookings.length === 0 ? 'No bookings yet' : 'No matching bookings found'}
          </h3>
          <p className="text-gray-600 mb-4">
            {bookings.length === 0 
              ? 'Start by browsing properties and making your first booking request' 
              : 'Try adjusting your filter criteria'
            }
          </p>
          {bookings.length === 0 && (
            <Link
              to="/properties"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 inline-flex items-center"
            >
              <HomeIcon className="w-4 h-4 mr-2" />
              Browse Properties
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default MyBookings
