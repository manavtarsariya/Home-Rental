import React, { useState, useEffect, useCallback } from 'react'
import locationServiceLocal from '../../utils/locationServiceLocal'
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
import PropertyCard from '../../components/PropertyCard'

const BrowseProperties = () => {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [pagination, setPagination] = useState({})

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    country: searchParams.get('country') || '',
    state: searchParams.get('state') || '',
    city: searchParams.get('city') || '',
    type: searchParams.get('type') || '',
    minRent: searchParams.get('minRent') || '',
    maxRent: searchParams.get('maxRent') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    furnished: searchParams.get('furnished') || '',
    amenities: searchParams.get('amenities') || '',
  })

  const [tempFilters, setTempFilters] = useState({
    search: searchParams.get('search') || '',
    country: searchParams.get('country') || '',
    state: searchParams.get('state') || '',
    city: searchParams.get('city') || '',
    type: searchParams.get('type') || '',
    minRent: searchParams.get('minRent') || '',
    maxRent: searchParams.get('maxRent') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    furnished: searchParams.get('furnished') || '',
    amenities: searchParams.get('amenities') || '',
  })

  // Location dropdown state
  const [countryOptions, setCountryOptions] = useState([])
  const [stateOptions, setStateOptions] = useState([])
  const [cityOptions, setCityOptions] = useState([])

  // For select values (store id for country/state/city)
  const [selectedCountryId, setSelectedCountryId] = useState('')
  const [selectedStateId, setSelectedStateId] = useState('')
  const [selectedCityId, setSelectedCityId] = useState('')

  // Load countries on mount
  useEffect(() => {
    (async () => {
      const countries = await locationServiceLocal.getCountries()
      setCountryOptions(countries)
    })()
  }, [])

  // When country changes, load states
  useEffect(() => {
    if (selectedCountryId) {
      (async () => {
        const states = await locationServiceLocal.getStates(selectedCountryId)
        setStateOptions(states)
        setCityOptions([])
        setSelectedStateId('')
        setSelectedCityId('')
        setTempFilters(prev => ({
          ...prev,
          country: countryOptions.find(c => String(c.id) === String(selectedCountryId))?.name || '',
          state: '',
          city: ''
        }))
      })()
    } else {
      setStateOptions([])
      setCityOptions([])
      setSelectedStateId('')
      setSelectedCityId('')
      setTempFilters(prev => ({
        ...prev,
        country: '',
        state: '',
        city: ''
      }))
    }
  }, [selectedCountryId, countryOptions])

  // When state changes, load cities
  useEffect(() => {
    if (selectedStateId) {
      (async () => {
        const cities = await locationServiceLocal.getCities(selectedStateId)
        setCityOptions(cities)
        setSelectedCityId('')
        setTempFilters(prev => ({
          ...prev,
          state: stateOptions.find(s => String(s.id) === String(selectedStateId))?.name || '',
          city: ''
        }))
      })()
    } else {
      setCityOptions([])
      setSelectedCityId('')
      setTempFilters(prev => ({
        ...prev,
        state: '',
        city: ''
      }))
    }
  }, [selectedStateId, stateOptions])

  // When city changes, update tempFilters.city
  useEffect(() => {
    if (selectedCityId) {
      setTempFilters(prev => ({
        ...prev,
        city: cityOptions.find(c => String(c.id) === String(selectedCityId))?.name || ''
      }))
    } else {
      setTempFilters(prev => ({
        ...prev,
        city: ''
      }))
    }
  }, [selectedCityId, cityOptions])

  const propertyTypes = ['Apartment', 'Villa', 'PG', 'House', 'Flat', 'Studio', 'Duplex']
  const bedroomOptions = ['1', '2', '3', '4', '5+']
  const furnishedOptions = ['Fully Furnished', 'Semi Furnished', 'Unfurnished']

  useEffect(() => {
    const newFilters = {
      search: searchParams.get('search') || '',
      city: searchParams.get('city') || '',
      state: searchParams.get('state') || '',
      type: searchParams.get('type') || '',
      minRent: searchParams.get('minRent') || '',
      maxRent: searchParams.get('maxRent') || '',
      bedrooms: searchParams.get('bedrooms') || '',
      furnished: searchParams.get('furnished') || '',
      amenities: searchParams.get('amenities') || '',
    }
    setFilters(newFilters)
    setTempFilters(newFilters)
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
    setTempFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    setFilters(tempFilters)
    const params = new URLSearchParams()
    Object.keys(tempFilters).forEach(key => {
      if (tempFilters[key]) params.set(key, tempFilters[key])
    })
    setSearchParams(params)
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
    const emptyFilters = {
      search: '',
      city: '',
      state: '',
      type: '',
      minRent: '',
      maxRent: '',
      bedrooms: '',
      furnished: '',
      amenities: '',
    }
    setFilters(emptyFilters)
    setTempFilters(emptyFilters)
    setSearchParams({})
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
                className="w-full pl-10 pr-4 py-2 border text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={tempFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="flex space-x-2">
              <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200">Search</button>
              <button type="button" onClick={() => setShowFilters(!showFilters)} className="border text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center">
                <FunnelIcon className="w-4 h-4 mr-1" /> Filters
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Country Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select
                  value={selectedCountryId}
                  onChange={e => setSelectedCountryId(e.target.value)}
                  className="w-full px-3 py-2 text-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Country</option>
                  {countryOptions.map(country => (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>
              </div>

              {/* State Select (show only if country selected) */}
              {selectedCountryId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select
                    value={selectedStateId}
                    onChange={e => setSelectedStateId(e.target.value)}
                    className="w-full px-3 py-2 text-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={!stateOptions.length}
                  >
                    <option value="">Select State</option>
                    {stateOptions.map(state => (
                      <option key={state.id} value={state.id}>{state.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* City Select (show only if state selected) */}
              {selectedStateId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <select
                    value={selectedCityId}
                    onChange={e => setSelectedCityId(e.target.value)}
                    className="w-full px-3 py-2 text-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={!cityOptions.length}
                  >
                    <option value="">Select City</option>
                    {cityOptions.map(city => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select value={tempFilters.type} onChange={(e) => handleFilterChange('type', e.target.value)} className="w-full px-3 py-2 text-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">All Types</option>
                  {propertyTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>


              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range (₹)</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="0"
                    value={tempFilters.minRent}
                    onChange={e => handleFilterChange('minRent', e.target.value)}
                    placeholder="Min Price"
                    className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-500"
                  />
                  <span className="self-center text-gray-400">-</span>
                  <input
                    type="number"
                    min="0"
                    value={tempFilters.maxRent}
                    onChange={e => handleFilterChange('maxRent', e.target.value)}
                    placeholder="Max Price"
                    className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-500"
                  />
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <select value={tempFilters.bedrooms} onChange={(e) => handleFilterChange('bedrooms', e.target.value)} className="w-full px-3 py-2 text-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Bedrooms</option>
                  {bedroomOptions.map(bed => <option key={bed} value={bed === '5+' ? '5' : bed}>{bed}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Furnishing</label>
                <select value={tempFilters.furnished} onChange={(e) => handleFilterChange('furnished', e.target.value)} className="w-full px-3 py-2 text-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Furniture</option>
                  {furnishedOptions.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="col-span-4 flex justify-end space-x-3 mt-4">
                <button type="button" onClick={applyFilters} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200">
                  Apply Filters
                </button>
                <button type="button" onClick={clearFilters} className="text-gray-600 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  Clear Filters
                </button>
              </div>
            </div>
          )}
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
