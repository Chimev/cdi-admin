'use client';

import React, { useState, useEffect } from 'react';
import { 
  Save, 
  User, 
  Lock, 
  Smartphone, 
  Mail, 
  Clock, 
  CreditCard,
  Church,
  Link as LinkIcon,
  Landmark,
  Hash,
  UserCheck,
  Phone
} from 'lucide-react';

// Helper to generate the 48 daily 30-minute slots to avoid Hydration issues
const generateDailySlots = () => {
  const slots = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const startAmPm = h >= 12 ? 'PM' : 'AM';
      const startHr = h % 12 || 12;
      const startMin = m === 0 ? '00' : '30';
      
      const endH = m === 30 ? h + 1 : h;
      const endM = m === 30 ? 0 : 30;
      const endAmPm = (endH % 24) >= 12 ? 'PM' : 'AM';
      const endHr = (endH % 12) || 12;
      const endMin = endM === 0 ? '00' : '30';

      slots.push({
        id: `${h}-${m}`,
        label: `${startHr}:${startMin} ${startAmPm} – ${endHr}:${endMin} ${endAmPm}`,
        link: ''
      });
    }
  }
  return slots;
};

export default function SettingsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'app' | 'prayer' | 'account' | 'security'>('app');

  // --- Form States ---
  
  // App Config State
  const [churchName, setChurchName] = useState('Chapel of Divine Inspiration');
  const [supportEmail, setSupportEmail] = useState('support@cdi.org');
  
  // Payment Config State
  const [defaultSfdPrice, setDefaultSfdPrice] = useState('2000');
  const [bankName, setBankName] = useState('Guaranty Trust Bank');
  const [accountName, setAccountName] = useState('Chapel of Divine Inspiration');
  const [accountNumber, setAccountNumber] = useState('0123456789');
  const [paymentWhatsApp, setPaymentWhatsApp] = useState('+2348000000000');

  // Prayer Chain State (48 Slots)
  const [prayerSlots, setPrayerSlots] = useState(generateDailySlots());

  // Account State
  const [adminName, setAdminName] = useState('Victor Admin');
  const [adminEmail, setAdminEmail] = useState('cdi@email.com');

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    setIsMounted(true);
    // MVP Mock: Pre-fill a couple of slots just to show how it looks
    setPrayerSlots(prev => prev.map(slot => 
      slot.id === '6-0' ? { ...slot, link: 'https://chat.whatsapp.com/morning-glory' } :
      slot.id === '12-30' ? { ...slot, link: 'https://chat.whatsapp.com/afternoon-fire' } : 
      slot
    ));
  }, []);

  // Save Handlers
  const handleSaveAppConfig = (e: React.FormEvent) => {
    e.preventDefault();
    alert('App configurations updated successfully!');
  };

  const handleSavePrayerSlots = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Prayer chain schedule updated successfully!');
  };

  const handleUpdateSlotLink = (id: string, newLink: string) => {
    setPrayerSlots(prev => prev.map(slot => slot.id === id ? { ...slot, link: newLink } : slot));
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Account details updated successfully!');
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    alert('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage your admin account and mobile app configurations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* LEFT: Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="flex flex-col space-y-1">
            <button
              onClick={() => setActiveTab('app')}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'app' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Smartphone className={`w-5 h-5 mr-3 ${activeTab === 'app' ? 'text-blue-700' : 'text-gray-400'}`} />
              App Configuration
            </button>
            <button
              onClick={() => setActiveTab('prayer')}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'prayer' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Clock className={`w-5 h-5 mr-3 ${activeTab === 'prayer' ? 'text-blue-700' : 'text-gray-400'}`} />
              Prayer Chain Links
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'account' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <User className={`w-5 h-5 mr-3 ${activeTab === 'account' ? 'text-blue-700' : 'text-gray-400'}`} />
              Admin Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'security' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Lock className={`w-5 h-5 mr-3 ${activeTab === 'security' ? 'text-blue-700' : 'text-gray-400'}`} />
              Security
            </button>
          </nav>
        </div>

        {/* RIGHT: Main Content Area */}
        <div className="flex-1">
          
          {/* TAB 1: APP CONFIGURATION */}
          {activeTab === 'app' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">App Configuration</h2>
                <p className="text-sm text-gray-500">Update the global settings that reflect on the mobile app.</p>
              </div>
              
              <form onSubmit={handleSaveAppConfig} className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">General Information</h3>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Church Name</label>
                    <div className="relative">
                      <Church className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" required 
                        value={churchName} onChange={(e) => setChurchName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">App Support Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="email" required 
                        value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-gray-100"></div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Payments & Subscriptions</h3>
                  
                  <div className="space-y-1.5 pb-2">
                    <label className="text-sm font-medium text-gray-700">Default SFD Price (₦)</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="number" required min="0" step="100"
                        value={defaultSfdPrice} onChange={(e) => setDefaultSfdPrice(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                    <p className="text-xs text-gray-500">The price members see when trying to unlock a new edition.</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                    <h4 className="text-sm font-semibold text-gray-800">Manual Bank Transfer Details</h4>
                    <p className="text-xs text-gray-500 -mt-3">These details will be shown to users in the app when they attempt to pay for the SFD.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Bank Name</label>
                        <div className="relative">
                          <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="text" required 
                            value={bankName} onChange={(e) => setBankName(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 text-gray-900 bg-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Account Name</label>
                        <div className="relative">
                          <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="text" required 
                            value={accountName} onChange={(e) => setAccountName(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 text-gray-900 bg-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Account Number</label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="text" required 
                            value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 text-gray-900 bg-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Admin WhatsApp (For Confirmation)</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="text" required placeholder="+234..."
                            value={paymentWhatsApp} onChange={(e) => setPaymentWhatsApp(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 text-gray-900 bg-white"
                          />
                        </div>
                        <p className="text-[10px] text-gray-500">Include country code (e.g. +234)</p>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="pt-4 flex justify-end">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center transition-colors">
                    <Save className="w-4 h-4 mr-2" />
                    Save App Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: PRAYER CHAIN */}
          {activeTab === 'prayer' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
              <div className="p-6 border-b border-gray-100 flex-shrink-0">
                <h2 className="text-lg font-bold text-gray-900">24-Hour Prayer Chain</h2>
                <p className="text-sm text-gray-500 mt-1">Manage the WhatsApp group links for every 30-minute prayer watch. Empty slots will not appear in the mobile app.</p>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                <form id="prayer-form" onSubmit={handleSavePrayerSlots} className="space-y-3">
                  {prayerSlots.map((slot) => (
                    <div key={slot.id} className="flex flex-col md:flex-row md:items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm gap-3">
                      <div className="w-40 flex-shrink-0 flex items-center text-sm font-bold text-gray-700">
                        <Clock className="w-4 h-4 mr-2 text-blue-600" />
                        {slot.label}
                      </div>
                      <div className="flex-1 relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          type="url" 
                          placeholder="Paste WhatsApp invite link..."
                          value={slot.link} 
                          onChange={(e) => handleUpdateSlotLink(slot.id, e.target.value)}
                          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                    </div>
                  ))}
                </form>
              </div>

              <div className="p-4 border-t border-gray-100 bg-white flex justify-end flex-shrink-0">
                <button type="submit" form="prayer-form" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center transition-colors">
                  <Save className="w-4 h-4 mr-2" />
                  Save All Links
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ADMIN PROFILE */}
          {activeTab === 'account' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Admin Profile</h2>
                <p className="text-sm text-gray-500">Update your personal dashboard information.</p>
              </div>
              
              <form onSubmit={handleSaveAccount} className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <input 
                    type="text" required 
                    value={adminName} onChange={(e) => setAdminName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <input 
                    type="email" required 
                    value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 text-gray-900 bg-gray-50"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center transition-colors">
                    <Save className="w-4 h-4 mr-2" />
                    Update Profile
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: SECURITY */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Security</h2>
                <p className="text-sm text-gray-500">Change your administrator password.</p>
              </div>
              
              <form onSubmit={handleSaveSecurity} className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Current Password</label>
                  <input 
                    type="password" required 
                    value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div className="w-full h-px bg-gray-100 my-4"></div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">New Password</label>
                  <input 
                    type="password" required minLength={6}
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input 
                    type="password" required minLength={6}
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center transition-colors">
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}