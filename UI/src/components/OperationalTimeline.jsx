import React, { useState } from 'react';
import {
  AlertTriangle,
  UserCheck,
  Search,
  Hammer,
  FileCheck2,
  ShieldCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Wrench,
  CheckSquare,
  XCircle,
  FileText
} from 'lucide-react';
import StatusBadge from './StatusBadge';

const STAGE_CONFIG = {
  'Detected': { icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  'Acknowledged': { icon: UserCheck, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  'Assigned': { icon: Search, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  'In Progress': { icon: Hammer, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  'Action Initiated': { icon: Hammer, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  'Pending Verification': { icon: FileCheck2, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  'Resolution Submitted': { icon: FileCheck2, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  'Verification': { icon: ShieldCheck, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  'Resolved': { icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  'Closed': { icon: CheckSquare, color: 'text-slate-600 bg-slate-100 border-slate-300' }
};

export default function OperationalTimeline({
  issue,
  onAdvanceTimeline,
  onOpenMaintenance,
  currentRole = 'District-1',
  isReadOnly = false
}) {
  const [acting, setActing] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  if (!issue || !issue.operational_timeline) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-500 text-sm">
        No active operational exception timeline.
      </div>
    );
  }

  const timeline = issue.operational_timeline;
  const currentStatus = (issue.status || 'OPEN').toUpperCase();

  const handleTriggerAction = (targetStage, isFailure = false, defaultNotes = '') => {
    setPendingAction({ targetStage, isFailure });
    setNoteInput(
      isFailure
        ? 'Verification inspection rejected: Concrete strength below SLA spec. Rework required on site.'
        : defaultNotes || `Progressed to ${targetStage} by ${currentRole}`
    );
    setShowNoteModal(true);
  };

  const confirmAdvance = async () => {
    if (!pendingAction || !onAdvanceTimeline) return;
    setActing(true);
    try {
      await onAdvanceTimeline(issue.id, {
        target_stage: pendingAction.targetStage,
        actor: `${currentRole} Authority`,
        role: currentRole,
        notes: noteInput.trim(),
        failed_verification: pendingAction.isFailure,
      });
      setShowNoteModal(false);
      setPendingAction(null);
    } catch (err) {
      alert('Error advancing timeline: ' + err.message);
    } finally {
      setActing(false);
    }
  };

  const isDistrict = currentRole.startsWith('District');
  const isEvaluator = currentRole === 'Evaluator';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
      {/* Top Border Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 via-purple-500 to-emerald-500" />

      {/* Header with Exact Detection Cause (P1.4 / Section 9) */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Operational Resolution Lifecycle
            </h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
              {issue.id}
            </span>
          </div>

          <h4 className="text-sm font-bold text-slate-900 mt-1.5">{issue.title}</h4>

          {/* Traceable Cause Box */}
          <div className="mt-2.5 p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-slate-700 space-y-1">
            <div className="flex flex-wrap items-center gap-2 font-mono">
              <span className="font-bold text-slate-900">Why was this issue generated?</span>
              {issue.rule_id && (
                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                  Rule #{issue.rule_id}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-800 leading-relaxed">
              <strong>Detection Metric:</strong> <span className="text-rose-700 font-bold">{issue.detected_metric || issue.parameter}</span> •{' '}
              <strong>Observed:</strong> <span className="text-rose-700 font-bold">{issue.detected_value || issue.observed_value}</span> •{' '}
              <strong>Threshold:</strong> <span className="font-semibold">{issue.operator || '<'} {issue.threshold_value || '60'}</span>
            </p>
            {issue.detection_reason && (
              <p className="text-[11px] text-slate-600 italic">
                "{issue.detection_reason}"
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={issue.severity || 'Critical'} />
          <StatusBadge status={issue.status || 'OPEN'} />
        </div>
      </div>

      {/* Linked Maintenance Banner if Active */}
      {issue.maintenance_id && (
        <div className="mb-4 p-3 rounded-lg bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-700" />
            <span>
              Linked Maintenance: <strong className="font-mono text-blue-900">{issue.maintenance_id}</strong>
            </span>
          </div>
          {onOpenMaintenance && (
            <button
              onClick={() => onOpenMaintenance(issue.maintenance_id)}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline"
            >
              View Maintenance Workflow →
            </button>
          )}
        </div>
      )}

      {/* Timeline Steps */}
      <div className="space-y-3.5 my-3">
        {timeline.map((step, idx) => {
          const config = STAGE_CONFIG[step.stage] || { icon: Clock };
          const Icon = config.icon;

          const isCompleted = step.status === 'completed';
          const isInProgress = step.status === 'in_progress';
          const isFailed = step.status === 'failed';

          let iconBg = 'bg-slate-100 text-slate-400 border-slate-200';
          let textColor = 'text-slate-600';
          let cardBg = 'bg-slate-50/60 border-slate-200';

          if (isCompleted) {
            iconBg = 'bg-emerald-600 text-white shadow-sm';
            textColor = 'text-emerald-800 font-bold';
            cardBg = 'bg-emerald-50/30 border-emerald-200';
          } else if (isInProgress) {
            iconBg = 'bg-amber-500 text-white ring-4 ring-amber-100 shadow-sm';
            textColor = 'text-amber-800 font-bold';
            cardBg = 'bg-amber-50/60 border-amber-300';
          } else if (isFailed) {
            iconBg = 'bg-rose-600 text-white';
            textColor = 'text-rose-800 font-bold';
            cardBg = 'bg-rose-50/50 border-rose-300';
          }

          return (
            <div key={step.event_id || step.stage} className="relative flex items-start gap-3">
              {idx < timeline.length - 1 && (
                <div
                  className={`absolute left-[15px] top-[28px] bottom-[-14px] w-0.5 z-0 ${
                    isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}

              <div
                className={`relative z-10 w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all ${iconBg}`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className={`flex-1 rounded-lg p-3 border text-xs ${cardBg}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${textColor}`}>{step.stage}</span>
                    {step.actor && (
                      <span className="text-[11px] text-slate-500 font-medium">
                        • {step.actor}
                      </span>
                    )}
                  </div>
                  {step.timestamp && (
                    <span className="text-[11px] font-mono text-slate-500">
                      {new Date(step.timestamp).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                </div>

                {step.details && (
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    {step.details}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Bar for Transitioning States */}
      {!isReadOnly && currentStatus !== 'CLOSED' && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-600">
            Current Status: <strong className="text-slate-900">{currentStatus}</strong>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Step 1: Acknowledge */}
            {(currentStatus === 'OPEN' || currentStatus === 'DETECTED') && isDistrict && (
              <button
                onClick={() => handleTriggerAction('Acknowledged', false, 'District Executive Engineer acknowledged exception and issued cause memo.')}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
              >
                Acknowledge Exception
              </button>
            )}

            {/* Step 2: Schedule Maintenance */}
            {(currentStatus === 'ACKNOWLEDGED' || currentStatus === 'ASSIGNED' || currentStatus === 'OPEN') && (
              <button
                onClick={() => {
                  if (onOpenMaintenance) onOpenMaintenance();
                  else handleTriggerAction('In Progress', false, 'Contractor maintenance crew mobilized on site.');
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>{issue.maintenance_id ? 'View/Update Maintenance' : 'Create Maintenance Request'}</span>
              </button>
            )}

            {/* Step 3: Complete Work & Request Verification */}
            {currentStatus === 'IN_PROGRESS' && (
              <button
                onClick={() => handleTriggerAction('Pending Verification', false, 'Maintenance repair work completed on site. Awaiting SQM verification.')}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition"
              >
                Submit for Evaluator Verification
              </button>
            )}

            {/* Step 4: Verification Actions for Evaluator */}
            {currentStatus === 'PENDING_VERIFICATION' && (
              <>
                <button
                  onClick={() => handleTriggerAction('Resolved', false, 'Field inspection verified repair quality meets MoRTH specifications.')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Verify & Approve (Resolve)</span>
                </button>
                <button
                  onClick={() => handleTriggerAction('In Progress', true)}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-300 transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reject (Request Rework)</span>
                </button>
              </>
            )}

            {/* Step 5: District Close */}
            {currentStatus === 'RESOLVED' && isDistrict && (
              <button
                onClick={() => handleTriggerAction('Closed', false, 'Executive Engineer verified audit certificate and closed record.')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Close & Archive Record</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-md w-full shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-slate-900">
              Confirm Transition to: <span className="text-blue-700">{pendingAction?.targetStage}</span>
            </h4>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Operational Notes / Justification:
              </label>
              <textarea
                rows="3"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNoteModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={acting}
                onClick={confirmAdvance}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
              >
                {acting ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
