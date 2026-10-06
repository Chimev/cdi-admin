'use client'

import { BellRing, BookOpen, Calendar, ChevronDown, ChevronRight, LayoutDashboard, LogOut, MessageSquareQuote, Settings } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";




export function SideBar () {
 const pathname = usePathname();
  
  // State to handle the SFD dropdown menu
  const [isSfdOpen, setIsSfdOpen] = useState(true);
    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Admin Header */}
        <Image src={'/logo.png'} alt='CDI logo' width={150} height={100} className='object-contain mx-auto' />

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          
          {/* 1. Dashboard */}
          <Link
            href="/admin"
            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              pathname === '/admin' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3 flex-shrink-0" />
            Dashboard
          </Link>

          {/* 2. SFD Sub-Navigation Group */}
          <div>
            <button
              onClick={() => setIsSfdOpen(!isSfdOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 mr-3 flex-shrink-0" />
                SFD Management
              </div>
              {isSfdOpen ? <ChevronDown  className="w-4 h-4" /> : <ChevronRight  className="w-4 h-4" />}
            </button>
            
            {/* The Nested Links */}
            {isSfdOpen && (
              <div className="mt-1 ml-4 pl-4 border-l-2 border-gray-100 space-y-1">
                <Link
                  href="/admin/sfd"
                  className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pathname === '/admin/sfd' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Editions & Content
                </Link>
                <Link
                  href="/admin/sfd/codes"
                  className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pathname === '/admin/sfd/codes' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Access Codes
                </Link>
              </div>
            )}
          </div>

          {/* 3. Testimonies */}
          <Link
            href="/admin/testimonies"
            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              pathname === '/admin/testimonies' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <MessageSquareQuote className="w-5 h-5 mr-3 flex-shrink-0" />
            Testimonies
          </Link>

          {/* 4. Events */}
          <Link
            href="/admin/events"
            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              pathname === '/admin/events' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Calendar className="w-5 h-5 mr-3 flex-shrink-0" />
            Events
          </Link>

          {/* 5. Notifications */}
          <Link
            href="/admin/notifications"
            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              pathname === '/admin/notifications' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <BellRing className="w-5 h-5 mr-3 flex-shrink-0" />
            Push Notifications
          </Link>

          {/* 6. Settings */}
          <Link
            href="/admin/settings"
            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              pathname === '/admin/settings' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Settings className="w-5 h-5 mr-3 flex-shrink-0" />
            Settings
          </Link>
          
        </nav>

        {/* User / Logout */}
        <div className="p-4 border-t border-gray-200">
          <button onClick={() => signOut({callbackUrl: '/auth'})} className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5 mr-3" />
            Sign out
          </button>
        </div>
      </aside>
    )
}