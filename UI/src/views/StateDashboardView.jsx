import React, { useState } from 'react';
import {
  Shield,
  MapPin,
  Search,
  ChevronRight
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function StateDashboardView({
  projects = [],
  stats,
  hierarchy,
  onSelectProject
}) {
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedWorkType, setSelectedWorkType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter((p) => {
    if (selectedRegion !== 'All' && p.region !== selectedRegion) return false;
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (selectedWorkType !== 'All' && p.work_type !== selectedWorkType) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.contractor.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded bg-purple-50 text-purple-700 border border-purple-200">
                <Shield className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-700">
                State Level Authority • Gujarat R&B
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Macro Infrastructure Oversight Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Cross-district monitoring, SLA compliance tracking, exception surveillance, and strategic governance.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center">
              <span className="text-slate-500 text-[10px] uppercase block font-semibold">Total Portfolio</span>
              <span className="text-lg font-bold text-emerald-700">₹{stats?.projects?.total_cost_cr || 512.7} Cr</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center">
              <span className="text-slate-500 text-[10px] uppercase block font-semibold">Delayed Assets</span>
              <span className="text-lg font-bold text-amber-700">{stats?.projects?.delayed || 2}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">Total Projects</span>
          <span className="text-2xl font-extrabold font-mono text-slate-900 mt-1 block">
            {stats?.projects?.total || projects.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">State wide assets</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono text-blue-700 uppercase tracking-wider block font-semibold">Development</span>
          <span className="text-2xl font-extrabold font-mono text-blue-700 mt-1 block">
            {stats?.projects?.development || 3}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Active construction</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono text-teal-700 uppercase tracking-wider block font-semibold">Maintenance</span>
          <span className="text-2xl font-extrabold font-mono text-teal-700 mt-1 block">
            {stats?.projects?.maintenance || 3}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Periodic lifecycle</span>
        </div>

        <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono text-rose-700 uppercase tracking-wider block font-semibold">Critical Issues</span>
          <span className="text-2xl font-extrabold font-mono text-rose-700 mt-1 block">
            {stats?.issues?.critical || 2}
          </span>
          <span className="text-[11px] text-rose-600/80 mt-0.5 block">Breached rules</span>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono text-amber-700 uppercase tracking-wider block font-semibold">Pending Audits</span>
          <span className="text-2xl font-extrabold font-mono text-amber-700 mt-1 block">
            {stats?.evaluations?.pending || 2}
          </span>
          <span className="text-[11px] text-amber-600/80 mt-0.5 block">Awaiting field data</span>
        </div>

        <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-wider block font-semibold">Active Tenders</span>
          <span className="text-2xl font-extrabold font-mono text-emerald-700 mt-1 block">
            {stats?.tenders?.total || 4}
          </span>
          <span className="text-[11px] text-emerald-600/80 mt-0.5 block">Contracting phase</span>
        </div>
      </div>

      {/* Regional Grouping Row (Context.md Section 3 & 26: Region is NOT an authority) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-700" />
              Regional Grouping Hierarchy
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Notice: Regions are geographic grouping containers for navigation & visualization. Project ownership is held by the District.
            </p>
          </div>
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            {hierarchy?.regions?.length || 4} Regions Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {hierarchy?.regions?.map((reg) => {
            const count = projects.filter((p) => p.region === reg.region).length;
            const isSelected = selectedRegion === reg.region;
            return (
              <button
                key={reg.region}
                type="button"
                onClick={() => setSelectedRegion(isSelected ? 'All' : reg.region)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-purple-50 border-purple-300 shadow-sm'
                    : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{reg.region}</h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-purple-800 font-bold border border-slate-200">
                    {count} Assets
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  Districts: {reg.districts?.join(', ')}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Projects Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Department Projects ({filteredProjects.length})
            </h3>
            {selectedRegion !== 'All' && (
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                Filtered: {selectedRegion}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search project, contractor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700"
            >
              <option value="All">All Categories</option>
              <option value="Road">Road</option>
              <option value="Bridge">Bridge</option>
              <option value="Building">Building</option>
            </select>

            <select
              value={selectedWorkType}
              onChange={(e) => setSelectedWorkType(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700"
            >
              <option value="All">All Work Types</option>
              <option value="Development">Development</option>
              <option value="Maintenance">Maintenance</option>
            </select>

            {(selectedRegion !== 'All' || selectedCategory !== 'All' || selectedWorkType !== 'All' || searchTerm) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedRegion('All');
                  setSelectedCategory('All');
                  setSelectedWorkType('All');
                  setSearchTerm('');
                }}
                className="text-xs text-blue-700 hover:underline px-1 font-semibold"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Projects Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-mono uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Project / ID</th>
                <th className="py-2.5 px-3">District (Owner)</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Stage</th>
                <th className="py-2.5 px-3">Cost (₹ Cr)</th>
                <th className="py-2.5 px-3">Progress</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredProjects.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => onSelectProject(p.id)}
                  className="hover:bg-slate-50 transition cursor-pointer group"
                >
                  <td className="py-3 px-3">
                    <span className="font-mono text-[11px] text-slate-500 font-semibold block">{p.id}</span>
                    <span className="font-bold text-slate-900 group-hover:text-blue-700 transition">
                      {p.name}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate max-w-xs">
                      Contractor: {p.contractor}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-slate-900 font-semibold">{p.district}</span>
                    <span className="text-[10px] text-slate-500 block">{p.region}</span>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={p.category} />
                    <span className="text-[10px] text-slate-500 block mt-0.5">{p.work_type}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {p.current_stage}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                    ₹{p.estimated_cost_cr}
                  </td>
                  <td className="py-3 px-3">
                    <div className="w-28 space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-600">
                        <span>Progress</span>
                        <span>{p.progress_percent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${p.progress_percent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-700 transition text-[11px] font-semibold">
                      <span>View</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
