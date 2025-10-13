import React, { useEffect, useState } from 'react'
import { reportService } from '../../services/reportService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { ExclamationTriangleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const AdminReports = () => {
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState([])
  const [query, setQuery] = useState('')

  const fetchReports = async () => {
    try {
      setLoading(true)
      const res = await reportService.getReports()
      // Expecting { success, data } structure based on other services
      console.log('Reports API Response:', res) // Debug log
      setReports(res.data || res)
    } catch (err) {
      console.error('Error fetching reports:', err) // Debug log
      toast.error(err?.response?.data?.message || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [action, setAction] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const actionOptions = [
    { value: 'Ignore', label: 'Ignore', color: 'bg-red-100 text-red-800' },
    { value: 'Remove_Property', label: 'Remove Property', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Remove_Owner', label: 'Remove Owner', color: 'bg-green-100 text-green-800' },
  ]

  const filtered = reports.filter((r) => {
    const text = `${r.category || ''} ${r.details || ''} ${r?.property?.title || ''} ${r?.owner?.name || ''}`.toLowerCase()
    return text.includes(query.toLowerCase())
  })

  const handleRowClick = (report) => {
    console.log('Selected Report:', report) // Debug log
    setSelectedReport(report)
    // Only set to 'Ignore' or '' if action is not one of the valid options
    const validActions = ['Ignore', 'Remove_Property', 'Remove_Owner']
    if (validActions.includes(report.action)) {
      setAction(report.action)
    } else {
      setAction('')
    }
    setShowReportModal(true)
  }

  const handleCloseModal = () => {
    setShowReportModal(false)
    setSelectedReport(null)
    setAction('')
  }

  const handleTakeAction = async () => {
    if (!selectedReport) return
    if (action === '') {
      toast.error('Please select an action')
      return
    }
    try {
      setActionLoading(true)
      await reportService.updateReportStatus(selectedReport._id, {
        action: action
      })
      toast.success('Report action taken')
      handleCloseModal()
      fetchReports()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update report')
    } finally {
      setActionLoading(false)
    }
  }

  const actionBadge = (status) => {
    if (status === 'Pending') return 'bg-red-100 text-red-800';
    if (status === 'Reviewed') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading reports..." />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by category, property, owner or details"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <ExclamationTriangleIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No reports found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(r)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r?.property?.title || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r?.owner?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r?.reporter?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${actionBadge(r.status)}`}>
                        {r.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
      {/* Report Detail Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Report Details</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Property Images */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Property Images</h4>
                {selectedReport.property?.photos && selectedReport.property.photos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedReport.property.photos.slice(0, 4).map((photo, index) => (
                      <img
                        key={index}
                        src={photo.url || `/uploads/properties/${photo.filename}`}
                        alt={`Property ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = '/placeholder.png'
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">No images</span>
                  </div>
                )}
              </div>

              {/* Property Information */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">{selectedReport.property?.title}</h4>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {selectedReport.property?.type}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <span className="text-sm">
                      {selectedReport.property?.address?.city}, {selectedReport.property?.address?.state}
                    </span>
                  </div>
                  <div className="flex items-center text-primary-600 font-semibold">
                    <span>₹{selectedReport.property?.rent?.toLocaleString()}/month</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Area</p>
                    <p className="font-medium text-gray-900">{selectedReport.property?.area} sq ft</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Bedrooms</p>
                    <p className="font-medium text-gray-900">{selectedReport.property?.bedrooms} BHK</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Bathrooms</p>
                    <p className="font-medium text-gray-900">{selectedReport.property?.bathrooms}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Furnished</p>
                    <p className="font-medium text-gray-900">{selectedReport.property?.furnished}</p>
                  </div>
                </div>

                {/* Owner Information */}
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Property Owner</h4>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {selectedReport.owner?.name?.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{selectedReport.owner?.name}</p>
                      <p className="text-sm text-gray-500">{selectedReport.owner?.email}</p>
                      {selectedReport.owner?.contactNumber && (
                        <p className="text-sm text-gray-500">{selectedReport.owner.contactNumber}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-600">{selectedReport.property?.description}</p>
            </div>

            {/* Amenities */}
            {selectedReport.property?.amenities && selectedReport.property.amenities.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedReport.property.amenities.map((amenity, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Address */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Full Address</h4>
              <p className="text-sm text-gray-600">
                {selectedReport.property?.address?.street}, {selectedReport.property?.address?.city}, {selectedReport.property?.address?.state} - {selectedReport.property?.address?.zipCode}
              </p>
            </div>

            {/* Report Details */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Report Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Reported on</span>
                  <div className="font-medium text-gray-900">{new Date(selectedReport.createdAt).toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Category</span>
                  <div className="font-medium text-gray-900">{selectedReport.category}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Reporter</span>
                  <div className="font-medium text-gray-900">{selectedReport?.reporter?.name || '-'}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Action</span>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${actionBadge(selectedReport.action)}`}>
                    {selectedReport.action || 'Ignore'}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-500">Details</span>
                <div className="text-gray-700">{selectedReport.details}</div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
                <select
                  value={action}
                  onChange={e => setAction(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900"
                >
                  <option key='' value=''>Select Action</option>
                  {actionOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handleTakeAction}
                disabled={actionLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : 'Take Action'}
              </button>
            </div>
          </div>
        </div>
      )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminReports
