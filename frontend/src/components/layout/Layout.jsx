import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Footer from './Footer'

const Layout = () => {
  const { user } = useAuth()
  const location = useLocation()
  
  // Check if current page should show sidebar
  const shouldShowSidebar = user && (
    location.pathname.startsWith('/admin/') ||
    location.pathname.startsWith('/owner/') ||
    location.pathname.startsWith('/tenant/')
  )

  // Check if current page should show footer
  const shouldShowFooter = !shouldShowSidebar

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        {shouldShowSidebar && <Sidebar />}
        
        <main className={`flex-1 ${shouldShowSidebar ? '' : ''}`}>
          <div className={shouldShowSidebar ? 'p-6' : ''}>
            <Outlet />
          </div>
        </main>
      </div>
      
      {shouldShowFooter && <Footer />}
    </div>
  )
}

export default Layout
