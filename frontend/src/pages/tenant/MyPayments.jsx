import React, { useState, useEffect } from 'react'
import { paymentService } from '../../services/paymentService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  CurrencyRupeeIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const MyPayments = () => {
  const [payments, setPayments] = useState([])
  const [filteredPayments, setFilteredPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchPayments()
  }, [])

  useEffect(() => {
    filterPayments()
  }, [payments, statusFilter, typeFilter])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await paymentService.getPayments()
      setPayments(response.data || [])
    } catch (error) {
      toast.error('Failed to load payments')
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterPayments = () => {
    let filtered = payments

    if (statusFilter !== 'All') {
      filtered = filtered.filter(payment => payment.status === statusFilter)
    }

    if (typeFilter !== 'All') {
      filtered = filtered.filter(payment => payment.paymentType === typeFilter)
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    setFilteredPayments(filtered)
  }

  const handlePaymentProcess = async (paymentData) => {
    try {
      setProcessing(true)
      const response = await paymentService.processPayment(paymentData)
      
      if (response.data.status === 'Completed') {
        toast.success('Payment processed successfully!')
      } else {
        toast.error('Payment failed. Please try again.')
      }
      
      setShowPaymentModal(false)
      setSelectedPayment(null)
      fetchPayments()
    } catch (error) {
      toast.error('Payment processing failed')
      console.error('Error processing payment:', error)
    } finally {
      setProcessing(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'Failed':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      'Completed': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Failed': 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badges[status] || badges['Pending']}`}>
        {getStatusIcon(status)}
        <span className="ml-1">{status}</span>
      </span>
    )
  }

  const getPaymentTypeColor = (type) => {
    const colors = {
      'Rent': 'text-blue-600',
      'Security Deposit': 'text-purple-600',
      'Maintenance': 'text-orange-600',
      'Late Fee': 'text-red-600'
    }
    return colors[type] || 'text-gray-600'
  }

  const PaymentModal = ({ payment, onClose, onPay }) => {
    const [cardData, setCardData] = useState({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardHolderName: ''
    })

    const handleSubmit = (e) => {
      e.preventDefault()
      onPay({
        paymentId: payment._id,
        ...cardData
      })
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Process Payment</h3>
          
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="font-medium">Amount: ₹{payment.amount.toLocaleString()}</p>
            <p className="text-sm text-gray-600">{payment.paymentType} - {payment.property?.title}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={cardData.cardNumber}
                  onChange={(e) => setCardData({...cardData, cardNumber: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={cardData.expiryDate}
                    onChange={(e) => setCardData({...cardData, expiryDate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={cardData.cvv}
                    onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Card Holder Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={cardData.cardHolderName}
                  onChange={(e) => setCardData({...cardData, cardHolderName: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center"
              >
                {processing && <LoadingSpinner size="small" color="white" className="mr-2" />}
                {processing ? 'Processing...' : `Pay ₹${payment.amount.toLocaleString()}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const PaymentCard = ({ payment }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <CurrencyRupeeIcon className="w-5 h-5 text-gray-400 mr-1" />
            <span className="text-xl font-bold text-gray-900">₹{payment.amount.toLocaleString()}</span>
            <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 ${getPaymentTypeColor(payment.paymentType)}`}>
              {payment.paymentType}
            </span>
          </div>
          
          <h3 className="font-medium text-gray-900 mb-1">
            {payment.property?.title || 'Property Payment'}
          </h3>
          
          <p className="text-sm text-gray-500">
            Transaction ID: {payment.transactionId}
          </p>
        </div>
        
        <div className="flex flex-col items-end">
          {getStatusBadge(payment.status)}
          {payment.status === 'Pending' && (
            <button
              onClick={() => {
                setSelectedPayment(payment)
                setShowPaymentModal(true)
              }}
              className="mt-2 px-3 py-1 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors duration-200"
            >
              Pay Now
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Payment Date</p>
          <p className="font-medium text-gray-900">
            {new Date(payment.paymentDate || payment.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Payment Method</p>
          <p className="font-medium text-gray-900">{payment.paymentMethod}</p>
        </div>

        {payment.dueDate && (
          <div>
            <p className="text-sm text-gray-500">Due Date</p>
            <p className="font-medium text-gray-900">
              {new Date(payment.dueDate).toLocaleDateString()}
            </p>
          </div>
        )}

        {payment.lateFeesApplied > 0 && (
          <div>
            <p className="text-sm text-gray-500">Late Fees</p>
            <p className="font-medium text-red-600">₹{payment.lateFeesApplied.toLocaleString()}</p>
          </div>
        )}
      </div>

      {payment.description && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Description</p>
          <p className="text-sm text-gray-700">{payment.description}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Created {new Date(payment.createdAt).toLocaleDateString()}
        </p>
        
        {payment.receiptUrl && (
          <a
            href={payment.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-600 hover:text-primary-500 flex items-center"
          >
            <DocumentTextIcon className="w-4 h-4 mr-1" />
            View Receipt
          </a>
        )}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading your payments..." />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Payments</h1>
        <p className="text-gray-600 mt-2">Track your rental payments and transaction history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Payments</p>
          <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {payments.filter(p => p.status === 'Completed').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {payments.filter(p => p.status === 'Pending').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Paid</p>
          <p className="text-2xl font-bold text-blue-600">
            ₹{payments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="All">All Types</option>
              <option value="Rent">Rent</option>
              <option value="Security Deposit">Security Deposit</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Late Fee">Late Fee</option>
            </select>
          </div>

          <div className="flex items-end">
            <p className="text-sm text-gray-600">
              Showing {filteredPayments.length} of {payments.length} payments
            </p>
          </div>
        </div>
      </div>

      {/* Payments List */}
      {filteredPayments.length > 0 ? (
        <div className="space-y-6">
          {filteredPayments.map((payment) => (
            <PaymentCard key={payment._id} payment={payment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CurrencyRupeeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {payments.length === 0 ? 'No payments yet' : 'No matching payments found'}
          </h3>
          <p className="text-gray-600">
            {payments.length === 0 
              ? 'Your payment history will appear here once you make your first payment' 
              : 'Try adjusting your filter criteria'
            }
          </p>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPayment && (
        <PaymentModal
          payment={selectedPayment}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedPayment(null)
          }}
          onPay={handlePaymentProcess}
        />
      )}
    </div>
  )
}

export default MyPayments
