import React from 'react';
import StatusBadge from './StatusBadge';
import { Calendar, ShieldAlert } from 'lucide-react';

export default function MilestoneTimeline({ milestones = [] }) {
  if (!milestones || milestones.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 text-center text-slate-500 text-sm">
        No contractual milestones configured yet for this lifecycle phase.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            Contract SLA & Milestone Breakdown
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Deliverable schedules and field inspection requirements
          </p>
        </div>
        <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 font-medium">
          {milestones.filter(m => m.status === 'completed').length} / {milestones.length} Completed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {milestones.map((m, idx) => {
          const isDelayed = m.status === 'delayed';
          const isCompleted = m.status === 'completed';

          return (
            <div
              key={m.id || idx}
              className={`p-4 rounded-xl border transition-all ${
                isDelayed
                  ? 'bg-amber-50/50 border-amber-300'
                  : isCompleted
                  ? 'bg-emerald-50/30 border-emerald-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    #{idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{m.name}</h4>
                </div>
                <StatusBadge status={m.status} />
              </div>

              {m.description && (
                <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">
                  {m.description}
                </p>
              )}

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Due: {m.expected_date}
                </span>

                {m.evaluation_required && (
                  <span className="flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-medium">
                    <ShieldAlert className="w-3 h-3" />
                    Audit Required
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-2.5">
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Physical Completion</span>
                  <span className="font-mono font-semibold text-slate-800">{m.progress_percent || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDelayed
                        ? 'bg-amber-500'
                        : isCompleted
                        ? 'bg-emerald-600'
                        : 'bg-blue-600'
                    }`}
                    style={{ width: `${m.progress_percent || 0}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
