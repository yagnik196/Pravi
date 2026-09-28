import React, { useState } from 'react';
import {
  Shield,
  MapPin,
  Search,
  ChevronRight,
  TrendingDown,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Building2,
  Activity,
  Filter
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function StateDashboardView({
  projects = [],
  stats,
  hierarchy,
  onSelectProject,
  onOpenChangeRequest
}) {
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedHealth, setSelectedHealth] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter((p) => {
    if (selectedDistrict !== 'All' && p.district !== selectedDistrict) return false;
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (selectedHealth !== 'All' && p.health_status !== selectedHealth) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        (p.contractor && p.contractor.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const infraStats = stats?.infrastructure || {};
  const issueStats = stats?.issues || {};
  const maintStats = stats?.maintenance || {};
  const agingStats = issueStats.aging || { '0–2 days': 1, '3–7 days': 1, '8–30 days': 0, '30+ days': 0 };
  const districtComparison = stats?.district_comparison || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded bg-purple-50 text-purple-700 border border-purple-200">
                <Shield className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-700">
                State Level Authority • Gujarat R&B Department
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Macro Infrastructure Oversight & Surveillance
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Cross-district asset monitoring, real-time quality surveillance, exception tracking, and performance analytics.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-center">
              <span className="text-slate-500 text-[10px] uppercase block font-semibold">Total Portfolio</span>
              <span className="text-lg font-bold text-slate-900">₹{infraStats.total_cost_cr || 512.7} Cr</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-center">
              <span className="text-slate-500 text-[10px] uppercase block font-semibold">Average Quality</span>
              <span className="text-lg font-bold text-blue-700">{infraStats.average_quality_score || 68.3} / 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row (P1.8 State Analytics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">Total Assets</span>
          <span className="text-2xl font-extrabold font-mono text-slate-900 mt-1 block">
            {infraStats.total || projects.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">State-wide portfolio</span>
        </div>

        <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-wider block font-semibold">Healthy Assets</span>
          <span className="text-2xl font-extrabold font-mono text-emerald-700 mt-1 block">
            {infraStats.healthy || 2}
          </span>
          <span className="text-[11px] text-emerald-600 mt-0.5 block">Score ≥ 80 / Optimal</span>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono text-amber-700 uppercase tracking-wider block font-semibold">Warning Assets</span>
          <span className="text-2xl font-extrabold font-mono text-amber-700 mt-1 block">
            {infraStats.warning || 2}
          </span>
          <span className="text-[11px] text-amber-600 mt-0.5 block">Minor deterioration</span>
        </div>

        <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono text-rose-700 uppercase tracking-wider block font-semibold">Critical Assets</span>
          <span className="text-2xl font-extrabold font-mono text-rose-700 mt-1 block">
            {infraStats.critical || 2}
          </span>
          <span className="text-[11px] text-rose-600 mt-0.5 block">Immediate action</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono text-purple-700 uppercase tracking-wider block font-semibold">Open Issues</span>
          <span className="text-2xl font-extrabold font-mono text-purple-700 mt-1 block">
            {issueStats.open || 2}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{issueStats.critical || 1} Critical severity</span>
        </div>

        <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono text-blue-700 uppercase tracking-wider block font-semibold">Active Maintenance</span>
          <span className="text-2xl font-extrabold font-mono text-blue-700 mt-1 block">
            {maintStats.active || 2}
          </span>
          <span className="text-[11px] text-blue-600 mt-0.5 block">Repair crews mobilized</span>
        </div>
      </div>

      {/* P1.16 Issue Aging Row */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Issue Aging Surveillance (Unresolved Duration)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Operational visibility to prevent unattended deterioration
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600 font-medium">0–2 days (Fresh)</span>
            <span className="font-mono font-bold text-blue-700 text-sm">{agingStats['0–2 days']}</span>
          </div>
          <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 flex items-center justify-between">
            <span className="text-amber-800 font-medium">3–7 days (Aging)</span>
            <span className="font-mono font-bold text-amber-700 text-sm">{agingStats['3–7 days']}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600 font-medium">8–30 days</span>
            <span className="font-mono font-bold text-slate-700 text-sm">{agingStats['8–30 days']}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600 font-medium">30+ days (Overdue)</span>
            <span className="font-mono font-bold text-rose-700 text-sm">{agingStats['30+ days']}</span>
          </div>
        </div>
      </div>

      {/* P1.8 District Comparison Table */}
      {districtComparison.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Cross-District Operational Comparison
              </h3>
              <p className="text-xs text-slate-500">
                Transparent metric comparison across Gujarat jurisdictions without arbitrary scores
              </p>
            </div>
            {selectedDistrict !== 'All' && (
              <button
                onClick={() => setSelectedDistrict('All')}
                className="text-xs font-semibold text-blue-700 hover:underline"
              >
                Reset Filter (Show All)
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80">
                  <th className="py-2.5 px-3">District</th>
                  <th className="py-2.5 px-3 text-center">Assets</th>
                  <th className="py-2.5 px-3 text-center">Open Issues</th>
                  <th className="py-2.5 px-3 text-center">Critical</th>
                  <th className="py-2.5 px-3 text-center">Active Maintenance</th>
                  <th className="py-2.5 px-3 text-center">Completed Audits</th>
                  <th className="py-2.5 px-3 text-right">Avg Quality</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {districtComparison.map((d) => {
                  const isSelected = selectedDistrict === d.district;
                  return (
                    <tr
                      key={d.district}
                      className={`hover:bg-blue-50/50 transition cursor-pointer ${
                        isSelected ? 'bg-blue-50/80 font-bold' : ''
                      }`}
                      onClick={() => setSelectedDistrict(isSelected ? 'All' : d.district)}
                    >
                      <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>{d.district} District</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-semibold">{d.total_assets}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          d.open_issues > 0 ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'text-slate-400'
                        }`}>
                          {d.open_issues}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          d.critical_issues > 0 ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'text-slate-400'
                        }`}>
                          {d.critical_issues}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">{d.active_maintenance}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{d.completed_evaluations}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`font-mono font-bold text-xs ${
                          d.avg_quality_score < 60 ? 'text-rose-700' :
                          d.avg_quality_score < 80 ? 'text-amber-700' : 'text-emerald-700'
                        }`}>
                          {d.avg_quality_score} / 100
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="text-blue-700 hover:text-blue-900 font-semibold text-[11px]">
                          {isSelected ? 'Selected' : 'Filter →'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search infrastructure by name, asset ID, or contractor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* District Filter */}
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700 bg-white"
          >
            <option value="All">All Districts</option>
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Surat">Surat</option>
            <option value="Rajkot">Rajkot</option>
            <option value="Vadodara">Vadodara</option>
            <option value="Gandhinagar">Gandhinagar</option>
            <option value="Bharuch">Bharuch</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700 bg-white"
          >
            <option value="All">All Categories</option>
            <option value="Road">Roads</option>
            <option value="Bridge">Bridges</option>
            <option value="Building">Buildings</option>
          </select>

          {/* Health Filter */}
          <select
            value={selectedHealth}
            onChange={(e) => setSelectedHealth(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700 bg-white"
          >
            <option value="All">All Health Statuses</option>
            <option value="Healthy">Healthy (≥ 80)</option>
            <option value="Warning">Warning (60–79)</option>
            <option value="Critical">Critical (&lt; 60)</option>
          </select>

          <span className="text-xs font-mono font-bold text-slate-500 px-2">
            {filteredProjects.length} Assets
          </span>
        </div>
      </div>

      {/* Infrastructure Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white border border-slate-200 rounded-xl">
            No infrastructure assets matched the selected filters.
          </div>
        ) : (
          filteredProjects.map((p) => {
            const qScore = p.quality_score || 70;
            const isCritical = p.health_status === 'Critical' || qScore < 60;
            const isWarning = p.health_status === 'Warning' || (qScore >= 60 && qScore < 80);

            return (
              <div
                key={p.id}
                onClick={() => onSelectProject(p.id)}
                className="bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md rounded-2xl p-5 cursor-pointer transition flex flex-col justify-between group"
              >
                <div>
                  {/* Top line badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {p.id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        isCritical ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        isWarning ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {p.health_status || (isCritical ? 'Critical' : isWarning ? 'Warning' : 'Healthy')}
                      </span>
                      <StatusBadge status={p.lifecycle_status || p.status || 'Active'} />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition leading-snug">
                    {p.name}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{p.district} District • {p.region}</span>
                  </p>

                  {/* Quality Gauge & Metric snippet */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">Infrastructure Quality:</span>
                      <span className={`font-mono font-bold ${
                        isCritical ? 'text-rose-700' : isWarning ? 'text-amber-700' : 'text-emerald-700'
                      }`}>
                        {qScore} / 100
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isCritical ? 'bg-rose-600' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, qScore)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block font-semibold">Budget</span>
                    <span className="font-bold text-slate-800">₹{p.estimated_cost_cr} Cr</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block font-semibold">Category</span>
                    <span className="font-semibold text-slate-700">{p.category}</span>
                  </div>
                  <span className="text-blue-700 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 text-[11px]">
                    Inspect Asset →
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
