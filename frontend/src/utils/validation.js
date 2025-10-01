import { VALIDATION_RULES, ERROR_MESSAGES } from './constants'

// Basic validation functions
export const isRequired = (value) => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

export const isEmail = (email) => {
  return VALIDATION_RULES.EMAIL_REGEX.test(email)
}

export const isPhone = (phone) => {
  return VALIDATION_RULES.PHONE_REGEX.test(phone)
}

export const isZipCode = (zipCode) => {
  return VALIDATION_RULES.ZIP_CODE_REGEX.test(zipCode)
}

export const minLength = (value, min) => {
  if (!value) return false
  return value.toString().length >= min
}

export const maxLength = (value, max) => {
  if (!value) return true
  return value.toString().length <= max
}

export const isNumber = (value) => {
  return !isNaN(value) && !isNaN(parseFloat(value))
}

export const isPositiveNumber = (value) => {
  return isNumber(value) && parseFloat(value) > 0
}

export const isInteger = (value) => {
  return Number.isInteger(Number(value))
}

// File validation
export const validateImageFile = (file) => {
  const errors = []
  
  if (!file) {
    errors.push('No file selected')
    return errors
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    errors.push('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed')
  }
  
  // Check file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    errors.push('File size too large. Maximum size is 5MB')
  }
  
  return errors
}

export const validateDocumentFile = (file) => {
  const errors = []
  
  if (!file) {
    errors.push('No file selected')
    return errors
  }
  
  // Check file type
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
  if (!allowedTypes.includes(file.type)) {
    errors.push('Invalid file type. Only PDF and Word documents are allowed')
  }
  
  // Check file size (10MB)
  if (file.size > 10 * 1024 * 1024) {
    errors.push('File size too large. Maximum size is 10MB')
  }
  
  return errors
}

// Form validation schemas
export const loginValidation = (data) => {
  const errors = {}
  
  if (!isRequired(data.email)) {
    errors.email = ERROR_MESSAGES.REQUIRED_FIELD
  } else if (!isEmail(data.email)) {
    errors.email = ERROR_MESSAGES.INVALID_EMAIL
  }
  
  if (!isRequired(data.password)) {
    errors.password = ERROR_MESSAGES.REQUIRED_FIELD
  }
  
  return errors
}

export const registerValidation = (data) => {
  const errors = {}
  
  if (!isRequired(data.name)) {
    errors.name = ERROR_MESSAGES.REQUIRED_FIELD
  } else if (!minLength(data.name, VALIDATION_RULES.NAME_MIN_LENGTH)) {
    errors.name = `Name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters long`
  } else if (!maxLength(data.name, VALIDATION_RULES.NAME_MAX_LENGTH)) {
    errors.name = `Name must be less than ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`
  }
  
  if (!isRequired(data.email)) {
    errors.email = ERROR_MESSAGES.REQUIRED_FIELD
  } else if (!isEmail(data.email)) {
    errors.email = ERROR_MESSAGES.INVALID_EMAIL
  }
  
  if (!isRequired(data.password)) {
    errors.password = ERROR_MESSAGES.REQUIRED_FIELD
  } else if (!minLength(data.password, VALIDATION_RULES.PASSWORD_MIN_LENGTH)) {
    errors.password = ERROR_MESSAGES.PASSWORD_TOO_SHORT
  }
  
  if (!isRequired(data.confirmPassword)) {
    errors.confirmPassword = ERROR_MESSAGES.REQUIRED_FIELD
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = ERROR_MESSAGES.PASSWORDS_DONT_MATCH
  }
  
  if (!isRequired(data.role)) {
    errors.role = ERROR_MESSAGES.REQUIRED_FIELD
  }
  
  if (data.contactNumber && !isPhone(data.contactNumber)) {
    errors.contactNumber = ERROR_MESSAGES.INVALID_PHONE
  }
  
  return errors
}

export const profileValidation = (data) => {
  const errors = {}
  
  if (!isRequired(data.name)) {
    errors.name = ERROR_MESSAGES.REQUIRED_FIELD
  } else if (!minLength(data.name, VALIDATION_RULES.NAME_MIN_LENGTH)) {
    errors.name = `Name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters long`
  }
  
  if (!isRequired(data.email)) {
    errors.email = ERROR_MESSAGES.REQUIRED_FIELD
  } else if (!isEmail(data.email)) {
    errors.email = ERROR_MESSAGES.INVALID_EMAIL
  }
  
  if (data.contactNumber && !isPhone(data.contactNumber)) {
    errors.contactNumber = ERROR_MESSAGES.INVALID_PHONE
  }
  
  // Address validation
  if (data.address) {
    if (data.address.zipCode && !isZipCode(data.address.zipCode)) {
      errors['address.zipCode'] = ERROR_MESSAGES.INVALID_ZIP_CODE
    }
  }
  
  return errors
}

