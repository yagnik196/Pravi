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
  RotateCcw
} from 'lucide-react';
import StatusBadge from './StatusBadge';

const STAGE_CONFIG = {
  'Detected': { icon: AlertTriangle },
  'Assigned': { icon: UserCheck },
  'Under Review': { icon: Search },
  'Action Initiated': { icon: Hammer },
  'Resolution Submitted': { icon: FileCheck2 },
  'Verification': { icon: ShieldCheck },
  'Resolved': { icon: CheckCircle },
};

export default function OperationalTimeline({
  issue,
  onAdvanceTimeline,
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
        No operational exception timeline active.
      </div>
    );
  }

  const timeline = issue.operational_timeline;
  const currentStatus = issue.status || 'OPEN';

  const stageOrder = [
    'Detected',
    'Assigned',
    'Under Review',
    'Action Initiated',
    'Resolution Submitted',
    'Verification',
    'Resolved'
  ];

  const inProgressStep = timeline.find((s) => s.status === 'in_progress');
  const currentStageName = inProgressStep ? inProgressStep.stage : (currentStatus === 'RESOLVED' ? 'Resolved' : 'Detected');

  const currentIndex = stageOrder.indexOf(currentStageName);
  const nextStageName = currentIndex >= 0 && currentIndex < stageOrder.length - 1 ? stageOrder[currentIndex + 1] : null;

  const handleTriggerAction = (targetStage, isFailure = false) => {
    setPendingAction({ targetStage, isFailure });
    setNoteInput(
      isFailure
        ? 'Verification inspection failed: Quality criteria not met. Reverted to Action Initiated.'
        : `Progressed to ${targetStage} by ${currentRole}`
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

  return (
    <div className="bg-white border border-rose-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
      {/* Top Border Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Issue Operational Resolution Timeline
            </h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {issue.id}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            <strong>Exception Root:</strong> {issue.title} ({issue.parameter} = <span className="text-rose-600 font-semibold">{issue.observed_value}</span>)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={issue.severity || 'Critical'} />
          <StatusBadge status={issue.status || 'OPEN'} />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3.5 my-2">
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
            cardBg = 'bg-emerald-50/20 border-emerald-200';
          } else if (isInProgress) {
            iconBg = 'bg-amber-500 text-white ring-4 ring-amber-100 shadow-sm';
            textColor = 'text-amber-800 font-bold';
            cardBg = 'bg-amber-50/50 border-amber-300';
          } else if (isFailed) {
            iconBg = 'bg-rose-600 text-white';
            textColor = 'text-rose-800 font-bold';
            cardBg = 'bg-rose-50/40 border-rose-200';
          }

          return (
            <div key={step.stage} className="relative flex items-start gap-3">
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

      {/* Action Bar */}
      {!isReadOnly && currentStatus !== 'RESOLVED' && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div>
            <span className="text-xs text-slate-500">Current Phase: </span>
            <span className="text-xs font-bold text-amber-700">{currentStageName}</span>
          </div>

          <div className="flex items-center gap-2">
            {currentStageName === 'Verification' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleTriggerAction('Action Initiated', true)}
                  disabled={acting}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Fail Verification (Revert)
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerAction('Resolved', false)}
                  disabled={acting}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Verify & Mark Resolved
                </button>
              </>
            ) : nextStageName ? (
              <button
                type="button"
                onClick={() => handleTriggerAction(nextStageName, false)}
                disabled={acting}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                <span>Advance to: {nextStageName}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-md w-full shadow-xl">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Hammer className="w-4 h-4 text-blue-600" />
              Advance Operational Timeline
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              Transitioning issue <strong>{issue.id}</strong> to stage:{' '}
              <span className="text-blue-700 font-bold">{pendingAction?.targetStage}</span>
            </p>

            <div className="mt-3.5">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Engineering Action Log / Audit Note:
              </label>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                rows={3}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                placeholder="Describe resolution measures, deployed plant & machinery, or test parameters..."
              />
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNoteModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAdvance}
                disabled={acting}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                {acting ? 'Saving...' : 'Confirm Progression'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
