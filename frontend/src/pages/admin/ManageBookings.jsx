import React, { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  HomeIcon,
  CurrencyRupeeIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const ManageBookings = () => {
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('All')
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchTerm, statusFilter, dateFilter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await adminService.getAllBookings()
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

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.tenant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.tenant?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.property?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== 'All') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (dateFilter) {
        case 'Today':
          filterDate.setHours(0, 0, 0, 0)
          filtered = filtered.filter(booking => 
            new Date(booking.createdAt) >= filterDate
          )
          break
        case 'This Week':
          filterDate.setDate(now.getDate() - 7)
          filtered = filtered.filter(booking => 
            new Date(booking.createdAt) >= filterDate
          )
          break
        case 'This Month':
          filterDate.setDate(1)
          filterDate.setHours(0, 0, 0, 0)
          filtered = filtered.filter(booking => 
            new Date(booking.createdAt) >= filterDate
          )
          break
      }
    }

    // Sort by most recent first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    setFilteredBookings(filtered)
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

  const BookingDetailModal = ({ booking, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Booking Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tenant Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Tenant Information
            </h4>
          
            <div className="space-y-3">
              <div className="flex items-center">
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={booking.tenant?.profileImage?.startsWith('http') 
                    ? booking.tenant.profileImage 
                    : booking.tenant?.profileImage 
                      ? `/uploads/profiles/${booking.tenant?.profileImage}`
                      : 'https://via.placeholder.com/40x40?text=T'
                  }
                  alt={booking.tenant?.name}
                />
                {/* errOR IS HERE */}
                <div className="ml-3">
                  {/* <p className='text-purple-600'>{booking.tenant?.profileImage}hiii</p> */}
                  <p className="font-medium text-black">{booking.tenant?.name}</p>
                  <p className="text-sm text-purple-500">{booking.tenant?.role}</p>
                </div>
                {/* ${booking.tenant?.profileImage} */}
              </div>
              
              <div className="space-y-2 text-sm text-black">
                <div className="flex items-center">
                  <EnvelopeIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span>{booking.tenant?.email}</span>
                </div>
                {booking.tenant?.contactNumber && (
                  <div className="flex items-center">
                    <PhoneIcon className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{booking.tenant.contactNumber}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span>Joined {new Date(booking.tenant?.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Property Information */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <HomeIcon className="w-5 h-5 mr-2" />
              Property Information
            </h4>
            
            <div className="space-y-3">
              {booking.property?.photos && booking.property.photos.length > 0 && (
                <img
                  src={booking.property.photos[0].url || `/uploads/properties/${booking.property.photos[0].filename}`}
                  alt={booking.property.title}
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = '/placeholder.png'
                  }}
                />
              )}
              
              <div>
                <h5 className="font-medium text-gray-900">{booking.property?.title}</h5>
                <p className="text-sm text-gray-600 mt-1">{booking.property?.address?.city}, {booking.property?.address?.state}</p>
                <div className="flex items-center mt-2">
                  <CurrencyRupeeIcon className="w-4 h-4 text-primary-600 mr-1" />
                  <span className="font-medium text-primary-600">₹{booking.property?.rent?.toLocaleString()}/month</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {booking.property?.area} sq ft • {booking.property?.bedrooms} BHK • {booking.property?.furnished}
                </p>
              </div>

              {/* Owner Info */}
              <div className="pt-2 border-t border-green-200">
                <p className="text-sm text-gray-500">Property Owner</p>
                <p className="font-medium text-gray-900">{booking.owner?.name}</p>
                <p className="text-sm text-gray-600">{booking.owner?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Booking Details</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <div className="mt-1">
                {getStatusBadge(booking.status)}
              </div>
            </div>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Monthly Rent</p>
              <p className="font-medium text-gray-900">₹{booking.monthlyRent?.toLocaleString()}</p>
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
        </div>

        {/* Messages */}
        <div className="mt-6 space-y-4">
          {/* Tenant Message */}
          {booking.message && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Tenant's Message</h4>
              <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-200 italic">
                "{booking.message}"
              </p>
            </div>
          )}

          {/* Owner Response */}
          {booking.ownerResponse && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Owner's Response</h4>
              <p className={`text-sm p-3 rounded-lg border ${
                booking.status === 'Approved' 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {booking.ownerResponse.message}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Responded on {new Date(booking.ownerResponse.respondedAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Visit Information */}
        {booking.visitScheduled?.isScheduled && (
          <div className="mt-6 bg-purple-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Scheduled Visit</h4>
            <div className="flex items-center text-sm text-gray-700">
              <CalendarIcon className="w-4 h-4 mr-2" />
              <span>
                {new Date(booking.visitScheduled.visitDate).toLocaleDateString()} at {booking.visitScheduled.visitTime}
              </span>
              <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                booking.visitScheduled.visitStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                booking.visitScheduled.visitStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {booking.visitScheduled.visitStatus}
              </span>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="mt-6 text-gray-600 felx flex-col">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Timeline</h4>

          <div className="space-y-2 text-sm">
            <div className="flex gap-5">
              <span className="text-gray-600">Booking Created:</span>
              <span className="font-medium">{new Date(booking.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex gap-5">
              <span className="text-gray-600">Last Updated:</span>
              <span className="font-medium">{new Date(booking.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
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
              <span className="truncate">{booking.property?.title}</span>
            </div>
            <div className="flex items-center">
              <UserIcon className="w-4 h-4 mr-2" />
              <span>Owner: {booking.owner?.name}</span>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" />
              <span>Move-in: {new Date(booking.moveInDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => {
            setSelectedBooking(booking)
            setShowBookingModal(true)
          }}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white rounded-lg transition-colors duration-200"
          title="View Details"
        >
          <EyeIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Booking Summary */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-500">Duration</p>
          <p className="font-medium text-gray-900">{booking.leaseDuration} months</p>
        </div>
        <div>
          <p className="text-gray-500">Total Amount</p>
          <p className="font-medium text-gray-900">₹{booking.totalAmount?.toLocaleString()}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Requested {new Date(booking.createdAt).toLocaleDateString()}
        </p>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">ID: {booking._id.slice(-6)}</span>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading bookings..." />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Bookings</h1>
        <p className="text-gray-600 mt-2">Monitor all booking requests and transactions</p>
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
          <p className="text-sm text-gray-600">Success Rate</p>
          <p className="text-2xl font-bold text-blue-600">
            {bookings.length > 0 ? Math.round((bookings.filter(b => b.status === 'Approved').length / bookings.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by tenant, property, or owner..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="All">All Time</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </p>
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
            {bookings.length === 0 ? 'No bookings found' : 'No matching bookings found'}
          </h3>
          <p className="text-gray-600">
            {bookings.length === 0 
              ? 'No booking requests have been made yet' 
              : 'Try adjusting your search criteria'
            }
          </p>
        </div>
      )}

      {/* Booking Detail Modal */}
      {showBookingModal && selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => {
            setShowBookingModal(false)
            setSelectedBooking(null)
          }}
        />
      )}
    </div>
  )
}

export default ManageBookings