export const propertyValidation = (data) => {
  const errors = {}
  
  if (!isRequired(data.title)) {
    errors.title = ERROR_MESSAGES.REQUIRED_FIELD
  }
  
  if (!isRequired(data.description)) {
    errors.description = ERROR_MESSAGES.REQUIRED_FIELD
  }
  
  if (!isRequired(data.type)) {
    errors.type = ERROR_MESSAGES.REQUIRED_FIELD
  }
  
  if (!isRequired(data.rent)) {
    errors.rent = ERROR_MESSAGES.REQUIRED_FIELD
  } else if (!isPositiveNumber(data.rent)) {
    errors.rent = 'Rent must be a positive number'
  }
  
  if (!isRequired(data.area)) {
    errors.area = ERROR_MESSAGES.REQUIRED_FIELD
  } else if (!isPositiveNumber(data.area)) {
    errors.area = 'Area must be a positive number'
  }
  
  if (!isRequired(data.bedrooms)) {
    errors.bedrooms = ERROR_MESSAGES.REQUIRED_FIELD
  } else if (!isInteger(data.bedrooms) || parseInt(data.bedrooms) < 0) {
    errors.bedrooms = 'Bedrooms must be a non-negative integer'
  }
  
  if (!isRequired(data.bathrooms)) {
    errors.bathrooms = ERROR_MESSAGES.REQUIRED_FIELD
  } else if (!isInteger(data.bathrooms) || parseInt(data.bathrooms) < 0) {
    errors.bathrooms = 'Bathrooms must be a non-negative integer'
  }
  
  // Address validation
  if (!data.address) {
    errors.address = 'Address is required'
  } else {
    if (!isRequired(data.address.street)) {
      errors['address.street'] = ERROR_MESSAGES.REQUIRED_FIELD
    }
    
    if (!isRequired(data.address.city)) {
      errors['address.city'] = ERROR_MESSAGES.REQUIRED_FIELD
    }
    
    if (!isRequired(data.address.state)) {
      errors['address.state'] = ERROR_MESSAGES.REQUIRED_FIELD
    }
    
    if (!isRequired(data.address.zipCode)) {
      errors['address.zipCode'] = ERROR_MESSAGES.REQUIRED_FIELD
    } else if (!isZipCode(data.address.zipCode)) {
      errors['address.zipCode'] = ERROR_MESSAGES.INVALID_ZIP_CODE
    }
  }
  
  return errors
}

export const bookingValidation = (data) => {
  const errors = {}
  
  if (!isRequired(data.propertyId)) {
    errors.propertyId = ERROR_MESSAGES.REQUIRED_FIELD
  }
  
  if (!isRequired(data.moveInDate)) {
    errors.moveInDate = ERROR_MESSAGES.REQUIRED_FIELD
  } else {
    const moveInDate = new Date(data.moveInDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (moveInDate < today) {
      errors.moveInDate = 'Move-in date cannot be in the past'
    }
  }
  
  if (!isRequired(data.leaseDuration)) {
    errors.leaseDuration = ERROR_MESSAGES.REQUIRED_FIELD
  } else if (!isPositiveNumber(data.leaseDuration) || parseInt(data.leaseDuration) < 1 || parseInt(data.leaseDuration) > 60) {
    errors.leaseDuration = 'Lease duration must be between 1 and 60 months'
  }
  
  return errors
}

export const passwordChangeValidation = (data) => {
  const errors = {}
  
  if (!isRequired(data.currentPassword)) {
    errors.currentPassword = ERROR_MESSAGES.REQUIRED_FIELD
  }
  
  if (!isRequired(data.newPassword)) {
    errors.newPassword = ERROR_MESSAGES.REQUIRED_FIELD
  } else if (!minLength(data.newPassword, VALIDATION_RULES.PASSWORD_MIN_LENGTH)) {
    errors.newPassword = ERROR_MESSAGES.PASSWORD_TOO_SHORT
  }
  
  if (!isRequired(data.confirmPassword)) {
    errors.confirmPassword = ERROR_MESSAGES.REQUIRED_FIELD
  } else if (data.newPassword !== data.confirmPassword) {
    errors.confirmPassword = ERROR_MESSAGES.PASSWORDS_DONT_MATCH
  }
  
  return errors
}

export const feedbackValidation = (data) => {
  const errors = {}
  
  if (!isRequired(data.propertyId)) {
    errors.propertyId = ERROR_MESSAGES.REQUIRED_FIELD
  }
  
  if (!isRequired(data.rating)) {
    errors.rating = ERROR_MESSAGES.REQUIRED_FIELD
  } else if (!isNumber(data.rating) || parseInt(data.rating) < 1 || parseInt(data.rating) > 5) {
    errors.rating = 'Rating must be between 1 and 5'
  }
  
  return errors
}

// Validation helper function
export const validateForm = (data, validationSchema) => {
  const errors = validationSchema(data)
  const isValid = Object.keys(errors).length === 0
  
  return {
    isValid,
    errors
  }
}

// Real-time validation helper
export const createValidator = (validationSchema) => {
  return (data) => {
    const errors = validationSchema(data)
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
}
