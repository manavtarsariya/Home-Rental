import React, { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { propertyService } from '../../services/propertyService'
import LoadingSpinner from '../../components/common/LoadingSpinner'

import {
  MapPinIcon,
  HomeIcon,
  CurrencyRupeeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const BrowseProperties = () => {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [pagination, setPagination] = useState({})

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    state: searchParams.get('state') || '',
    type: searchParams.get('type') || '',
    minRent: searchParams.get('minRent') || '',
    maxRent: searchParams.get('maxRent') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    furnished: searchParams.get('furnished') || '',
    amenities: searchParams.get('amenities') || '',
  })

  const propertyTypes = ['Apartment', 'Villa', 'PG', 'House', 'Flat', 'Studio', 'Duplex']
  const bedroomOptions = ['1', '2', '3', '4', '5+']
  const furnishedOptions = ['Fully Furnished', 'Semi Furnished', 'Unfurnished']

  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      city: searchParams.get('city') || '',
      state: searchParams.get('state') || '',
      type: searchParams.get('type') || '',
      minRent: searchParams.get('minRent') || '',
      maxRent: searchParams.get('maxRent') || '',
      bedrooms: searchParams.get('bedrooms') || '',
      furnished: searchParams.get('furnished') || '',
      amenities: searchParams.get('amenities') || '',
    })
  }, [searchParams])

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true)
      const apiParams = {}
      Object.keys(filters).forEach(key => {
        if (filters[key]) apiParams[key] = filters[key]
      })
      apiParams.page = 1
      apiParams.limit = 12

      console.log('Fetching properties with params:', apiParams)

      const response = await propertyService.getProperties(apiParams)
      console.log('Properties response:', response)

      if (response?.data) {
        setProperties(response.data.data || response.data || [])
        setPagination(response.data.pagination || {})
      } else {
        setProperties([])
        setPagination({})
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
      toast.error('Failed to load properties')
      setProperties([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.set(key, filters[key])
    })
    setSearchParams(params)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      city: '',
      state: '',
      type: '',
      minRent: '',
      maxRent: '',
      bedrooms: '',
      furnished: '',
      amenities: '',
    })
    setSearchParams({})
  }

  const PropertyCard = ({ property }) => {
    const imageUrl =
      property.photos && property.photos.length > 0
        ? property.photos[0].filename.startsWith('http')
          ? property.photos[0].filename
          : `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/uploads/properties/${property.photos[0].filename}`
        : null

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={property.title}
              className="w-full h-48 object-cover"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=No+Image' }}
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <HomeIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}

          <div className="absolute top-3 left-3">
            <span className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              {property.type}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <span className="bg-white text-gray-800 px-2 py-1 rounded-full text-xs font-medium shadow">
              {property.bedrooms} BHK
            </span>
          </div>

          {!property.isAvailable && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
                Not Available
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">{property.title}</h3>
            <div className="flex items-center text-sm text-yellow-500">
              <StarIcon className="w-4 h-4 fill-current mr-1" />
              <span>{property.rating?.average || 0}</span>
            </div>
          </div>

          <div className="flex items-center text-gray-600 mb-3">
            <MapPinIcon className="w-4 h-4 mr-1" />
            <span className="text-sm truncate">{property.address?.city}, {property.address?.state}</span>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-primary-600 font-semibold">
              <CurrencyRupeeIcon className="w-5 h-5" />
              <span className="text-lg">{property.rent?.toLocaleString()}</span>
              <span className="text-sm text-gray-500 ml-1">/month</span>
            </div>
            <span className="text-sm text-gray-500">{property.area} sq ft</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">{property.furnished} • {property.preferredTenants}</div>
            <Link
              to={`/properties/${property._id}`}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors duration-200"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Properties</h1>
        <p className="text-gray-600">Find your perfect rental property from our verified listings</p>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-2 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="City"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />
            </div>

            <div className="flex space-x-2">
              <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200">Search</button>
              <button type="button" onClick={() => setShowFilters(!showFilters)} className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center">
                <FunnelIcon className="w-4 h-4 mr-1" /> Filters
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input type="text" placeholder="State" value={filters.state} onChange={(e) => handleFilterChange('state', e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">All Types</option>
                {propertyTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
              <select value={filters.bedrooms} onChange={(e) => handleFilterChange('bedrooms', e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Any</option>
                {bedroomOptions.map(bed => <option key={bed} value={bed === '5+' ? '5' : bed}>{bed}</option>)}
              </select>
              <select value={filters.furnished} onChange={(e) => handleFilterChange('furnished', e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Any</option>
                {furnishedOptions.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          )}

          {showFilters && <button type="button" onClick={clearFilters} className="text-sm text-gray-600 mt-4 hover:text-gray-800">Clear all filters</button>}
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="large" text="Loading properties..." />
        </div>
      ) : (
        properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => <PropertyCard key={property._id} property={property} />)}
          </div>
        ) : (
          <div className="text-center py-12">
            <HomeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
            <button onClick={clearFilters} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200">Clear Filters</button>
          </div>
        )
      )}
    </div>
  )
}

export default BrowseProperties
