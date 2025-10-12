import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Layout from './components/layout/Layout'
import ErrorBoundary from './components/common/ErrorBoundary'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Public Pages
import Home from './pages/Home'
import PropertyDetails from './pages/PropertyDetails'
import BrowseProperties from './pages/tenant/BrowseProperties'

// User Pages
import Profile from './pages/user/Profile'
import EditProfile from './pages/user/EditProfile'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageUsers from './pages/admin/ManageUsers'
import ManageProperties from './pages/admin/ManageProperties'
import ManageBookings from './pages/admin/ManageBookings'
import AdminReports from './pages/admin/AdminReports'

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard'
import AddProperty from './pages/owner/AddProperty'
import MyProperties from './pages/owner/MyProperties'
import EditProperty from './pages/owner/EditProperty'
import OwnerBookings from './pages/owner/OwnerBookings'
import OwnerPayments from './pages/owner/OwnerPayments'

// Tenant Pages
import TenantDashboard from './pages/tenant/TenantDashboard'
import CreateBooking from './pages/tenant/CreateBooking'
import MyBookings from './pages/tenant/MyBookings'
import MyPayments from './pages/tenant/MyPayments'
import MyFeedback from './pages/tenant/MyFeedback'

import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes - No authentication required */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Routes with Layout */}
              <Route path="/" element={<Layout />}>
                {/* Public Pages */}
                <Route index element={<Home />} />
                <Route path="properties" element={<BrowseProperties />} />
                <Route path="properties/:id"  element={<PropertyDetails />} />

                {/* User Profile Routes - Any authenticated user */}
                <Route path="profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="profile/edit" element={
                  <ProtectedRoute>
                    <EditProfile />
                  </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="admin" element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <Navigate to="/admin/dashboard" replace />
                  </ProtectedRoute>
                } />
                <Route path="admin/dashboard" element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="admin/users" element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <ManageUsers />
                  </ProtectedRoute>
                } />
                <Route path="admin/properties" element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <ManageProperties />
                  </ProtectedRoute>
                } />
                <Route path="admin/bookings" element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <ManageBookings />
                  </ProtectedRoute>
                } />
                <Route path="admin/reports" element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <AdminReports />
                  </ProtectedRoute>
                } />

                {/* Owner Routes */}
                <Route path="owner" element={
                  <ProtectedRoute allowedRoles={['Owner']}>
                    <Navigate to="/owner/dashboard" replace />
                  </ProtectedRoute>
                } />
                <Route path="owner/dashboard" element={
                  <ProtectedRoute allowedRoles={['Owner']}>
                    <OwnerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="owner/properties" element={
                  <ProtectedRoute allowedRoles={['Owner']}>
                    <MyProperties />
                  </ProtectedRoute>
                } />
                <Route path="owner/properties/add" element={
                  <ProtectedRoute allowedRoles={['Owner']}>
                    <AddProperty />
                  </ProtectedRoute>
                } />
                <Route path="owner/properties/:id/edit" element={
                  <ProtectedRoute allowedRoles={['Owner']}>
                    <EditProperty />
                  </ProtectedRoute>
                } />
                <Route path="owner/bookings" element={
                  <ProtectedRoute allowedRoles={['Owner']}>
                    <OwnerBookings />
                  </ProtectedRoute>
                } />
                <Route path="owner/payments" element={
                  <ProtectedRoute allowedRoles={['Owner']}>
                    <OwnerPayments />
                  </ProtectedRoute>
                } />

                {/* Tenant Routes */}
                <Route path="tenant" element={
                  <ProtectedRoute allowedRoles={['Tenant']}>
                    <Navigate to="/tenant/dashboard" replace />
                  </ProtectedRoute>
                } />
                <Route path="tenant/dashboard" element={
                  <ProtectedRoute allowedRoles={['Tenant']}>
                    <TenantDashboard />
                  </ProtectedRoute>
                } />
                <Route path="tenant/bookings" element={
                  <ProtectedRoute allowedRoles={['Tenant']}>
                    <MyBookings />
                  </ProtectedRoute>
                } />
                <Route path="tenant/bookings/create/:propertyId" element={
                  <ProtectedRoute allowedRoles={['Tenant']}>
                    <CreateBooking />
                  </ProtectedRoute>
                } />
                <Route path="tenant/payments" element={
                  <ProtectedRoute allowedRoles={['Tenant']}>
                    <MyPayments />
                  </ProtectedRoute>
                } />
                <Route path="tenant/feedback" element={
                  <ProtectedRoute allowedRoles={['Tenant']}>
                    <MyFeedback />
                  </ProtectedRoute>
                } />

                {/* 404 Route */}
                <Route path="*" element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                      <p className="text-gray-600 mb-4">Page not found</p>
                      <a href="/" className="text-primary-600 hover:text-primary-500">
                        Go back home
                      </a>
                    </div>
                  </div>
                } />
              </Route>
            </Routes>

            {/* Toast Notifications */}
            <Toaster
              position="bottom-right"
              reverseOrder={false}
              gutter={8}
              containerClassName=""
              containerStyle={{}}
              toastOptions={{
                className: '',
                duration: 2000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 2000,
                  theme: {
                    primary: 'green',
                    secondary: 'black',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
