import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { propertyService } from '../../services/propertyService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  PhotoIcon,
  DocumentIcon,
  XMarkIcon,
  MapPinIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const EditProperty = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [property, setProperty] = useState(null)
  const [newPhotos, setNewPhotos] = useState([])
  const [newDocuments, setNewDocuments] = useState([])
  const [newPhotosPreviews, setNewPhotosPreviews] = useState([])
  const [photosToRemove, setPhotosToRemove] = useState([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
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
    availableFrom: '',
    isAvailable: true
  })

  const [errors, setErrors] = useState({})

  const propertyTypes = ['Apartment', 'Villa', 'PG', 'House', 'Flat', 'Studio', 'Duplex']
  const furnishedOptions = ['Fully Furnished', 'Semi Furnished', 'Unfurnished']
  const tenantPreferences = ['Family', 'Bachelor', 'Company', 'Any']
  const amenitiesList = [
    'Parking', 'Swimming Pool', 'Gym', 'Garden', 'Balcony', 
    'AC', 'Furnished', 'WiFi', 'Security', 'Elevator',
    'Power Backup', 'Water Supply', 'Maintenance', 'Pet Friendly'
  ]

  useEffect(() => {
    fetchProperty()
  }, [id])

  const fetchProperty = async () => {
    try {
      setLoading(true)
      const response = await propertyService.getProperty(id)
      const propertyData = response.data
      
      setProperty(propertyData)
      setFormData({
        title: propertyData.title,
        description: propertyData.description,
        address: propertyData.address,
        area: propertyData.area,
        type: propertyData.type,
        rent: propertyData.rent,
        securityDeposit: propertyData.securityDeposit,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        furnished: propertyData.furnished,
        preferredTenants: propertyData.preferredTenants,
        amenities: propertyData.amenities || [],
        availableFrom: propertyData.availableFrom ? new Date(propertyData.availableFrom).toISOString().split('T')[0] : '',
        isAvailable: propertyData.isAvailable
      })
    } catch (error) {
      toast.error('Failed to load property details')
      navigate('/owner/properties')
    } finally {
      setLoading(false)
    }
  }

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

  const handleNewPhotosChange = (e) => {
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

    const totalPhotos = (property?.photos?.length || 0) + newPhotos.length + validFiles.length - photosToRemove.length
    if (totalPhotos > 10) {
      toast.error('Maximum 10 photos allowed')
      return
    }

    setNewPhotos(prev => [...prev, ...validFiles])

    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setNewPhotosPreviews(prev => [...prev, {
          file: file,
          url: e.target.result
        }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeNewPhoto = (index) => {
    setNewPhotos(prev => prev.filter((_, i) => i !== index))
    setNewPhotosPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingPhoto = (photoId) => {
    setPhotosToRemove(prev => [...prev, photoId])
  }

  const restorePhoto = (photoId) => {
    setPhotosToRemove(prev => prev.filter(id => id !== photoId))
  }

  const handleNewDocumentsChange = (e) => {
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

    const totalDocs = (property?.documents?.length || 0) + newDocuments.length + validFiles.length
    if (totalDocs > 5) {
      toast.error('Maximum 5 documents allowed')
      return
    }

    setNewDocuments(prev => [...prev, ...validFiles])
  }

  const removeNewDocument = (index) => {
    setNewDocuments(prev => prev.filter((_, i) => i !== index))
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

    const remainingPhotos = (property?.photos?.length || 0) - photosToRemove.length + newPhotos.length
    if (remainingPhotos === 0) {
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

    setUpdating(true)

    try {
      const updateData = {
        ...formData,
        securityDeposit: formData.securityDeposit || formData.rent * 2
      }

      // If there are new photos or photos to remove, include them
      if (newPhotos.length > 0 || photosToRemove.length > 0) {
        updateData.newPhotos = newPhotos
        updateData.photosToRemove = photosToRemove
      }

      if (newDocuments.length > 0) {
        updateData.newDocuments = newDocuments
      }

      await propertyService.updateProperty(id, updateData)
      
      toast.success('Property updated successfully!')
      navigate('/owner/properties')
    } catch (error) {
      console.error('Error updating property:', error)
      toast.error('Failed to update property. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading property details..." />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property not found</h2>
          <button
            onClick={() => navigate('/owner/properties')}
            className="text-primary-600 hover:text-primary-500"
          >
            Back to properties
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
        <p className="text-gray-600 mt-2">Update your property information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Modern 2BHK Apartment in Bandra"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe your property, its features, nearby amenities, etc."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {propertyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area (sq ft) *
              </label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.area ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., 1200"
              />
              {errors.area && <p className="mt-1 text-sm text-red-600">{errors.area}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms *
              </label>
              <input
                type="number"
                name="bedrooms"
                min="0"
                value={formData.bedrooms}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.bedrooms ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., 2"
              />
              {errors.bedrooms && <p className="mt-1 text-sm text-red-600">{errors.bedrooms}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bathrooms *
              </label>
              <input
                type="number"
                name="bathrooms"
                min="0"
                value={formData.bathrooms}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.bathrooms ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., 2"
              />
              {errors.bathrooms && <p className="mt-1 text-sm text-red-600">{errors.bathrooms}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Furnished Status
              </label>
              <select
                name="furnished"
                value={formData.furnished}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {furnishedOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Tenants
              </label>
              <select
                name="preferredTenants"
                value={formData.preferredTenants}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {tenantPreferences.map(pref => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Available for rent</span>
              </label>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <MapPinIcon className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Address Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors['address.street'] ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., 123 Main Street, Building Name"
              />
              {errors['address.street'] && <p className="mt-1 text-sm text-red-600">{errors['address.street']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors['address.city'] ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Mumbai"
              />
              {errors['address.city'] && <p className="mt-1 text-sm text-red-600">{errors['address.city']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors['address.state'] ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Maharashtra"
              />
              {errors['address.state'] && <p className="mt-1 text-sm text-red-600">{errors['address.state']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zip Code *
              </label>
              <input
                type="text"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors['address.zipCode'] ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., 400001"
              />
              {errors['address.zipCode'] && <p className="mt-1 text-sm text-red-600">{errors['address.zipCode']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                name="address.country"
                value={formData.address.country}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Pricing Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <CurrencyRupeeIcon className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Pricing Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Rent (₹) *
              </label>
              <input
                type="number"
                name="rent"
                value={formData.rent}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.rent ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., 25000"
              />
              {errors.rent && <p className="mt-1 text-sm text-red-600">{errors.rent}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Security Deposit (₹)
              </label>
              <input
                type="number"
                name="securityDeposit"
                value={formData.securityDeposit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Leave empty for 2x monthly rent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Default: {formData.rent ? `₹${(formData.rent * 2).toLocaleString()}` : '2x monthly rent'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available From
              </label>
              <input
                type="date"
                name="availableFrom"
                value={formData.availableFrom}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {amenitiesList.map(amenity => (
              <label key={amenity} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(amenity)}
                  onChange={() => handleAmenityChange(amenity)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Existing Photos */}
        {property.photos && property.photos.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Photos</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              {property.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={`/uploads/properties/${photo.filename}`}
                    alt={`Property ${index + 1}`}
                    className={`w-full h-32 object-cover rounded-lg ${
                      photosToRemove.includes(photo._id) ? 'opacity-50 grayscale' : ''
                    }`}
                  />
                  {photosToRemove.includes(photo._id) ? (
                    <button
                      type="button"
                      onClick={() => restorePhoto(photo._id)}
                      className="absolute top-2 right-2 bg-green-600 text-white rounded-full p-1 hover:bg-green-700 text-xs"
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeExistingPhoto(photo._id)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Photos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Photos</h2>
          
          <div className="mb-4">
            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Click to upload new photos
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG up to 5MB each
                </p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleNewPhotosChange}
                className="hidden"
              />
            </label>
            {errors.photos && <p className="mt-1 text-sm text-red-600">{errors.photos}</p>}
          </div>

          {/* New Photo Previews */}
          {newPhotosPreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {newPhotosPreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview.url}
                    alt={`New Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewPhoto(index)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                  <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    New
                  </span>
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
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updating}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {updating && <LoadingSpinner size="small" color="white" className="mr-2" />}
            {updating ? 'Updating Property...' : 'Update Property'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditProperty
