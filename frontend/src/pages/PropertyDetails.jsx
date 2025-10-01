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
  ShareIcon
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

  useEffect(() => {
    fetchPropertyDetails()
    fetchPropertyFeedback()
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

  const handleContactOwner = () => {
    if (!user) {
      toast.error('Please login to contact the owner')
      navigate('/login')
      return
    }
    
    // Implement contact functionality
    toast.success('Contact information revealed!')
  }

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
                src={`/uploads/properties/${property.photos[currentImageIndex]?.filename}`}
                alt={property.title}
                className="w-full h-96 object-cover rounded-lg"
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
                src={`/uploads/properties/${photo.filename}`}
                alt={`${property.title} ${index + 2}`}
                className="w-full h-44 object-cover rounded-lg cursor-pointer hover:opacity-75"
                onClick={() => setCurrentImageIndex(index + 1)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Property Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPinIcon className="w-5 h-5 mr-1" />
                  <span>{property.address.street}, {property.address.city}, {property.address.state}</span>
                </div>
                {averageRating > 0 && (
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {averageRating.toFixed(1)} ({feedback.length} reviews)
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={toggleFavorite}
                  className="p-2 rounded-full border border-gray-300 hover:bg-gray-50"
                >
                  {isFavorite ? (
                    <HeartSolidIcon className="w-6 h-6 text-red-500" />
                  ) : (
                    <HeartIcon className="w-6 h-6 text-gray-600" />
                  )}
                </button>
                <button
                  onClick={shareProperty}
                  className="p-2 rounded-full border border-gray-300 hover:bg-gray-50"
                >
                  <ShareIcon className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full font-medium">
                {property.type}
              </span>
              <span>{property.area} sq ft</span>
              <span>{property.bedrooms} BHK</span>
              <span>{property.bathrooms} Bath</span>
              <span>{property.furnished}</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-600 leading-relaxed">{property.description}</p>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews & Ratings</h2>
            {feedback.length > 0 ? (
              <div className="space-y-4">
                {feedback.slice(0, 3).map((review, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {review.tenant.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{review.tenant.name}</p>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
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
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
                {feedback.length > 3 && (
                  <button className="text-primary-600 hover:text-primary-500 font-medium">
                    View all {feedback.length} reviews
                  </button>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No reviews yet for this property.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Booking Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{property.rent.toLocaleString()}
                </span>
                <span className="text-gray-600">/ month</span>
              </div>
              <p className="text-sm text-gray-500">
                Security Deposit: ₹{property.securityDeposit?.toLocaleString() || (property.rent * 2).toLocaleString()}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Available from:</span>
                <span className="font-medium">
                  {new Date(property.availableFrom).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Preferred for:</span>
                <span className="font-medium">{property.preferredTenants}</span>
              </div>
            </div>

            {property.isAvailable ? (
              <div className="space-y-3">
                <button
                  onClick={handleBookProperty}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
                >
                  Book Property
                </button>
                <button
                  onClick={handleContactOwner}
                  className="w-full border border-primary-600 text-primary-600 py-3 px-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors duration-200"
                >
                  Contact Owner
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-red-600 font-semibold">Property Not Available</p>
                <p className="text-sm text-gray-500 mt-1">This property is currently rented</p>
              </div>
            )}
          </div>

          {/* Owner Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Owner</h3>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white text-lg font-medium">
                {property.owner.name.charAt(0)}
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">{property.owner.name}</p>
                <p className="text-sm text-gray-500">Property Owner</p>
              </div>
            </div>
            
            {user && (
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <EnvelopeIcon className="w-5 h-5 mr-2" />
                  <span className="text-sm">{property.owner.email}</span>
                </div>
                {property.owner.contactNumber && (
                  <div className="flex items-center text-gray-600">
                    <PhoneIcon className="w-5 h-5 mr-2" />
                    <span className="text-sm">{property.owner.contactNumber}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyDetails
