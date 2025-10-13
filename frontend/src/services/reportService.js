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
  getReports: async () => {
    // axios GET uses params for querystring
    const response = await API.get('/reports')
    return response
  },

  // Update report status
  updateReportStatus: async (reportId, action) => {
    const response = await API.patch(`/reports/takeaction/${reportId}`, { action })
    return response
  },
}

export default reportService
