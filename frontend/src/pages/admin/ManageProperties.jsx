import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminService } from '../../services/adminService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const ManageProperties = () => {
  const [properties, setProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [cityFilter, setCityFilter] = useState('All')
  const [showPropertyModal, setShowPropertyModal] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    filterProperties()
  }, [properties, searchTerm, statusFilter, typeFilter, cityFilter])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const response = await adminService.getAllProperties()
      setProperties(response.data || [])
    } catch (error) {
      toast.error('Failed to load properties')
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterProperties = () => {
    let filtered = properties

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(property => 
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address?.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'All') {
      if (statusFilter === 'Available') {
        filtered = filtered.filter(property => property.status === 'Approved' && property.isAvailable)
      } else if (statusFilter === 'Rented') {
        filtered = filtered.filter(property => property.status === 'Approved' && !property.isAvailable)
      } else {
        filtered = filtered.filter(property => property.status === statusFilter)
      }
    }

    // Type filter
    if (typeFilter !== 'All') {
      filtered = filtered.filter(property => property.type === typeFilter)
    }

    // City filter
    if (cityFilter !== 'All') {
      filtered = filtered.filter(property => property.address?.city === cityFilter)
    }

    // Sort by most recent first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    setFilteredProperties(filtered)
  }

  const handleUpdatePropertyStatus = async (propertyId, status, reason = '') => {
    try {
      setActionLoading(true)
      await adminService.updatePropertyStatus(propertyId, { status, reason })
      
      toast.success(`Property ${status.toLowerCase()} successfully`)
      fetchProperties()
    } catch (error) {
      toast.error('Failed to update property status')
      console.error('Error updating property status:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return
    }

    try {
      setActionLoading(true)
      await adminService.deleteProperty(propertyId)
      toast.success('Property deleted successfully')
      fetchProperties()
    } catch (error) {
      toast.error('Failed to delete property')
      console.error('Error deleting property:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status, isAvailable) => {
    if (status === 'Pending') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
          <ClockIcon className="w-3 h-3 mr-1" />
          Pending Review
        </span>
      )
    }
    if (status === 'Rejected') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          <XCircleIcon className="w-3 h-3 mr-1" />
          Rejected
        </span>
      )
    }
    if (status === 'Approved' && !isAvailable) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          Rented
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
        <CheckCircleIcon className="w-3 h-3 mr-1" />
        Available
      </span>
    )
  }

  const getUniqueTypes = () => {
    return [...new Set(properties.map(p => p.type))]
  }

  const getUniqueCities = () => {
    return [...new Set(properties.map(p => p.address?.city).filter(Boolean))]
  }

  const PropertyDetailModal = ({ property, onClose, onApprove, onReject }) => {
    const [rejectionReason, setRejectionReason] = useState('')
    const [showRejectionForm, setShowRejectionForm] = useState(false)

    const handleReject = () => {
      if (!rejectionReason.trim()) {
        toast.error('Please provide a reason for rejection')
        return
      }
      onReject(property._id, rejectionReason)
      onClose()
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Property Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Property Images */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Property Images</h4>
              {property.photos && property.photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {property.photos.slice(0, 4).map((photo, index) => (
                    <img
                      key={index}
                      src={`/uploads/properties/${photo.filename}`}
                      alt={`Property ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <BuildingOfficeIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Property Information */}
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">{property.title}</h4>
                <div className="flex items-center space-x-2 mb-2">
                  {getStatusBadge(property.status, property.isAvailable)}
                  <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    {property.type}
                  </span>
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    {property.address?.city}, {property.address?.state}
                  </span>
                </div>
                <div className="flex items-center text-primary-600 font-semibold">
                  <CurrencyRupeeIcon className="w-4 h-4 mr-1" />
                  <span>₹{property.rent?.toLocaleString()}/month</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Area</p>
                  <p className="font-medium text-gray-900">{property.area} sq ft</p>
                </div>
                <div>
                  <p className="text-gray-500">Bedrooms</p>
                  <p className="font-medium text-gray-900">{property.bedrooms} BHK</p>
                </div>
                <div>
                  <p className="text-gray-500">Bathrooms</p>
                  <p className="font-medium text-gray-900">{property.bathrooms}</p>
                </div>
                <div>
                  <p className="text-gray-500">Furnished</p>
                  <p className="font-medium text-gray-900">{property.furnished}</p>
                </div>
              </div>

              {/* Owner Information */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Property Owner</h4>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {property.owner?.name?.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{property.owner?.name}</p>
                    <p className="text-sm text-gray-500">{property.owner?.email}</p>
                    {property.owner?.contactNumber && (
                      <p className="text-sm text-gray-500">{property.owner.contactNumber}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-sm text-gray-600">{property.description}</p>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Address */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Full Address</h4>
            <p className="text-sm text-gray-600">
              {property.address?.street}, {property.address?.city}, {property.address?.state} - {property.address?.zipCode}
            </p>
          </div>

          {/* Action Buttons */}
          {property.status === 'Pending' && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              {showRejectionForm ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Rejection
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Explain why this property is being rejected..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => {
                        setShowRejectionForm(false)
                        setRejectionReason('')
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject Property
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowRejectionForm(true)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      onApprove(property._id)
                      onClose()
                    }}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 flex justify-end">
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
  }

  const PropertyCard = ({ property }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="relative">
        {property.photos && property.photos.length > 0 ? (
          <img
            src={`/uploads/properties/${property.photos[0].filename}`}
            alt={property.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <BuildingOfficeIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        <div className="absolute top-3 left-3">
          <span className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            {property.type}
          </span>
        </div>
        
        <div className="absolute top-3 right-3">
          {getStatusBadge(property.status, property.isAvailable)}
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{property.title}</h3>
          <div className="flex items-center text-gray-600 text-sm">
            <MapPinIcon className="w-4 h-4 mr-1" />
            <span>{property.address?.city}, {property.address?.state}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-primary-600 font-semibold">
            <CurrencyRupeeIcon className="w-4 h-4 mr-1" />
            <span className="text-lg">₹{property.rent?.toLocaleString()}</span>
            <span className="text-sm text-gray-500 ml-1">/month</span>
          </div>
          <span className="text-sm text-gray-500">
            {property.area} sq ft • {property.bedrooms} BHK
          </span>
        </div>

        {/* Owner Info */}
        <div className="flex items-center mb-4 text-sm text-gray-600">
          <UserIcon className="w-4 h-4 mr-1" />
          <span>Owner: {property.owner?.name}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Listed on {new Date(property.createdAt).toLocaleDateString()}
          </span>
          
          <div className="flex space-x-2">
            <Link
              to={`/properties/${property._id}`}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="View Property"
            >
              <EyeIcon className="w-4 h-4" />
            </Link>
            
            <button
              onClick={() => {
                setSelectedProperty(property)
                setShowPropertyModal(true)
              }}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Review Property"
            >
              <CheckCircleIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading properties..." />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Properties</h1>
        <p className="text-gray-600 mt-2">Review and manage all property listings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Properties</p>
          <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-600">
            {properties.filter(p => p.status === 'Pending').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {properties.filter(p => p.status === 'Approved').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Available</p>
          <p className="text-2xl font-bold text-blue-600">
            {properties.filter(p => p.status === 'Approved' && p.isAvailable).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties, cities, or owners..."
                className="w-full text-black pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className='text-black'>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="Available">Available</option>
              <option value="Rented">Rented</option>
              <option value="Pending">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className='text-black'>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="All">All Types</option>
              {getUniqueTypes().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div className='text-black'>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="All">All Cities</option>
              {getUniqueCities().map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {filteredProperties.length} of {properties.length} properties
          </p>
          
          {properties.filter(p => p.status === 'Pending').length > 0 && (
            <span className="text-sm text-yellow-600 font-medium">
              {properties.filter(p => p.status === 'Pending').length} properties need review
            </span>
          )}
        </div>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {properties.length === 0 ? 'No properties found' : 'No matching properties found'}
          </h3>
          <p className="text-gray-600">
            {properties.length === 0 
              ? 'No properties have been listed yet' 
              : 'Try adjusting your search criteria'
            }
          </p>
        </div>
      )}

      {/* Property Detail Modal */}
      {showPropertyModal && selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => {
            setShowPropertyModal(false)
            setSelectedProperty(null)
          }}
          onApprove={(propertyId) => handleUpdatePropertyStatus(propertyId, 'Approved')}
          onReject={(propertyId, reason) => handleUpdatePropertyStatus(propertyId, 'Rejected', reason)}
        />
      )}
    </div>
  )
}

export default ManageProperties
