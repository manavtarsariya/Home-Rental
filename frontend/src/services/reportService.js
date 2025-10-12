import API from './api'

export const reportService = {
  // Submit a report about a property/owner/listing
  submitReport: async ({ propertyId, ownerId, tenantId, category, details }) => {
    const payload = {
      property: propertyId,
      owner: ownerId,
      reporter: tenantId,
      category,
      details,
    }
    const response = await API.post('/reports', payload)
    return response
  },

  // Get reports (admin only). Optional query params can be passed via payload
  getReports: async (payload = {}) => {
    // axios GET uses params for querystring
    const response = await API.get('/reports', { params: payload })
    return response
  },

  // Update report status
  updateReportStatus: async (reportId, status) => {
    const response = await API.patch(`/reports/${reportId}/status`, { status })
    return response
  },
}

export default reportService
