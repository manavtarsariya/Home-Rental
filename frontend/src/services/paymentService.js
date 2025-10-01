import API from './api'

export const paymentService = {
  // Get all payments
  getPayments: async () => {
    const response = await API.get('/payments')
    return response
  },

  // Get single payment
  getPayment: async (id) => {
    const response = await API.get(`/payments/${id}`)
    return response
  },

  // Create payment
  createPayment: async (paymentData) => {
    const response = await API.post('/payments', paymentData)
    return response
  },

  // Process payment
  processPayment: async (paymentData) => {
    const response = await API.post('/payments/process', paymentData)
    return response
  },

  // Get payment statistics
  getPaymentStats: async () => {
    const response = await API.get('/payments/stats')
    return response
  },
}
