import React from 'react'
import LoadingSpinner from '../common/LoadingSpinner'

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500'
      case 'success':
        return 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
      case 'warning':
        return 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500'
      case 'outline':
        return 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-primary-500'
      default:
        return 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-3 py-1.5 text-sm'
      case 'large':
        return 'px-6 py-3 text-lg'
      default:
        return 'px-4 py-2 text-sm'
    }
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        font-medium rounded-lg transition-colors duration-200 
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center
        ${className}
      `}
      {...props}
    >
      {loading && <LoadingSpinner size="small" color="white" className="mr-2" />}
      {children}
    </button>
  )
}

export default Button
