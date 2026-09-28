import React, { useState } from 'react';
import {
  Building2,
  PlusCircle,
  AlertTriangle,
  ClipboardList,
  ChevronRight
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function DistrictDashboardView({
  districtName = 'Ahmedabad',
  projects = [],
  issues = [],
  evaluations = [],
  onSelectProject,
  onOpenNewProject,
  onOpenEvaluation,
  onSelectIssue
}) {
  const [activeFilter, setActiveFilter] = useState('owned'); // 'owned' | 'all'

  const ownedProjects = projects.filter((p) => p.district === districtName);
  const peerProjects = projects.filter((p) => p.district !== districtName);
  const displayedProjects = activeFilter === 'owned' ? ownedProjects : projects;

  const districtIssues = issues.filter(
    (i) => i.district === districtName && i.status !== 'RESOLVED'
  );
  const districtPendingEvals = evaluations.filter(
    (e) => e.district === districtName && e.status === 'assigned'
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                <Building2 className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700">
                {districtName} District Circle Administration
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              District Engineering Operations Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Project ownership, contract SLA enforcement, field evaluation reviews, and exception resolution workflows.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenNewProject}
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register New Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block font-semibold">
            Owned Assets
          </span>
          <span className="text-2xl font-extrabold font-mono text-blue-700 mt-1 block">
            {ownedProjects.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Full Read/Write authority</span>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-mono text-amber-700 uppercase tracking-wider block font-semibold">
            Pending Audits
          </span>
          <span className="text-2xl font-extrabold font-mono text-amber-700 mt-1 block">
            {districtPendingEvals.length}
          </span>
          <span className="text-[11px] text-amber-600/80 mt-0.5 block">Assigned field tasks</span>
        </div>

        <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-mono text-rose-700 uppercase tracking-wider block font-semibold">
            Active Issues
          </span>
          <span className="text-2xl font-extrabold font-mono text-rose-700 mt-1 block">
            {districtIssues.length}
          </span>
          <span className="text-[11px] text-rose-600/80 mt-0.5 block">Operational timeline active</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block font-semibold">
            Peer Visibility
          </span>
          <span className="text-2xl font-extrabold font-mono text-slate-800 mt-1 block">
            {peerProjects.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Cross-circle Read-Only</span>
        </div>
      </div>

      {/* Action Center: Pending Issues & Evaluations */}
      {(districtIssues.length > 0 || districtPendingEvals.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Active Issues */}
          <div className="bg-white border border-rose-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Active Operational Exceptions ({districtIssues.length})
              </h3>
              <span className="text-[11px] font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold border border-rose-200">
                Action Required
              </span>
            </div>

            <div className="space-y-2.5">
              {districtIssues.map((iss) => (
                <div
                  key={iss.id}
                  onClick={() => onSelectProject(iss.project_id)}
                  className="bg-slate-50 border border-slate-200 hover:border-rose-300 rounded-lg p-3 text-xs cursor-pointer transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-rose-700 font-bold">{iss.id}</span>
                    <StatusBadge status={iss.status} />
                  </div>
                  <p className="text-slate-900 font-semibold mt-1">{iss.title}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {iss.project_name} • Parameter: {iss.parameter} (<span className="text-rose-700 font-bold">{iss.observed_value}</span>)
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Field Inspections */}
          <div className="bg-white border border-amber-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-amber-600" />
                Pending Field Inspections ({districtPendingEvals.length})
              </h3>
              <span className="text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold border border-amber-200">
                Assigned
              </span>
            </div>

            <div className="space-y-2.5">
              {districtPendingEvals.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => onSelectProject(ev.project_id)}
                  className="bg-slate-50 border border-slate-200 hover:border-amber-300 rounded-lg p-3 text-xs cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono text-amber-700 font-bold">{ev.id}</span>
                    <p className="text-slate-900 font-semibold mt-0.5">{ev.milestone_name}</p>
                    <p className="text-slate-500 text-[11px]">
                      Auditor: {ev.evaluator_name} • Due: {ev.due_date}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Infrastructure Portfolio
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Superintendent & Executive Engineer circle jurisdiction
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setActiveFilter('owned')}
              className={`px-3 py-1 rounded-md transition font-semibold ${
                activeFilter === 'owned'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My District Assets ({ownedProjects.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-md transition font-semibold ${
                activeFilter === 'all'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Peer Assets ({projects.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedProjects.map((p) => {
            const isOwned = p.district === districtName;
            return (
              <div
                key={p.id}
                onClick={() => onSelectProject(p.id)}
                className={`rounded-xl p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                  isOwned
                    ? 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md'
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-semibold border border-slate-200">
                      {p.id}
                    </span>
                    {isOwned ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
                        Owned (R/W)
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        Peer (Read Only)
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
                    {p.name}
                  </h4>

                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {p.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <StatusBadge status={p.category} />
                    <StatusBadge status={p.work_type} />
                    <StatusBadge status={p.status} />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cost</span>
                    <span className="font-mono font-bold text-emerald-700">₹{p.estimated_cost_cr} Cr</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Progress</span>
                    <span className="font-mono font-bold text-blue-700">{p.progress_percent}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
