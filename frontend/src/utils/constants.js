export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },
  PROPERTIES: {
    BASE: '/properties',
    SEARCH: '/properties/search',
    OWNER: '/properties/owner/my-properties',
    FEATURED: '/properties/featured',
    RECENT: '/properties/recent'
  },
  BOOKINGS: {
    BASE: '/bookings',
    TENANT: '/bookings/tenant/my-bookings',
    OWNER: '/bookings/owner/property-bookings',
    STATS: '/bookings/stats'
  },
  PAYMENTS: {
    BASE: '/payments',
    PROCESS: '/payments/process',
    STATS: '/payments/stats',
    HISTORY: '/payments/history'
  },
  FEEDBACK: {
    BASE: '/feedback',
    MY_FEEDBACK: '/feedback/my-feedback',
    PROPERTY: '/feedback/property',
    STATS: '/feedback/stats'
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard/stats',
    USERS: '/admin/users',
    PROPERTIES: '/admin/properties',
    BOOKINGS: '/admin/bookings',
    PAYMENTS: '/admin/payments',
    ANALYTICS: '/admin/analytics',
    SETTINGS: '/admin/settings'
  }
}

export const USER_ROLES = {
  ADMIN: 'Admin',
  OWNER: 'Owner',
  TENANT: 'Tenant'
}

export const PROPERTY_TYPES = [
  'Apartment',
  'Villa',
  'PG',
  'House',
  'Flat',
  'Studio',
  'Duplex'
]

export const FURNISHED_OPTIONS = [
  'Fully Furnished',
  'Semi Furnished',
  'Unfurnished'
]

export const TENANT_PREFERENCES = [
  'Family',
  'Bachelor',
  'Company',
  'Any'
]

export const AMENITIES_LIST = [
  'Parking',
  'Swimming Pool',
  'Gym',
  'Garden',
  'Balcony',
  'AC',
  'Furnished',
  'WiFi',
  'Security',
  'Elevator',
  'Power Backup',
  'Water Supply',
  'Maintenance',
  'Pet Friendly'
]

export const BOOKING_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled'
}

export const PAYMENT_STATUS = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  FAILED: 'Failed'
}

export const PROPERTY_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
}

export const PAYMENT_METHODS = [
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'UPI',
  'Cash',
  'Bank Transfer'
]

export const PAYMENT_TYPES = [
  'Rent',
  'Security Deposit',
  'Maintenance',
  'Late Fee'
]

export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
}

export const FILE_UPLOAD = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  MAX_IMAGES: 10,
  MAX_DOCUMENTS: 5
}

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[6-9]\d{9}$/,
  ZIP_CODE_REGEX: /^\d{6}$/
}

export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid 10-digit phone number',
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long`,
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  INVALID_ZIP_CODE: 'Please enter a valid 6-digit ZIP code',
  FILE_TOO_LARGE: 'File size is too large',
  INVALID_FILE_TYPE: 'Invalid file type',
  TOO_MANY_FILES: 'Too many files selected'
}

export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  PROPERTY_ADDED: 'Property added successfully',
  PROPERTY_UPDATED: 'Property updated successfully',
  BOOKING_CREATED: 'Booking request sent successfully',
  PAYMENT_COMPLETED: 'Payment completed successfully',
  FEEDBACK_SUBMITTED: 'Feedback submitted successfully'
}

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROPERTIES: '/properties',
  PROPERTY_DETAILS: '/properties/:id',
  PROFILE: '/profile',
  EDIT_PROFILE: '/profile/edit',
  
  // Admin routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_PROPERTIES: '/admin/properties',
  ADMIN_BOOKINGS: '/admin/bookings',
  
  // Owner routes
  OWNER_DASHBOARD: '/owner/dashboard',
  OWNER_PROPERTIES: '/owner/properties',
  OWNER_ADD_PROPERTY: '/owner/properties/add',
  OWNER_EDIT_PROPERTY: '/owner/properties/:id/edit',
  OWNER_BOOKINGS: '/owner/bookings',
  OWNER_PAYMENTS: '/owner/payments',
  
  // Tenant routes
  TENANT_DASHBOARD: '/tenant/dashboard',
  TENANT_BOOKINGS: '/tenant/bookings',
  TENANT_CREATE_BOOKING: '/tenant/bookings/create/:propertyId',
  TENANT_PAYMENTS: '/tenant/payments',
  TENANT_FEEDBACK: '/tenant/feedback'
}

export const CHART_COLORS = {
  PRIMARY: '#3B82F6',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  DANGER: '#EF4444',
  INFO: '#6366F1',
  SECONDARY: '#6B7280'
}

export const THEME_COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  }
}
