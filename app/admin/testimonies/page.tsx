'use client';

import React, { useState } from 'react';
import { 
  MessageSquareQuote, 
  Plus, 
  Search, 
  X,
  Edit3,
  Trash2,
  Save
} from 'lucide-react';

export default function TestimoniesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formBody, setFormBody] = useState('');

  // Mock Data (All published)
  const [testimonies, setTestimonies] = useState([
    { 
      id: 1, 
      title: 'Healing for my Mother', 
      author: 'David O.', 
      body: 'I want to thank God for healing my mother after a long illness. The doctors said it would take months, but she was back on her feet in two weeks! Praise God.', 
      date: 'Sept 18, 2026'
    },
    { 
      id: 2, 
      title: 'Safe Travels', 
      author: 'Anonymous', 
      body: 'Thank God for journey mercies during my trip to Abuja.', 
      date: 'Sept 15, 2026'
    },
    { 
      id: 3, 
      title: 'Financial Breakthrough', 
      author: 'Sarah M.', 
      body: 'After joining the prayer chain last month, I received a job offer that doubled my previous salary. God is truly faithful to His word!', 
      date: 'Sept 10, 2026'
    }
  ]);

  // Filter based on search query
  const filteredTestimonies = testimonies.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open Add Modal
  const handleAddClick = () => {
    setEditingId(null);
    setFormTitle('');
    setFormAuthor('');
    setFormBody('');
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleEditClick = (testimony: any) => {
    setEditingId(testimony.id);
    setFormTitle(testimony.title);
    setFormAuthor(testimony.author);
    setFormBody(testimony.body);
    setIsFormModalOpen(true);
  };

  // Delete Testimony
  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this testimony? It will be removed from the mobile app immediately.')) {
      setTestimonies(testimonies.filter(t => t.id !== id));
    }
  };

  // Save (Create or Update)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      // Update existing
      setTestimonies(testimonies.map(t => 
        t.id === editingId 
          ? { ...t, title: formTitle, author: formAuthor || 'Anonymous', body: formBody }
          : t
      ));
    } else {
      // Create new
      const newTestimony = {
        id: Date.now(),
        title: formTitle,
        author: formAuthor || 'Anonymous',
        body: formBody,
        // Format today's date (e.g., Sept 21, 2026)
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      setTestimonies([newTestimony, ...testimonies]);
    }
    
    setIsFormModalOpen(false);
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
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
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
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            />
          </div>
          <div className="text-sm text-gray-500 font-medium">
            {filteredTestimonies.length} Published
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs">Author & Date</th>
                <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs">Testimony Content</th>
                <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredTestimonies.length > 0 ? (
                filteredTestimonies.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap align-top pt-5">
                      <p className="font-bold text-gray-900">{item.author}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                    </td>
                    <td className="px-6 py-4 max-w-xl">
                      <p className="font-bold text-gray-900 mb-1">{item.title}</p>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.body}</p>
                    </td>
                    <td className="px-6 py-4 text-right align-top pt-5 whitespace-nowrap">
                      <button 
                        onClick={() => handleEditClick(item)}
                        className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mr-2"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                    <p className="text-gray-500 text-sm">You haven't published any testimonies yet, or none match your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------- ADD / EDIT MODAL ----------------- */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'Edit Testimony' : 'Publish New Testimony'}
              </h2>
              <button onClick={() => setIsFormModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Author Display Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Bro. Victor (Leave blank for Anonymous)"
                    value={formAuthor} 
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. God's Faithfulness"
                    value={formTitle} 
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex justify-between">
                  <span>Testimony Body</span>
                  <span className="text-xs text-gray-400 font-normal">This will be visible on the mobile app</span>
                </label>
                <textarea 
                  required 
                  rows={6} 
                  placeholder="Type the testimony here..."
                  value={formBody} 
                  onChange={(e) => setFormBody(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 leading-relaxed resize-y"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsFormModalOpen(false)} 
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" /> 
                  {editingId ? 'Update Testimony' : 'Publish to App'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}