import React, { useState } from 'react';
import {
  Building2,
  PlusCircle,
  AlertTriangle,
  ClipboardList,
  ChevronRight,
  Wrench,
  Activity,
  Clock,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function DistrictDashboardView({
  districtName = 'Ahmedabad',
  projects = [],
  issues = [],
  evaluations = [],
  maintenance = [],
  onSelectProject,
  onOpenNewProject,
  onOpenEvaluation,
  onSelectIssue,
  onOpenMaintenanceModal
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'issues' | 'maintenance'

  const ownedProjects = projects.filter((p) => p.district === districtName);
  const districtIssues = issues.filter((i) => i.district === districtName);
  const openIssues = districtIssues.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED');
  const districtMaintenance = maintenance.filter((m) => m.district === districtName);

  // Issue aging for district
  const agingCounts = { '0–2 days': 0, '3–7 days': 0, '8–30 days': 0, '30+ days': 0 };
  openIssues.forEach((iss) => {
    const bucket = iss.aging_bucket || (iss.aging_days <= 2 ? '0–2 days' : iss.aging_days <= 7 ? '3–7 days' : '8–30 days');
    if (agingCounts[bucket] !== undefined) agingCounts[bucket]++;
    else agingCounts['0–2 days']++;
  });

  const healthyCount = ownedProjects.filter((p) => (p.quality_score || 70) >= 80).length;
  const criticalCount = ownedProjects.filter((p) => (p.quality_score || 70) < 60 || p.health_status === 'Critical').length;
  const warningCount = ownedProjects.length - healthyCount - criticalCount;

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                <Building2 className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700">
                {districtName} District Circle Administration
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Operational Engineering Command Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Autonomous district asset stewardship, exception lifecycle management, maintenance scheduling, and SLA enforcement.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenNewProject}
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Infrastructure</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row (P1.15 District Operational Visibility) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">
            District Assets
          </span>
          <span className="text-2xl font-extrabold font-mono text-slate-900 mt-1 block">
            {ownedProjects.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{districtName} jurisdiction</span>
        </div>

        <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-wider block font-semibold">
            Healthy Condition
          </span>
          <span className="text-2xl font-extrabold font-mono text-emerald-700 mt-1 block">
            {healthyCount}
          </span>
          <span className="text-[11px] text-emerald-600 mt-0.5 block">Score ≥ 80</span>
        </div>

        <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono text-rose-700 uppercase tracking-wider block font-semibold">
            Critical Assets
          </span>
          <span className="text-2xl font-extrabold font-mono text-rose-700 mt-1 block">
            {criticalCount}
          </span>
          <span className="text-[11px] text-rose-600 mt-0.5 block">Score &lt; 60</span>
        </div>

        <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono text-rose-700 uppercase tracking-wider block font-semibold">
            Open Exceptions
          </span>
          <span className="text-2xl font-extrabold font-mono text-rose-700 mt-1 block">
            {openIssues.length}
          </span>
          <span className="text-[11px] text-rose-600 mt-0.5 block">Active operational timelines</span>
        </div>

        <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono text-blue-700 uppercase tracking-wider block font-semibold">
            Maintenance Jobs
          </span>
          <span className="text-2xl font-extrabold font-mono text-blue-700 mt-1 block">
            {districtMaintenance.length}
          </span>
          <span className="text-[11px] text-blue-600 mt-0.5 block">Contractor repair activities</span>
        </div>

        <div className="bg-white border border-purple-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono text-purple-700 uppercase tracking-wider block font-semibold">
            Avg District Quality
          </span>
          <span className="text-2xl font-extrabold font-mono text-purple-700 mt-1 block">
            {ownedProjects.length > 0
              ? Math.round(ownedProjects.reduce((acc, p) => acc + (p.quality_score || 70), 0) / ownedProjects.length)
              : 0}
          </span>
          <span className="text-[11px] text-purple-600 mt-0.5 block">Target ≥ 75</span>
        </div>
      </div>

      {/* P1.16 District Issue Aging Indicators */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {districtName} Issue Aging Surveillance
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Unresolved exceptions by duration
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600 font-medium">0–2 days</span>
            <span className="font-mono font-bold text-blue-700 text-sm">{agingCounts['0–2 days']}</span>
          </div>
          <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 flex items-center justify-between">
            <span className="text-amber-800 font-medium">3–7 days (Requires Attention)</span>
            <span className="font-mono font-bold text-amber-700 text-sm">{agingCounts['3–7 days']}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600 font-medium">8–30 days</span>
            <span className="font-mono font-bold text-slate-700 text-sm">{agingCounts['8–30 days']}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600 font-medium">30+ days (Critical Overdue)</span>
            <span className="font-mono font-bold text-rose-700 text-sm">{agingCounts['30+ days']}</span>
          </div>
        </div>
      </div>

      {/* Active Operational Exceptions with Explainable Reason (Section 9) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Active Operational Exceptions ({openIssues.length})
            </h3>
            <p className="text-xs text-slate-500">
              Rule-generated infrastructure non-conformances with active resolution workflows
            </p>
          </div>
        </div>

        {openIssues.length === 0 ? (
          <div className="p-6 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-500">
            No active exceptions in {districtName} District. All monitored metrics within tolerances.
          </div>
        ) : (
          <div className="space-y-3">
            {openIssues.map((iss) => (
              <div
                key={iss.id}
                className="bg-white border border-rose-200 rounded-xl p-4 shadow-sm hover:border-blue-400 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                        {iss.id}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{iss.title}</h4>
                      <StatusBadge status={iss.status || 'OPEN'} />
                    </div>

                    <p className="text-xs text-slate-600">
                      Infrastructure: <strong className="text-slate-900">{iss.project_name}</strong> • Aging: <span className="font-mono text-amber-700 font-bold">{iss.aging_days || 3} days</span>
                    </p>

                    {/* Explainable Detection Cause */}
                    <div className="mt-2 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-slate-700">
                      <p>
                        <strong>Why Generated:</strong> <span className="text-rose-700 font-semibold">{iss.detected_metric || iss.parameter}</span> measured at{' '}
                        <strong className="text-rose-700">{iss.detected_value || iss.observed_value}</strong>, breaching rule threshold ({iss.operator || '<'} {iss.threshold_value || 60}).
                      </p>
                      {iss.detection_reason && (
                        <p className="text-[11px] text-slate-600 italic mt-0.5">
                          "{iss.detection_reason}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2 shrink-0">
                    <button
                      onClick={() => onSelectProject(iss.project_id)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                    >
                      <span>Open Resolution Timeline</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    {onOpenMaintenanceModal && (
                      <button
                        onClick={() => onOpenMaintenanceModal(iss)}
                        className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center gap-1"
                      >
                        <Wrench className="w-3 h-3 text-slate-500" />
                        <span>Manage Maintenance</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* District Maintenance Workflows Section */}
      {districtMaintenance.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-600" />
                Active Maintenance Contracts ({districtMaintenance.length})
              </h3>
              <p className="text-xs text-slate-500">
                Scheduled and in-progress remediation work underway by assigned contractors
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {districtMaintenance.map((m) => (
              <div key={m.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-700">{m.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    m.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                    m.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {m.status}
                  </span>
                </div>

                <p className="font-bold text-slate-900">{m.infrastructure_name}</p>
                <p className="text-slate-600 text-[11px] leading-relaxed">{m.description}</p>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Contractor: <strong className="text-slate-800">{m.assigned_party}</strong></span>
                  <span>Budget: <strong className="text-slate-800">₹{m.cost_estimate_cr} Cr</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Owned Infrastructure Assets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            {districtName} Infrastructure Asset Portfolio ({ownedProjects.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ownedProjects.map((p) => {
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
                    <span>{p.location}</span>
                  </p>

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
                    <span className="text-slate-400 text-[10px] uppercase block font-semibold">Contractor</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[120px] block">{p.contractor}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block font-semibold">Budget</span>
                    <span className="font-bold text-slate-800">₹{p.estimated_cost_cr} Cr</span>
                  </div>
                  <span className="text-blue-700 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 text-[11px]">
                    Manage Asset →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
