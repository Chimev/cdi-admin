'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Search, 
  X,
  Edit3,
  Trash2,
  Save,
  Link as LinkIcon,
  Image as ImageIcon,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';

export default function EventsPage() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('');
  const [formEndTime, setFormEndTime] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formExternalLink, setFormExternalLink] = useState('');
  const [formStatus, setFormStatus] = useState<'published' | 'draft'>('published');

  // Mock Data (Added status field)
  const [events, setEvents] = useState([
    { 
      id: 1, 
      name: 'Annual Church Convention', 
      date: '2026-10-15',
      startTime: '17:00',
      endTime: '20:00',
      location: 'Main Church Auditorium',
      description: 'Join us for our annual convention. A time of power, worship, and divine inspiration.',
      imageUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=800&auto=format&fit=crop',
      externalLink: '',
      status: 'published' as const
    },
    { 
      id: 2, 
      name: 'Youth Praise Night', 
      date: '2026-09-28',
      startTime: '18:30',
      endTime: '21:00',
      location: 'Youth Hall',
      description: 'An evening of unrestrained worship and praise tailored for the youths.',
      imageUrl: '',
      externalLink: 'https://wa.me/group-link',
      status: 'published' as const
    },
    { 
      id: 3, 
      name: 'Couples Dinner Night', 
      date: '2026-11-14',
      startTime: '18:00',
      endTime: '21:00',
      location: 'Banquet Hall',
      description: 'A special evening for married couples to connect and celebrate love.',
      imageUrl: '',
      externalLink: '',
      status: 'draft' as const // Example of a drafted event
    }
  ]);

  const getMonthAndDay = (dateStr: string) => {
    if (!dateStr) return { month: 'MTH', day: '00' };
    const date = new Date(dateStr);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return {
      month: months[date.getMonth()],
      day: date.getDate().toString().padStart(2, '0')
    };
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHours = h % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  const filteredEvents = events
    .filter(e => 
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setFormImageUrl(localUrl);
    }
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormName('');
    setFormDate('');
    setFormStartTime('');
    setFormEndTime('');
    setFormLocation('');
    setFormDescription('');
    setFormImageUrl('');
    setFormExternalLink('');
    setFormStatus('published');
    setIsFormModalOpen(true);
  };

  const handleEditClick = (event: any) => {
    setEditingId(event.id);
    setFormName(event.name);
    setFormDate(event.date);
    setFormStartTime(event.startTime);
    setFormEndTime(event.endTime);
    setFormLocation(event.location);
    setFormDescription(event.description);
    setFormImageUrl(event.imageUrl || '');
    setFormExternalLink(event.externalLink || '');
    setFormStatus(event.status || 'published');
    setIsFormModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this event? It will be removed from the mobile app immediately.')) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  // Quick toggle for the Eye icon
  const handleTogglePublish = (id: number) => {
    setEvents(events.map(ev => 
      ev.id === id 
        ? { ...ev, status: ev.status === 'published' ? 'draft' : 'published' } 
        : ev
    ));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      setEvents(events.map(ev => 
        ev.id === editingId 
          ? { 
              ...ev, name: formName, date: formDate, startTime: formStartTime, endTime: formEndTime, 
              location: formLocation, description: formDescription, imageUrl: formImageUrl, 
              externalLink: formExternalLink, status: formStatus
            }
          : ev
      ));
    } else {
      const newEvent = {
        id: Date.now(), name: formName, date: formDate, startTime: formStartTime, endTime: formEndTime,
        location: formLocation, description: formDescription, imageUrl: formImageUrl,
        externalLink: formExternalLink, status: formStatus
      };
      setEvents([...events, newEvent]);
    }
    
    setIsFormModalOpen(false);
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
        <button 
          onClick={handleAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search events by name or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
        </div>
        <div className="text-sm text-gray-500 font-medium flex gap-4">
          <span>{filteredEvents.filter(e => e.status === 'published').length} Published</span>
          <span>{filteredEvents.filter(e => e.status === 'draft').length} Drafts</span>
        </div>
      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => {
            const { month, day } = getMonthAndDay(event.date);
            const isPast = new Date(event.date) < new Date();
            const isDraft = event.status === 'draft';
            
            return (
              <div key={event.id} className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all ${isDraft ? 'opacity-75 grayscale-[20%]' : ''}`}>
                
                {/* Image Banner Area */}
                <div className={`h-40 w-full relative ${isPast || isDraft ? 'bg-gray-200' : 'bg-blue-50'}`}>
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-blue-300">
                      <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                      <span className="text-xs font-medium opacity-70">No Image Provided</span>
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    {isDraft && (
                      <div className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded shadow">
                        DRAFT (Hidden)
                      </div>
                    )}
                    {isPast && !isDraft && (
                      <div className="bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
                        Past Event
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 flex items-start gap-4 flex-1">
                  {/* Calendar Block */}
                  <div className="flex-shrink-0 flex flex-col items-center bg-gray-50 border border-gray-100 rounded-lg w-14 overflow-hidden shadow-sm">
                    <div className={`${isPast || isDraft ? 'bg-gray-400' : 'bg-blue-600'} w-full text-center py-1`}>
                      <span className="text-[10px] font-bold text-white tracking-widest">{month}</span>
                    </div>
                    <div className="py-1.5 w-full text-center">
                      <span className="text-lg font-bold text-gray-900">{day}</span>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900 truncate mb-1" title={event.name}>{event.name}</h3>
                    <div className="space-y-1 mt-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-3.5 h-3.5 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="truncate text-xs">
                          {formatTime(event.startTime)} {event.endTime && `- ${formatTime(event.endTime)}`}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-3.5 h-3.5 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="truncate text-xs" title={event.location}>{event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="border-t border-gray-100 bg-gray-50 p-3 px-4 flex justify-between items-center mt-auto">
                  <div className="text-xs font-medium text-gray-500">
                    <button 
                      onClick={() => handleTogglePublish(event.id)}
                      className={`flex items-center transition-colors px-2 py-1 rounded ${isDraft ? 'text-gray-500 hover:bg-gray-200' : 'text-green-600 hover:bg-green-100'}`}
                      title={isDraft ? "Click to Publish" : "Click to Hide"}
                    >
                      {isDraft ? <EyeOff className="w-4 h-4 mr-1.5" /> : <Eye className="w-4 h-4 mr-1.5" />}
                      {isDraft ? 'Hidden' : 'Live'}
                    </button>
                  </div>
                  <div className="flex space-x-1 flex-shrink-0">
                    <button 
                      onClick={() => handleEditClick(event)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit Event"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(event.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-gray-200">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900 mb-1">No events found</h3>
            <p className="text-gray-500 text-sm">Schedule a new event for the church to see.</p>
          </div>
        )}
      </div>

      {/* ----------------- ADD / EDIT MODAL ----------------- */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'Edit Event' : 'Create New Event'}
              </h2>
              <button onClick={() => setIsFormModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6">
              <form id="event-form" onSubmit={handleSave} className="space-y-6">
                
                {/* IMAGE UPLOAD AREA */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 flex justify-between">
                    <span>Event Flyer / Banner</span>
                    <span className="text-xs text-gray-400 font-normal">Optional</span>
                  </label>
                  
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors relative overflow-hidden">
                    {formImageUrl ? (
                      <div className="absolute inset-0 w-full h-full">
                        <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-100">
                            Change Image
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-10 w-10 text-gray-400" />
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>Upload a file</span>
                            <input type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                      </div>
                    )}
                  </div>
                  {formImageUrl && (
                    <button type="button" onClick={() => setFormImageUrl('')} className="text-xs text-red-500 hover:text-red-700 font-medium mt-2">
                      Remove Image
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Event Name</label>
                  <input 
                    type="text" required placeholder="e.g. Annual Church Convention"
                    value={formName} onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Date</label>
                    <input type="date" required value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 text-gray-900" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Start Time</label>
                    <input type="time" required value={formStartTime} onChange={(e) => setFormStartTime(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 text-gray-900" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 flex justify-between">
                      <span>End Time</span>
                      <span className="text-xs text-gray-400">Optional</span>
                    </label>
                    <input type="time" value={formEndTime} onChange={(e) => setFormEndTime(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 text-gray-900" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" required placeholder="e.g. Main Church Auditorium" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 text-gray-900" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <textarea required rows={3} placeholder="Describe the event..." value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 text-gray-900 resize-y"></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 flex justify-between">
                      <span>External Link</span>
                      <span className="text-xs text-gray-400">Optional</span>
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="url" placeholder="e.g. WhatsApp link" value={formExternalLink} onChange={(e) => setFormExternalLink(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 text-gray-900" />
                    </div>
                  </div>
                  
                  {/* VISIBILITY DROPDOWN */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Visibility</label>
                    <select 
                      value={formStatus} 
                      onChange={(e) => setFormStatus(e.target.value as 'published' | 'draft')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 text-gray-900 bg-white"
                    >
                      <option value="published">Published (Visible on App)</option>
                      <option value="draft">Draft (Hidden)</option>
                    </select>
                  </div>
                </div>

              </form>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3 flex-shrink-0">
              <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors">
                Cancel
              </button>
              <button type="submit" form="event-form" className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center">
                <Save className="w-4 h-4 mr-2" /> 
                {editingId ? 'Save Changes' : 'Create Event'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}