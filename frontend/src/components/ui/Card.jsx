import React from 'react'

const Card = ({
  children,
  title,
  subtitle,
  padding = 'normal',
  shadow = 'sm',
  hover = false,
  className = '',
  ...props
}) => {
  const getPaddingClasses = () => {
    switch (padding) {
      case 'none':
        return ''
      case 'small':
        return 'p-4'
      case 'large':
        return 'p-8'
      default:
        return 'p-6'
    }
  }

  const getShadowClasses = () => {
    switch (shadow) {
      case 'none':
        return ''
      case 'md':
        return 'shadow-md'
      case 'lg':
        return 'shadow-lg'
      default:
        return 'shadow-sm'
    }
  }

  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 
        ${getShadowClasses()}
        ${getPaddingClasses()}
        ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''}
        ${className}
      `}
      {...props}
    >
      {(title || subtitle) && (
        <div className={`${padding !== 'none' ? 'mb-4' : 'p-6 pb-0'}`}>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      
      {children}
    </div>
  )
}

export default Card
