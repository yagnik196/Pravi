import React, { useState } from 'react';
import { Wrench, Calendar, DollarSign, FileText, CheckCircle2, ShieldCheck, X, AlertTriangle } from 'lucide-react';

export default function MaintenanceModal({
  issue,
  maintenance,
  currentRole,
  onClose,
  onCreateMaintenance,
  onCompleteMaintenance,
  onVerifyMaintenance
}) {
  const isExisting = Boolean(maintenance);
  const isEvaluator = currentRole === 'Evaluator';
  const isDistrict = currentRole.startsWith('District');
  const isState = currentRole === 'State';

  // Form State for creating maintenance
  const [assignedParty, setAssignedParty] = useState(
    maintenance?.assigned_party || issue?.assigned_to || 'ABC Infrastructure Ltd. Maintenance Wing'
  );
  const [priority, setPriority] = useState(maintenance?.priority || issue?.severity || 'High');
  const [scheduledDate, setScheduledDate] = useState(
    maintenance?.scheduled_date || new Date().toISOString().split('T')[0]
  );
  const [costEstimateCr, setCostEstimateCr] = useState(maintenance?.cost_estimate_cr || 0.85);
  const [description, setDescription] = useState(
    maintenance?.description ||
    (issue ? `Remediation for ${issue.title}: rectify ${issue.detected_metric || issue.parameter} defect.` : '')
  );

  // Form State for Verification
  const [verifyPassed, setVerifyPassed] = useState(true);
  const [verificationNotes, setVerificationNotes] = useState(
    'Compressive strength tests exceed 42 MPa. Ultrasonic pulse velocity confirms void elimination.'
  );

  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!description.trim()) return alert('Please enter maintenance description');
    setSubmitting(true);
    try {
      await onCreateMaintenance({
        issue_id: issue.id,
        infrastructure_id: issue.project_id,
        assigned_party: assignedParty,
        priority: priority,
        scheduled_date: scheduledDate,
        description: description,
        cost_estimate_cr: parseFloat(costEstimateCr) || 0.5,
        evidence: []
      });
      onClose();
    } catch (err) {
      alert('Failed to initiate maintenance: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!maintenance) return;
    if (!window.confirm('Mark this maintenance work as completed? This will request verification from Field Evaluators.')) return;
    setSubmitting(true);
    try {
      await onCompleteMaintenance(maintenance.id);
      onClose();
    } catch (err) {
      alert('Failed to complete maintenance: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!maintenance) return;
    setSubmitting(true);
    try {
      await onVerifyMaintenance(maintenance.id, {
        verifier_name: 'Er. Pravin Varma (SQM)',
        passed: verifyPassed,
        verification_notes: verificationNotes.trim()
      });
      onClose();
    } catch (err) {
      alert('Failed to submit verification: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isExisting ? `Maintenance Workflow — ${maintenance.id}` : 'Initiate Maintenance Workflow'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Connected to Exception: <strong className="text-slate-800">{issue?.id || maintenance?.issue_id}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm flex-1">
          {/* Linked Issue Summary */}
          {issue && (
            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Target Exception
                </span>
                <span className="font-mono text-rose-700 font-semibold">{issue.id}</span>
              </div>
              <p className="text-slate-700">
                <strong>{issue.title}</strong>
              </p>
              <p className="text-slate-600">
                Detected Metric: <strong className="text-rose-700">{issue.detected_metric || issue.parameter}</strong> (Observed: {issue.detected_value || issue.observed_value} vs Threshold: {issue.threshold_value})
              </p>
            </div>
          )}

          {/* Mode 1: Create New Maintenance */}
          {!isExisting && (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Responsible Maintenance Agency / Contractor
                </label>
                <input
                  type="text"
                  required
                  value={assignedParty}
                  onChange={(e) => setAssignedParty(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Scheduled Mobilization Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Estimated Budget (₹ Crores)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={costEstimateCr}
                    onChange={(e) => setCostEstimateCr(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Corrective Engineering Scope & Methodology
                </label>
                <textarea
                  rows="3"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail pressure grouting, milling, compaction or structural retrofitting required..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Creating...' : 'Initiate Maintenance Workflow'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Mode 2: Existing Maintenance Details & Status Progression */}
          {isExisting && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-semibold block">Status</span>
                  <span className="font-bold text-slate-900 mt-0.5 inline-block">
                    {maintenance.status}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-semibold block">Contractor</span>
                  <span className="font-bold text-slate-900 mt-0.5 inline-block">
                    {maintenance.assigned_party}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-semibold block">Scheduled Date</span>
                  <span className="font-mono text-slate-900 mt-0.5 inline-block">
                    {maintenance.scheduled_date}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-semibold block">Cost Estimate</span>
                  <span className="font-bold text-slate-900 mt-0.5 inline-block">
                    ₹{maintenance.cost_estimate_cr} Cr
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="text-[11px] text-slate-500 font-semibold block mb-1">Scope of Work</span>
                <p className="text-slate-800 leading-relaxed">{maintenance.description}</p>
              </div>

              {/* Action 1: District/Contractor marks completed */}
              {maintenance.status === 'IN_PROGRESS' && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">Work Completed On-Site?</h4>
                    <p className="text-[11px] text-amber-700">
                      Marking as completed will notify State Quality Monitors for verification.
                    </p>
                  </div>
                  <button
                    onClick={handleComplete}
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm whitespace-nowrap"
                  >
                    Mark Work Completed
                  </button>
                </div>
              )}

              {/* Action 2: Evaluator verification form */}
              {(maintenance.status === 'COMPLETED' || maintenance.verification_requested || isEvaluator) && maintenance.status !== 'VERIFIED' && (
                <form onSubmit={handleVerify} className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-700" />
                    <h4 className="text-xs font-bold text-purple-900">Evaluator Field Verification</h4>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="verify_result"
                        checked={verifyPassed}
                        onChange={() => setVerifyPassed(true)}
                        className="text-purple-600"
                      />
                      <span className="text-emerald-700">Verify & Approve (Pass)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="verify_result"
                        checked={!verifyPassed}
                        onChange={() => setVerifyPassed(false)}
                        className="text-purple-600"
                      />
                      <span className="text-rose-700">Reject Repair (Needs Rework)</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-purple-800 mb-1">
                      Verification Field Notes & Test Verification
                    </label>
                    <textarea
                      rows="2"
                      required
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-purple-300 rounded-lg text-slate-900 text-xs"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition shadow-sm"
                    >
                      {submitting ? 'Submitting...' : verifyPassed ? 'Confirm Verification & Resolve' : 'Submit Rejection'}
                    </button>
                  </div>
                </form>
              )}

              {/* Verified Badge */}
              {maintenance.status === 'VERIFIED' && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold">Maintenance Officially Verified & Resolved</p>
                    <p className="text-[11px] text-emerald-700">{maintenance.verification_notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
