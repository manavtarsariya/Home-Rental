import React, { useState, useEffect } from 'react'
import { bookingService } from '../../services/bookingService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  CalendarIcon,
  UserIcon,
  HomeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const OwnerBookings = () => {
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('All')
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [responding, setResponding] = useState(false)

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

  const handleBookingResponse = async (bookingId, status, ownerResponse) => {
    try {
      setResponding(true)
      await bookingService.updateBookingStatus(bookingId, { status, ownerResponse })
      
      const statusText = status === 'Approved' ? 'approved' : 'rejected'
      toast.success(`Booking ${statusText} successfully`)
      
      setShowResponseModal(false)
      setSelectedBooking(null)
      fetchBookings()
    } catch (error) {
      toast.error('Failed to update booking status')
      console.error('Error updating booking:', error)
    } finally {
      setResponding(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'Rejected':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Approved': 'bg-green-100 text-green-800 border-green-200',
      'Rejected': 'bg-red-100 text-red-800 border-red-200',
      'Cancelled': 'bg-gray-100 text-gray-800 border-gray-200'
    }
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${badges[status] || badges['Pending']}`}>
        {getStatusIcon(status)}
        <span className="ml-1">{status}</span>
      </span>
    )
  }

  const ResponseModal = ({ booking, onClose, onRespond }) => {
    const [responseType, setResponseType] = useState('approve')
    const [message, setMessage] = useState('')

    const handleSubmit = (e) => {
      e.preventDefault()
      const status = responseType === 'approve' ? 'Approved' : 'Rejected'
      onRespond(booking._id, status, message)
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-black">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
          <h3 className="text-xl font-semibold mb-4">Respond to Booking Request</h3>
          
          {/* Booking Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center mb-2">
              <UserIcon className="w-5 h-5 text-gray-400 mr-2" />
              <span className="font-medium">{booking.tenant?.name}</span>
            </div>
            <div className="flex items-center mb-2">
              <HomeIcon className="w-5 h-5 text-gray-400 mr-2" />
              <span>{booking.property?.title}</span>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="w-5 h-5 text-gray-400 mr-2" />
              <span>Move-in: {new Date(booking.moveInDate).toLocaleDateString()}</span>
              <span className="ml-4">Duration: {booking.leaseDuration} months</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Response Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="approve"
                      checked={responseType === 'approve'}
                      onChange={(e) => setResponseType(e.target.value)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <span className="ml-2 text-green-600 font-medium">Approve</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="reject"
                      checked={responseType === 'reject'}
                      onChange={(e) => setResponseType(e.target.value)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                    />
                    <span className="ml-2 text-red-600 font-medium">Reject</span>
                  </label>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message to Tenant
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={`${responseType === 'approve' ? 'Welcome! Please proceed with the payment...' : 'Thank you for your interest. Unfortunately...'}`}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={responding}
                className={`px-4 py-2 rounded-lg font-medium flex items-center ${
                  responseType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {responding && <LoadingSpinner size="small" color="white" className="mr-2" />}
                {responding ? 'Sending...' : `${responseType === 'approve' ? 'Approve' : 'Reject'} Booking`}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const BookingCard = ({ booking }) => (
    <div className={`bg-white rounded-lg border-l-4 shadow-sm border border-gray-200 p-6 ${
      booking.status === 'Pending' ? 'border-l-yellow-400 bg-yellow-50' :
      booking.status === 'Approved' ? 'border-l-green-400 bg-green-50' :
      booking.status === 'Rejected' ? 'border-l-red-400 bg-red-50' :
      'border-l-gray-400 bg-gray-50'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900 mr-3">
              {booking.tenant?.name}
            </h3>
            {getStatusBadge(booking.status)}
          </div>
          
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center">
              <HomeIcon className="w-4 h-4 mr-2" />
              <span>{booking.property?.title}</span>
            </div>
            <div className="flex items-center">
              <EnvelopeIcon className="w-4 h-4 mr-2" />
              <span>{booking.tenant?.email}</span>
            </div>
            {booking.tenant?.contactNumber && (
              <div className="flex items-center">
                <PhoneIcon className="w-4 h-4 mr-2" />
                <span>{booking.tenant.contactNumber}</span>
              </div>
            )}
          </div>
        </div>
        
        {booking.status === 'Pending' && (
          <button
            onClick={() => {
              setSelectedBooking(booking)
              setShowResponseModal(true)
            }}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            Respond
          </button>
        )}
      </div>

      {/* Booking Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-500">Move-in Date</p>
          <p className="font-medium text-gray-900">
            {new Date(booking.moveInDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Lease Duration</p>
          <p className="font-medium text-gray-900">{booking.leaseDuration} months</p>
        </div>
        <div>
          <p className="text-gray-500">Total Amount</p>
          <p className="font-medium text-gray-900">₹{booking.totalAmount?.toLocaleString()}</p>
        </div>
      </div>

      {/* Tenant Message */}
      {booking.message && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Tenant's Message</p>
          <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border italic">
            "{booking.message}"
          </p>
        </div>
      )}

      {/* Owner Response */}
      {booking.ownerResponse && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Your Response</p>
          <p className={`text-sm p-3 rounded-lg border ${
            booking.status === 'Approved' ? 'bg-green-50 border-green-200 text-green-800' :
            'bg-red-50 border-red-200 text-red-800'
          }`}>
            {booking.ownerResponse.message}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Responded on {new Date(booking.ownerResponse.respondedAt).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Requested on {new Date(booking.createdAt).toLocaleDateString()}
        </p>
        
        {booking.status === 'Approved' && (
          <span className="text-sm text-green-600 font-medium">
            ✓ Booking Confirmed
          </span>
        )}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading booking requests..." />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Booking Requests</h1>
        <p className="text-gray-600 mt-2">Manage incoming booking requests for your properties</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Requests</p>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-black">Filter by status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-5 py-2 text-black text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredBookings.length} of {bookings.length} requests
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
            {bookings.length === 0 ? 'No booking requests yet' : 'No matching requests found'}
          </h3>
          <p className="text-gray-600">
            {bookings.length === 0 
              ? 'Booking requests from tenants will appear here' 
              : 'Try adjusting your filter criteria'
            }
          </p>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedBooking && (
        <ResponseModal
          booking={selectedBooking}
          onClose={() => {
            setShowResponseModal(false)
            setSelectedBooking(null)
          }}
          onRespond={handleBookingResponse}
        />
      )}
    </div>
  )
}

export default OwnerBookings
