import React, { useState } from 'react';
import {
  Users,
  Search,
  MapPin,
  CheckCircle2,
  Calendar,
  Building,
  Info,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function CitizenPortalView({
  projects = [],
  onSelectProject
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filtered = projects.filter((p) => {
    if (selectedDistrict !== 'All' && p.district !== selectedDistrict) return false;
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Users className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
                Public Transparency Portal • Gujarat Roads & Buildings
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Citizen Infrastructure Progress & Safety Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Verified public condition records, ongoing road resurfacing, bridge structural safety audits, and project delivery schedules.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs max-w-xs text-emerald-900">
            <span className="font-bold flex items-center gap-1.5 mb-0.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Public Quality Guarantee
            </span>
            Condition ratings, verified progress percentages, and public safety advisories published directly from certified engineering audits.
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search road, bridge, location, or district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
          >
            <option value="All">All Gujarat Districts</option>
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Surat">Surat</option>
            <option value="Vadodara">Vadodara</option>
            <option value="Rajkot">Rajkot</option>
            <option value="Gandhinagar">Gandhinagar</option>
            <option value="Bharuch">Bharuch</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
          >
            <option value="All">All Asset Types</option>
            <option value="Road">Roads & Expressways</option>
            <option value="Bridge">Bridges & Flyovers</option>
            <option value="Building">Public Buildings</option>
          </select>

          <span className="text-xs font-mono font-bold text-slate-500 px-1">
            {filtered.length} Public Records
          </span>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p) => {
          const qScore = p.quality_score || 70;
          return (
            <div
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              className="bg-white border border-slate-200 hover:border-emerald-400 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {p.district} District
                  </span>
                  <StatusBadge status={p.lifecycle_status || p.status || 'Active'} />
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition leading-snug">
                  {p.name}
                </h3>

                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{p.location}</span>
                </p>

                {/* Public Condition Box */}
                {p.public_condition && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-0.5">
                      Current Public Condition
                    </span>
                    <p className="text-slate-700 leading-relaxed font-medium">{p.public_condition}</p>
                  </div>
                )}

                {/* Progress bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Physical Progress</span>
                    <span className="font-mono font-bold text-slate-900">{p.progress_percent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all"
                      style={{ width: `${p.progress_percent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block font-semibold">Sanctioned Cost</span>
                  <span className="font-mono font-bold text-slate-900">₹{p.estimated_cost_cr} Cr</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block font-semibold">Target Completion</span>
                  <span className="font-mono text-slate-700">{p.expected_completion}</span>
                </div>
                <span className="text-emerald-700 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 text-[11px]">
                  View Details →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
