'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      <main
        className={`flex-grow transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-20' : 'ml-64'}`}
      >
        {children}
      </main>
    </div>
  )
}