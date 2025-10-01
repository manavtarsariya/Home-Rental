import API from './api'

export const feedbackService = {
  // Create feedback
  createFeedback: async (feedbackData) => {
    const response = await API.post('/feedback', feedbackData)
    return response
  },

  // Get property feedback
  getPropertyFeedback: async (propertyId) => {
    const response = await API.get(`/feedback/property/${propertyId}`)
    return response
  },

  // Get my feedback
  getMyFeedback: async () => {
    const response = await API.get('/feedback/my')
    return response
  },

  // Update feedback
  updateFeedback: async (id, feedbackData) => {
    const response = await API.put(`/feedback/${id}`, feedbackData)
    return response
  },

  // Delete feedback
  deleteFeedback: async (id) => {
    const response = await API.delete(`/feedback/${id}`)
    return response
  },
}
