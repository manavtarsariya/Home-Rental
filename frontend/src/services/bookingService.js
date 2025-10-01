import API from './api'

export const bookingService = {
  // Get all bookings
  getBookings: async () => {
    const response = await API.get('/bookings')
    return response
  },

  // Get single booking
  getBooking: async (id) => {
    const response = await API.get(`/bookings/${id}`)
    return response
  },

  // Create booking
  createBooking: async (bookingData) => {
    const response = await API.post('/bookings', bookingData)
    return response
  },

  // Update booking status
  updateBookingStatus: async (id, statusData) => {
    const response = await API.put(`/bookings/${id}/status`, statusData)
    return response
  },

  // Schedule visit
  scheduleVisit: async (id, visitData) => {
    const response = await API.put(`/bookings/${id}/visit`, visitData)
    return response
  },

  // Cancel booking
  cancelBooking: async (id) => {
    const response = await API.delete(`/bookings/${id}`)
    return response
  },
}
