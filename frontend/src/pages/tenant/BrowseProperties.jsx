import React, { useState, useEffect, useCallback } from 'react'
import locationServiceLocal from '../../utils/locationServiceLocal'
import { Link, useSearchParams } from 'react-router-dom'
import { propertyService } from '../../services/propertyService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { MapPinIcon, HomeIcon, CurrencyRupeeIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import PropertyCard from '../../components/PropertyCard'

const BrowseProperties = () => {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [pagination, setPagination] = useState({})

  const initialFilters = {
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
  }

  const [filters, setFilters] = useState(initialFilters) // for API
  const [tempFilters, setTempFilters] = useState(initialFilters) // for input

  // Location dropdown state
  const [countryOptions, setCountryOptions] = useState([])
  const [stateOptions, setStateOptions] = useState([])
  const [cityOptions, setCityOptions] = useState([])
  const [selectedCountryId, setSelectedCountryId] = useState('')
  const [selectedStateId, setSelectedStateId] = useState('')
  const [selectedCityId, setSelectedCityId] = useState('')

  // Property types
  const propertyTypes = ['Apartment', 'Villa', 'PG', 'House', 'Flat', 'Studio', 'Duplex']
  const bedroomOptions = ['1', '2', '3', '4', '5+']
  const furnishedOptions = ['Fully Furnished', 'Semi Furnished', 'Unfurnished']

  // Load countries once
  useEffect(() => {
    (async () => {
      const countries = await locationServiceLocal.getCountries()
      setCountryOptions(countries)
    })()
  }, [])

  // Load states when country selected
  useEffect(() => {
    if (!selectedCountryId) {
      setStateOptions([])
      setCityOptions([])
      setSelectedStateId('')
      setSelectedCityId('')
      return
    }
    (async () => {
      const states = await locationServiceLocal.getStates(selectedCountryId)
      setStateOptions(states)
      setCityOptions([])
      setSelectedStateId('')
      setSelectedCityId('')
    })()
  }, [selectedCountryId])

  // Load cities when state selected
  useEffect(() => {
    if (!selectedStateId) {
      setCityOptions([])
      setSelectedCityId('')
      return
    }
    (async () => {
      const cities = await locationServiceLocal.getCities(selectedStateId)
      setCityOptions(cities)
      setSelectedCityId('')
    })()
  }, [selectedStateId])

  // Handle search button click
  const handleSearch = () => {
    setFilters(prev => ({ ...prev, title: tempFilters.search }))
    const params = new URLSearchParams(searchParams)
    setSearchParams(params)
  }

  // Apply tempFilters to real filters (with names)
  const applyFilters = () => {
    const applied = { ...tempFilters }

    if (selectedCountryId) {
      const c = countryOptions.find(c => String(c.id) === String(selectedCountryId))
      applied.country = c?.name || ''
    }
    if (selectedStateId) {
      const s = stateOptions.find(s => String(s.id) === String(selectedStateId))
      applied.state = s?.name || ''
    }
    if (selectedCityId) {
      const ci = cityOptions.find(ci => String(ci.id) === String(selectedCityId))
      applied.city = ci?.name || ''
    }

    setFilters(applied)

    const params = new URLSearchParams()
    Object.keys(applied).forEach(k => {
      if (applied[k]) params.set(k, applied[k])
    })
    setSearchParams(params)
  }

  // Clear filters
  const clearFilters = () => {
    const resetFilters = {
      search: '',
      country: '',
      state: '',
      city: '',
      type: '',
      minRent: '',
      maxRent: '',
      bedrooms: '',
      furnished: '',
      amenities: '',
    }
    setTempFilters(resetFilters)
    setFilters(resetFilters)
    setSelectedCountryId('')
    setSelectedStateId('')
    setSelectedCityId('')
    setSearchParams({})
  }

  // Handle filter input change
  const handleFilterChange = (key, value) => {
    setTempFilters(prev => ({ ...prev, [key]: value }))
  }

  // Fetch properties (only when filters change)
  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true)
      const apiParams = {}
      Object.keys(filters).forEach(key => {
        if (filters[key]) apiParams[key] = filters[key]
      })
      apiParams.page = 1
      apiParams.limit = 12

      const response = await propertyService.getProperties(apiParams)
      if (response?.data) {
        setProperties(response.data.data || response.data || [])
        setPagination(response.data.pagination || {})
      } else {
        setProperties([])
        setPagination({})
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load properties')
      setProperties([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Properties</h1>
        <p className="text-gray-600">Find your perfect rental property from our verified listings</p>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <form onSubmit={e => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-2 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                className="w-full pl-10 pr-4 py-2 border text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={tempFilters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <button type="button" onClick={handleSearch} className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200">
                Search
              </button>
              <button type="button" onClick={() => setShowFilters(!showFilters)} className="border text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center">
                <FunnelIcon className="w-4 h-4 mr-1" /> Filters
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select
                  value={selectedCountryId}
                  onChange={e => setSelectedCountryId(e.target.value)}
                  className="w-full px-3 py-2 text-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Country</option>
                  {countryOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
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
                    {stateOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
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
                    {cityOptions.map(ci => <option key={ci.id} value={ci.id}>{ci.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select value={tempFilters.type} onChange={e => handleFilterChange('type', e.target.value)} className="w-full px-3 py-2 text-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">All Types</option>
                  {propertyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range (₹)</label>
                <div className="flex space-x-2">
                  <input type="number" min="0" value={tempFilters.minRent} onChange={e => handleFilterChange('minRent', e.target.value)} placeholder="Min" className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-500" />
                  <span className="self-center text-gray-400">-</span>
                  <input type="number" min="0" value={tempFilters.maxRent} onChange={e => handleFilterChange('maxRent', e.target.value)} placeholder="Max" className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <select value={tempFilters.bedrooms} onChange={e => handleFilterChange('bedrooms', e.target.value)} className="w-full px-3 py-2 text-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Bedrooms</option>
                  {bedroomOptions.map(b => <option key={b} value={b === '5+' ? '5' : b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Furnishing</label>
                <select value={tempFilters.furnished} onChange={e => handleFilterChange('furnished', e.target.value)} className="w-full px-3 py-2 text-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Furniture</option>
                  {furnishedOptions.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="col-span-4 flex justify-end space-x-3 mt-4">
                <button type="button" onClick={applyFilters} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200">Apply Filters</button>
                <button type="button" onClick={clearFilters} className="text-gray-600 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors duration-200">Clear Filters</button>
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
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(p => <PropertyCard key={p._id} property={p} />)}
        </div>
      ) : (
        <div className="text-center py-12">
          <HomeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
          <button onClick={clearFilters} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200">Clear Filters</button>
        </div>
      )}
    </div>
  )
}

export default BrowseProperties
