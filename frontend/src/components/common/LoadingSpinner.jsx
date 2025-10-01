import React from 'react'

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  text = '', 
  className = '' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-4 w-4'
      case 'large':
        return 'h-8 w-8'
      case 'xl':
        return 'h-12 w-12'
      default:
        return 'h-6 w-6'
    }
  }

  const getColorClasses = () => {
    switch (color) {
      case 'white':
        return 'border-white border-t-transparent'
      case 'gray':
        return 'border-gray-300 border-t-gray-600'
      default:
        return 'border-gray-300 border-t-primary-600'
    }
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        className={`
          ${getSizeClasses()} 
          ${getColorClasses()} 
          border-2 rounded-full animate-spin
        `}
      />
      {text && (
        <p className={`mt-2 text-sm ${color === 'white' ? 'text-white' : 'text-gray-600'}`}>
          {text}
        </p>
      )}
    </div>
  )
}

export default LoadingSpinner
