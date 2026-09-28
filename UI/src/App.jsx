import React, { useState, useEffect } from 'react';
import { api } from './api';

// Components
import Navbar from './components/Navbar';
import EvaluationModal from './components/EvaluationModal';
import ChangeRequestModal from './components/ChangeRequestModal';
import NewProjectModal from './components/NewProjectModal';
import MaintenanceModal from './components/MaintenanceModal';
import NotificationsDrawer from './components/NotificationsDrawer';
import AuditLogModal from './components/AuditLogModal';
import StatusBadge from './components/StatusBadge';

// Views
import RoleSelectView from './views/RoleSelectView';
import StateDashboardView from './views/StateDashboardView';
import DistrictDashboardView from './views/DistrictDashboardView';
import ProjectDetailView from './views/ProjectDetailView';
import EvaluatorDashboardView from './views/EvaluatorDashboardView';
import VendorTenderView from './views/VendorTenderView';
import CitizenPortalView from './views/CitizenPortalView';

// Icons
import { Wrench, AlertTriangle, ChevronRight, Activity, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState('landing');
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState('RNB-2026-001');

  // Application Data State
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [issues, setIssues] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [hierarchy, setHierarchy] = useState(null);
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reseeding, setReseeding] = useState(false);

  // Modals
  const [activeEvaluationModal, setActiveEvaluationModal] = useState(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
  const [activeMaintenanceData, setActiveMaintenanceData] = useState(null); // { issue, maintenance }
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [showAuditLogModal, setShowAuditLogModal] = useState(false);

  // Initial Data Load
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [projRes, evalRes, issueRes, maintRes, tenderRes, hierRes, statsRes, notifRes] = await Promise.all([
        api.getProjects().catch(() => ({ data: [] })),
        api.getEvaluations().catch(() => ({ data: [] })),
        api.getIssues().catch(() => ({ data: [] })),
        api.getMaintenance().catch(() => ({ data: [] })),
        api.getTenders().catch(() => ({ data: [] })),
        api.getHierarchy().catch(() => null),
        api.getStats().catch(() => null),
        api.getNotifications().catch(() => ({ data: [] })),
      ]);

      setProjects(projRes.data || []);
      setEvaluations(evalRes.data || []);
      setIssues(issueRes.data || []);
      setMaintenance(maintRes.data || []);
      setTenders(tenderRes.data || []);
      setHierarchy(hierRes);
      setStats(statsRes);
      setNotifications(notifRes.data || []);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const loadProjectDetail = async (id) => {
    try {
      const res = await api.getProject(id);
      setSelectedProject(res.data);
      setSelectedProjectId(id);
      setCurrentView('project-detail');
    } catch (err) {
      console.error('Error fetching project detail:', err);
    }
  };

  const handleSelectRole = (role) => {
    setCurrentRole(role);
    if (role === 'Citizen') {
      setCurrentView('citizen');
    } else if (role === 'Evaluator') {
      setCurrentView('evaluations');
    } else if (role === 'Vendor') {
      setCurrentView('tenders');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleReseed = async () => {
    if (!window.confirm('Reset database to clean baseline demo dataset?')) return;
    setReseeding(true);
    try {
      await api.reseed(true);
      await loadAllData();
      if (selectedProjectId) {
        await loadProjectDetail(selectedProjectId);
      }
      alert('PRAVI database successfully reseeded to clean baseline state.');
    } catch (err) {
      alert('Reseed failed: ' + err.message);
    } finally {
      setReseeding(false);
    }
  };

  const handleSubmitEvaluation = async (evalId, payload) => {
    const res = await api.submitEvaluation(evalId, payload);
    await loadAllData();
    if (selectedProjectId) {
      await loadProjectDetail(selectedProjectId);
    }
    return res;
  };

  const handleAdvanceTimeline = async (issueId, payload) => {
    const res = await api.advanceTimeline(issueId, payload, currentRole);
    await loadAllData();
    if (selectedProjectId) {
      await loadProjectDetail(selectedProjectId);
    }
    return res;
  };

  const handleCreateMaintenance = async (data) => {
    const res = await api.createMaintenance(data, currentRole);
    await loadAllData();
    if (selectedProjectId) {
      await loadProjectDetail(selectedProjectId);
    }
    return res;
  };

  const handleCompleteMaintenance = async (maintId) => {
    const res = await api.completeMaintenance(maintId, currentRole);
    await loadAllData();
    if (selectedProjectId) {
      await loadProjectDetail(selectedProjectId);
    }
    return res;
  };

  const handleVerifyMaintenance = async (maintId, payload) => {
    const res = await api.verifyMaintenance(maintId, payload);
    await loadAllData();
    if (selectedProjectId) {
      await loadProjectDetail(selectedProjectId);
    }
    return res;
  };

  const handleAddMonitoringRule = async (projectId, rule) => {
    const res = await api.addMonitoringRule(projectId, rule);
    await loadProjectDetail(projectId);
    return res;
  };

  const handleAddComment = async (projId, comment) => {
    await api.addComment(projId, comment);
    await loadProjectDetail(projId);
  };

  const handleAddChangeRequest = async (projId, cr) => {
    await api.addChangeRequest(projId, cr);
    await loadProjectDetail(projId);
  };

  const handleRespondChangeRequest = async (projId, crId, response) => {
    await api.respondChangeRequest(projId, crId, response);
    await loadProjectDetail(projId);
  };

  const handleCreateProject = async (data) => {
    const res = await api.createProject(data, currentRole);
    await loadAllData();
    await loadProjectDetail(res.data.id);
  };

  const handleMarkNotificationRead = async (notifId) => {
    await api.markNotificationRead(notifId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    );
  };

  const handleOpenMaintenanceForIssue = (issue) => {
    const linkedMaint = maintenance.find((m) => m.issue_id === issue.id || m.id === issue.maintenance_id);
    setActiveMaintenanceData({ issue, maintenance: linkedMaint || null });
  };

  const activeDistrictName = currentRole === 'District-2' ? 'Surat' : 'Ahmedabad';
  const activeRegionName = currentRole === 'District-2' ? 'Surat Region' : 'Ahmedabad Region';
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // 1. Landing View
  if (currentRole === 'landing') {
    return (
      <RoleSelectView
        stats={stats}
        onSelectRole={handleSelectRole}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'landing') {
            setCurrentRole('landing');
          } else {
            setCurrentView(view);
          }
        }}
        onReseed={handleReseed}
        reseeding={reseeding}
        unreadNotificationsCount={unreadCount}
        onOpenNotifications={() => setShowNotificationsDrawer(true)}
        onOpenAuditLogs={() => setShowAuditLogModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {loading && !projects.length ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-slate-500 font-semibold">Loading PRAVI Infrastructure Registry...</p>
          </div>
        ) : (
          <>
            {/* View 1: Project Detail (Single Source of Truth) */}
            {currentView === 'project-detail' && selectedProject && (
              <ProjectDetailView
                project={selectedProject}
                currentRole={currentRole}
                onBack={() => {
                  if (currentRole === 'Citizen') setCurrentView('citizen');
                  else if (currentRole === 'Evaluator') setCurrentView('evaluations');
                  else if (currentRole === 'Vendor') setCurrentView('tenders');
                  else setCurrentView('dashboard');
                }}
                onOpenEvaluation={(ev) => setActiveEvaluationModal(ev || evaluations[0])}
                onOpenChangeRequest={() => setShowChangeRequestModal(true)}
                onOpenMaintenanceModal={handleOpenMaintenanceForIssue}
                onAdvanceTimeline={handleAdvanceTimeline}
                onAddComment={handleAddComment}
                onRespondChangeRequest={handleRespondChangeRequest}
                onAddMonitoringRule={handleAddMonitoringRule}
              />
            )}

            {/* View 2: State Dashboard */}
            {currentView === 'dashboard' && currentRole === 'State' && (
              <StateDashboardView
                projects={projects}
                stats={stats}
                hierarchy={hierarchy}
                onSelectProject={(id) => loadProjectDetail(id)}
                onOpenChangeRequest={() => setShowChangeRequestModal(true)}
              />
            )}

            {/* View 3: District Dashboard (District-1 Ahmedabad & District-2 Surat) */}
            {currentView === 'dashboard' && (currentRole === 'District-1' || currentRole === 'District-2') && (
              <DistrictDashboardView
                districtName={activeDistrictName}
                projects={projects}
                issues={issues}
                evaluations={evaluations}
                maintenance={maintenance}
                onSelectProject={(id) => loadProjectDetail(id)}
                onOpenNewProject={() => setShowNewProjectModal(true)}
                onOpenEvaluation={(ev) => setActiveEvaluationModal(ev)}
                onSelectIssue={(iss) => loadProjectDetail(iss.project_id)}
                onOpenMaintenanceModal={handleOpenMaintenanceForIssue}
              />
            )}

            {/* View 4: Infrastructure List (State & Districts) */}
            {currentView === 'projects' && (
              <StateDashboardView
                projects={projects}
                stats={stats}
                hierarchy={hierarchy}
                onSelectProject={(id) => loadProjectDetail(id)}
                onOpenChangeRequest={() => setShowChangeRequestModal(true)}
              />
            )}

            {/* View 5: Field Evaluator Dashboard */}
            {(currentView === 'evaluations' || (currentView === 'dashboard' && currentRole === 'Evaluator')) && (
              <EvaluatorDashboardView
                evaluations={evaluations}
                onOpenEvaluation={(ev) => setActiveEvaluationModal(ev)}
                onSelectProject={(id) => loadProjectDetail(id)}
              />
            )}

            {/* View 6: Issues Monitor with Explainable Causes & Aging */}
            {currentView === 'issues' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Active Operational Exceptions</h2>
                    <p className="text-xs text-slate-500">
                      Rule-detected non-conformances with active operational resolution timelines
                    </p>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-700 font-bold">
                    {issues.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length} Active Issues
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {issues.map((iss) => (
                    <div
                      key={iss.id}
                      onClick={() => loadProjectDetail(iss.project_id)}
                      className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-5 cursor-pointer transition shadow-sm group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                            {iss.id}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
                            {iss.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-mono">
                            Aging: <strong className="text-amber-700">{iss.aging_days || 3} days</strong>
                          </span>
                          <StatusBadge status={iss.status || 'OPEN'} />
                        </div>
                      </div>

                      {/* Traceable Cause Explanation */}
                      <div className="mt-3 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-slate-700">
                        <p>
                          <strong>Cause:</strong> <span className="text-rose-700 font-bold">{iss.detected_metric || iss.parameter}</span> measured at{' '}
                          <span className="text-rose-700 font-bold">{iss.detected_value || iss.observed_value}</span>, breaching threshold ({iss.operator || '<'} {iss.threshold_value || '60'}).
                        </p>
                        {iss.detection_reason && (
                          <p className="text-[11px] text-slate-600 italic mt-0.5">
                            "{iss.detection_reason}"
                          </p>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>
                          Infrastructure: <strong className="text-slate-800">{iss.project_name}</strong> • Jurisdiction: {iss.district} District
                        </span>
                        <span className="text-blue-700 font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                          Open Resolution Timeline →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View 7: Maintenance Workflows */}
            {currentView === 'maintenance' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Infrastructure Maintenance Workflows</h2>
                    <p className="text-xs text-slate-500">
                      Active corrective remediation activities, scheduled repairs, and evaluator verification statuses
                    </p>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-bold">
                    {maintenance.length} Active Workflows
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {maintenance.map((m) => (
                    <div
                      key={m.id}
                      className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-blue-600" />
                          <span className="font-mono text-xs font-bold text-blue-700">{m.id}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          m.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                          m.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {m.status}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">{m.infrastructure_name}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{m.description}</p>

                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Contractor</span>
                          <span className="font-bold text-slate-800 truncate block">{m.assigned_party}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Scheduled Date</span>
                          <span className="font-mono text-slate-800">{m.scheduled_date}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Estimated Budget</span>
                          <span className="font-bold text-slate-800">₹{m.cost_estimate_cr} Cr</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Target Exception</span>
                          <span className="font-mono text-rose-700 font-semibold">{m.issue_id}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <button
                          onClick={() => loadProjectDetail(m.infrastructure_id)}
                          className="text-xs font-semibold text-blue-700 hover:underline"
                        >
                          View Infrastructure Asset →
                        </button>

                        <button
                          onClick={() => setActiveMaintenanceData({ issue: null, maintenance: m })}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                        >
                          Manage Workflow
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View 8: Third-Party Vendor / Tenders Portal */}
            {(currentView === 'tenders' || (currentView === 'dashboard' && currentRole === 'Vendor')) && (
              <VendorTenderView
                tenders={tenders}
                onSelectProject={(id) => loadProjectDetail(id)}
              />
            )}

            {/* View 9: Citizen Public Portal */}
            {(currentView === 'citizen' || (currentView === 'dashboard' && currentRole === 'Citizen')) && (
              <CitizenPortalView
                projects={projects}
                onSelectProject={(id) => loadProjectDetail(id)}
              />
            )}
          </>
        )}
      </main>

      {/* MODAL 1: Field Evaluation Modal */}
      {activeEvaluationModal && (
        <EvaluationModal
          evaluation={activeEvaluationModal}
          onClose={() => setActiveEvaluationModal(null)}
          onSubmitEvaluation={handleSubmitEvaluation}
        />
      )}

      {/* MODAL 2: State Change Request Modal */}
      {showChangeRequestModal && selectedProject && (
        <ChangeRequestModal
          projectId={selectedProject.id}
          projectName={selectedProject.name}
          onClose={() => setShowChangeRequestModal(false)}
          onSubmitChangeRequest={handleAddChangeRequest}
        />
      )}

      {/* MODAL 3: New Project Registration Modal */}
      {showNewProjectModal && (
        <NewProjectModal
          district={activeDistrictName}
          region={activeRegionName}
          onClose={() => setShowNewProjectModal(false)}
          onCreateProject={handleCreateProject}
        />
      )}

      {/* MODAL 4: Maintenance Workflow Modal */}
      {activeMaintenanceData && (
        <MaintenanceModal
          issue={activeMaintenanceData.issue}
          maintenance={activeMaintenanceData.maintenance}
          currentRole={currentRole}
          onClose={() => setActiveMaintenanceData(null)}
          onCreateMaintenance={handleCreateMaintenance}
          onCompleteMaintenance={handleCompleteMaintenance}
          onVerifyMaintenance={handleVerifyMaintenance}
        />
      )}

      {/* MODAL 5: Notifications Drawer */}
      {showNotificationsDrawer && (
        <NotificationsDrawer
          notifications={notifications}
          onClose={() => setShowNotificationsDrawer(false)}
          onMarkRead={handleMarkNotificationRead}
          onSelectEntity={(type, id) => {
            setShowNotificationsDrawer(false);
            if (type === 'project' || type === 'issue') {
              loadProjectDetail(id.startsWith('ISSUE') ? 'RNB-2026-001' : id);
            }
          }}
        />
      )}

      {/* MODAL 6: System Audit Trail Modal */}
      {showAuditLogModal && (
        <AuditLogModal
          onClose={() => setShowAuditLogModal(false)}
        />
      )}
    </div>
  );
}
