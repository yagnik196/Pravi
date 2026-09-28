import React from 'react';
import {
  Shield,
  Building2,
  HardHat,
  Briefcase,
  Users,
  Layers,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function RoleSelectView({ onSelectRole, stats }) {
  const roles = [
    {
      id: 'State',
      title: 'State Authority',
      badge: 'State Oversight',
      desc: 'State-wide infrastructure monitoring across all regions and districts. Tracks project health, exceptions, and issues formal change requests.',
      icon: Shield,
      btnText: 'Login as State',
      btnStyle: 'bg-purple-700 hover:bg-purple-800 text-white',
      badgeStyle: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      id: 'District-1',
      title: 'District-1 (Ahmedabad)',
      badge: 'Project Owner • Read / Write',
      desc: 'Superintendent & Executive Engineer circle. Owns Ahmedabad Ring Road Phase 2, configures SLAs and evaluation rules, and resolves issues.',
      icon: Building2,
      btnText: 'Login as District-1',
      btnStyle: 'bg-blue-600 hover:bg-blue-700 text-white',
      badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'District-2',
      title: 'District-2 (Surat)',
      badge: 'Independent District • Multi-Tenant',
      desc: 'Surat City R&B Division. Manages Surat Cable Bridge rehabilitation independently under the State, with read-only peer visibility of Ahmedabad.',
      icon: Building2,
      btnText: 'Login as District-2',
      btnStyle: 'bg-teal-600 hover:bg-teal-700 text-white',
      badgeStyle: 'bg-teal-50 text-teal-700 border-teal-200'
    },
    {
      id: 'Evaluator',
      title: 'Evaluator',
      badge: 'Quality Auditor (SQM)',
      desc: 'Performs field inspections, records physical progress %, checks quality & safety, and triggers automated rule engine issues. Records are immutable.',
      icon: HardHat,
      btnText: 'Login as Evaluator',
      btnStyle: 'bg-amber-600 hover:bg-amber-700 text-white',
      badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      id: 'Vendor',
      title: 'Third-Party Company',
      badge: 'Contractor & Tenders',
      desc: 'Browse available R&B tenders, view Class-AA eligibility rules, earnest money deposit terms, scope of work, and contract milestones.',
      icon: Briefcase,
      btnText: 'Login as Third-Party Company',
      btnStyle: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      id: 'Citizen',
      title: 'Citizen',
      badge: 'Public Transparency',
      desc: 'Public infrastructure portal for citizens. View project progress, verified condition, sanctioned cost, and target completion without internal bureaucracy.',
      icon: Users,
      btnText: 'Continue as Citizen',
      btnStyle: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center pt-2 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800 mb-3">
          <span>Government of Gujarat • Roads & Buildings Department</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2">
          <Layers className="w-8 h-8 text-blue-600" />
          <span>PRAVI</span>
        </h1>
        <p className="text-base text-slate-600 font-medium mt-1">
          Infrastructure Monitoring & Contract Lifecycle Platform
        </p>
        <p className="text-xs text-slate-500 max-w-xl mx-auto mt-1">
          Single source of truth connecting project lifecycles, SLAs, field audits, and automated operational timelines.
        </p>

        {/* Clean Metric Badges */}
        {stats && (
          <div className="mt-5 flex flex-wrap justify-center items-center gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-600">
              Total Assets: <strong className="text-slate-900 font-semibold">{stats.projects?.total || 6}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-600">
              Portfolio Value: <strong className="text-emerald-700 font-semibold">₹{stats.projects?.total_cost_cr || 512.7} Cr</strong>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-600">
              Active Exceptions: <strong className="text-rose-700 font-semibold">{stats.issues?.open || 2}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-600">
              Database: <strong className="text-blue-700 font-semibold">MongoDB Active</strong>
            </div>
          </div>
        )}
      </div>

      {/* Role Selection Grid */}
      <div className="max-w-5xl mx-auto w-full my-auto py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${r.badgeStyle}`}>
                      {r.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {r.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {r.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onSelectRole(r.id)}
                    className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${r.btnStyle}`}
                  >
                    <span>{r.btnText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Concise Architectural Footer */}
      <div className="max-w-2xl mx-auto text-center pt-8 pb-2 text-xs text-slate-500">
        <p>
          Region is a geographic grouping container only (no independent authority). Projects are owned by Districts with State oversight.
        </p>
      </div>
    </div>
  );
}
