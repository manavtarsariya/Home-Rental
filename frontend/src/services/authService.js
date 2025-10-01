import API from './api'

export const authService = {
  // Register user
  register: async (userData) => {
    const response = await API.post('/auth/register', userData)
    return response
  },

  // Login user
  login: async (credentials) => {
    const response = await API.post('/auth/login', credentials)
    return response
  },

  // Logout user
  logout: async () => {
    const response = await API.get('/auth/logout')
    return response
  },

  // Get current user
  getMe: async () => {
    const response = await API.get('/auth/me')
    return response
  },

  // Update user profile
  updateProfile: async (userData) => {
    const formData = new FormData()
    
    // Append regular fields
    Object.keys(userData).forEach(key => {
      if (key !== 'profileImage' && userData[key] !== undefined) {
        if (typeof userData[key] === 'object') {
          formData.append(key, JSON.stringify(userData[key]))
        } else {
          formData.append(key, userData[key])
        }
      }
    })
    
    // Append file if exists
    if (userData.profileImage && userData.profileImage instanceof File) {
      formData.append('profileImage', userData.profileImage)
    }
    
    const response = await API.put('/auth/updateprofile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response
  },

  // Update password
  updatePassword: async (passwordData) => {
    const response = await API.put('/auth/updatepassword', passwordData)
    return response
  },
}
