'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  Send, 
  Search, 
  X,
  CheckCircle2,
  Megaphone,
  AlertCircle,
  Calendar,
  BookOpen
} from 'lucide-react';

export default function NotificationsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);

  // Form State
  const [formType, setFormType] = useState('General Broadcast');
  const [formTitle, setFormTitle] = useState('');
  const [formMessage, setFormMessage] = useState('');
  
  // Character Limits for Push Notifications
  const MAX_TITLE = 50;
  const MAX_MESSAGE = 150;

  // Mock Data: Notification History
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Sunday Service Starts in 1 Hour!',
      message: 'Join us today for an amazing time in God\'s presence. Don\'t be late!',
      date: 'Sept 20, 2026 • 8:00 AM',
      type: 'Event Reminder',
      status: 'sent'
    },
    {
      id: 2,
      title: 'New Devotional Available',
      message: 'The September - October edition of the SFD is now available in your app.',
      date: 'Sept 1, 2026 • 10:00 AM',
      type: 'SFD Update',
      status: 'sent'
    },
    {
      id: 3,
      title: '24-Hour Prayer Chain',
      message: 'We are fasting and praying tomorrow for the church. Join the WhatsApp group for details.',
      date: 'Aug 28, 2026 • 6:30 PM',
      type: 'General Broadcast',
      status: 'sent'
    }
  ]);

  const filteredNotifications = notifications.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenCompose = () => {
    setFormType('General Broadcast');
    setFormTitle('');
    setFormMessage('');
    setIsComposeModalOpen(true);
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formTitle.trim() || !formMessage.trim()) return;

    if (confirm(`Are you sure you want to send this ${formType} to all users right now?`)) {
      const newNotification = {
        id: Date.now(),
        title: formTitle,
        message: formMessage,
        date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
        type: formType,
        status: 'sent'
      };

      setNotifications([newNotification, ...notifications]);
      setIsComposeModalOpen(false);
    }
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
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
        >
          <Send className="w-4 h-4 mr-2" />
          Compose Message
        </button>
      </div>

      {/* Quick Stats (Updated to reflect MVP reality) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600 mr-4">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">General Broadcasts</p>
            <p className="text-2xl font-bold text-gray-900">
              {notifications.filter(n => n.type === 'General Broadcast').length}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="bg-green-100 p-3 rounded-lg text-green-600 mr-4">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Event Reminders</p>
            <p className="text-2xl font-bold text-gray-900">
              {notifications.filter(n => n.type === 'Event Reminder').length}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="bg-purple-100 p-3 rounded-lg text-purple-600 mr-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">SFD Updates</p>
            <p className="text-2xl font-bold text-gray-900">
              {notifications.filter(n => n.type === 'SFD Update').length}
            </p>
          </div>
        </div>
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
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            />
          </div>
          <h3 className="text-sm font-semibold text-gray-600">Notification History</h3>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs">Message Details</th>
                <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs">Category</th>
                <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs">Date Sent</th>
                <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 max-w-md">
                      <p className="font-bold text-gray-900 mb-1 truncate">{item.title}</p>
                      <p className="text-gray-600 text-xs line-clamp-2">{item.message}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-xs font-medium">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="inline-flex items-center text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Delivered
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No notifications found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------- COMPOSE MODAL ----------------- */}
      {isComposeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl overflow-hidden flex flex-col md:flex-row">
            
            {/* LEFT: Compose Form */}
            <div className="flex-1 border-r border-gray-100 flex flex-col max-h-[85vh]">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <Megaphone className="w-5 h-5 mr-2 text-blue-600" />
                  Compose Broadcast
                </h2>
                <button onClick={() => setIsComposeModalOpen(false)} className="text-gray-400 hover:text-gray-600 md:hidden">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Broadcast messages are pushed immediately to all users who have the app installed and notifications enabled. Use them sparingly to avoid spamming members.
                  </p>
                </div>

                <form id="push-form" onSubmit={handleSendNotification} className="space-y-6">
                  
                  {/* ADDED: Notification Type Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Notification Category</label>
                    <select 
                      value={formType} 
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    >
                      <option value="General Broadcast">General Broadcast (Announcements, info)</option>
                      <option value="Event Reminder">Event Reminder (Upcoming services)</option>
                      <option value="SFD Update">SFD Update (New devotional editions)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 flex justify-between">
                      <span>Notification Title</span>
                      <span className={`text-xs ${formTitle.length > MAX_TITLE ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                        {formTitle.length} / {MAX_TITLE}
                      </span>
                    </label>
                    <input 
                      type="text" required placeholder="e.g. Sunday Service starts in 1 hour!"
                      value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                      maxLength={MAX_TITLE}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 flex justify-between">
                      <span>Message Body</span>
                      <span className={`text-xs ${formMessage.length > MAX_MESSAGE ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                        {formMessage.length} / {MAX_MESSAGE}
                      </span>
                    </label>
                    <textarea 
                      required rows={4} placeholder="Type the message here..."
                      value={formMessage} onChange={(e) => setFormMessage(e.target.value)}
                      maxLength={MAX_MESSAGE}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 resize-none"
                    ></textarea>
                  </div>
                </form>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                <button 
                  type="button" onClick={() => setIsComposeModalOpen(false)} 
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" form="push-form"
                  disabled={!formTitle || !formMessage}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 mr-2" /> 
                  Send Now
                </button>
              </div>
            </div>

            {/* RIGHT: Live Preview (Hidden on small screens) */}
            <div className="hidden md:flex w-80 bg-gray-100 flex-col items-center justify-center p-6 border-l border-gray-200">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">User Device Preview</p>
              
              {/* Mock Phone Lock Screen */}
              <div className="w-[260px] h-[520px] bg-slate-900 rounded-[36px] p-2 shadow-2xl relative border-[6px] border-slate-800 flex flex-col">
                {/* iPhone Notch */}
                <div className="absolute top-0 inset-x-0 h-6 bg-slate-800 rounded-b-3xl w-32 mx-auto"></div>
                
                {/* Lock Screen Time */}
                <div className="mt-14 text-center">
                  <p className="text-white text-5xl font-light">9:41</p>
                  <p className="text-slate-300 text-sm mt-1">Tuesday, September 22</p>
                </div>

                {/* The Push Notification Bubble */}
                <div className="mt-8 mx-2 bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-5 h-5 bg-[#D62828] rounded flex items-center justify-center">
                        <span className="text-[10px] text-white font-bold">CDI</span>
                      </div>
                      <span className="text-[11px] font-medium text-gray-700 tracking-wide uppercase">Chapel</span>
                    </div>
                    <span className="text-[10px] text-gray-500">now</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 leading-tight mb-1 truncate">
                    {formTitle || "Notification Title"}
                  </p>
                  <p className="text-xs text-gray-700 leading-snug line-clamp-3">
                    {formMessage || "The message body will appear here. Users can tap this to open the app."}
                  </p>
                </div>
                
                {/* Bottom Bar */}
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