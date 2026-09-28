import React, { useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  X,
  ShieldCheck
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function EvaluationModal({
  evaluation,
  onClose,
  onSubmitEvaluation
}) {
  const [step, setStep] = useState('form'); // 'form' | 'review' | 'success'
  const [submitting, setSubmitting] = useState(false);
  const [resultData, setResultData] = useState(null);

  const [metrics, setMetrics] = useState({
    'Physical Progress': evaluation?.metrics?.['Physical Progress'] ?? 62,
    'Quality': evaluation?.metrics?.['Quality'] ?? 'Good',
    'Safety': evaluation?.metrics?.['Safety'] ?? 'Compliant',
    'Milestone Completion': evaluation?.metrics?.['Milestone Completion'] ?? 'Not Completed',
    ...(evaluation?.metrics || {})
  });
  const [observations, setObservations] = useState(
    evaluation?.observations ||
      'Field inspection conducted. Pier P-14 and P-15 deck slab casting remains incomplete due to monsoon rebar lag.'
  );

  if (!evaluation) return null;

  const handleMetricChange = (key, val) => {
    setMetrics((prev) => ({ ...prev, [key]: val }));
  };

  const handleProceedToReview = (e) => {
    e.preventDefault();
    setStep('review');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await onSubmitEvaluation(evaluation.id, {
        evaluator_name: evaluation.evaluator_name,
        metrics,
        observations: observations.trim(),
        photos: []
      });
      setResultData(res);
      setStep('success');
    } catch (err) {
      alert('Failed to submit evaluation: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {step === 'review' ? 'Review Field Audit' : 'Field Inspection & Evaluation'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {evaluation.id} • {evaluation.project_name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 flex-1">
          {/* Target Milestone */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-slate-500 uppercase text-[10px] block">Milestone:</span>
              <span className="font-bold text-slate-800">{evaluation.milestone_name}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase text-[10px] block">Auditor:</span>
              <span className="font-medium text-slate-700">{evaluation.evaluator_name}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase text-[10px] block">Due:</span>
              <span className="font-mono font-semibold text-amber-700">{evaluation.due_date}</span>
            </div>
          </div>

          {/* STEP 1: FORM INPUT */}
          {step === 'form' && (
            <form onSubmit={handleProceedToReview} className="space-y-3.5">
              <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                💡 <strong>Continuous Monitoring Rule Check:</strong> Enter field metrics. Once submitted, records are permanently immutable and will be evaluated against project threshold rules.
              </div>

              {/* Physical Progress */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-700">Observed Physical Progress (%)</label>
                  <span className="font-mono font-bold text-blue-700 text-sm">
                    {metrics['Physical Progress']}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={metrics['Physical Progress']}
                  onChange={(e) => handleMetricChange('Physical Progress', Number(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Quality Grade */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Quality Assessment</label>
                <select
                  value={metrics['Quality']}
                  onChange={(e) => handleMetricChange('Quality', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  <option value="Excellent">Excellent (Exceeds M40 strength criteria)</option>
                  <option value="Good">Good (Meets specifications)</option>
                  <option value="Satisfactory">Satisfactory (Minor tolerance deviations)</option>
                  <option value="Poor">Poor (Defects / cube test failure / Rule Trigger)</option>
                </select>
              </div>

              {/* Safety */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Site Safety & Diversion Compliance</label>
                <select
                  value={metrics['Safety']}
                  onChange={(e) => handleMetricChange('Safety', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  <option value="Compliant">Compliant (PPE, reflective barricades)</option>
                  <option value="Minor Hazard">Minor Hazard (Partial gap)</option>
                  <option value="Critical Hazard">Critical Hazard (Unshielded pit / Rule Trigger)</option>
                </select>
              </div>

              {/* Milestone Completion Status */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Milestone Completion Status</label>
                <select
                  value={metrics['Milestone Completion']}
                  onChange={(e) => handleMetricChange('Milestone Completion', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-600"
                >
                  <option value="Completed">Completed (Milestone handed over)</option>
                  <option value="On Schedule">On Schedule (Pacing matches SLA curve)</option>
                  <option value="Not Completed">Not Completed (Delayed / Rule Trigger Exception)</option>
                </select>
              </div>

              {/* Observations */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Field Observations & Evidence Summary</label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={3}
                  required
                  placeholder="Record site realities, cause of lag, material delays..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <span>Review Before Submission</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: REVIEW SCREEN (Context.md Section 19) */}
          {step === 'review' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <strong>Mandatory Final Review:</strong> Once submitted, this field audit becomes{' '}
                  <span className="font-bold underline">strictly immutable</span>. Verify all metrics below.
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
                <div className="p-3 flex justify-between items-center text-xs">
                  <span className="text-slate-600">Physical Progress:</span>
                  <span className="font-mono font-bold text-blue-700 text-sm">{metrics['Physical Progress']}%</span>
                </div>
                <div className="p-3 flex justify-between items-center text-xs">
                  <span className="text-slate-600">Quality Assessment:</span>
                  <StatusBadge status={metrics['Quality']} />
                </div>
                <div className="p-3 flex justify-between items-center text-xs">
                  <span className="text-slate-600">Safety Status:</span>
                  <StatusBadge status={metrics['Safety']} />
                </div>
                <div className="p-3 flex justify-between items-center text-xs">
                  <span className="text-slate-600">Milestone Status:</span>
                  <StatusBadge status={metrics['Milestone Completion']} />
                </div>
                <div className="p-3 text-xs">
                  <span className="text-slate-600 block mb-1">Observation:</span>
                  <p className="text-slate-800 bg-slate-50 p-2 rounded border border-slate-200 font-sans">
                    {observations}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Edit Observations</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{submitting ? 'Submitting & Evaluating Rules...' : 'Submit Evaluation (Immutable)'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS & AUTOMATIC ISSUE DETECTION */}
          {step === 'success' && (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">Evaluation Submitted & Sealed</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record is permanently immutable. Automated rule engine executed against project thresholds.
                </p>
              </div>

              {resultData?.issues_created?.length > 0 ? (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-left space-y-2">
                  <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Rule Engine Triggered ({resultData.issues_created.length} Exception Issue Created)</span>
                  </div>

                  {resultData.issues_created.map((iss) => (
                    <div key={iss.id} className="bg-white p-2.5 rounded-lg border border-rose-200 text-xs shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-rose-700 font-bold">{iss.id}</span>
                        <StatusBadge status={iss.severity} />
                      </div>
                      <p className="text-slate-800 font-semibold mt-1">{iss.title}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Caused by: {iss.parameter} = <strong>{iss.observed_value}</strong>
                      </p>
                    </div>
                  ))}

                  <p className="text-[11px] text-slate-600">
                    An operational resolution timeline has been automatically initiated for this district.
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800">
                  All parameters met acceptable tolerances. No exception issues triggered.
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                Close & View Project
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
