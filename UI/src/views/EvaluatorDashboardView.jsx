import React, { useState } from 'react';
import {
  HardHat,
  ClipboardCheck,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function EvaluatorDashboardView({
  evaluations = [],
  onOpenEvaluation,
  onSelectProject
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'assigned' | 'submitted'

  const filteredEvals = evaluations.filter((e) => {
    if (filter === 'assigned') return e.status === 'assigned';
    if (filter === 'submitted') return e.status === 'submitted';
    return true;
  });

  const pendingCount = evaluations.filter((e) => e.status === 'assigned').length;
  const completedCount = evaluations.filter((e) => e.status === 'submitted').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
                <HardHat className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700">
                State Quality Monitor (SQM) • Independent Field Auditor
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Field Evaluation & Quality Audit Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Inspect on-site physical progress, verify concrete compressive strength, evaluate site safety, and log immutable field observations.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center">
              <span className="text-slate-500 text-[10px] uppercase block font-semibold">Assigned Tasks</span>
              <span className="text-lg font-bold text-amber-700">{pendingCount}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center">
              <span className="text-slate-500 text-[10px] uppercase block font-semibold">Sealed Audits</span>
              <span className="text-lg font-bold text-emerald-700">{completedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="text-slate-900 block mb-0.5">Immutability Principle (Section 20):</strong>
            <p className="text-slate-600">
              Once submitted, field evaluation data cannot be altered or overwritten. Historical inspection records preserve ground truth.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="text-slate-900 block mb-0.5">Automated Rule Engine (Section 40):</strong>
            <p className="text-slate-600">
              Evaluators do not manually create issues. The platform's automated rule engine continuously evaluates observations against project threshold rules.
            </p>
          </div>
        </div>
      </div>

      {/* Evaluations List */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Assigned Field Tasks ({filteredEvals.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an assigned task to inspect criteria, enter measurements, review, and seal
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md transition font-semibold ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({evaluations.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('assigned')}
              className={`px-3 py-1 rounded-md transition font-semibold ${
                filter === 'assigned' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('submitted')}
              className={`px-3 py-1 rounded-md transition font-semibold ${
                filter === 'submitted' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Submitted / Sealed ({completedCount})
            </button>
          </div>
        </div>

        {/* Task Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvals.map((ev) => {
            const isAssigned = ev.status === 'assigned';
            return (
              <div
                key={ev.id}
                className={`rounded-xl p-5 border flex flex-col justify-between transition-all ${
                  isAssigned
                    ? 'bg-amber-50/30 border-amber-200 hover:border-amber-400'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {ev.id}
                    </span>
                    <StatusBadge status={ev.status} />
                  </div>

                  <h4 className="text-base font-bold text-slate-900">
                    {ev.project_name}
                  </h4>

                  <p className="text-xs text-blue-700 font-semibold mt-1">
                    Target Milestone: {ev.milestone_name}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Jurisdiction:</span>
                      <span className="font-medium text-slate-800">{ev.district} District</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Due Date:</span>
                      <span className="text-amber-700 font-mono font-bold">{ev.due_date}</span>
                    </div>
                    {ev.submitted_at && (
                      <div className="flex items-center justify-between">
                        <span>Submitted On:</span>
                        <span className="text-emerald-700 font-mono">{new Date(ev.submitted_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {ev.metrics && (
                    <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] grid grid-cols-2 gap-2 font-mono">
                      <div>
                        <span className="text-slate-500 block">Progress:</span>
                        <span className="text-blue-700 font-bold">{ev.metrics['Physical Progress'] ?? '--'}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Quality:</span>
                        <span className="text-slate-800 font-medium">{ev.metrics['Quality'] ?? '--'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Milestone:</span>
                        <span className="text-rose-700 font-bold">{ev.metrics['Milestone Completion'] ?? '--'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Safety:</span>
                        <span className="text-slate-800 font-medium">{ev.metrics['Safety'] ?? '--'}</span>
                      </div>
                    </div>
                  )}

                  {ev.observations && (
                    <p className="text-xs text-slate-600 mt-2.5 italic line-clamp-2">
                      "{ev.observations}"
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onSelectProject(ev.project_id)}
                    className="text-xs text-blue-700 hover:underline font-semibold"
                  >
                    View Project
                  </button>

                  {isAssigned ? (
                    <button
                      type="button"
                      onClick={() => onOpenEvaluation(ev)}
                      className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      <span>Start Audit & Input Data</span>
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Immutable Sealed</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
