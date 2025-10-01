import React, { useState, useEffect } from 'react'
import { feedbackService } from '../../services/feedbackService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  StarIcon,
  PencilIcon,
  TrashIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

const MyFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingFeedback, setEditingFeedback] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    fetchMyFeedback()
  }, [])

  const fetchMyFeedback = async () => {
    try {
      setLoading(true)
      const response = await feedbackService.getMyFeedback()
      setFeedbacks(response.data || [])
    } catch (error) {
      toast.error('Failed to load feedback')
      console.error('Error fetching feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return
    }

    try {
      await feedbackService.deleteFeedback(feedbackId)
      toast.success('Review deleted successfully')
      fetchMyFeedback()
    } catch (error) {
      toast.error('Failed to delete review')
      console.error('Error deleting feedback:', error)
    }
  }

  const handleEditFeedback = async (feedbackData) => {
    try {
      await feedbackService.updateFeedback(editingFeedback._id, feedbackData)
      toast.success('Review updated successfully')
      setShowEditModal(false)
      setEditingFeedback(null)
      fetchMyFeedback()
    } catch (error) {
      toast.error('Failed to update review')
      console.error('Error updating feedback:', error)
    }
  }

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return [...Array(5)].map((_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => interactive && onStarClick && onStarClick(i + 1)}
        className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
      >
        {i < rating ? (
          <StarSolidIcon className="w-5 h-5 text-yellow-400" />
        ) : (
          <StarIcon className="w-5 h-5 text-gray-300" />
        )}
      </button>
    ))
  }

  const EditFeedbackModal = ({ feedback, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      rating: feedback.rating,
      comment: feedback.comment || '',
      categories: {
        cleanliness: feedback.categories?.cleanliness || 5,
        location: feedback.categories?.location || 5,
        amenities: feedback.categories?.amenities || 5,
        ownerBehavior: feedback.categories?.ownerBehavior || 5,
        valueForMoney: feedback.categories?.valueForMoney || 5
      }
    })

    const handleSubmit = (e) => {
      e.preventDefault()
      onSave(formData)
    }

    const categoryLabels = {
      cleanliness: 'Cleanliness',
      location: 'Location',
      amenities: 'Amenities',
      ownerBehavior: 'Owner Behavior',
      valueForMoney: 'Value for Money'
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl font-semibold mb-4">Edit Review</h3>
          
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium">{feedback.property?.title}</h4>
            <p className="text-sm text-gray-600">{feedback.property?.address?.city}, {feedback.property?.address?.state}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Overall Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Rating
                </label>
                <div className="flex space-x-1">
                  {renderStars(formData.rating, true, (rating) => 
                    setFormData({...formData, rating})
                  )}
                </div>
              </div>

              {/* Category Ratings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Category Ratings
                </label>
                <div className="space-y-3">
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{label}</span>
                      <div className="flex space-x-1">
                        {renderStars(formData.categories[key], true, (rating) => 
                          setFormData({
                            ...formData, 
                            categories: {...formData.categories, [key]: rating}
                          })
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Share your experience with this property..."
                  value={formData.comment}
                  onChange={(e) => setFormData({...formData, comment: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Update Review
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const FeedbackCard = ({ feedback }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            {feedback.property?.title || 'Property Not Available'}
          </h3>
          {feedback.property && (
            <p className="text-sm text-gray-500 mb-2">
              {feedback.property.address?.city}, {feedback.property.address?.state}
            </p>
          )}
          
          <div className="flex items-center mb-2">
            <div className="flex space-x-1 mr-3">
              {renderStars(feedback.rating)}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {feedback.rating}/5 stars
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setEditingFeedback(feedback)
              setShowEditModal(true)
            }}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Edit Review"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handleDeleteFeedback(feedback._id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Delete Review"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Ratings */}
      {feedback.categories && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Category Ratings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {Object.entries(feedback.categories).map(([key, rating]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-gray-600 capitalize">
                  {key === 'ownerBehavior' ? 'Owner Behavior' : 
                   key === 'valueForMoney' ? 'Value for Money' : key}
                </span>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-3 h-3 ${
                        i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comment */}
      {feedback.comment && (
        <div className="mb-4">
          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg italic">
            "{feedback.comment}"
          </p>
        </div>
      )}

      {/* Owner Response */}
      {feedback.ownerResponse && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Owner Response</h4>
          <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
            {feedback.ownerResponse.message}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Responded on {new Date(feedback.ownerResponse.respondedAt).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Posted {new Date(feedback.createdAt).toLocaleDateString()}
        </p>
        
        <div className="flex items-center">
          {feedback.isVerified && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full mr-2">
              Verified
            </span>
          )}
          <span className={`text-xs px-2 py-1 rounded-full ${
            feedback.isVisible ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {feedback.isVisible ? 'Public' : 'Hidden'}
          </span>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading your reviews..." />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
        <p className="text-gray-600 mt-2">Manage your property reviews and ratings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Reviews</p>
          <p className="text-2xl font-bold text-gray-900">{feedbacks.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Average Rating</p>
          <p className="text-2xl font-bold text-yellow-600">
            {feedbacks.length > 0 
              ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
              : '0.0'
            }
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Owner Responses</p>
          <p className="text-2xl font-bold text-blue-600">
            {feedbacks.filter(f => f.ownerResponse).length}
          </p>
        </div>
      </div>

      {/* Reviews List */}
      {feedbacks.length > 0 ? (
        <div className="space-y-6">
          {feedbacks.map((feedback) => (
            <FeedbackCard key={feedback._id} feedback={feedback} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600 mb-4">
            Your property reviews will appear here after you write them
          </p>
          <p className="text-sm text-gray-500">
            You can write reviews for properties you have rented or visited
          </p>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingFeedback && (
        <EditFeedbackModal
          feedback={editingFeedback}
          onClose={() => {
            setShowEditModal(false)
            setEditingFeedback(null)
          }}
          onSave={handleEditFeedback}
        />
      )}
    </div>
  )
}

export default MyFeedback
