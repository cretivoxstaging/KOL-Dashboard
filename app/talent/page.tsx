"use client";
import React, { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { TALENT_DATA } from '../dashboard/data';

export default function TalentDatabasePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Logika Filter
  const filteredTalent = TALENT_DATA.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'All' || t.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="flex h-screen bg-[#F0F4F8]">
      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-8 text-[#1B3A5B]">Talent Management</h2>

        {/* Toolbar: Search & Action */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4 w-2/3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search for Talent...." 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none font-medium text-slate-600"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">Category: All</option>
              <option value="Content 1">Content 1</option>
              <option value="Content 2">Content 2</option>
              <option value="Content 3">Content 3</option>
            </select>
          </div>

          <button className="flex items-center gap-2 bg-[#1B3A5B] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#162e49] transition-all shadow-md">
            <Plus size={18} /> Add Talent
          </button>
        </div>

        {/* Tabel Talent */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-slate-700">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">#</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Talent Name</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Tier</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTalent.map((talent, index) => (
                <tr key={talent.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-400 font-bold text-xs">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200 uppercase">
                        {talent.name[0]}
                      </div>
                      <span className="font-bold text-slate-700">{talent.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm font-medium">{talent.category}</td>
                  
                  {/* Kolom Tier (Ganti Engagement Rate) */}
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-extrabold uppercase tracking-tight border border-blue-100">
                      {talent.tier}
                    </span>
                  </td>

                  {/* Kolom Status */}
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-tight ${
                      talent.status === 'Active' ? 'bg-green-50 text-green-600 border border-green-100' : 
                      talent.status === 'Pending' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                      'bg-slate-50 text-slate-400 border border-slate-100'
                    }`}>
                      {talent.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredTalent.length === 0 && (
            <div className="p-12 text-center text-slate-400 italic text-sm">No talent found in this category...</div>
          )}
        </div>
      </main>
    </div>
  );
}