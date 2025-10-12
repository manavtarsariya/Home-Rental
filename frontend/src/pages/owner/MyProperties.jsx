import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { propertyService } from '../../services/propertyService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  BuildingOfficeIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const MyProperties = () => {
  const [properties, setProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    filterProperties()
  }, [properties, searchTerm, statusFilter, typeFilter])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const response = await propertyService.getOwnerProperties()
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
        property.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.state.toLowerCase().includes(searchTerm.toLowerCase())
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

    setFilteredProperties(filtered)
  }

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return
    }

    try {
      await propertyService.deleteProperty(propertyId)
      toast.success('Property deleted successfully')
      fetchProperties()
    } catch (error) {
      toast.error('Failed to delete property')
      console.error('Error deleting property:', error)
    }
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
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Available</span>
  }

  const getUniqueTypes = () => {
    return [...new Set(properties.map(p => p.type))]
  }

  const PropertyCard = ({ property }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="relative">
        {property.photos && property.photos.length > 0 ? (
          <img
            src={property.photos[0].url || `/uploads/properties/${property.photos[0].filename}`}
            alt={property.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.target.src = '/placeholder.png'
            }}
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
          <p className="text-sm text-gray-500">
            {property.address.city}, {property.address.state}
          </p>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-primary-600 font-semibold">
            <span className="text-lg">₹{property.rent.toLocaleString()}</span>
            <span className="text-sm text-gray-500 ml-1">/month</span>
          </div>
          <span className="text-sm text-gray-500">
            {property.area} sq ft • {property.bedrooms} BHK
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>{property.furnished}</span>
          <span>{property.views} views</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Listed on {new Date(property.createdAt).toLocaleDateString()}
          </span>
          
          <div className="flex space-x-2">
            {/* <Link
              to={`/properties/${property._id}`}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="View Property"
            >
              <EyeIcon className="w-4 h-4" />
            </Link> */}
            
            <Link
              to={`/owner/properties/${property._id}/edit`}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Edit Property"
            >
              <PencilIcon className="w-4 h-4" />
            </Link>
            
            <button
              onClick={() => handleDeleteProperty(property._id)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Delete Property"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading your properties..." />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-600 mt-2">Manage your property listings</p>
        </div>
        <Link
          to="/owner/properties/add"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Property
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 text-black">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
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
              className="px-8 text-sm py-2.5 items-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="Available">Available</option>
              <option value="Rented">Rented</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-8 text-sm py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="All">All Types</option>
              {getUniqueTypes().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Properties</p>
          <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Available</p>
          <p className="text-2xl font-bold text-green-600">
            {properties.filter(p => p.status === 'Approved' && p.isAvailable).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Rented</p>
          <p className="text-2xl font-bold text-blue-600">
            {properties.filter(p => p.status === 'Approved' && !p.isAvailable).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {properties.filter(p => p.status === 'Pending').length}
          </p>
        </div>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">
              Showing {filteredProperties.length} of {properties.length} properties
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {properties.length === 0 ? 'No properties yet' : 'No matching properties found'}
          </h3>
          <p className="text-gray-600 mb-4">
            {properties.length === 0 
              ? 'Start by adding your first property to the platform' 
              : 'Try adjusting your search criteria'
            }
          </p>
          {properties.length === 0 && (
            <Link
              to="/owner/properties/add"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 inline-flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Your First Property
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default MyProperties
