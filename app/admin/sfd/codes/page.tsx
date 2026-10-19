'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle2, XCircle, Printer, KeyRound, Filter, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AccessCodesPage() {
  // --- API DATA STATES ---
  const [editions, setEditions] = useState<any[]>([]);
  const [codes, setCodes] = useState<any[]>([]);
  
  // New States for Server-Side Stats & Pagination
  const [stats, setStats] = useState({ total: 0, used: 0, unused: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [isLoadingEditions, setIsLoadingEditions] = useState(true);
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);

  // --- GENERATOR FORM STATE ---
  const [selectedEditionId, setSelectedEditionId] = useState('');
  const [generateCount, setGenerateCount] = useState('25');
  const [expirationDate, setExpirationDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // --- FILTER & SEARCH STATE ---
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Debounce the search input (waits 500ms after user stops typing before setting state)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset page to 1 if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, selectedEditionId]);

  // 1. Fetch Editions on mount
  useEffect(() => {
    const fetchEditions = async () => {
      try {
        const res = await fetch('/api/admin/sfd/editions');
        if (res.ok) {
          const data = await res.json();
          setEditions(data.editions || []);
          if (data.editions?.length > 0) setSelectedEditionId(data.editions[0]._id);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingEditions(false);
      }
    };
    fetchEditions();
  }, []);

  // 2. Fetch Codes from Server (Triggered by Edition, Search, Status, or Page changes)
  useEffect(() => {
    if (!selectedEditionId) return;

    const fetchCodes = async () => {
      setIsLoadingCodes(true);
      try {
        const queryParams = new URLSearchParams({
          editionId: selectedEditionId,
          search: debouncedSearch,
          status: statusFilter,
          page: currentPage.toString(),
          limit: '50' // Load 50 per page
        });

        const res = await fetch(`/api/admin/sfd/codes?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setCodes(data.codes || []);
          setStats(data.stats);
          setTotalPages(data.pagination.totalPages || 1);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingCodes(false);
      }
    };
    fetchCodes();
  }, [selectedEditionId, debouncedSearch, statusFilter, currentPage]);

  // 3. Generate Codes
  const handleGenerateCodes = async () => {
    if (!selectedEditionId || !expirationDate) return alert('Select an edition and expiration date.');

    setIsGenerating(true);
    try {
      const res = await fetch('/api/admin/sfd/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          editionId: selectedEditionId,
          count: parseInt(generateCount, 10),
          expirationDate
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        // Force a re-fetch of page 1 to show the new codes
        if (currentPage === 1) {
           setDebouncedSearch(''); // trigger refetch
        } else {
           setCurrentPage(1);
        }
      } else {
        alert(data.message || 'Failed to generate codes.');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (isLoadingEditions) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 text-[#3a3e98] animate-spin" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SFD Access Codes</h1>
          <p className="text-sm text-gray-500">Generate and track one-time codes for devotional access.</p>
        </div>
      </div>

      {/* Stats Cards (Now driven by DB stats, unaffected by search filters) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Generated</p>
            <p className="text-2xl font-bold text-[#3a3e98] mt-1">{stats.total}</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-[#3a3e98]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Used (Claimed)</p>
            <p className="text-2xl font-bold text-[#f0303b] mt-1">{stats.used}</p>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
            <XCircle className="w-6 h-6 text-[#f0303b]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Unused (Available)</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{stats.unused}</p>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Generator Card */}
      <div className="bg-white p-6 rounded-xl border text-black border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-[#3a3e98] mb-4">Generate New Codes</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700">SFD Edition</label>
            <select value={selectedEditionId} onChange={(e) => setSelectedEditionId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-[#3a3e98] focus:border-[#3a3e98]">
              {editions.map(ed => <option key={ed._id} value={ed._id}>{ed.title}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700">Quantity</label>
            <select value={generateCount} onChange={(e) => setGenerateCount(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-[#3a3e98] focus:border-[#3a3e98]">
              <option value="10">10 Codes</option><option value="50">50 Codes</option><option value="100">100 Codes</option><option value="500">500 Codes</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700">Expiration Date</label>
            <input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-[#3a3e98] focus:border-[#3a3e98]" />
          </div>
          <button onClick={handleGenerateCodes} disabled={isGenerating || !selectedEditionId} className="bg-[#3a3e98] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center disabled:opacity-50">
            {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />} Generate Codes
          </button>
        </div>
      </div>

      {/* Codes Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search - Filters from DB directly! */}
            <div className="relative w-full sm:w-72 text-black">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by Code..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#3a3e98]"
              />
            </div>
            
            <div className="relative w-full sm:w-40 text-black">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#3a3e98]">
                <option value="All">All Status</option><option value="Unused">Unused</option><option value="Used">Used</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left ">
            <thead className="bg-[#3a3e98] text-white">
              <tr>
                <th className="px-6 py-3.5 font-bold">Access Code</th>
                <th className="px-6 py-3.5 font-bold">Status</th>
                <th className="px-6 py-3.5 font-bold">Used By</th>
                <th className="px-6 py-3.5 font-bold">Generated Date</th>
                <th className="px-6 py-3.5 font-bold">Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y text-black divide-gray-200 bg-white">
              {isLoadingCodes ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#3a3e98]" /></td></tr>
              ) : codes.length > 0 ? (
                codes.map((item) => (
                  <tr key={item._id} className="hover:bg-indigo-50/30">
                    <td className="px-6 py-4 font-mono font-bold text-[#3a3e98] text-base">{item.code}</td>
                    <td className="px-6 py-4">
                      {item.isUsed 
                        ? <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-[#f0303b]"><XCircle className="w-3.5 h-3.5 mr-1.5" /> Used</span>
                        : <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Unused</span>
                      }
                    </td>
                    <td className="px-6 py-4">{item.usedBy ? (item.usedBy.name || item.usedBy.email) : '-'}</td>
                    <td className="px-6 py-4">{formatDate(item.createdAt)}</td>
                    <td className="px-6 py-4">{formatDate(item.expiredAt)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No codes found.</td></tr>
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
              disabled={currentPage === 1 || isLoadingCodes}
              className="p-2 rounded-lg text-black border border-gray-300 bg-white disabled:opacity-50 hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0 || isLoadingCodes}
              className="p-2 rounded-lg text-black border border-gray-300 bg-white disabled:opacity-50 hover:bg-gray-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}