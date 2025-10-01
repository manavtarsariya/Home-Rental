import api from './api'

export const propertyService = {
  // Get all properties (public)
  getProperties: async (params = {}) => {
    const response = await api.get('/properties', { params })
    return response
  },

  // Search properties
  searchProperties: async (searchParams) => {
    const response = await api.get('/properties/search', { params: searchParams })
    return response
  },

  // Get single property
  getProperty: async (id) => {
    const response = await api.get(`/properties/${id}`)
    return response
  },

  // Owner routes
  getOwnerProperties: async () => {
    const response = await api.get('/properties/owner/me')
    return response
  },

  // Create property with FormData (recommended method)
  createPropertyWithFormData: async (formData) => {
    const response = await api.post('/properties', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response
  },

  // Create property (alternative method)
  createProperty: async (propertyData) => {
    const formData = new FormData()
    
    // Append regular fields
    Object.keys(propertyData).forEach(key => {
      if (key !== 'photos' && key !== 'documents' && propertyData[key] !== undefined) {
        if (typeof propertyData[key] === 'object' && propertyData[key] !== null) {
          formData.append(key, JSON.stringify(propertyData[key]))
        } else {
          formData.append(key, propertyData[key])
        }
      }
    })
    
    // Append photos
    if (propertyData.photos && propertyData.photos.length > 0) {
      propertyData.photos.forEach(file => {
        formData.append('photos', file)
      })
    }
    
    // Append documents
    if (propertyData.documents && propertyData.documents.length > 0) {
      propertyData.documents.forEach(file => {
        formData.append('documents', file)
      })
    }
    
    const response = await api.post('/properties', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response
  },

  // Update property
  updateProperty: async (id, propertyData) => {
    const formData = new FormData()
    
    // Handle regular updates (text fields)
    Object.keys(propertyData).forEach(key => {
      if (!['newPhotos', 'newDocuments', 'photosToRemove'].includes(key) && propertyData[key] !== undefined) {
        if (typeof propertyData[key] === 'object' && propertyData[key] !== null) {
          formData.append(key, JSON.stringify(propertyData[key]))
        } else {
          formData.append(key, propertyData[key])
        }
      }
    })
    
    // Handle new photos
    if (propertyData.newPhotos && propertyData.newPhotos.length > 0) {
      propertyData.newPhotos.forEach(file => {
        formData.append('newPhotos', file)
      })
    }
    
    // Handle new documents
    if (propertyData.newDocuments && propertyData.newDocuments.length > 0) {
      propertyData.newDocuments.forEach(file => {
        formData.append('newDocuments', file)
      })
    }
    
    // Handle photos to remove
    if (propertyData.photosToRemove && propertyData.photosToRemove.length > 0) {
      propertyData.photosToRemove.forEach(photoId => {
        formData.append('photosToRemove', photoId)
      })
    }

    const response = await api.put(`/properties/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response
  },

  // Delete property
  deleteProperty: async (id) => {
    const response = await api.delete(`/properties/${id}`)
    return response
  },

  // Get property statistics
  getPropertyStats: async (id) => {
    const response = await api.get(`/properties/${id}/stats`)
    return response
  },

  // Increment property views
  incrementViews: async (id) => {
    const response = await api.post(`/properties/${id}/view`)
    return response
  },

  // Get featured properties
  getFeaturedProperties: async () => {
    const response = await api.get('/properties/featured')
    return response
  },

  // Get recent properties
  getRecentProperties: async (limit = 10) => {
    const response = await api.get(`/properties/recent?limit=${limit}`)
    return response
  },

  // Update property availability
  updateAvailability: async (id, isAvailable) => {
    const response = await api.patch(`/properties/${id}/availability`, { isAvailable })
    return response
  },

  // Get similar properties
  getSimilarProperties: async (id) => {
    const response = await api.get(`/properties/${id}/similar`)
    return response
  },

  // Get properties by location
  getPropertiesByLocation: async (city, state) => {
    const response = await api.get(`/properties/location/${city}/${state}`)
    return response
  },

  // Get property types
  getPropertyTypes: async () => {
    const response = await api.get('/properties/types')
    return response
  },

  // Get property amenities
  getPropertyAmenities: async () => {
    const response = await api.get('/properties/amenities')
    return response
  }
}
