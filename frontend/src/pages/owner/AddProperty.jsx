import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { propertyService } from '../../services/propertyService'
import locationServiceLocal from '../../utils/locationServiceLocal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  PhotoIcon,
  DocumentIcon,
  XMarkIcon,
  MapPinIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const AddProperty = () => {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [photos, setPhotos] = useState([])
  const [documents, setDocuments] = useState([])
  const [photosPreviews, setPhotosPreviews] = useState([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    area: '',
    type: 'Apartment',
    rent: '',
    securityDeposit: '',
    bedrooms: '',
    bathrooms: '',
    furnished: 'Unfurnished',
    preferredTenants: 'Any',
    amenities: [],
    availableFrom: ''
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
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            country: countryOptions.find(c => String(c.id) === String(selectedCountryId))?.name || '',
            state: '',
            city: ''
          }
        }))
      })()
    } else {
      setStateOptions([])
      setCityOptions([])
      setSelectedStateId('')
      setSelectedCityId('')
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          country: '',
          state: '',
          city: ''
        }
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
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            state: stateOptions.find(s => String(s.id) === String(selectedStateId))?.name || '',
            city: ''
          }
        }))
      })()
    } else {
      setCityOptions([])
      setSelectedCityId('')
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          state: '',
          city: ''
        }
      }))
    }
  }, [selectedStateId, stateOptions])

  // When city changes, update address.city
  useEffect(() => {
    if (selectedCityId) {
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          city: cityOptions.find(c => String(c.id) === String(selectedCityId))?.name || ''
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          city: ''
        }
      }))
    }
  }, [selectedCityId, cityOptions])

  const [errors, setErrors] = useState({})

  const propertyTypes = ['Apartment', 'Villa', 'PG', 'House', 'Flat', 'Studio', 'Duplex']
  const furnishedOptions = ['Fully Furnished', 'Semi Furnished', 'Unfurnished']
  const tenantPreferences = ['Family', 'Bachelor', 'Company', 'Any']
  const amenitiesList = [
    'Parking', 'Swimming Pool', 'Gym', 'Garden', 'Balcony', 
    'AC', 'Furnished', 'WiFi', 'Security', 'Elevator',
    'Power Backup', 'Water Supply', 'Maintenance', 'Pet Friendly'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files)
    
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`)
        return false
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`)
        return false
      }
      return true
    })

    if (photos.length + validFiles.length > 10) {
      toast.error('Maximum 10 photos allowed')
      return
    }

    setPhotos(prev => [...prev, ...validFiles])

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotosPreviews(prev => [...prev, {
          file: file,
          url: e.target.result
        }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
    setPhotosPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleDocumentsChange = (e) => {
    const files = Array.from(e.target.files)
    
    const validFiles = files.filter(file => {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid document. Only PDF and Word documents are allowed`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`)
        return false
      }
      return true
    })

    if (documents.length + validFiles.length > 5) {
      toast.error('Maximum 5 documents allowed')
      return
    }

    setDocuments(prev => [...prev, ...validFiles])
  }

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Property title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Property description is required'
    }

    if (!formData.address.street.trim()) {
      newErrors['address.street'] = 'Street address is required'
    }

    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required'
    }

    if (!formData.address.state.trim()) {
      newErrors['address.state'] = 'State is required'
    }

    if (!formData.address.zipCode.trim()) {
      newErrors['address.zipCode'] = 'Zip code is required'
    }

    if (!formData.area || formData.area <= 0) {
      newErrors.area = 'Valid area is required'
    }

    if (!formData.rent || formData.rent <= 0) {
      newErrors.rent = 'Valid rent amount is required'
    }

    if (!formData.bedrooms || formData.bedrooms < 0) {
      newErrors.bedrooms = 'Valid number of bedrooms is required'
    }

    if (!formData.bathrooms || formData.bathrooms < 0) {
      newErrors.bathrooms = 'Valid number of bathrooms is required'
    }

    if (photos.length === 0) {
      newErrors.photos = 'At least one photo is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix all errors before submitting')
      return
    }

    setSubmitting(true)

    try {
      // Create FormData object
      const formDataToSend = new FormData()

      // Add text fields
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('type', formData.type)
      formDataToSend.append('rent', formData.rent)
      formDataToSend.append('area', formData.area)
      formDataToSend.append('bedrooms', formData.bedrooms)
      formDataToSend.append('bathrooms', formData.bathrooms)
      formDataToSend.append('furnished', formData.furnished)
      formDataToSend.append('preferredTenants', formData.preferredTenants)
      
      if (formData.securityDeposit) {
        formDataToSend.append('securityDeposit', formData.securityDeposit)
      }
      
      if (formData.availableFrom) {
        formDataToSend.append('availableFrom', formData.availableFrom)
      }

      // Add address as JSON string
      formDataToSend.append('address', JSON.stringify(formData.address))

      // Add amenities as JSON string
      formDataToSend.append('amenities', JSON.stringify(formData.amenities))

      // Add photos
      photos.forEach((photo) => {
        formDataToSend.append('photos', photo)
      })

      // Add documents
      documents.forEach((document) => {
        formDataToSend.append('documents', document)
      })

      const response = await propertyService.createPropertyWithFormData(formDataToSend)
      
      toast.success('Property added successfully!')
      navigate('/owner/properties')
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to add property'
      toast.error(errorMessage)
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Property creation error:', error)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-black">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
        <p className="text-gray-600 mt-2">Fill in the details to list your property</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Modern 2BHK Apartment in Bandra"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {propertyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area (sq ft) *
              </label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.area ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="1200"
                min="1"
              />
              {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Rent (₹) *
              </label>
              <div className="relative">
                <CurrencyRupeeIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="number"
                  name="rent"
                  value={formData.rent}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.rent ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="25000"
                  min="1"
                />
              </div>
              {errors.rent && <p className="text-red-500 text-sm mt-1">{errors.rent}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Security Deposit (₹)
              </label>
              <input
                type="number"
                name="securityDeposit"
                value={formData.securityDeposit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="50000 (Optional - defaults to 2x rent)"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bedrooms *
              </label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.bedrooms ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="2"
                min="0"
              />
              {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bathrooms *
              </label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.bathrooms ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="2"
                min="0"
              />
              {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Furnished Status
              </label>
              <select
                name="furnished"
                value={formData.furnished}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {furnishedOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Tenants
              </label>
              <select
                name="preferredTenants"
                value={formData.preferredTenants}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {tenantPreferences.map(preference => (
                  <option key={preference} value={preference}>{preference}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available From
              </label>
              <input
                type="date"
                name="availableFrom"
                value={formData.availableFrom}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.availableFrom ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.availableFrom && <p className="text-red-500 text-sm mt-1">{errors.availableFrom}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe your property in detail..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <MapPinIcon className="w-6 h-6 mr-2" />
            Address Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors['address.street'] ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="123 Main Street, Building Name"
              />
              {errors['address.street'] && <p className="text-red-500 text-sm mt-1">{errors['address.street']}</p>}
            </div>
           

            {/* Country Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
              <select
                name="address.country"
                value={selectedCountryId}
                onChange={e => setSelectedCountryId(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors['address.country'] ? 'border-red-300' : 'border-gray-300'}`}
              >
                <option value="">Select Country</option>
                {countryOptions.map(country => (
                  <option key={country.id} value={country.id}>{country.name}</option>
                ))}
              </select>
              {errors['address.country'] && <p className="text-red-500 text-sm mt-1">{errors['address.country']}</p>}
            </div>

            {/* State Select (show only if country selected) */}
            {selectedCountryId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                <select
                  name="address.state"
                  value={selectedStateId}
                  onChange={e => setSelectedStateId(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors['address.state'] ? 'border-red-300' : 'border-gray-300'}`}
                  disabled={!stateOptions.length}
                >
                  <option value="">Select State</option>
                  {stateOptions.map(state => (
                    <option key={state.id} value={state.id}>{state.name}</option>
                  ))}
                </select>
                {errors['address.state'] && <p className="text-red-500 text-sm mt-1">{errors['address.state']}</p>}
              </div>
            )}

            {/* City Select (show only if state selected) */}
            {selectedStateId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">District / City *</label>
                <select
                  name="address.city"
                  value={selectedCityId}
                  onChange={e => setSelectedCityId(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors['address.city'] ? 'border-red-300' : 'border-gray-300'}`}
                  disabled={!cityOptions.length}
                >
                  <option value="">Select City</option>
                  {cityOptions.map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
                {errors['address.city'] && <p className="text-red-500 text-sm mt-1">{errors['address.city']}</p>}
              </div>
            )}

            {/* Zip Code Last */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code *
              </label>
              <input
                type="text"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors['address.zipCode'] ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="400001"
                pattern="[0-9]{6}"
                maxLength="6"
              />
              {errors['address.zipCode'] && <p className="text-red-500 text-sm mt-1">{errors['address.zipCode']}</p>}
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Amenities</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {amenitiesList.map(amenity => (
              <label key={amenity} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(amenity)}
                  onChange={() => handleAmenityChange(amenity)}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Property Photos *
          </h2>
          
          <div className="mb-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotosChange}
              className="hidden"
              id="photos-upload"
            />
            <label
              htmlFor="photos-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <PhotoIcon className="w-5 h-5 mr-2" />
              Upload Photos
            </label>
            <p className="text-sm text-gray-500 mt-2">
              Upload up to 10 photos. Maximum size 5MB each.
            </p>
            {errors.photos && <p className="text-red-500 text-sm mt-1">{errors.photos}</p>}
          </div>

          {photosPreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photosPreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview.url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Documents (Optional)
          </h2>
          
          <div className="mb-4">
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={handleDocumentsChange}
              className="hidden"
              id="documents-upload"
            />
            <label
              htmlFor="documents-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <DocumentIcon className="w-5 h-5 mr-2" />
              Upload Documents
            </label>
            <p className="text-sm text-gray-500 mt-2">
              Upload property documents like agreements, certificates etc. Maximum 5 documents, 10MB each.
            </p>
          </div>

          {documents.length > 0 && (
            <div className="space-y-2">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <DocumentIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">{doc.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/owner/properties')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium flex items-center"
          >
            {submitting ? (
              <>
                <LoadingSpinner size="small" color="white" className="mr-2" />
                Adding Property...
              </>
            ) : (
              'Add Property'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddProperty
