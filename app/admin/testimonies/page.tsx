'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquareQuote, 
  Plus, 
  Search, 
  X,
  Edit3,
  Trash2,
  Save,
  Loader2
} from 'lucide-react';

export default function TestimoniesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // API Data State
  const [testimonies, setTestimonies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formBody, setFormBody] = useState('');

  // Debounce the search input (waits 500ms after user stops typing)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Testimonies on Mount and whenever the debounced search changes
  useEffect(() => {
    const fetchTestimonies = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/testimonies?search=${encodeURIComponent(debouncedSearch)}`);
        if (res.ok) {
          const data = await res.json();
          setTestimonies(data.testimonies || []);
        }
      } catch (error) {
        console.error('Error fetching testimonies:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestimonies();
  }, [debouncedSearch]);

  const handleAddClick = () => {
    setEditingId(null);
    setFormTitle('');
    setFormAuthor('');
    setFormBody('');
    setIsFormModalOpen(true);
  };

  const handleEditClick = (testimony: any) => {
    setEditingId(testimony._id);
    setFormTitle(testimony.title);
    setFormAuthor(testimony.author === 'Anonymous' ? '' : testimony.author);
    setFormBody(testimony.body);
    setIsFormModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimony? It will be removed from the mobile app immediately.')) return;

    try {
      const res = await fetch(`/api/admin/testimonies/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTestimonies(testimonies.filter(t => t._id !== id));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete testimony.');
      }
    } catch (error) {
      console.error(error);
      alert('Network error deleting testimony.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      title: formTitle,
      author: formAuthor.trim() || 'Anonymous',
      body: formBody
    };

    try {
      if (editingId) {
        // Update existing (PATCH)
        const res = await fetch(`/api/admin/testimonies/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok) {
          setTestimonies(testimonies.map(t => t._id === editingId ? data.testimony : t));
          setIsFormModalOpen(false);
        } else {
          alert(data.message || 'Failed to update testimony.');
        }
      } else {
        // Create new (POST)
        const res = await fetch('/api/admin/testimonies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok) {
          // Add to the front of the list, unless there's an active search filter that might exclude it
          if (!debouncedSearch) {
            setTestimonies([data.testimony, ...testimonies]);
          } else {
            // Force a refetch to ensure accurate display
            setDebouncedSearch('');
            setSearchQuery('');
          }
          setIsFormModalOpen(false);
        } else {
          alert(data.message || 'Failed to publish testimony.');
        }
      }
    } catch (error) {
      console.error(error);
      alert('Network error saving testimony.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to format date nicely
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Published Testimonies</h1>
          <p className="text-sm text-gray-500">Manually add and manage testimonies shared by church members.</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="bg-[#3a3e98] hover:bg-[#2a2d75] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-md transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Testimony
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Search Toolbar */}
        <div className="border-b border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search testimonies by title, author, or keyword..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#3a3e98] focus:border-[#3a3e98] text-gray-900 bg-white"
            />
          </div>
          <div className="text-sm text-[#3a3e98] font-bold">
            {testimonies.length} Result{testimonies.length !== 1 && 's'}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#3a3e98] text-white">
              <tr>
                <th className="px-6 py-3 font-bold uppercase tracking-wider text-xs">Author & Date</th>
                <th className="px-6 py-3 font-bold uppercase tracking-wider text-xs">Testimony Content</th>
                <th className="px-6 py-3 font-bold uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#3a3e98]" />
                  </td>
                </tr>
              ) : testimonies.length > 0 ? (
                testimonies.map((item) => (
                  <tr key={item._id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap align-top pt-5">
                      <p className="font-bold text-gray-900">{item.author}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(item.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4 max-w-xl">
                      <p className="font-bold text-[#3a3e98] mb-1">{item.title}</p>
                      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{item.body}</p>
                    </td>
                    <td className="px-6 py-4 text-right align-top pt-5 whitespace-nowrap">
                      <button 
                        onClick={() => handleEditClick(item)}
                        className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-[#3a3e98] hover:bg-indigo-50 rounded-lg transition-colors mr-2"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item._id)}
                        className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-[#f0303b] hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center">
                    <MessageSquareQuote className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-gray-900 mb-1">No testimonies found</h3>
                    <p className="text-gray-500 text-sm">
                      {debouncedSearch ? "No testimonies match your search query." : "You haven't published any testimonies yet."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------- ADD / EDIT MODAL ----------------- */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-[#3a3e98]">
                {editingId ? 'Edit Testimony' : 'Publish New Testimony'}
              </h2>
              <button onClick={() => setIsFormModalOpen(false)} className="text-gray-400 hover:text-[#f0303b] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Author Display Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Bro. Victor (Leave blank for Anonymous)"
                    value={formAuthor} 
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#3a3e98] focus:border-[#3a3e98] text-gray-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Title</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. God's Faithfulness"
                    value={formTitle} 
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#3a3e98] focus:border-[#3a3e98] text-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 flex justify-between">
                  <span>Testimony Body</span>
                  <span className="text-xs text-gray-400 font-medium">This will be visible on the mobile app</span>
                </label>
                <textarea 
                  required 
                  rows={6} 
                  placeholder="Type the testimony here..."
                  value={formBody} 
                  onChange={(e) => setFormBody(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-[#3a3e98] focus:border-[#3a3e98] text-gray-900 leading-relaxed resize-y"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsFormModalOpen(false)} 
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-[#3a3e98] text-white rounded-lg text-sm font-bold hover:bg-[#2a2d75] transition-all flex items-center shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} 
                  {isSubmitting ? 'Saving...' : (editingId ? 'Update Testimony' : 'Publish to App')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}