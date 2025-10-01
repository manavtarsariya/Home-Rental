import { format, parseISO, isValid } from 'date-fns'

// Date utilities
export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj) ? format(dateObj, formatString) : ''
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

export const formatDateTime = (date) => {
  return formatDate(date, 'MMM dd, yyyy HH:mm')
}

export const formatRelativeTime = (date) => {
  if (!date) return ''
  
  const now = new Date()
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const diffInSeconds = Math.floor((now - dateObj) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return formatDate(dateObj)
}

// Number utilities
export const formatCurrency = (amount, currency = '₹') => {
  if (typeof amount !== 'number') return `${currency}0`
  return `${currency}${amount.toLocaleString('en-IN')}`
}

export const formatNumber = (number) => {
  if (typeof number !== 'number') return '0'
  return number.toLocaleString('en-IN')
}

export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0
  return Math.round((value / total) * 100)
}

// String utilities
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

export const capitalizeFirst = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const capitalizeWords = (str) => {
  if (!str) return ''
  return str.split(' ').map(capitalizeFirst).join(' ')
}

export const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

// Array utilities
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key]
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {})
}

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = key.split('.').reduce((obj, k) => obj?.[k], a)
    const bVal = key.split('.').reduce((obj, k) => obj?.[k], b)
    
    if (direction === 'desc') {
      return bVal > aVal ? 1 : -1
    }
    return aVal > bVal ? 1 : -1
  })
}

export const filterBy = (array, filters) => {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === '' || value === null || value === undefined) return true
      
      const itemValue = key.split('.').reduce((obj, k) => obj?.[k], item)
      
      if (Array.isArray(value)) {
        return value.includes(itemValue)
      }
      
      if (typeof value === 'string' && typeof itemValue === 'string') {
        return itemValue.toLowerCase().includes(value.toLowerCase())
      }
      
      return itemValue === value
    })
  })
}

// Object utilities
export const omit = (obj, keys) => {
  const keysArray = Array.isArray(keys) ? keys : [keys]
  return Object.keys(obj)
    .filter(key => !keysArray.includes(key))
    .reduce((result, key) => {
      result[key] = obj[key]
      return result
    }, {})
}

export const pick = (obj, keys) => {
  const keysArray = Array.isArray(keys) ? keys : [keys]
  return keysArray.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
    return result
  }, {})
}

export const isEmpty = (value) => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

// File utilities
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

export const isImageFile = (file) => {
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  return imageTypes.includes(file.type)
}

export const createImagePreview = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.readAsDataURL(file)
  })
}

// URL utilities
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v))
      } else {
        searchParams.append(key, value)
      }
    }
  })
  
  return searchParams.toString()
}

export const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString)
  const result = {}
  
  for (const [key, value] of params.entries()) {
    if (result[key]) {
      if (Array.isArray(result[key])) {
        result[key].push(value)
      } else {
        result[key] = [result[key], value]
      }
    } else {
      result[key] = value
    }
  }
  
  return result
}

// Storage utilities
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error reading from localStorage:`, error)
      return defaultValue
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error writing to localStorage:`, error)
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing from localStorage:`, error)
    }
  },
  
  clear: () => {
    try {
      localStorage.clear()
    } catch (error) {
      console.error(`Error clearing localStorage:`, error)
    }
  }
}

// Utility functions for components
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const throttle = (func, limit) => {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Color utilities
export const getStatusColor = (status) => {
  const colors = {
    'Pending': 'text-yellow-600 bg-yellow-100',
    'Approved': 'text-green-600 bg-green-100',
    'Rejected': 'text-red-600 bg-red-100',
    'Cancelled': 'text-gray-600 bg-gray-100',
    'Completed': 'text-green-600 bg-green-100',
    'Failed': 'text-red-600 bg-red-100',
    'Active': 'text-green-600 bg-green-100',
    'Inactive': 'text-red-600 bg-red-100'
  }
  
  return colors[status] || 'text-gray-600 bg-gray-100'
}

export const generateAvatar = (name) => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-yellow-500',
    'bg-pink-500',
    'bg-indigo-500'
  ]
  
  const initial = name ? name.charAt(0).toUpperCase() : 'U'
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0
  const bgColor = colors[colorIndex]
  
  return { initial, bgColor }
}
