import API from './api'

export const adminService = {
  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await API.get('/admin/stats')
    return response
  },

  // User management
  getUsers: async () => {
    const response = await API.get('/admin/users')
    return response
  },

  updateUserStatus: async (id, statusData) => {
    const response = await API.put(`/admin/users/${id}/status`, statusData)
    return response
  },

  deleteUser: async (id) => {
    const response = await API.delete(`/admin/users/${id}`)
    return response
  },

  // Property management
  getAllProperties: async () => {
    const response = await API.get('/admin/properties')
    return response
  },

  updatePropertyStatus: async (id, statusData) => {
    const response = await API.put(`/admin/properties/${id}/status`, statusData)
    return response
  },

  // Booking management
  getAllBookings: async () => {
    const response = await API.get('/admin/bookings')
    return response
  },
}
