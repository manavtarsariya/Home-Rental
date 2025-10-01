import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  HomeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CheckIcon,
  StarIcon
} from '@heroicons/react/24/outline'

const Home = () => {
  const { user } = useAuth()

  const features = [
    {
      icon: BuildingOfficeIcon,
      title: 'Find Perfect Properties',
      description: 'Browse through thousands of verified rental properties across multiple cities.'
    },
    {
      icon: UserGroupIcon,
      title: 'Trusted Community',
      description: 'Connect with verified property owners and tenants in a safe environment.'
    },
    {
      icon: ChartBarIcon,
      title: 'Property Management',
      description: 'Manage your properties, bookings, and payments all in one place.'
    },
    {
      icon: CheckIcon,
      title: 'Verified Listings',
      description: 'All properties are verified by our team to ensure quality and authenticity.'
    }
  ]

  const stats = [
    { label: 'Properties Listed', value: '10,000+' },
    { label: 'Happy Tenants', value: '5,000+' },
    { label: 'Property Owners', value: '2,000+' },
    { label: 'Cities Covered', value: '50+' }
  ]

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Tenant',
      content: 'Found my dream apartment in just 2 days! The process was smooth and transparent.',
      rating: 5
    },
    {
      name: 'Raj Kumar',
      role: 'Property Owner',
      content: 'Managing my properties has never been easier. Great platform for landlords!',
      rating: 5
    },
    {
      name: 'Anita Desai',
      role: 'Tenant',
      content: 'Excellent service and genuine listings. Highly recommended for property search.',
      rating: 5
    }
  ]

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
              Find Your Perfect
              <span className="block text-primary-200">Rental Property</span>
            </h1>
            <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Connect with trusted property owners and find quality rental properties 
              across India. Your dream home is just a click away.
            </p>
            <div className="space-x-4">
              <Link
                to="/properties"
                className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors duration-200"
              >
                Browse Properties
              </Link>
              {!user && (
                <Link
                  to="/register"
                  className="inline-block bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors duration-200"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose PropertyRent?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide a comprehensive platform for all your rental property needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow duration-200">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to find or list your property
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-full text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sign Up & Browse
              </h3>
              <p className="text-gray-600">
                Create your account and start browsing verified properties in your desired location
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-full text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Connect & Visit
              </h3>
              <p className="text-gray-600">
                Connect with property owners and schedule visits to find your perfect match
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-full text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Book & Move In
              </h3>
              <p className="text-gray-600">
                Complete the booking process and move into your new home hassle-free
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Real experiences from our satisfied customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Find Your Next Home?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of satisfied users who found their perfect rental property
            </p>
            <div className="space-x-4">
              <Link
                to="/properties"
                className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors duration-200"
              >
                Start Searching
              </Link>
              {!user && (
                <Link
                  to="/register"
                  className="inline-block bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors duration-200"
                >
                  List Your Property
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
