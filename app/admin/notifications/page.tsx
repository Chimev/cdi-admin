'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, Send, Search, X, CheckCircle2, Megaphone, 
  AlertCircle, Calendar, BookOpen, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';

type AppNotification = {
  _id: string;
  title: string;
  message: string;
  type: string;
  status: string;
  createdAt: string;
};

export default function NotificationsPage() {
  // --- API DATA & SEARCH STATE ---
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [totalNotifications, setTotalNotifications] = useState(0); // Optional: track total overall
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // --- MODAL & FORM STATE ---
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [formType, setFormType] = useState('General Broadcast');
  const [formTitle, setFormTitle] = useState('');
  const [formMessage, setFormMessage] = useState('');
  
  const MAX_TITLE = 50;
  const MAX_MESSAGE = 150;

  // 1. Debounce Search Input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 2. Reset page to 1 if search filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // 3. Fetch Notifications History
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams({
          search: debouncedSearch,
          page: currentPage.toString(),
          limit: '50' // Fetching 50 per page
        });

        const res = await fetch(`/api/admin/notifications?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
          setTotalPages(data.pagination.totalPages || 1);
          setTotalNotifications(data.pagination.total || 0);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, [debouncedSearch, currentPage]);

  const handleOpenCompose = () => {
    setFormType('General Broadcast');
    setFormTitle('');
    setFormMessage('');
    setIsComposeModalOpen(true);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formMessage.trim()) return;

    if (!confirm(`Are you sure you want to send this ${formType} to all users right now?`)) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formTitle, message: formMessage, type: formType })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (currentPage === 1 && !debouncedSearch) {
          // If on page 1 with no search, just pop it to the top
          setNotifications([data.notification, ...notifications]);
        } else {
          // Otherwise, clear search and reset to page 1 to see the new message
          setSearchQuery('');
          setDebouncedSearch('');
          setCurrentPage(1);
        }
        setIsComposeModalOpen(false);
        alert('Broadcast sent successfully!');
      } else {
        alert(data.message || 'Failed to send broadcast.');
      }
    } catch (error) {
      console.error(error);
      alert('Network error sending broadcast.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' 
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Push Notifications</h1>
          <p className="text-sm text-gray-500">Send custom broadcast messages and alerts to all app users.</p>
        </div>
        <button 
          onClick={handleOpenCompose}
          className="bg-[#3a3e98] hover:bg-[#2a2d75] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-md transition-all"
        >
          <Send className="w-4 h-4 mr-2" />
          Compose Message
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="border-b border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search past notifications..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#3a3e98] focus:border-[#3a3e98] text-gray-900 bg-white"
            />
          </div>
          <h3 className="text-sm font-bold text-gray-600">History ({totalNotifications})</h3>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#3a3e98] text-white border-b border-gray-200">
              <tr>
                <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-xs">Message Details</th>
                <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-xs">Category</th>
                <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-xs">Date Sent</th>
                <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-xs text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#3a3e98]" />
                  </td>
                </tr>
              ) : notifications.length > 0 ? (
                notifications.map((item) => (
                  <tr key={item._id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4 max-w-md">
                      <p className="font-bold text-[#3a3e98] mb-1 truncate">{item.title}</p>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{item.message}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-xs font-medium">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="inline-flex items-center text-green-700 font-bold text-xs bg-green-50 px-2.5 py-1 rounded-md border border-green-200">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Delivered
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">{debouncedSearch ? "No history matches your search." : "No notifications have been sent yet."}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <span className="text-sm text-gray-600 font-medium">Page {currentPage} of {totalPages}</span>
          <div className="flex space-x-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
              className="p-2 rounded-lg border border-gray-300 bg-white disabled:opacity-50 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0 || isLoading}
              className="p-2 rounded-lg border border-gray-300 bg-white disabled:opacity-50 hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* ----------------- COMPOSE MODAL ----------------- */}
      {isComposeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row">
            
            {/* LEFT: Compose Form */}
            <div className="flex-1 border-r border-gray-100 flex flex-col max-h-[85vh]">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-bold text-[#3a3e98] flex items-center">
                  <Megaphone className="w-5 h-5 mr-2 text-[#f0303b]" />
                  Compose Broadcast
                </h2>
                <button onClick={() => setIsComposeModalOpen(false)} className="text-gray-400 hover:text-[#f0303b] md:hidden transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6 flex items-start">
                  <AlertCircle className="w-5 h-5 text-[#3a3e98] mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-indigo-900 font-medium leading-relaxed">
                    Broadcast messages are pushed immediately to all users who have the app installed and notifications enabled. Use them sparingly to avoid spamming members.
                  </p>
                </div>

                <form id="push-form" onSubmit={handleSendNotification} className="space-y-6">
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700">Notification Category</label>
                    <select 
                      value={formType} 
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#3a3e98] focus:border-[#3a3e98] text-gray-900 bg-white"
                    >
                      <option value="General Broadcast">General Broadcast (Announcements, info)</option>
                      <option value="Event Reminder">Event Reminder (Upcoming services)</option>
                      <option value="SFD Update">SFD Update (New devotional editions)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 flex justify-between">
                      <span>Notification Title</span>
                      <span className={`text-xs ${formTitle.length > MAX_TITLE ? 'text-[#f0303b] font-bold' : 'text-gray-400'}`}>
                        {formTitle.length} / {MAX_TITLE}
                      </span>
                    </label>
                    <input 
                      type="text" required placeholder="e.g. Sunday Service starts in 1 hour!"
                      value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                      maxLength={MAX_TITLE}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#3a3e98] focus:border-[#3a3e98] text-gray-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 flex justify-between">
                      <span>Message Body</span>
                      <span className={`text-xs ${formMessage.length > MAX_MESSAGE ? 'text-[#f0303b] font-bold' : 'text-gray-400'}`}>
                        {formMessage.length} / {MAX_MESSAGE}
                      </span>
                    </label>
                    <textarea 
                      required rows={4} placeholder="Type the message here..."
                      value={formMessage} onChange={(e) => setFormMessage(e.target.value)}
                      maxLength={MAX_MESSAGE}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-[#3a3e98] focus:border-[#3a3e98] text-gray-900 resize-none"
                    ></textarea>
                  </div>
                </form>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                <button 
                  type="button" onClick={() => setIsComposeModalOpen(false)} 
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" form="push-form"
                  disabled={!formTitle || !formMessage || isSubmitting}
                  className="px-6 py-2 bg-[#3a3e98] text-white rounded-lg text-sm font-bold hover:bg-[#2a2d75] transition-colors flex items-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />} 
                  {isSubmitting ? 'Sending...' : 'Send Now'}
                </button>
              </div>
            </div>

            {/* RIGHT: Live Preview (Hidden on small screens) */}
            <div className="hidden md:flex w-80 bg-gray-100 flex-col items-center justify-center p-6 border-l border-gray-200">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">User Device Preview</p>
              
              <div className="w-[260px] h-[520px] bg-slate-900 rounded-[36px] p-2 shadow-2xl relative border-[6px] border-slate-800 flex flex-col">
                <div className="absolute top-0 inset-x-0 h-6 bg-slate-800 rounded-b-3xl w-32 mx-auto"></div>
                
                <div className="mt-14 text-center">
                  <p className="text-white text-5xl font-light">9:41</p>
                  <p className="text-slate-300 text-sm mt-1">Tuesday, September 22</p>
                </div>

                <div className="mt-8 mx-2 bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-5 h-5 bg-[#f0303b] rounded flex items-center justify-center">
                        <span className="text-[10px] text-white font-bold">CDI</span>
                      </div>
                      <span className="text-[11px] font-bold text-gray-700 tracking-wide uppercase">Chapel</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">now</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 leading-tight mb-1 truncate">
                    {formTitle || "Notification Title"}
                  </p>
                  <p className="text-xs text-gray-700 leading-snug line-clamp-3">
                    {formMessage || "The message body will appear here. Users can tap this to open the app."}
                  </p>
                </div>
                
                <div className="absolute bottom-2 inset-x-0 flex justify-center">
                  <div className="w-24 h-1 bg-white/30 rounded-full"></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}