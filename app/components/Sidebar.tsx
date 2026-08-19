'use client'

import { Archive, ChevronLeft, ChevronRight, LayoutDashboard, LogOut, User } from 'lucide-react'
import { logout } from '../components/actions'

interface SidebarProps {
  isCollapsed: boolean
  toggleSidebar: () => void
}

export default function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-gray-900 text-white transition-all duration-300 ease-in-out z-30 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-20 border-b border-gray-800">
          <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-gray-700">
            {isCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>
        </div>
        <div className="flex flex-col justify-between flex-grow">
          <nav className="flex flex-col gap-y-2 px-4 pt-4">
            <a href="/" className="flex items-center p-3 rounded-lg bg-gray-700">
              <LayoutDashboard size={24} />
              {!isCollapsed && <span className="ml-4 font-semibold">Home</span>}
            </a>
            <a href="#" className="flex items-center p-3 rounded-lg hover:bg-gray-700">
              <Archive size={24} />
              {!isCollapsed && <span className="ml-4 font-semibold">Manage Pots</span>}
            </a>
            <a href="#" className="flex items-center p-3 rounded-lg hover:bg-gray-700">
              <User size={24} />
              {!isCollapsed && <span className="ml-4 font-semibold">Profile</span>}
            </a>
          </nav>
          <div className="p-4 border-t border-gray-800">
            <form action={logout}>
              <button type="submit" className="flex items-center w-full p-3 rounded-lg hover:bg-gray-700">
                <LogOut size={24} />
                {!isCollapsed && <span className="ml-4 font-semibold">Logout</span>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  )
}