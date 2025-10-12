import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { propertyService } from '../services/propertyService'
import { feedbackService } from '../services/feedbackService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import {
  MapPinIcon,
  HomeIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  StarIcon,
  HeartIcon,
  ShareIcon,
  BuildingOfficeIcon,
  CubeIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  CheckBadgeIcon,
  ClockIcon,
  BedDoubleIcon,
  WifiIcon,
  TvIcon,
  FireIcon,
  BeakerIcon,
  TruckIcon,
  ShieldExclamationIcon,
  SunIcon,
  ComputerDesktopIcon,
  FunnelIcon,
  SwatchIcon,
  AcademicCapIcon,
  LifebuoyIcon,
  ShoppingBagIcon,
  CpuChipIcon,
  GlobeAltIcon,
  ArrowUpIcon,
  BoltIcon,
  WrenchIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

const PropertyDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [property, setProperty] = useState(null)
  const [feedback, setFeedback] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [scheduleData, setScheduleData] = useState({
    preferredDate: '',
    preferredTime: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    message: ''
  })
  const [similarProperties, setSimilarProperties] = useState([])

  // Helper function to get amenity icon
  const getAmenityIcon = (amenity) => {
    const amenityName = amenity.toLowerCase()
    if (amenityName.includes('parking')) {
      return <TruckIcon className="w-5 h-5 text-primary-600" />
    }
    if (amenityName.includes('swimming pool') || amenityName.includes('pool')) {
      return <SunIcon className="w-5 h-5 text-primary-600" />
    }
    if (amenityName.includes('gym')) {
      return <BeakerIcon className="w-5 h-5 text-primary-600" />
    }
    if (amenityName.includes('garden')) {
      return <SunIcon className="w-5 h-5 text-primary-600" />
    }
    if (amenityName.includes('balcony')) {
      return <BuildingOfficeIcon className="w-5 h-5 text-primary-600" />
    }
    if (amenityName === 'ac' || amenityName.includes('air conditioning')) {
      return <FunnelIcon className="w-5 h-5 text-primary-600" />
    }
    if (amenityName.includes('furnished')) {
      return <HomeIcon className="w-5 h-5 text-primary-600" />
    }
    if (amenityName.includes('wifi')) {
      return <WifiIcon className="w-5 h-5 text-primary-600" />
    }
    if (amenityName.includes('security')) {
      return <ShieldExclamationIcon className="w-5 h-5 text-primary-600" />
    }
    if (amenityName.includes('elevator') || amenityName.includes('lift')) {
      return <ArrowUpIcon className="w-5 h-5 text-primary-600" />
    }
    if (amenityName.includes('power backup') || amenityName.includes('backup')) {
      return <BoltIcon className="w-5 h-5 text-primary-600" />
    }
    if (amenityName.includes('water supply') || amenityName.includes('water')) {
      return <SwatchIcon className="w-5 h-5 text-primary-600" />
    }
    if (amenityName.includes('maintenance')) {
      return <WrenchIcon className="w-5 h-5 text-primary-600" />
    }
    if (amenityName.includes('pet friendly') || amenityName.includes('pet')) {
      return <UserIcon className="w-5 h-5 text-primary-600" />
    }
    // Default icon
    return <CheckBadgeIcon className="w-5 h-5 text-primary-600" />
  }

  useEffect(() => {
    fetchPropertyDetails()
    fetchPropertyFeedback()
    fetchSimilarProperties()
  }, [id])

  const fetchPropertyDetails = async () => {
    try {
      const response = await propertyService.getProperty(id)
      setProperty(response.data)
    } catch (error) {
      toast.error('Failed to load property details')
      navigate('/properties')
    } finally {
      setLoading(false)
    }
  }

  const fetchPropertyFeedback = async () => {
    try {
      const response = await feedbackService.getPropertyFeedback(id)
      setFeedback(response.data)
      setAverageRating(response.averageRating || 0)
    } catch (error) {
      console.error('Failed to load feedback:', error)
    }
  }

  const fetchSimilarProperties = async () => {
    try {
      // This would typically be an API call to get similar properties
      // For now, we'll create mock data
      const mockSimilarProperties = [
        {
          _id: 'prop1',
          title: 'Luxury 3BHK Apartment',
          rent: 25000,
          bedrooms: 3,
          bathrooms: 2,
          area: 1200,
          address: { city: 'Mumbai', state: 'Maharashtra' },
          type: 'Apartment',
          photos: [{ filename: 'placeholder.jpg' }],
          isAvailable: true
        },
        {
          _id: 'prop2',
          title: 'Modern 2BHK Flat',
          rent: 18000,
          bedrooms: 2,
          bathrooms: 2,
          area: 900,
          address: { city: 'Mumbai', state: 'Maharashtra' },
          type: 'Flat',
          photos: [{ filename: 'placeholder.jpg' }],
          isAvailable: true
        },
        {
          _id: 'prop3',
          title: 'Spacious 4BHK Villa',
          rent: 45000,
          bedrooms: 4,
          bathrooms: 3,
          area: 2000,
          address: { city: 'Mumbai', state: 'Maharashtra' },
          type: 'Villa',
          photos: [{ filename: 'placeholder.jpg' }],
          isAvailable: true
        }
      ]
      setSimilarProperties(mockSimilarProperties)
    } catch (error) {
      console.error('Failed to load similar properties:', error)
    }
  }

  const handleBookProperty = () => {
    if (!user) {
      toast.error('Please login to book a property')
      navigate('/login')
      return
    }

    if (user.role !== 'Tenant') {
      toast.error('Only tenants can book properties')
      return
    }

    navigate(`/tenant/bookings/create/${id}`)
  }

  // const handleContactOwner = () => {
  //   if (!user) {
  //     toast.error('Please login to contact the owner')
  //     navigate('/login')
  //     return
  //   }

  //   // Implement contact functionality
  //   toast.success('Contact information revealed!')
  // }

  const toggleFavorite = () => {
    if (!user) {
      toast.error('Please login to save favorites')
      return
    }
    setIsFavorite(!isFavorite)
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites')
  }

  const shareProperty = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Property link copied to clipboard!')
    }
  }

  // const handleScheduleVisit = (e) => {
  //   e.preventDefault()
  //   if (!user) {
  //     toast.error('Please login to schedule a visit')
  //     navigate('/login')
  //     return
  //   }

  //   // Basic validation
  //   if (!scheduleData.preferredDate || !scheduleData.contactName || !scheduleData.contactPhone) {
  //     toast.error('Please fill all required fields')
  //     return
  //   }

  //   // Here you would typically send the data to your backend
  //   console.log('Schedule visit data:', scheduleData)
  //   toast.success('Visit scheduled successfully! You will receive a confirmation call.')
  //   setShowScheduleForm(false)
  //   setScheduleData({
  //     preferredDate: '',
  //     preferredTime: '',
  //     contactName: '',
  //     contactPhone: '',
  //     contactEmail: '',
  //     message: ''
  //   })
  // }

  const handleScheduleInputChange = (e) => {
    const { name, value } = e.target
    setScheduleData(prev => ({
      ...prev,
      [name]: value
    }))
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
          <Link to="/properties" className="text-primary-600 hover:text-primary-500">
            Browse other properties
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Property Images */}
      <div className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Main Image */}
          <div className="relative">
            {property.photos && property.photos.length > 0 ? (
              <img
                src={property.photos[currentImageIndex]?.url || `/uploads/properties/${property.photos[currentImageIndex]?.filename}`}
                alt={property.title}
                className="w-full h-96 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = '/placeholder.png'
                }}
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <HomeIcon className="w-20 h-20 text-gray-400" />
              </div>
            )}
            {/* Image Navigation */}
            {property.photos && property.photos.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  disabled={currentImageIndex === 0}
                >
                  ‹
                </button>
                <button
                  onClick={() => setCurrentImageIndex(Math.min(property.photos.length - 1, currentImageIndex + 1))}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  disabled={currentImageIndex === property.photos.length - 1}
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Images */}
          <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {property.photos && property.photos.slice(1, 5).map((photo, index) => (
              <img
                key={index}
                src={photo.url || `/uploads/properties/${photo.filename}`}
                alt={`${property.title} ${index + 2}`}
                className="w-full h-44 object-cover rounded-lg cursor-pointer hover:opacity-75"
                onClick={() => setCurrentImageIndex(index + 1)}
                onError={(e) => {
                  e.target.src = '/placeholder.png'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Enhanced Property Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">{property.title}</h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPinIcon className="w-5 h-5 mr-2 text-primary-600" />
                  <span className="text-lg">{property.address.street}, {property.address.city}, {property.address.state}</span>
                </div>

                {/* Rating and Reviews */}
                {averageRating > 0 && (
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-5 h-5 ${i < Math.floor(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {averageRating.toFixed(1)} ({feedback.length} reviews)
                    </span>
                  </div>
                )}

                {/* Property Type and Availability Status */}
                <div className="flex items-center space-x-3 mb-6">
                  <span className="bg-primary-100 text-primary-800 px-4 py-2 rounded-full font-semibold text-sm">
                    {property.type}
                  </span>
                  {property.isAvailable ? (
                    <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold text-sm flex items-center">
                      <CheckBadgeIcon className="w-4 h-4 mr-1" />
                      Available
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full font-semibold text-sm">
                      Not Available
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={toggleFavorite}
                  className="p-3 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                >
                  {isFavorite ? (
                    <HeartSolidIcon className="w-6 h-6 text-red-500" />
                  ) : (
                    <HeartIcon className="w-6 h-6 text-gray-600" />
                  )}
                </button>
                <button
                  onClick={shareProperty}
                  className="p-3 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                >
                  <ShareIcon className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Property Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6 ">
              {/* Area */}
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <CubeIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Area</p>
                <p className="font-semibold text-gray-900">{property.area} sq ft</p>
              </div>

              {/* Bedrooms */}
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <HomeIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Bedrooms</p>
                <p className="font-semibold text-gray-900">{property.bedrooms} BHK</p>
              </div>

              {/* Bathrooms */}
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <BuildingOfficeIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Bathrooms</p>
                <p className="font-semibold text-gray-900">{property.bathrooms}</p>
              </div>

              {/* Rent */}
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <BanknotesIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Monthly Rent</p>
                <p className="font-semibold text-gray-900">₹{property.rent.toLocaleString()}</p>
              </div>

              {/* Security Deposit */}
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <ShieldCheckIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Security</p>
                <p className="font-semibold text-gray-900">₹{(property.securityDeposit || property.rent * 2).toLocaleString()}</p>
              </div>

              {/* Furnished Status */}
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <CheckBadgeIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Furnished</p>
                <p className="font-semibold text-gray-900">{property.furnished}</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Available from</p>
                  <p className="text-blue-900 font-semibold">
                    {new Date(property.availableFrom).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <UserIcon className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Preferred for</p>
                  <p className="text-blue-900 font-semibold">{property.preferredTenants}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-600 leading-relaxed">{property.description}</p>
          </div>

          {/* Enhanced Amenities */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Amenities & Features</h2>
            {property.amenities && property.amenities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center space-x-3">
                      {getAmenityIcon(amenity)}
                      <span className="text-gray-700 font-medium">{amenity}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <CheckBadgeIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-lg">No amenities listed</p>
                <p className="text-gray-400 text-sm mt-1">Contact the owner for more information about available amenities</p>
              </div>
            )}
          </div>

          {/* Location & Map */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Location</h2>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Address Info */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start space-x-4">
                  <MapPinIcon className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Property Address</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {property.address.street}<br />
                      {property.address.city}, {property.address.state}<br />
                      {property.address.zipCode && `${property.address.zipCode}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Google Maps Embed */}
              <div className="h-96 bg-gray-100 relative">
                {property.location && property.location.latitude && property.location.longitude ? (
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${property.location.latitude},${property.location.longitude}&zoom=15`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Property Location"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MapPinIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">Location details not available</p>
                      <p className="text-gray-400 text-sm mt-2">Map will be displayed when coordinates are provided</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Map Actions */}
              <div className="p-4 bg-gray-50 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <span>Get directions and explore the neighborhood</span>
                </div>
                {property.location && property.location.latitude && property.location.longitude && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${property.location.latitude},${property.location.longitude}`, '_blank')}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors duration-200"
                    >
                      Get Directions
                    </button>
                    <button
                      onClick={() => window.open(`https://www.google.com/maps/@${property.location.latitude},${property.location.longitude},15z`, '_blank')}
                      className="border border-primary-600 text-primary-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-50 transition-colors duration-200"
                    >
                      View on Maps
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Nearby Amenities */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">What's Nearby</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Schools & Education */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <AcademicCapIcon className="w-8 h-8 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Education</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ABC Public School</span>
                    <span className="text-sm text-blue-600 font-medium">0.5 km</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">XYZ College</span>
                    <span className="text-sm text-blue-600 font-medium">1.2 km</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">City University</span>
                    <span className="text-sm text-blue-600 font-medium">2.8 km</span>
                  </div>
                </div>
              </div>

              {/* Healthcare */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <LifebuoyIcon className="w-8 h-8 text-red-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Healthcare</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">City Hospital</span>
                    <span className="text-sm text-red-600 font-medium">0.8 km</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Medical Center</span>
                    <span className="text-sm text-red-600 font-medium">1.5 km</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pharmacy Plus</span>
                    <span className="text-sm text-red-600 font-medium">0.3 km</span>
                  </div>
                </div>
              </div>

              {/* Shopping & Dining */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <ShoppingBagIcon className="w-8 h-8 text-green-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Shopping</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Supermarket</span>
                    <span className="text-sm text-green-600 font-medium">0.2 km</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Shopping Mall</span>
                    <span className="text-sm text-green-600 font-medium">1.8 km</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Restaurants</span>
                    <span className="text-sm text-green-600 font-medium">0.1 km</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transportation */}
            <div className="mt-6 bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <GlobeAltIcon className="w-6 h-6 text-purple-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Transportation</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Bus Stop</span>
                  <span className="text-sm text-purple-600 font-medium">0.1 km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Metro Station</span>
                  <span className="text-sm text-purple-600 font-medium">1.5 km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Railway Station</span>
                  <span className="text-sm text-purple-600 font-medium">3.2 km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Airport</span>
                  <span className="text-sm text-purple-600 font-medium">15 km</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Reviews & Ratings</h2>
            {feedback.length > 0 ? (
              <div className="space-y-4">
                {feedback.slice(0, 3).map((review, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {review.tenant.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{review.tenant.name}</p>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
                {feedback.length > 3 && (
                  <button className="text-primary-600 hover:text-primary-500 font-medium">
                    View all {feedback.length} reviews
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <StarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-lg">No reviews yet for this property</p>
                <p className="text-gray-400 text-sm mt-1">Be the first to leave a review!</p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Sidebar */}
        <div className="lg:col-span-1 ">
          {/* Booking Card */}
          {/* <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24 shadow-lg"> */}

          {/* Enhanced Owner Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg ">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Owner</h3>
            {property.owner ? (
              <>
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {property.owner.name ? property.owner.name.charAt(0).toUpperCase() : 'O'}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900 text-lg">
                      {property.owner.name || 'Property Owner'}
                    </p>
                    <p className="text-sm text-gray-500">Property Owner</p>
                    <div className="flex items-center mt-1">
                      <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">4.8 (32 reviews)</span>
                    </div>
                  </div>
                </div>

                {user && (
                  <div className="space-y-3">
                    {property.owner.email && (
                      <div className="flex items-center text-gray-600 p-3 bg-gray-50 rounded-lg">
                        <EnvelopeIcon className="w-5 h-5 mr-3 text-primary-600" />
                        <span className="text-sm font-medium">{property.owner.email}</span>
                      </div>
                    )}
                    {property.owner.contactNumber && (
                      <div className="flex items-center text-gray-600 p-3 bg-gray-50 rounded-lg">
                        <PhoneIcon className="w-5 h-5 mr-3 text-primary-600" />
                        <span className="text-sm font-medium">{property.owner.contactNumber}</span>
                      </div>
                    )}
                    {!property.owner.email && !property.owner.contactNumber && (
                      <div className="text-center py-4 bg-yellow-50 rounded-lg">
                        <p className="text-yellow-700 text-sm">
                          Contact information will be shared after booking confirmation
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Owner information not available</p>
                <p className="text-gray-400 text-sm mt-1">Contact details will be provided upon request</p>
              </div>
            )}


          </div>
          <div className="bg-white border mt-6 border-gray-200 rounded-lg p-6 sticky top-24 shadow-lg">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{property.rent.toLocaleString()}
                </span>
                <span className="text-gray-600 text-lg">/ month</span>
              </div>
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                <strong>Security Deposit:</strong> ₹{(property.securityDeposit || property.rent * 2).toLocaleString()}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 font-medium">Available from:</span>
                <span className="font-semibold text-gray-900">
                  {new Date(property.availableFrom).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 font-medium">Preferred for:</span>
                <span className="font-semibold text-gray-900">{property.preferredTenants}</span>
              </div>
            </div>

            {property.isAvailable ? (
              <div className="space-y-3">
                <button
                  onClick={handleBookProperty}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200 shadow-md"
                >
                  Book Property
                </button>
                {/* <button
                  onClick={() => setShowScheduleForm(true)}
                  className="w-full border-2 border-primary-600 text-primary-600 py-3 px-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors duration-200"
                >
                  Schedule Visit
                </button> */}
                {/* <button
                  onClick={handleContactOwner}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200"
                >
                  Contact Owner
                </button> */}
              </div>
            ) : (
              <div className="text-center py-6 bg-red-50 rounded-lg">
                <p className="text-red-600 font-semibold text-lg">Property Not Available</p>
                <p className="text-sm text-red-500 mt-2">This property is currently rented</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Similar Properties Section */}
      {similarProperties.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Similar Properties</h2>
            <Link
              to="/properties"
              className="text-primary-600 hover:text-primary-500 font-medium flex items-center"
            >
              View all properties
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarProperties.map((similarProperty) => (
              <div key={similarProperty._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {/* Property Image */}
                <div className="relative h-48 bg-gray-200">
                  {similarProperty.photos && similarProperty.photos.length > 0 ? (
                    <img
                      src={similarProperty.photos[0].url || `/uploads/properties/${similarProperty.photos[0].filename}`}
                      alt={similarProperty.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder.png'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <HomeIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}

                  {similarProperty.isAvailable ? (
                    <span className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Available
                    </span>
                  ) : (
                    <span className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Rented
                    </span>
                  )}
                </div>

                {/* Property Details */}
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                      {similarProperty.title}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      {similarProperty.address.city}, {similarProperty.address.state}
                    </p>
                  </div>

                  {/* Property Stats */}
                  <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
                    <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded font-medium">
                      {similarProperty.type}
                    </span>
                    <div className="flex space-x-3">
                      <span>{similarProperty.bedrooms} BHK</span>
                      <span>{similarProperty.bathrooms} Bath</span>
                      <span>{similarProperty.area} sq ft</span>
                    </div>
                  </div>

                  {/* Price and Action */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{similarProperty.rent.toLocaleString()}
                      </span>
                      <span className="text-gray-500 text-sm">/ month</span>
                    </div>
                    <Link
                      to={`/properties/${similarProperty._id}`}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors duration-200"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {false && (
        <div>
          {/* Schedule Visit Modal */}
          {showScheduleForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Schedule a Visit</h3>
                    <button
                      onClick={() => setShowScheduleForm(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <form className="space-y-4 text-black">
                    {/* Preferred Date */}
                    <div>
                      <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="preferredDate"
                        name="preferredDate"
                        value={scheduleData.preferredDate}
                        onChange={handleScheduleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className=" w-full  px-3 py-2 border  border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>

                    {/* Preferred Time */}
                    <div>
                      <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Time
                      </label>
                      <select
                        id="preferredTime"
                        name="preferredTime"
                        value={scheduleData.preferredTime}
                        onChange={handleScheduleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select time</option>
                        <option value="09:00">9:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                        <option value="17:00">5:00 PM</option>
                      </select>
                    </div>

                    {/* Contact Name */}
                    <div>
                      <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="contactName"
                        name="contactName"
                        value={scheduleData.contactName}
                        onChange={handleScheduleInputChange}
                        placeholder="Enter your full name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>

                    {/* Contact Phone */}
                    <div>
                      <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="contactPhone"
                        name="contactPhone"
                        value={scheduleData.contactPhone}
                        onChange={handleScheduleInputChange}
                        placeholder="Enter your phone number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>

                    {/* Contact Email */}
                    <div>
                      <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="contactEmail"
                        name="contactEmail"
                        value={scheduleData.contactEmail}
                        onChange={handleScheduleInputChange}
                        placeholder="Enter your email address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={scheduleData.message}
                        onChange={handleScheduleInputChange}
                        placeholder="Any specific requirements or questions?"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    {/* Form Actions */}
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowScheduleForm(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                      >
                        Schedule Visit
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>)}
    </div>
  )
}

export default PropertyDetails
