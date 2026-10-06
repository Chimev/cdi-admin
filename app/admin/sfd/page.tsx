'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  BookOpen, 
  KeyRound, 
  Calendar, 
  ChevronLeft, 
  Save, 
  FileText,
  X,
  Pencil
} from 'lucide-react';

// Helper function to format date to: "FRIDAY 1st MAY 2026"
const formatToDevotionalDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  const dateNum = date.getDate();
  
  const getOrdinal = (n: number) => {
    if (n > 3 && n < 21) return 'th';
    switch (n % 10) {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
  };

  return `${dayName} ${dateNum}${getOrdinal(dateNum)} ${monthName} ${year}`;
};

export default function SfdEditionsPage() {
  const [view, setView] = useState<'list' | 'manage'>('list');
  const [selectedEdition, setSelectedEdition] = useState<any>(null);

  // Modal State for New Edition
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTheme, setNewTheme] = useState('');
  const [newStartMonth, setNewStartMonth] = useState('');
  const [newEndMonth, setNewEndMonth] = useState('');
  const [newPrice, setNewPrice] = useState('2000');

  // Form State for Daily Reading
  const [editingReadingId, setEditingReadingId] = useState<number | null>(null);
  const [readingDate, setReadingDate] = useState('');
  const [readingTopic, setReadingTopic] = useState('');
  const [readingSubStatement, setReadingSubStatement] = useState('');
  const [readingContent, setReadingContent] = useState('');
  const [readingPrayer, setReadingPrayer] = useState('');

  // Mock Editions Data
  const [editions, setEditions] = useState([
    { id: 1, title: 'September – October 2026', theme: 'Walking in Divine Purpose', status: 'Active', price: '₦2,000', readingsCount: 61 },
    { id: 2, title: 'November – December 2026', theme: 'The Power of Prayer', status: 'Draft', price: '₦2,000', readingsCount: 14 },
  ]);

  // Mock Daily Readings for the Manage View
  const [readings, setReadings] = useState([
    { 
      id: 1, 
      date: '2026-09-04', 
      topic: 'Walking in Divine Purpose', 
      subStatement: 'Jeremiah 29:11',
      content: 'For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.',
      prayer: 'Lord, help me to walk in your divine will today.'
    },
    { 
      id: 2, 
      date: '2026-09-06', 
      topic: 'Patience in the Process', 
      subStatement: 'James 1:4',
      content: 'Let perseverance finish its work so that you may be mature and complete, not lacking anything.',
      prayer: 'Father, give me the grace to wait on Your timing.'
    }
  ]);

  // Sort readings chronologically so future dates are ordered properly
  const sortedReadings = useMemo(() => {
    return [...readings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [readings]);

  const handleManageEdition = (edition: any) => {
    setSelectedEdition(edition);
    setView('manage');
    resetForm();
  };

  const resetForm = () => {
    setEditingReadingId(null);
    setReadingDate('');
    setReadingTopic('');
    setReadingSubStatement('');
    setReadingContent('');
    setReadingPrayer('');
  };

  // Load an existing reading into the form when clicked in the sidebar
  const handleEditReadingClick = (reading: any) => {
    setEditingReadingId(reading.id);
    setReadingDate(reading.date);
    setReadingTopic(reading.topic);
    setReadingSubStatement(reading.subStatement);
    setReadingContent(reading.content);
    setReadingPrayer(reading.prayer);
  };

  const handleSaveReading = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingReadingId) {
      // Update existing reading
      setReadings(readings.map(r => 
        r.id === editingReadingId 
          ? { ...r, date: readingDate, topic: readingTopic, subStatement: readingSubStatement, content: readingContent, prayer: readingPrayer }
          : r
      ));
      alert('Reading updated successfully!');
    } else {
      // Create new reading
      const newReading = {
        id: Date.now(),
        date: readingDate,
        topic: readingTopic,
        subStatement: readingSubStatement,
        content: readingContent,
        prayer: readingPrayer
      };
      setReadings([...readings, newReading]);
      alert('New reading added successfully!');
    }
    
    resetForm();
  };

  const handleCreateEdition = (e: React.FormEvent) => {
    e.preventDefault();
    const startDate = new Date(newStartMonth + '-01');
    const endDate = new Date(newEndMonth + '-01');
    
    const startMonthName = startDate.toLocaleString('default', { month: 'long' });
    const endMonthName = endDate.toLocaleString('default', { month: 'long' });
    const year = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    
    const title = year === endYear 
      ? `${startMonthName} – ${endMonthName} ${year}`
      : `${startMonthName} ${year} – ${endMonthName} ${endYear}`;

    const newEdition = {
      id: Date.now(),
      title,
      theme: newTheme,
      status: 'Draft',
      price: `₦${Number(newPrice).toLocaleString()}`,
      readingsCount: 0
    };

    setEditions([newEdition, ...editions]);
    setNewTheme('');
    setNewStartMonth('');
    setNewEndMonth('');
    setNewPrice('2000');
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* ----------------- LIST VIEW ----------------- */}
      {view === 'list' && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SFD Editions</h1>
              <p className="text-sm text-gray-500">Manage your monthly/bi-monthly devotional releases.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Edition
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {editions.map((edition) => (
              <div key={edition.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      edition.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {edition.status}
                    </div>
                    <span className="text-gray-900 font-bold">{edition.price}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{edition.title}</h3>
                  <p className="text-sm text-blue-600 font-medium mb-3">Theme: {edition.theme}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-3 border-t border-gray-100 pt-3">
                    <FileText className="w-4 h-4 mr-1.5" />
                    {edition.readingsCount} Daily Readings added
                  </div>
                </div>
                <div className="border-t border-gray-100 bg-gray-50 p-4 grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleManageEdition(edition)}
                    className="flex items-center justify-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                    Content
                  </button>
                  <Link 
                    href="/admin/sfd/codes"
                    className="flex items-center justify-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <KeyRound className="w-4 h-4 mr-2 text-green-600" />
                    Codes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ----------------- CREATE EDITION MODAL ----------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Create New Edition</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateEdition} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">SFD Theme</label>
                <input 
                  type="text" required placeholder="e.g. Walking in Divine Purpose"
                  value={newTheme} onChange={(e) => setNewTheme(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Start Month</label>
                  <input type="month" required value={newStartMonth} onChange={(e) => setNewStartMonth(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">End Month</label>
                  <input type="month" required value={newEndMonth} onChange={(e) => setNewEndMonth(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Price (₦)</label>
                <input type="number" required min="0" step="500" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Create Edition</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MANAGE CONTENT VIEW ----------------- */}
      {view === 'manage' && selectedEdition && (
        <div className="space-y-6">
          
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <button onClick={() => setView('list')} className="p-2 mr-3 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{selectedEdition.title}</h1>
                <p className="text-sm text-blue-600 font-medium">Theme: {selectedEdition.theme}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col: Upload/Edit Form */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              
              <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingReadingId ? 'Edit Daily Reading' : 'Add New Reading'}
                </h2>
                
                {/* Show "Cancel Edit" button if we are currently editing an existing reading */}
                {editingReadingId && (
                  <button 
                    onClick={resetForm}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add New Instead
                  </button>
                )}
              </div>
              
              <form onSubmit={handleSaveReading} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 flex justify-between">
                    <span>Date</span>
                    <span className="text-xs text-blue-600 font-bold">
                      {readingDate ? formatToDevotionalDate(readingDate) : 'Select a date'}
                    </span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="date" required value={readingDate} onChange={(e) => setReadingDate(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Topic</label>
                    <input type="text" required placeholder="e.g. Walking in Divine Purpose" value={readingTopic} onChange={(e) => setReadingTopic(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Sub Statement / Key Verse</label>
                    <input type="text" required placeholder="e.g. Jeremiah 29:11" value={readingSubStatement} onChange={(e) => setReadingSubStatement(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Reading Content</label>
                  <textarea required rows={8} value={readingContent} onChange={(e) => setReadingContent(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-serif leading-relaxed resize-y"></textarea>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Closing Prayer</label>
                  <textarea required rows={3} value={readingPrayer} onChange={(e) => setReadingPrayer(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-serif leading-relaxed resize-y bg-gray-50"></textarea>
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium flex items-center transition-colors">
                    <Save className="w-4 h-4 mr-2" />
                    {editingReadingId ? 'Update Reading' : 'Save Reading'}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Col: Clickable List of Readings (Sorted Chronologically) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[750px]">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Added Readings ({sortedReadings.length})</h3>
                <span className="text-xs text-gray-500">Click to edit</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2">
                {sortedReadings.map((reading) => {
                  const isEditing = editingReadingId === reading.id;
                  
                  return (
                    <div 
                      key={reading.id} 
                      onClick={() => handleEditReadingClick(reading)}
                      className={`p-4 border-b border-gray-100 transition-colors group cursor-pointer rounded-lg relative ${
                        isEditing ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500' : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Edit Icon pops up on hover (or stays visible if actively editing) */}
                      <div className={`absolute top-4 right-4 ${isEditing ? 'text-blue-600' : 'text-gray-300 group-hover:text-blue-500 transition-colors'}`}>
                        <Pencil className="w-4 h-4" />
                      </div>

                      <p className={`text-[11px] font-bold mb-1 tracking-wider uppercase ${isEditing ? 'text-blue-700' : 'text-blue-600'}`}>
                        {formatToDevotionalDate(reading.date)}
                      </p>
                      <p className="text-sm font-bold text-gray-900 pr-6">{reading.topic}</p>
                      <p className="text-xs font-semibold text-gray-500 mt-1 italic">{reading.subStatement}</p>
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">{reading.content}</p>
                      
                      <div className={`mt-3 p-2 rounded border ${isEditing ? 'bg-white border-blue-100' : 'bg-blue-50 border-blue-100'}`}>
                        <p className="text-[10px] font-bold text-blue-700 uppercase mb-0.5">Prayer</p>
                        <p className="text-xs text-blue-900 truncate">{reading.prayer}</p>
                      </div>
                    </div>
                  );
                })}
                {sortedReadings.length === 0 && (
                  <div className="text-center py-10 text-gray-500 text-sm">
                    No readings added yet.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}