'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, MapPin, Plus, Search, X, Edit3, Trash2, Save,
  Link as LinkIcon, Image as ImageIcon, Upload, Eye, EyeOff, Loader2
} from 'lucide-react';
import { uploadImageToCloudinary } from '@/utilis/funtions/uploadImage';

type ChurchEvent = {
  _id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  image: { url: string; publicId: string } | null;
  externalLink: string;
  status: 'published' | 'draft';
};

export default function EventsPage() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('');
  const [formEndTime, setFormEndTime] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formExternalLink, setFormExternalLink] = useState('');
  const [formStatus, setFormStatus] = useState<'published' | 'draft'>('published');
  
  const [formImage, setFormImage] = useState<{ url: string; publicId: string } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // NEW: Track newly uploaded images that haven't been saved to DB yet
  const [unsavedUploadId, setUnsavedUploadId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/events?search=${encodeURIComponent(debouncedSearch)}`);
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events || []);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [debouncedSearch]);

  const getMonthAndDay = (dateStr: string) => {
    if (!dateStr) return { month: 'MTH', day: '00' };
    const date = new Date(dateStr);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return { month: months[date.getMonth()], day: date.getDate().toString().padStart(2, '0') };
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    return `${h % 12 || 12}:${minutes} ${h >= 12 ? 'PM' : 'AM'}`;
  };

  // HELPER: Fire and forget Cloudinary deletion
  const deleteFromCloudinary = (publicId: string) => {
    fetch('/api/cloudinary/cloudinary-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId })
    }).catch(e => console.error("Cloudinary delete failed:", e));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const uploadedImage = await uploadImageToCloudinary(file, 'cdi_events');
      if (uploadedImage) {
        // If they already uploaded a new image this session but are replacing it, delete the orphaned one
        if (unsavedUploadId) deleteFromCloudinary(unsavedUploadId);

        setFormImage(uploadedImage);
        setUnsavedUploadId(uploadedImage.publicId); // Track it!
      } else {
        alert('Image upload failed.');
      }
    } catch (error) {
      alert('Network error during upload.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // NEW: Handle "Remove Image" click safely
  const handleRemoveImage = () => {
    // If the image they are removing was uploaded during THIS session, wipe it from Cloudinary
    if (formImage?.publicId === unsavedUploadId && unsavedUploadId) {
      deleteFromCloudinary(unsavedUploadId);
      setUnsavedUploadId(null);
    }
    // Set form to null. (If it was an original DB image, the backend will handle deleting it on Save)
    setFormImage(null);
  };

  // NEW: Handle clicking Cancel or X safely
  const handleCloseModal = () => {
    // If they uploaded something but canceled, wipe it!
    if (unsavedUploadId) {
      deleteFromCloudinary(unsavedUploadId);
      setUnsavedUploadId(null);
    }
    setIsFormModalOpen(false);
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormName(''); setFormDate(''); setFormStartTime(''); setFormEndTime('');
    setFormLocation(''); setFormDescription(''); setFormImage(null);
    setFormExternalLink(''); setFormStatus('published');
    setUnsavedUploadId(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (event: ChurchEvent) => {
    setEditingId(event._id);
    setFormName(event.name); 
    setFormDate(new Date(event.date).toISOString().split('T')[0]); 
    setFormStartTime(event.startTime); setFormEndTime(event.endTime);
    setFormLocation(event.location); setFormDescription(event.description); setFormImage(event.image);
    setFormExternalLink(event.externalLink || ''); setFormStatus(event.status || 'published');
    setUnsavedUploadId(null);
    setIsFormModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event? It will be removed from the mobile app immediately.')) return;

    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEvents(events.filter(e => e._id !== id));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete event.');
      }
    } catch (error) {
      console.error(error);
      alert('Network error deleting event.');
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) setEvents(events.map(ev => ev._id === id ? { ...ev, status: newStatus } : ev));
    } catch (error) {
      alert('Network error updating status.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name: formName, date: formDate, startTime: formStartTime, endTime: formEndTime,
      location: formLocation, description: formDescription, image: formImage,
      externalLink: formExternalLink, status: formStatus
    };
    
    // Safety rollback in case the DB call completely fails
    const rollbackImage = () => {
      if (unsavedUploadId) {
        deleteFromCloudinary(unsavedUploadId);
        setUnsavedUploadId(null);
      }
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/admin/events/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          setEvents(events.map(ev => ev._id === editingId ? data.event : ev));
          setUnsavedUploadId(null); // Success! Clear the tracking ID
          setIsFormModalOpen(false);
        } else {
          rollbackImage();
          alert(data.message || 'Failed to update event.');
        }
      } else {
        const res = await fetch('/api/admin/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          if (debouncedSearch) {
            setSearchQuery(''); setDebouncedSearch('');
          } else {
            setEvents([data.event, ...events]);
          }
          setUnsavedUploadId(null); // Success!
          setIsFormModalOpen(false);
        } else {
          rollbackImage();
          alert(data.message || 'Failed to create event.');
        }
      }
    } catch (error) {
      rollbackImage();
      alert('Network error saving event.');
    } finally {
      setIsSubmitting(false);
    }
  };


  if (!isMounted) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Church Events</h1>
          <p className="text-sm text-gray-500">Manage upcoming services, meetings, and special programs.</p>
        </div>
        <button onClick={handleAddClick} className="bg-[#3a3e98] hover:bg-[#2a2d75] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-md transition-all">
          <Plus className="w-4 h-4 mr-2" /> Create Event
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" placeholder="Search events by name or location..." 
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#3a3e98] focus:border-[#3a3e98] text-gray-900"
          />
        </div>
        <div className="text-sm text-[#3a3e98] font-bold flex gap-4">
          <span>{events.filter(e => e.status === 'published').length} Published</span>
          <span className="text-gray-500">{events.filter(e => e.status === 'draft').length} Drafts</span>
        </div>
      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
        {isLoading ? (
          <div className="col-span-full py-16 flex justify-center">
             <Loader2 className="w-10 h-10 animate-spin text-[#3a3e98]" />
          </div>
        ) : events.length > 0 ? (
          events.map((event) => {
            const { month, day } = getMonthAndDay(event.date);
            const isPast = new Date(event.date) < new Date(new Date().setHours(0,0,0,0));
            const isDraft = event.status === 'draft';
            
            return (
              <div key={event._id} className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col group hover:border-[#3a3e98]/30 transition-all ${isDraft ? 'opacity-75 grayscale-[20%]' : ''}`}>
                <div className={`h-40 w-full relative ${isPast || isDraft ? 'bg-gray-200' : 'bg-indigo-50'}`}>
                  {event.image?.url ? (
                    <img src={event.image.url} alt={event.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#3a3e98]/40">
                      <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                      <span className="text-xs font-bold uppercase tracking-wider">No Banner</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    {isDraft && <div className="bg-gray-800 text-white text-xs font-bold px-2.5 py-1 rounded shadow">DRAFT</div>}
                    {isPast && !isDraft && <div className="bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded backdrop-blur-sm">Past Event</div>}
                  </div>
                </div>

                <div className="p-5 flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0 flex flex-col items-center bg-gray-50 border border-gray-100 rounded-lg w-14 overflow-hidden shadow-sm">
                    <div className={`${isPast || isDraft ? 'bg-gray-400' : 'bg-[#3a3e98]'} w-full text-center py-1`}>
                      <span className="text-[10px] font-bold text-white tracking-widest">{month}</span>
                    </div>
                    <div className="py-1.5 w-full text-center">
                      <span className="text-lg font-bold text-gray-900">{day}</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900 truncate mb-1" title={event.name}>{event.name}</h3>
                    <div className="space-y-1 mt-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-3.5 h-3.5 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="truncate text-xs font-medium">{formatTime(event.startTime)} {event.endTime && `- ${formatTime(event.endTime)}`}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-3.5 h-3.5 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="truncate text-xs font-medium" title={event.location}>{event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 bg-gray-50 p-3 px-4 flex justify-between items-center mt-auto">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleTogglePublish(event._id, event.status)}
                      className={`flex items-center transition-colors px-2 py-1 rounded ${isDraft ? 'text-gray-500 hover:bg-gray-200' : 'text-green-600 hover:bg-green-100'}`}
                    >
                      {isDraft ? <EyeOff className="w-4 h-4 mr-1.5" /> : <Eye className="w-4 h-4 mr-1.5" />}
                      {isDraft ? 'Hidden' : 'Live'}
                    </button>
                  </div>
                  <div className="flex space-x-1 flex-shrink-0">
                    <button onClick={() => handleEditClick(event)} className="p-1.5 text-gray-400 hover:text-[#3a3e98] hover:bg-indigo-50 rounded transition-colors"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(event._id)} className="p-1.5 text-gray-400 hover:text-[#f0303b] hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-gray-200">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900 mb-1">No events found</h3>
            <p className="text-gray-500 text-sm">{debouncedSearch ? 'No events match your search.' : 'Schedule a new event for the church to see.'}</p>
          </div>
        )}
      </div>

      {/* ----------------- ADD / EDIT MODAL ----------------- */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
              <h2 className="text-lg font-bold text-[#3a3e98]">
                {editingId ? 'Edit Event' : 'Create New Event'}
              </h2>
              {/* UPDATED: Calling handleCloseModal */}
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-[#f0303b]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6">
              <form id="event-form" onSubmit={handleSave} className="space-y-6">
                
                {/* IMAGE UPLOAD AREA */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 flex justify-between">
                    <span>Event Flyer / Banner</span>
                    <span className="text-xs text-gray-400 font-medium">Optional</span>
                  </label>
                  
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors relative overflow-hidden">
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10" />
                    
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center justify-center text-[#3a3e98] py-4">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <span className="text-sm font-bold">Uploading to Cloudinary...</span>
                      </div>
                    ) : formImage ? (
                      <div className="relative w-full h-40">
                        <img src={formImage.url} alt="Preview" className="w-full h-full object-cover rounded-md" />
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-md">
                           <span className="text-white font-bold text-sm mb-1">Click to Replace</span>
                           <span className="text-gray-300 font-mono text-[10px]">ID: {formImage.publicId}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center py-4">
                        <Upload className="mx-auto h-10 w-10 text-gray-400" />
                        <div className="flex text-sm text-gray-600 justify-center font-medium mt-2">
                          <span className="text-[#3a3e98]">Click or drag to upload</span>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                      </div>
                    )}
                  </div>
                  {formImage && !isUploadingImage && (
                    <button type="button" onClick={handleRemoveImage} className="text-xs text-[#f0303b] hover:text-red-700 font-bold mt-2">
                      Remove Image
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Event Name</label>
                  <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#3a3e98] text-gray-900" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700">Date</label>
                    <input type="date" required value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#3a3e98] text-gray-900" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700">Start Time</label>
                    <input type="time" required value={formStartTime} onChange={(e) => setFormStartTime(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#3a3e98] text-gray-900" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 flex justify-between">
                      <span>End Time</span>
                      <span className="text-xs text-gray-400">Optional</span>
                    </label>
                    <input type="time" value={formEndTime} onChange={(e) => setFormEndTime(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#3a3e98] text-gray-900" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3a3e98]" />
                    <input type="text" required placeholder="e.g. Main Church Auditorium" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#3a3e98] text-gray-900" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Description</label>
                  <textarea required rows={3} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-[#3a3e98] text-gray-900 resize-y"></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 flex justify-between">
                      <span>External Link</span>
                      <span className="text-xs text-gray-400">Optional</span>
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3a3e98]" />
                      <input type="url" placeholder="e.g. WhatsApp link" value={formExternalLink} onChange={(e) => setFormExternalLink(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#3a3e98] text-gray-900" />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700">Visibility</label>
                    <select value={formStatus} onChange={(e) => setFormStatus(e.target.value as 'published' | 'draft')} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#3a3e98] text-gray-900 bg-white">
                      <option value="published">Published (Visible on App)</option>
                      <option value="draft">Draft (Hidden)</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3 flex-shrink-0">
              {/* UPDATED: Calling handleCloseModal */}
              <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-white transition-colors">
                Cancel
              </button>
              <button type="submit" form="event-form" disabled={isUploadingImage || isSubmitting} className="px-6 py-2 bg-[#3a3e98] text-white rounded-lg text-sm font-bold hover:bg-[#2a2d75] transition-colors flex items-center shadow-md disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} 
                {isSubmitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Create Event')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}