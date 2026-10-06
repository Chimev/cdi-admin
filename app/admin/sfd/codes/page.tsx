'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Search, CheckCircle2, XCircle, Printer, KeyRound, Filter } from 'lucide-react';

export default function AccessCodesPage() {
  // Mock Data for the UI
  const [codes, setCodes] = useState([
    { id: 1, code: 'A7X9WQ', edition: 'Sept – Oct 2026', status: 'Used', usedBy: 'John Doe', generated: 'Sept 1, 2026', expiry: 'Oct 31, 2026' },
    { id: 2, code: 'M4P2LZ', edition: 'Sept – Oct 2026', status: 'Unused', usedBy: '-', generated: 'Sept 10, 2026', expiry: 'Oct 31, 2026' },
    { id: 3, code: 'X9R1BC', edition: 'Sept – Oct 2026', status: 'Unused', usedBy: '-', generated: 'Sept 10, 2026', expiry: 'Oct 31, 2026' },
    { id: 4, code: 'Q2W8NK', edition: 'Sept – Oct 2026', status: 'Used', usedBy: 'Jane Smith', generated: 'Sept 2, 2026', expiry: 'Oct 31, 2026' },
    { id: 5, code: 'V5T7YJ', edition: 'Sept – Oct 2026', status: 'Unused', usedBy: '-', generated: 'Sept 12, 2026', expiry: 'Oct 31, 2026' },
  ]);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Used', 'Unused'

  // Calculate Stats Dynamically
  const totalCodes = codes.length;
  const usedCodes = codes.filter(c => c.status === 'Used').length;
  const unusedCodes = codes.filter(c => c.status === 'Unused').length;

  // Filter Logic
  const filteredCodes = useMemo(() => {
    return codes.filter(item => {
      const matchesSearch = 
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.usedBy.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [codes, searchQuery, statusFilter]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SFD Access Codes</h1>
          <p className="text-sm text-gray-500">Generate and track one-time codes for members who pay at the church.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Generated</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalCodes}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Used (Claimed)</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{usedCodes}</p>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Unused (Available)</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{unusedCodes}</p>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Generator Card */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate New Codes</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">SFD Edition</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900">
              <option>September – October 2026</option>
              <option>November – December 2026</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Quantity</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900">
              <option>10 Codes</option>
              <option>25 Codes</option>
              <option>50 Codes</option>
              <option>100 Codes</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Expiry</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900">
              <option>30 Days</option>
              <option>60 Days</option>
              <option>End of Edition</option>
            </select>
          </div>

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Generate
          </button>
        </div>
      </div>

      {/* Codes Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Table Toolbar (Search & Filter) */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by code or user..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
            
            {/* Status Filter */}
            <div className="relative w-full sm:w-40">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 appearance-none"
              >
                <option value="All">All Status</option>
                <option value="Unused">Unused</option>
                <option value="Used">Used</option>
              </select>
            </div>
          </div>

          <button className="text-gray-600 hover:text-gray-900 flex items-center text-sm font-medium px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors w-full sm:w-auto justify-center">
            <Printer className="w-4 h-4 mr-2" />
            Print Unused
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium">Access Code</th>
                <th className="px-6 py-3 font-medium">Edition</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Used By</th>
                <th className="px-6 py-3 font-medium">Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredCodes.length > 0 ? (
                filteredCodes.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900 tracking-wider">
                      {item.code}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.edition}</td>
                    <td className="px-6 py-4">
                      {item.status === 'Used' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          <XCircle className="w-3 h-3 mr-1" /> Used
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Unused
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-900">{item.usedBy}</td>
                    <td className="px-6 py-4 text-gray-500">{item.expiry}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No codes found matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}