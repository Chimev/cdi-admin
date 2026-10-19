'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Plus, BookOpen, KeyRound, Calendar, ChevronLeft, Save, X, UploadCloud, Loader2
} from 'lucide-react';

// Helper to format date
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
      case 1: return "st"; case 2: return "nd"; case 3: return "rd"; default: return "th";
    }
  };

  return `${dayName} ${dateNum}${getOrdinal(dateNum)} ${monthName} ${year}`;
};

export default function SfdEditionsPage() {
  const [view, setView] = useState<'list' | 'manage'>('list');
  const [selectedEdition, setSelectedEdition] = useState<any>(null);

  // --- API DATA STATES ---
  const [editions, setEditions] = useState<any[]>([]);
  const [readings, setReadings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- MODAL STATE (Editions) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTheme, setNewTheme] = useState('');
  const [newStartMonth, setNewStartMonth] = useState(''); 
  const [newEndMonth, setNewEndMonth] = useState('');     
  const [newPrice, setNewPrice] = useState('2000');
  
  // Clean Unified Image Object
  const [coverImage, setCoverImage] = useState<{ url: string; publicId: string } | null>(null); 
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmittingEdition, setIsSubmittingEdition] = useState(false);
  const [isCancelingEdition, setIsCancelingEdition] = useState(false);
  // --- FORM STATE (Content) ---
  const [editingReadingId, setEditingReadingId] = useState<string | null>(null);
  const [readingDate, setReadingDate] = useState('');
  const [readingTopic, setReadingTopic] = useState('');
  const [readingSubStatement, setReadingSubStatement] = useState('');
  const [readingContent, setReadingContent] = useState('');
  const [readingPrayer, setReadingPrayer] = useState('');
  const [isSubmittingContent, setIsSubmittingContent] = useState(false);

  const [isTogglingPublish, setIsTogglingPublish] = useState(false);

  // 1. Fetch Editions on Mount
  useEffect(() => {
    const fetchEditions = async () => {
      try {
        const res = await fetch('/api/admin/sfd/editions');
        if (res.ok) {
          const data = await res.json();
          setEditions(data.editions || []);
        }
      } catch (error) {
        console.error('Failed to fetch editions', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEditions();
  }, []);

  const sortedReadings = useMemo(() => {
    return [...readings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [readings]);

  // 2. Fetch Daily Readings when opening an Edition
  const handleManageEdition = async (edition: any) => {
    setSelectedEdition(edition);
    setView('manage');
    resetForm();
    
    try {
      const res = await fetch(`/api/admin/sfd/content?editionId=${edition._id}`);
      if (res.ok) {
        const data = await res.json();
        setReadings(data.dailyReadings || []);
      }
    } catch (error) {
      console.error('Failed to fetch content', error);
      alert('Failed to load daily readings.');
    }
  };

  const resetForm = () => {
    setEditingReadingId(null);
    setReadingDate('');
    setReadingTopic('');
    setReadingSubStatement('');
    setReadingContent('');
    setReadingPrayer('');
  };

  const handleEditReadingClick = (reading: any) => {
    setEditingReadingId(reading._id);
    const formattedDate = new Date(reading.date).toISOString().split('T')[0];
    setReadingDate(formattedDate);
    setReadingTopic(reading.topic);
    setReadingSubStatement(reading.subStatement);
    setReadingContent(reading.content);
    setReadingPrayer(reading.prayer);
  };

  // 3. Cloudinary Upload (Sets the Unified Object)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

 

  setIsUploadingImage(true);
  try {
    // 1. Get the signature, timestamp, and API key from your backend
    const signRes = await fetch('/api/cloudinary/cloudinary-sign', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'cdi' })
    });
    const { signature, timestamp, folder, api_key } = await signRes.json();
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;


    // 2. Build the form data with signed parameters
    const formData = new FormData();
    formData.append('file', file);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('api_key', api_key);
    formData.append('folder', folder);

    // 3. Upload the file to Cloudinary
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (data.secure_url && data.public_id) {
      setCoverImage({ url: data.secure_url, publicId: data.public_id });
    } else {
      alert('Image upload failed.');
    }
  } catch (error) {
    console.error('Upload error:', error);
    alert('Network error during upload.');
  } finally {
    setIsUploadingImage(false);
  }
};


  // 4. Create Edition via API
  const handleCreateEdition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverImage) return alert('Please upload a cover image.');

    setIsSubmittingEdition(true);

    const [startYearStr, startMonthStr] = newStartMonth.split('-');
    const [endYearStr, endMonthStr] = newEndMonth.split('-');
    
    const startMonth = parseInt(startMonthStr, 10);
    const endMonth = parseInt(endMonthStr, 10);
    const year = parseInt(startYearStr, 10);
    const priceNumber = parseInt(newPrice, 10);

    const startDate = new Date(year, startMonth - 1);
    const endDate = new Date(parseInt(endYearStr, 10), endMonth - 1);
    const startMonthName = startDate.toLocaleString('default', { month: 'long' });
    const endMonthName = endDate.toLocaleString('default', { month: 'long' });
    
    const title = year === parseInt(endYearStr, 10) 
      ? `${startMonthName} – ${endMonthName} ${year}`
      : `${startMonthName} ${year} – ${endMonthName} ${endYearStr}`;

    const payload = {
      title,
      theme: newTheme,
      startMonth,
      endMonth,
      year,
      coverImage, 
      price: priceNumber
    };

    // HELPER: Rollback Cloudinary upload if DB save fails
    const rollbackImage = () => {
      if (coverImage?.publicId) {
        console.log("Rolling back Cloudinary upload...", coverImage.publicId);
        fetch('/api/cloudinary/cloudinary-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicId: coverImage.publicId }) // Fixed to match your POST route
        }).catch(e => console.error("Rollback failed to execute:", e));
      }
    };

    try {
      const res = await fetch('/api/admin/sfd/editions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setEditions([data.edition, ...editions]);
        setNewTheme(''); setNewStartMonth(''); setNewEndMonth(''); setNewPrice('2000'); setCoverImage(null);
        setIsModalOpen(false);
        alert('Edition created successfully!');
      } else {
        // CATCH 1: Backend errors (e.g. 409 Duplicate Edition or 400 Validation Error)
        rollbackImage();
        alert(data.message || 'Failed to create edition.');
      }
    } catch (error) {
      console.error(error);
      // CATCH 2: Network errors (e.g. WiFi disconnects during fetch)
      rollbackImage();
      alert('Network error creating edition.');
    } finally {
      setIsSubmittingEdition(false);
    }
  };

  // 5. Save Daily Reading via API
  const handleSaveReading = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContent(true);

    const payload = {
      editionId: selectedEdition._id,
      date: readingDate,
      topic: readingTopic,
      subStatement: readingSubStatement,
      content: readingContent,
      prayer: readingPrayer
    };

    try {
      if (editingReadingId) {
        // --- EDIT EXISTING READING (PATCH) ---
        const res = await fetch(`/api/admin/sfd/content/${editingReadingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
          // Update the specific item in the local React state without reloading the page
          setReadings(readings.map(r => r._id === editingReadingId ? data.content : r));
          resetForm();
          alert('Reading updated successfully!');
        } else {
          alert(data.message || 'Failed to update reading.');
        }

      } else {
        // --- CREATE NEW READING (POST) ---
        const res = await fetch('/api/admin/sfd/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
          setReadings([...readings, data.content]);
          resetForm();
          alert('Reading added successfully!');
        } else {
          alert(data.message || 'Failed to add reading.');
        }
      }
    } catch (error) {
      console.error(error);
      alert('Network error saving reading.');
    } finally {
      setIsSubmittingContent(false);
    }
  };


  // 6. Toggle Publish Status
  const handleTogglePublish = async () => {
    if (!selectedEdition) return;
    
    const newStatus = !selectedEdition.isPublished;
    const confirmMessage = newStatus 
      ? "Are you sure you want to publish this edition? It will become visible to all mobile app users." 
      : "Are you sure you want to revert this to a draft? Users will no longer see it.";
      
    if (!window.confirm(confirmMessage)) return;

    setIsTogglingPublish(true);

    try {
      const res = await fetch(`/api/admin/sfd/editions/${selectedEdition._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: newStatus })
      });

      const data = await res.json();

      if (res.ok) {
        // Update the selected edition state
        setSelectedEdition({ ...selectedEdition, isPublished: newStatus });
        // Update the item in the master list so the badge updates when you go back
        setEditions(editions.map(ed => ed._id === selectedEdition._id ? { ...ed, isPublished: newStatus } : ed));
        alert(data.message);
      } else {
        alert(data.message || 'Failed to update status.');
      }
    } catch (error) {
      console.error(error);
      alert('Network error updating status.');
    } finally {
      setIsTogglingPublish(false);
    }
  };

 const handleCancel = async () => {
  setIsCancelingEdition(true);
    // 1. Capture the ID into an isolated variable immediately before changing state
    const publicIdToDelete = coverImage?.publicId;
    console.log("Preparing to delete Cloudinary asset:", publicIdToDelete);

    // 2. Clear UI states right away so the application feels snappy and responsive
    
    

    // 3. Trigger the deletion in the background safely using the isolated variable
    if (publicIdToDelete) {
      try {
        const response = await fetch('/api/cloudinary/cloudinary-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // ⚠️ Matches the 'publicId' property your backend expects
          body: JSON.stringify({ publicId: publicIdToDelete }) 
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Cloudinary asset cleanup failed on server:", errorData);
        }
      } catch (error) {
        console.error("Network connectivity failure during rollback:", error);
      }finally {
        setIsCancelingEdition(false);
        setIsModalOpen(false);
        setNewTheme('');
        setNewStartMonth('');
        setNewEndMonth('');
        setNewPrice('2000');
        setCoverImage(null);
      }
    }
  };


  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* ----------------- LIST VIEW ----------------- */}
      {view === 'list' && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SFD Editions</h1>
              <p className="text-sm text-gray-500">Manage bi-monthly devotional releases and content.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#3a3e98] hover:bg-[#2a2d75] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Edition
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-[#3a3e98] animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {editions.map((edition) => (
                <div key={edition._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:border-[#3a3e98]/30 transition-colors">
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        edition.isPublished ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {edition.isPublished ? 'Published' : 'Draft'}
                      </div>
                      <span className="text-gray-900 font-bold">₦{edition.price?.toLocaleString()}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#3a3e98] mb-1">{edition.title}</h3>
                    <p className="text-sm text-gray-600 font-medium mb-3">Theme: {edition.theme}</p>
                  </div>
                  <div className="border-t border-gray-100 bg-gray-50 p-4 grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleManageEdition(edition)}
                      className="flex items-center justify-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-[#3a3e98]"
                    >
                      <BookOpen className="w-4 h-4 mr-2 text-[#3a3e98]" />
                      Content
                    </button>
                    <Link 
                      href={`/admin/sfd/codes?editionId=${edition._id}`}
                      className="flex items-center justify-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-[#3a3e98]"
                    >
                      <KeyRound className="w-4 h-4 mr-2 text-[#f0303b]" />
                      Codes
                    </Link>
                  </div>
                </div>
              ))}
              {editions.length === 0 && (
                 <div className="col-span-full text-center py-12 text-gray-500">No editions found. Create one above!</div>
              )}
            </div>
          )}
        </>
      )}

      {/* ----------------- CREATE EDITION MODAL ----------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-[#3a3e98]">Create New Edition</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-[#f0303b]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateEdition} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Cover Image</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50">
                  <input 
                    type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  {isUploadingImage ? (
                    <div className="flex flex-col items-center justify-center text-[#3a3e98]">
                      <Loader2 className="w-8 h-8 animate-spin mb-2" />
                      <span className="text-sm font-medium">Uploading...</span>
                    </div>
                  ) : coverImage ? (
                    <div className="flex flex-col items-center">
                      <img src={coverImage.url} alt="Cover" className="h-24 w-auto rounded-md object-cover shadow-sm mb-2" />
                      <span className="text-[10px] text-gray-500 font-mono mb-1">ID: {coverImage.publicId}</span>
                      <span className="text-xs text-green-600 font-bold">Uploaded Successfully</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <UploadCloud className="w-8 h-8 mb-2 text-gray-400" />
                      <span className="text-sm font-medium">Click to upload cover image</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Theme</label>
                <input 
                  type="text" required placeholder="e.g. Walking in Divine Purpose"
                  value={newTheme} onChange={(e) => setNewTheme(e.target.value)}
                  className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Start Month</label>
                  <input type="month" required value={newStartMonth} onChange={(e) => setNewStartMonth(e.target.value)} className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">End Month</label>
                  <input type="month" required value={newEndMonth} onChange={(e) => setNewEndMonth(e.target.value)} className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Price (₦)</label>
                <input type="number" required min="0" step="500" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="w-full px-4 py-2  text-black border border-gray-300 rounded-lg text-sm" />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={handleCancel} disabled={isCancelingEdition || isSubmittingEdition}  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700">
                  {isCancelingEdition ? 'Canceling...' : 'Cancel'}
                </button>
                <button type="submit" disabled={isUploadingImage || isSubmittingEdition} className="px-4 py-2 bg-[#3a3e98] text-white rounded-lg text-sm font-bold disabled:opacity-50">
                  {isSubmittingEdition ? 'Creating...' : 'Create Edition'}
                </button>
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
              <button onClick={() => setView('list')} className="p-2 mr-3 hover:bg-gray-100 rounded-lg text-gray-500">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-[#3a3e98]">{selectedEdition.title}</h1>
                <p className="text-sm text-gray-600 font-medium">Theme: {selectedEdition.theme}</p>
              </div>
            </div>
            <button 
          onClick={handleTogglePublish}
          disabled={isTogglingPublish}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 ${
            selectedEdition.isPublished 
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300' 
              : 'bg-green-600 text-white hover:bg-green-700 shadow-md'
          }`}
        >
          {isTogglingPublish ? 'Updating...' : (selectedEdition.isPublished ? 'Revert to Draft' : 'Publish Edition')}
        </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Upload/Edit Form */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
                <h2 className="text-lg font-bold text-gray-900">
                  {editingReadingId ? 'Edit Daily Reading' : 'Add New Reading'}
                </h2>
                {editingReadingId && (
                  <button onClick={resetForm} className="text-sm text-[#f0303b] hover:text-[#c72630] font-bold flex items-center bg-red-50 px-3 py-1.5 rounded-md">
                    <Plus className="w-4 h-4 mr-1" /> Add New Instead
                  </button>
                )}
              </div>
              
              <form onSubmit={handleSaveReading} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 flex justify-between">
                    <span>Date</span>
                    <span className="text-xs text-[#3a3e98] font-bold uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                      {readingDate ? formatToDevotionalDate(readingDate) : 'Select a date'}
                    </span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3a3e98]" />
                    <input 
                      type="date" required value={readingDate} onChange={(e) => setReadingDate(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border text-black border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700">Topic</label>
                    <input type="text" required value={readingTopic} onChange={(e) => setReadingTopic(e.target.value)} className="w-full text-black  px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700">Sub Statement / Key Verse</label>
                    <input type="text" required value={readingSubStatement} onChange={(e) => setReadingSubStatement(e.target.value)} className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg text-sm" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Reading Content</label>
                  <textarea required rows={8} value={readingContent} onChange={(e) => setReadingContent(e.target.value)} className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg text-sm font-serif"></textarea>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Closing Prayer</label>
                  <textarea required rows={3} value={readingPrayer} onChange={(e) => setReadingPrayer(e.target.value)} className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg text-sm font-serif bg-gray-50"></textarea>
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={isSubmittingContent} className="bg-[#3a3e98] hover:bg-[#2a2d75] text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center disabled:opacity-50">
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmittingContent ? 'Saving...' : (editingReadingId ? 'Update Reading' : 'Save Reading')}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Col: Clickable List of Readings */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[750px]">
              <div className="p-4 border-b border-gray-200 bg-[#3a3e98] text-white flex justify-between items-center">
                <h3 className="font-bold text-sm">Added Readings ({sortedReadings.length})</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 bg-gray-50/50">
                {sortedReadings.map((reading) => {
                  const isEditing = editingReadingId === reading._id;
                  
                  return (
                    <div 
                      key={reading._id} 
                      onClick={() => handleEditReadingClick(reading)}
                      className={`p-4 mb-2 border transition-all cursor-pointer rounded-xl relative bg-white ${
                        isEditing ? 'border-[#3a3e98] ring-1 ring-[#3a3e98] shadow-md' : 'border-gray-200 hover:border-[#3a3e98]/50'
                      }`}
                    >
                      <p className={`text-[10px] font-bold mb-1.5 tracking-widest uppercase ${isEditing ? 'text-[#f0303b]' : 'text-[#3a3e98]'}`}>
                        {formatToDevotionalDate(reading.date)}
                      </p>
                      <p className="text-sm font-bold text-gray-900 leading-tight mb-1">{reading.topic}</p>
                      <p className="text-xs font-semibold text-gray-500 italic mb-2">{reading.subStatement}</p>
                    </div>
                  );
                })}
                {sortedReadings.length === 0 && (
                  <div className="text-center py-10 text-gray-500 text-sm font-medium">No readings added yet.</div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}