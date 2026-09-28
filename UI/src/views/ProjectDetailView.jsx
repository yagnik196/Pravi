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
  Send,
  Wrench,
  Camera,
  Plus,
  ShieldCheck,
  FileText
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
  onOpenMaintenanceModal,
  onAdvanceTimeline,
  onAddComment,
  onRespondChangeRequest,
  onAddMonitoringRule
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'monitoring' | 'issues' | 'evaluations' | 'evidence' | 'governance'
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [crResponseText, setCrResponseText] = useState({});

  // Add rule state
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRuleMetric, setNewRuleMetric] = useState('Road Quality');
  const [newRuleOp, setNewRuleOp] = useState('<');
  const [newRuleThreshold, setNewRuleThreshold] = useState(60);
  const [newRuleSeverity, setNewRuleSeverity] = useState('Critical');

  if (!project) return null;

  const isState = currentRole === 'State';
  const isOwnerDistrict =
    (currentRole === 'District-1' && project.district === 'Ahmedabad') ||
    (currentRole === 'District-2' && project.district === 'Surat');
  const isPeerDistrict = currentRole.startsWith('District') && !isOwnerDistrict;
  const isEvaluator = currentRole === 'Evaluator';

  const activeIssue = project.live_issues?.[0] || null;
  const qScore = project.quality_score || 70;
  const isCritical = project.health_status === 'Critical' || qScore < 60;
  const isWarning = project.health_status === 'Warning' || (qScore >= 60 && qScore < 80);

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

  const handleCreateRuleSubmit = async (e) => {
    e.preventDefault();
    if (!onAddMonitoringRule) return;
    try {
      await onAddMonitoringRule(project.id, {
        metric: newRuleMetric,
        operator: newRuleOp,
        threshold_value: Number(newRuleThreshold) || newRuleThreshold,
        severity: newRuleSeverity,
        issue_title: `${newRuleMetric} fell below tolerance (${newRuleOp} ${newRuleThreshold})`,
        description: `Triggered when field evaluation records ${newRuleMetric} ${newRuleOp} ${newRuleThreshold}`
      });
      setShowAddRule(false);
      alert('Monitoring rule configured successfully!');
    } catch (err) {
      alert('Error creating rule: ' + err.message);
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
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span>Gujarat State</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-700 font-semibold">{project.region}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-blue-700 font-bold">{project.district} District</span>
        </div>

        {/* Ownership Badge */}
        <div className="flex items-center gap-2">
          {isOwnerDistrict && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              District Operational Authority
            </span>
          )}
          {isPeerDistrict && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Cross-District Read Only
            </span>
          )}
          {isState && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              State Oversight Authority
            </span>
          )}
        </div>
      </div>

      {/* Asset Hero Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {project.id}
              </span>
              <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                {project.category}
              </span>
              <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                {project.work_type}
              </span>
              <StatusBadge status={project.lifecycle_status || project.status || 'Active'} />
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                isCritical ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                isWarning ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {project.health_status || (isCritical ? 'Critical' : isWarning ? 'Warning' : 'Healthy')}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {project.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
              {project.location}
            </p>

            {project.public_condition && (
              <div className="mt-2 text-xs text-slate-700 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-blue-700">Public Condition:</span>
                <span className="font-medium">{project.public_condition}</span>
              </div>
            )}
          </div>

          {/* Quality Score & Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            {/* Score Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[130px]">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                Quality Index
              </span>
              <span className={`text-2xl font-extrabold font-mono mt-0.5 block ${
                isCritical ? 'text-rose-700' : isWarning ? 'text-amber-700' : 'text-emerald-700'
              }`}>
                {qScore} / 100
              </span>
              <span className="text-[10px] text-slate-400 font-medium block">
                {isCritical ? 'Defect Breached' : isWarning ? 'Monitored' : 'Optimal Spec'}
              </span>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
              {/* Evaluator Action */}
              {isEvaluator && (
                <button
                  type="button"
                  onClick={() => onOpenEvaluation(project.live_evaluations?.[0])}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-2 justify-center"
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Perform Inspection</span>
                </button>
              )}

              {/* State Action: Change Request */}
              {isState && (
                <button
                  type="button"
                  onClick={onOpenChangeRequest}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-2 justify-center"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Issue Change Request</span>
                </button>
              )}

              {/* District Action: Maintenance */}
              {isOwnerDistrict && activeIssue && (
                <button
                  type="button"
                  onClick={() => onOpenMaintenanceModal && onOpenMaintenanceModal(activeIssue)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-2 justify-center"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Manage Maintenance</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex flex-wrap gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2.5 px-3 border-b-2 transition ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Contract & Lifecycle
        </button>

        <button
          onClick={() => setActiveTab('monitoring')}
          className={`pb-2.5 px-3 border-b-2 transition ${
            activeTab === 'monitoring'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Monitoring & Rules ({project.monitoring_rules?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('issues')}
          className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'issues'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Operational Timeline</span>
          {activeIssue && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('evaluations')}
          className={`pb-2.5 px-3 border-b-2 transition ${
            activeTab === 'evaluations'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Field Evaluations ({project.live_evaluations?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`pb-2.5 px-3 border-b-2 transition ${
            activeTab === 'evidence'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Evidence & Media ({project.evidence?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('governance')}
          className={`pb-2.5 px-3 border-b-2 transition ${
            activeTab === 'governance'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Change Requests & Notes ({project.change_requests?.length || 0})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & MACRO LIFECYCLE */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Specs Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Contract Specifications & Responsible Ownership
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Contractor</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{project.contractor}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Sanctioned Cost</span>
                <span className="font-mono font-bold text-slate-900 mt-0.5 block">₹{project.estimated_cost_cr} Cr</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Executive Engineer</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{project.responsible_employee}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Target Completion</span>
                <span className="font-mono font-bold text-slate-900 mt-0.5 block">{project.expected_completion}</span>
              </div>
            </div>
            <p className="text-xs text-slate-700 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Macro Lifecycle Timeline */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Macro Contract Lifecycle Stages
            </h3>
            <LifecycleTimeline stages={project.lifecycle_stages} />
          </div>

          {/* Milestones */}
          {project.milestones && project.milestones.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Performance Milestones & SLA Deliverables
              </h3>
              <MilestoneTimeline milestones={project.milestones} />
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MONITORING RULES & REAL-TIME METRICS (P1.3) */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          {/* Current Measured Telemetry */}
          {project.metrics_current && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Current Measured Field Telemetry
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {Object.entries(project.metrics_current).map(([key, val]) => (
                  <div key={key} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase block font-semibold">{key}</span>
                    <span className="text-base font-extrabold font-mono text-slate-900 mt-1 block">
                      {String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Configured Monitoring Rules */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Automated Monitoring Rules & Thresholds
                </h3>
                <p className="text-xs text-slate-500">
                  Rules execute on every submitted evaluation. Breaches auto-generate tracked operational issues.
                </p>
              </div>

              {(isOwnerDistrict || isState) && (
                <button
                  type="button"
                  onClick={() => setShowAddRule(!showAddRule)}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Configure Rule</span>
                </button>
              )}
            </div>

            {/* Quick Add Rule Form */}
            {showAddRule && (
              <form onSubmit={handleCreateRuleSubmit} className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3 text-xs">
                <h4 className="font-bold text-blue-900">Define New Monitoring Rule</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Metric</label>
                    <input
                      type="text"
                      required
                      value={newRuleMetric}
                      onChange={(e) => setNewRuleMetric(e.target.value)}
                      className="w-full p-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Operator</label>
                    <select
                      value={newRuleOp}
                      onChange={(e) => setNewRuleOp(e.target.value)}
                      className="w-full p-1.5 border border-slate-300 rounded bg-white"
                    >
                      <option value="<">&lt; (Less Than)</option>
                      <option value="<=">&lt;= (Less Than Equal)</option>
                      <option value=">">&gt; (Greater Than)</option>
                      <option value=">=">&gt;= (Greater Than Equal)</option>
                      <option value="=">= (Equals)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Threshold</label>
                    <input
                      type="text"
                      required
                      value={newRuleThreshold}
                      onChange={(e) => setNewRuleThreshold(e.target.value)}
                      className="w-full p-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Severity</label>
                    <select
                      value={newRuleSeverity}
                      onChange={(e) => setNewRuleSeverity(e.target.value)}
                      className="w-full p-1.5 border border-slate-300 rounded bg-white"
                    >
                      <option value="Critical">Critical</option>
                      <option value="Warning">Warning</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddRule(false)}
                    className="px-3 py-1 rounded text-slate-600 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    Save Rule
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {project.monitoring_rules?.map((rule) => (
                <div key={rule.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800">{rule.id}</span>
                      <span className="font-bold text-slate-900">{rule.issue_title}</span>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                        rule.severity === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rule.severity}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Condition: IF <strong className="text-slate-800">{rule.metric || rule.parameter}</strong> {rule.operator} <strong className="text-slate-800">{String(rule.threshold_value)}</strong> → Action: Auto Create Issue
                    </p>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200 shrink-0">
                    Active Guard
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OPERATIONAL TIMELINE & ISSUE RESOLUTION (P1.4, P1.5, P1.7) */}
      {activeTab === 'issues' && (
        <div className="space-y-6">
          {activeIssue ? (
            <OperationalTimeline
              issue={activeIssue}
              onAdvanceTimeline={onAdvanceTimeline}
              onOpenMaintenance={() => onOpenMaintenanceModal && onOpenMaintenanceModal(activeIssue)}
              currentRole={currentRole}
              isReadOnly={isPeerDistrict}
            />
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="font-bold text-slate-900">No active operational exceptions.</p>
              <p className="text-[11px] text-slate-500 mt-1">All monitored metrics conform to SLA tolerances.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: FIELD EVALUATIONS (P1.6) */}
      {activeTab === 'evaluations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Field Inspection Records ({project.live_evaluations?.length || 0})
              </h3>
              <p className="text-xs text-slate-500">
                Ground-truth audit submissions committed as immutable historical records
              </p>
            </div>

            {isEvaluator && (
              <button
                type="button"
                onClick={() => onOpenEvaluation(project.live_evaluations?.[0])}
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Submit Field Evaluation</span>
              </button>
            )}
          </div>

          {project.live_evaluations?.map((ev) => (
            <div key={ev.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-700">{ev.id}</span>
                  <span className="font-bold text-slate-900">{ev.milestone_name || 'Standard Inspection'}</span>
                  {ev.is_immutable && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Immutable
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {ev.submitted_at ? new Date(ev.submitted_at).toLocaleString('en-IN') : 'Assigned'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                {Object.entries(ev.metrics || {}).map(([k, v]) => (
                  <div key={k} className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-500 block">{k}</span>
                    <span className="font-bold text-slate-800">{String(v)}</span>
                  </div>
                ))}
              </div>

              {ev.observations && (
                <div>
                  <span className="font-semibold text-slate-700 block mb-0.5">Observations:</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 leading-relaxed">
                    {ev.observations}
                  </p>
                </div>
              )}

              {ev.recommendation && (
                <div>
                  <span className="font-semibold text-slate-700 block mb-0.5">Recommendation:</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 leading-relaxed">
                    {ev.recommendation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: EVIDENCE & MEDIA (P1.6, P1.12) */}
      {activeTab === 'evidence' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Field Evidence & Verification Media
              </h3>
              <p className="text-xs text-slate-500">
                Photographic, ultrasonic testing, and laboratory verification records
              </p>
            </div>
          </div>

          {(!project.evidence || project.evidence.length === 0) ? (
            <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-slate-500 text-xs">
              No evidence files attached to this asset yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {project.evidence.map((ev, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                  <img
                    src={ev.file_url}
                    alt={ev.caption || ev.file_name}
                    className="w-full h-44 object-cover"
                  />
                  <div className="p-3 text-xs space-y-1">
                    <p className="font-bold text-slate-900 truncate">{ev.caption || ev.file_name}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>By: {ev.uploaded_by}</span>
                      <span>{ev.uploaded_at ? new Date(ev.uploaded_at).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: GOVERNANCE & COMMENTS */}
      {activeTab === 'governance' && (
        <div className="space-y-6">
          {/* State Change Requests */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              State Oversight Change Requests ({project.change_requests?.length || 0})
            </h3>

            {(!project.change_requests || project.change_requests.length === 0) ? (
              <p className="text-xs text-slate-500">No active state change requests lodged.</p>
            ) : (
              <div className="space-y-3">
                {project.change_requests.map((cr) => (
                  <div key={cr.id} className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-purple-900">{cr.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                        {cr.status}
                      </span>
                    </div>

                    <p className="text-slate-800 font-medium">{cr.message}</p>
                    <span className="text-[10px] text-slate-500 block">Requested by: {cr.requested_by}</span>

                    {/* District Response Display */}
                    {cr.district_response ? (
                      <div className="p-2.5 rounded bg-white border border-purple-200 text-emerald-800">
                        <span className="font-bold block text-[10px] uppercase">District Response:</span>
                        <p>{cr.district_response}</p>
                      </div>
                    ) : isOwnerDistrict && (
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Type district response and resource update..."
                          value={crResponseText[cr.id] || ''}
                          onChange={(e) => setCrResponseText({ ...crResponseText, [cr.id]: e.target.value })}
                          className="flex-1 px-3 py-1.5 border border-purple-300 rounded-lg text-slate-900 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleRespondCR(cr.id)}
                          className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold whitespace-nowrap"
                        >
                          Submit Response
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Discussion Comments */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Inter-Agency Operational Discussion
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
              {project.comments?.map((c) => (
                <div key={c.id} className="pt-2 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-900">{c.author}</span>
                    <span className="font-mono text-slate-400">
                      {new Date(c.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{c.message}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendComment} className="pt-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                placeholder="Post a coordination update or clarification..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={submittingComment}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
