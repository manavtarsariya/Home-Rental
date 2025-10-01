import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyService } from '../../services/propertyService';
import { bookingService } from '../../services/bookingService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  HomeIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CreateBooking = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    moveInDate: '',
    leaseDuration: '12',
    message: '',
  });

  const [errors, setErrors] = useState({});

  // Fetch property details
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await propertyService.getProperty(propertyId);
        setProperty(res.data);

        // Default move-in date: tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setFormData((prev) => ({
          ...prev,
          moveInDate: tomorrow.toISOString().split('T')[0],
        }));
      } catch (err) {
        toast.error('Failed to load property details');
        navigate('/properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.moveInDate) {
      newErrors.moveInDate = 'Move-in date is required';
    } else {
      const selectedDate = new Date(formData.moveInDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) newErrors.moveInDate = 'Move-in date cannot be in the past';
    }

    const leaseNum = Number(formData.leaseDuration);
    if (!leaseNum || leaseNum < 1 || leaseNum > 60) {
      newErrors.leaseDuration = 'Lease duration must be 1–60 months';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit booking
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!property?.isAvailable) {
      toast.error('Property is not available for booking');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        propertyId: property._id,
        moveInDate: formData.moveInDate,
        leaseDuration: Number(formData.leaseDuration),
        message: formData.message,
      };

      console.log('Booking payload:', payload); // debug

      await bookingService.createBooking(payload);

      toast.success(
        'Booking request sent! The property owner will review your request.'
      );
      navigate('/tenant/bookings');
    } catch (err) {
      console.error('Booking error:', err.response?.data || err.message);
      toast.error(
        err.response?.data?.error || 'Failed to send booking request'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Cost calculation
  const calculateCosts = () => {
    if (!property) return { monthlyRent: 0, securityDeposit: 0, totalAmount: 0 };
    const monthlyRent = property.rent;
    const securityDeposit = property.securityDeposit || property.rent * 2;
    return { monthlyRent, securityDeposit, totalAmount: monthlyRent + securityDeposit };
  };

  const { monthlyRent, securityDeposit, totalAmount } = calculateCosts();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading property..." />
      </div>
    );

  if (!property)
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <h2 className="text-2xl font-bold mb-4">Property not found</h2>
        <button onClick={() => navigate('/properties')} className="text-blue-600 hover:text-blue-500">
          Browse other properties
        </button>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Booking Request</h1>
      <p className="text-gray-600 mb-6">Fill in the details to request this property.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Property Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
            <h2 className="font-semibold text-lg mb-4">Property Summary</h2>
            {property.photos?.length > 0 ? (
              <img
                src={`/uploads/properties/${property.photos[0].filename}`}
                alt={property.title}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
            ) : (
              <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                <HomeIcon className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <p className="font-medium text-gray-900">{property.title}</p>
            <div className="flex items-center text-gray-600 mt-1">
              <MapPinIcon className="w-4 h-4 mr-1" />
              <span className="text-sm">{property.address.city}, {property.address.state}</span>
            </div>
            <div className="flex items-center text-primary-600 font-semibold mt-2">
              <CurrencyRupeeIcon className="w-5 h-5 mr-1" />
              <span className="text-lg">₹{property.rent.toLocaleString()}/month</span>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6">
            {/* Move-in Date */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Move-in Date *</label>
              <div className="relative">
                <CalendarIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="date"
                  name="moveInDate"
                  value={formData.moveInDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    errors.moveInDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.moveInDate && <p className="text-red-600 text-sm mt-1">{errors.moveInDate}</p>}
            </div>

            {/* Lease Duration */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Lease Duration (Months) *</label>
              <input
                type="number"
                name="leaseDuration"
                value={formData.leaseDuration}
                onChange={handleChange}
                min={1}
                max={60}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  errors.leaseDuration ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.leaseDuration && <p className="text-red-600 text-sm mt-1">{errors.leaseDuration}</p>}
            </div>

            {/* Message */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
              <textarea
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                placeholder="Introduce yourself to the owner..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
              />
            </div>

            {/* Cost Summary */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Cost Summary</h3>
              <div className="flex justify-between text-gray-600">
                <span>Monthly Rent:</span>
                <span>₹{monthlyRent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Security Deposit:</span>
                <span>₹{securityDeposit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold mt-2">
                <span>Total Initial Payment:</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Sending...' : 'Send Booking Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBooking;
