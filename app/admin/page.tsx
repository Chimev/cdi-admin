'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  KeyRound, 
  MessageSquareQuote, 
  Calendar, 
  Bell, 
  Loader2 
} from 'lucide-react';

type DashboardStats = {
  users: number;
  editions: number;
  codesTotal: number;
  codesUnused: number;
  testimonies: number;
  events: number;
  notifications: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#3a3e98]" />
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading Overview...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500">A high-level summary of your app's data and content.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Users Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center hover:border-[#3a3e98]/30 transition-colors">
          <div className="bg-indigo-50 p-4 rounded-xl text-[#3a3e98] mr-5">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">App Users</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.users.toLocaleString()}</p>
          </div>
        </div>

        {/* SFD Editions Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center hover:border-[#3a3e98]/30 transition-colors">
          <div className="bg-indigo-50 p-4 rounded-xl text-[#3a3e98] mr-5">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Devotional Editions</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.editions.toLocaleString()}</p>
          </div>
        </div>

        {/* Access Codes Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center hover:border-green-200 transition-colors">
          <div className="bg-green-50 p-4 rounded-xl text-green-600 mr-5">
            <KeyRound className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Unused Codes</h3>
            <div className="flex items-baseline space-x-2 mt-1">
              <p className="text-3xl font-bold text-gray-900">{stats?.codesUnused.toLocaleString()}</p>
              <p className="text-xs font-medium text-gray-500">/ {stats?.codesTotal.toLocaleString()} total</p>
            </div>
          </div>
        </div>

        {/* Testimonies Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center hover:border-[#3a3e98]/30 transition-colors">
          <div className="bg-indigo-50 p-4 rounded-xl text-[#3a3e98] mr-5">
            <MessageSquareQuote className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Published Testimonies</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.testimonies.toLocaleString()}</p>
          </div>
        </div>

        {/* Events Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center hover:border-[#3a3e98]/30 transition-colors">
          <div className="bg-indigo-50 p-4 rounded-xl text-[#3a3e98] mr-5">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Church Events</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.events.toLocaleString()}</p>
          </div>
        </div>

        {/* Notifications Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center hover:border-[#f0303b]/30 transition-colors">
          <div className="bg-red-50 p-4 rounded-xl text-[#f0303b] mr-5">
            <Bell className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Broadcasts Sent</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.notifications.toLocaleString()}</p>
          </div>
        </div>

      </div>
    </div>
  );
}