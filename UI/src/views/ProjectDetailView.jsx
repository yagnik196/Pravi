import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  User,
  ArrowLeft,
  MessageSquare,
  AlertTriangle,
  HardHat,
  ChevronRight,
  ClipboardList,
  Sliders,
  CheckCircle2,
  Send
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import LifecycleTimeline from '../components/LifecycleTimeline';
import MilestoneTimeline from '../components/MilestoneTimeline';
import OperationalTimeline from '../components/OperationalTimeline';

export default function ProjectDetailView({
  project,
  currentRole,
  onBack,
  onOpenEvaluation,
  onOpenChangeRequest,
  onAdvanceTimeline,
  onAddComment,
  onRespondChangeRequest
}) {
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [crResponseText, setCrResponseText] = useState({});

  if (!project) return null;

  const isState = currentRole === 'State';
  const isOwnerDistrict =
    (currentRole === 'District-1' && project.district === 'Ahmedabad') ||
    (currentRole === 'District-2' && project.district === 'Surat');
  const isPeerDistrict = currentRole.startsWith('District') && !isOwnerDistrict;
  const isEvaluator = currentRole === 'Evaluator';

  const activeIssue = project.live_issues?.[0] || null;

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await onAddComment(project.id, {
        author: `${currentRole} Representative`,
        role: currentRole,
        message: commentText.trim()
      });
      setCommentText('');
    } catch (err) {
      alert('Error adding comment: ' + err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleRespondCR = async (crId) => {
    const text = crResponseText[crId];
    if (!text || !text.trim()) return;

    try {
      await onRespondChangeRequest(project.id, crId, {
        district_response: text.trim()
      });
      setCrResponseText((prev) => ({ ...prev, [crId]: '' }));
    } catch (err) {
      alert('Error responding to change request: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Permissions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            type="button"
            onClick={onBack}
            className="p-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span>Gujarat State</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-700 font-semibold">{project.region}</span>
          <span className="text-[10px] text-slate-400 font-mono">(Grouping Container)</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-blue-700 font-bold">{project.district} District</span>
          <span className="text-[10px] text-blue-600 font-mono font-medium">(Project Owner)</span>
        </div>

        {/* Ownership Badge */}
        <div className="flex items-center gap-2">
          {isOwnerDistrict && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              District Ownership: Read + Write Access
            </span>
          )}
          {isPeerDistrict && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-medium">
              Peer District Visibility: Read Only
            </span>
          )}
          {isState && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 font-semibold">
              State Oversight: Supervisory Access
            </span>
          )}
        </div>
      </div>

      {/* Project Header Box (Context.md Section 25) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {project.id}
              </span>
              <StatusBadge status={project.category} />
              <StatusBadge status={project.work_type} />
              <StatusBadge status={project.status} />
              {project.priority && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  Priority: {project.priority}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {project.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl">
              {project.description}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>{project.responsible_org}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" />
                <span>{project.responsible_employee}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Target: {project.expected_completion}</span>
              </div>
            </div>
          </div>

          {/* Right Metrics Box */}
          <div className="lg:w-80 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-semibold block">Contract Cost</span>
                <span className="text-xl font-extrabold font-mono text-emerald-700">
                  ₹{project.estimated_cost_cr} Cr
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 uppercase font-semibold block">Contractor</span>
                <span className="text-xs font-bold text-slate-800">{project.contractor}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-600 font-medium">Physical Progress</span>
                <span className="font-mono font-bold text-blue-700">{project.progress_percent}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${project.progress_percent}%` }}
                />
              </div>
            </div>

            {/* Role Actions */}
            <div className="pt-1 flex flex-col gap-2">
              {isState && (
                <button
                  type="button"
                  onClick={onOpenChangeRequest}
                  className="w-full py-2 px-3 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Request Project Change</span>
                </button>
              )}

              {isEvaluator && (
                <button
                  type="button"
                  onClick={() => onOpenEvaluation(project.live_evaluations?.[0])}
                  className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <HardHat className="w-3.5 h-3.5" />
                  <span>Conduct Field Audit</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 1. Macro Lifecycle Timeline */}
      <LifecycleTimeline
        stages={project.lifecycle_stages}
        currentStage={project.current_stage}
      />

      {/* 2. Contractual SLA & Milestones */}
      <MilestoneTimeline milestones={project.milestones} />

      {/* 3. Issue Operational Timeline (Context.md Section 22B) */}
      {activeIssue ? (
        <div className="space-y-4">
          <OperationalTimeline
            issue={activeIssue}
            onAdvanceTimeline={onAdvanceTimeline}
            currentRole={currentRole}
            isReadOnly={isPeerDistrict || isEvaluator}
          />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between text-xs shadow-sm">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Zero Unresolved Operational Exceptions</span>
          </div>
          <span className="text-slate-500">All field parameters within contractual tolerance</span>
        </div>
      )}

      {/* 4. Monitoring Rules & Field Audit History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monitoring Rules */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                Configured Monitoring Threshold Rules
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Defined by District Engineer to trigger automated issue generation
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {project.monitoring_rules?.map((rule) => (
              <div
                key={rule.id}
                className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 font-semibold">
                      {rule.id}
                    </span>
                    <span className="font-bold text-slate-800">
                      If {rule.parameter} {rule.operator} "{rule.threshold_value}"
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-1">
                    Action: <span className="text-rose-700 font-semibold">Create Issue: "{rule.issue_title}"</span>
                  </p>
                </div>
                <StatusBadge status={rule.severity} />
              </div>
            ))}
          </div>
        </div>

        {/* Field Audit Records */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-amber-600" />
                Field Inspection Records
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ground-truth observations logged by independent evaluators
              </p>
            </div>
            {isEvaluator && (
              <button
                type="button"
                onClick={() => onOpenEvaluation(project.live_evaluations?.[0])}
                className="text-xs px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-sm"
              >
                + New Audit
              </button>
            )}
          </div>

          <div className="space-y-3">
            {project.live_evaluations?.map((evalItem) => {
              const isSubmitted = evalItem.status === 'submitted';
              return (
                <div
                  key={evalItem.id}
                  className={`p-3.5 rounded-lg border text-xs ${
                    isSubmitted
                      ? 'bg-slate-50/60 border-slate-200'
                      : 'bg-amber-50/50 border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-800 font-bold">{evalItem.id}</span>
                      <span className="text-slate-600 font-medium">• {evalItem.milestone_name}</span>
                    </div>
                    <StatusBadge status={evalItem.status} />
                  </div>

                  {evalItem.metrics && (
                    <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-400 block text-[9px] uppercase">Progress</span>
                        <span className="text-blue-700 font-bold">{evalItem.metrics?.['Physical Progress'] ?? '--'}%</span>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-400 block text-[9px] uppercase">Quality</span>
                        <span className="text-slate-800 font-semibold">{evalItem.metrics?.['Quality'] ?? '--'}</span>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-400 block text-[9px] uppercase">Safety</span>
                        <span className="text-slate-800 font-semibold">{evalItem.metrics?.['Safety'] ?? '--'}</span>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-400 block text-[9px] uppercase">Milestone</span>
                        <span className="text-rose-700 font-bold">{evalItem.metrics?.['Milestone Completion'] ?? '--'}</span>
                      </div>
                    </div>
                  )}

                  {evalItem.observations && (
                    <p className="text-slate-700 text-xs mt-2 italic bg-white p-2 rounded border border-slate-100">
                      "{evalItem.observations}"
                    </p>
                  )}

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Auditor: {evalItem.evaluator_name}</span>
                    {evalItem.is_immutable ? (
                      <span className="text-emerald-700 font-semibold">Immutable Sealed Record</span>
                    ) : (
                      <span className="text-amber-700 font-semibold">Pending Submission</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. State Change Requests & Engineering Discussion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* State Change Requests */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-purple-700" />
                State Authority Change Requests
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Supervisory directives issued by State to District owner
              </p>
            </div>
            {isState && (
              <button
                type="button"
                onClick={onOpenChangeRequest}
                className="text-xs px-2.5 py-1 rounded bg-purple-700 hover:bg-purple-800 text-white font-bold transition shadow-sm"
              >
                + Issue Request
              </button>
            )}
          </div>

          <div className="space-y-3">
            {(!project.change_requests || project.change_requests.length === 0) ? (
              <p className="text-xs text-slate-500 italic py-2">
                No active change requests issued by State Authority.
              </p>
            ) : (
              project.change_requests.map((cr) => (
                <div key={cr.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-purple-800 font-bold">{cr.id}</span>
                    <StatusBadge status={cr.status} />
                  </div>
                  <p className="text-slate-800">
                    <strong>Directive:</strong> {cr.message}
                  </p>
                  <span className="text-[11px] text-slate-500 block">
                    Issued by: {cr.requested_by} • {new Date(cr.requested_at).toLocaleDateString()}
                  </span>

                  {cr.district_response ? (
                    <div className="bg-white p-2.5 rounded border border-emerald-200 text-[11px] text-emerald-800">
                      <strong>District Action Response:</strong> {cr.district_response}
                    </div>
                  ) : isOwnerDistrict ? (
                    <div className="mt-2 pt-2 border-t border-slate-200 space-y-2">
                      <input
                        type="text"
                        placeholder="Type district rectification response..."
                        value={crResponseText[cr.id] || ''}
                        onChange={(e) => setCrResponseText({ ...crResponseText, [cr.id]: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleRespondCR(cr.id)}
                        className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                      >
                        Submit District Response
                      </button>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Discussion */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Technical Discussion & Audit Log
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Collaboration trail between State, District Engineers, and Auditors
            </p>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {project.comments?.map((c) => (
              <div key={c.id} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span className="font-bold text-slate-800">{c.author} ({c.role})</span>
                  <span className="font-mono">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-slate-700">{c.message}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendComment} className="pt-2 flex gap-2">
            <input
              type="text"
              placeholder={`Post comment as ${currentRole}...`}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />
            <button
              type="submit"
              disabled={submittingComment || !commentText.trim()}
              className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
