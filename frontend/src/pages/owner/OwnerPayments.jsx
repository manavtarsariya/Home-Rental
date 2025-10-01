import React, { useState, useEffect } from 'react'
import { paymentService } from '../../services/paymentService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  CurrencyRupeeIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import toast from 'react-hot-toast'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const OwnerPayments = () => {
  const [payments, setPayments] = useState([])
  const [filteredPayments, setFilteredPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingAmount: 0,
    completedPayments: 0,
    monthlyData: []
  })
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('All')

  useEffect(() => {
    fetchPayments()
    fetchPaymentStats()
  }, [])

  useEffect(() => {
    filterPayments()
  }, [payments, statusFilter, typeFilter, dateFilter])

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

  const fetchPaymentStats = async () => {
    try {
      const response = await paymentService.getPaymentStats()
      const statsData = response.data || {}
      
      const overview = statsData.overview || {}
      const monthlyRevenue = statsData.monthlyRevenue || []
      
      // Calculate current month revenue
      const currentMonth = new Date().getMonth() + 1
      const thisMonthRevenue = monthlyRevenue.find(m => m._id === currentMonth)?.revenue || 0
      
      setStats({
        totalRevenue: overview.totalRevenue || 0,
        monthlyRevenue: thisMonthRevenue,
        pendingAmount: overview.pendingAmount || 0,
        completedPayments: overview.completedPayments || 0,
        monthlyData: monthlyRevenue
      })
    } catch (error) {
      console.error('Error fetching payment stats:', error)
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

    if (dateFilter !== 'All') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (dateFilter) {
        case 'Today':
          filterDate.setHours(0, 0, 0, 0)
          filtered = filtered.filter(payment => 
            new Date(payment.createdAt) >= filterDate
          )
          break
        case 'This Week':
          filterDate.setDate(now.getDate() - 7)
          filtered = filtered.filter(payment => 
            new Date(payment.createdAt) >= filterDate
          )
          break
        case 'This Month':
          filterDate.setDate(1)
          filterDate.setHours(0, 0, 0, 0)
          filtered = filtered.filter(payment => 
            new Date(payment.createdAt) >= filterDate
          )
          break
        case 'This Year':
          filterDate.setMonth(0, 1)
          filterDate.setHours(0, 0, 0, 0)
          filtered = filtered.filter(payment => 
            new Date(payment.createdAt) >= filterDate
          )
          break
      }
    }

    // Sort by most recent first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    setFilteredPayments(filtered)
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
      'Rent': 'text-blue-600 bg-blue-100',
      'Security Deposit': 'text-purple-600 bg-purple-100',
      'Maintenance': 'text-orange-600 bg-orange-100',
      'Late Fee': 'text-red-600 bg-red-100'
    }
    return colors[type] || 'text-gray-600 bg-gray-100'
  }

  // Prepare revenue chart data
  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Monthly Revenue (₹)',
        data: Array(12).fill(0).map((_, index) => {
          const monthData = stats.monthlyData.find(m => m._id === index + 1)
          return monthData ? monthData.revenue : 0
        }),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const PaymentCard = ({ payment }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <CurrencyRupeeIcon className="w-5 h-5 text-gray-400 mr-1" />
            <span className="text-xl font-bold text-gray-900">₹{payment.amount.toLocaleString()}</span>
            <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getPaymentTypeColor(payment.paymentType)}`}>
              {payment.paymentType}
            </span>
          </div>
          
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center">
              <BuildingOfficeIcon className="w-4 h-4 mr-2" />
              <span>{payment.property?.title || 'Property Payment'}</span>
            </div>
            <p>From: {payment.tenant?.name}</p>
            <p>Transaction ID: {payment.transactionId}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          {getStatusBadge(payment.status)}
          <p className="text-xs text-gray-500 mt-1">
            {new Date(payment.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Payment Method</p>
          <p className="font-medium text-gray-900">{payment.paymentMethod}</p>
        </div>
        
        <div>
          <p className="text-gray-500">Payment Date</p>
          <p className="font-medium text-gray-900">
            {new Date(payment.paymentDate || payment.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {payment.description && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">{payment.description}</p>
        </div>
      )}

      {payment.receiptUrl && (
        <div className="mt-4 flex justify-end">
          <a
            href={payment.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-600 hover:text-primary-500 flex items-center"
          >
            <DocumentTextIcon className="w-4 h-4 mr-1" />
            View Receipt
          </a>
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading payment data..." />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payment Analytics</h1>
        <p className="text-gray-600 mt-2">Track and analyze your rental income</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CurrencyRupeeIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.monthlyRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <CheckCircleIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedPayments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.pendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Revenue Trend</h2>
          <div className="flex items-center">
            <ChartBarIcon className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-500">2024</span>
          </div>
        </div>
        
        {stats.monthlyData.length > 0 ? (
          <Line
            data={revenueChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return '₹' + value.toLocaleString()
                    }
                  }
                },
              },
            }}
            height={100}
          />
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No revenue data available yet
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="All">All Types</option>
              <option value="Rent">Rent</option>
              <option value="Security Deposit">Security Deposit</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Late Fee">Late Fee</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="All">All Time</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Year">This Year</option>
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
              ? 'Payments from your tenants will appear here' 
              : 'Try adjusting your filter criteria'
            }
          </p>
        </div>
      )}
    </div>
  )
}

export default OwnerPayments
