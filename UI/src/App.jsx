import React, { useState, useEffect } from 'react';
import { api } from './api';

// Components
import Navbar from './components/Navbar';
import EvaluationModal from './components/EvaluationModal';
import ChangeRequestModal from './components/ChangeRequestModal';
import NewProjectModal from './components/NewProjectModal';

// Views
import RoleSelectView from './views/RoleSelectView';
import StateDashboardView from './views/StateDashboardView';
import DistrictDashboardView from './views/DistrictDashboardView';
import ProjectDetailView from './views/ProjectDetailView';
import EvaluatorDashboardView from './views/EvaluatorDashboardView';
import VendorTenderView from './views/VendorTenderView';
import CitizenPortalView from './views/CitizenPortalView';

export default function App() {
  const [currentRole, setCurrentRole] = useState('landing');
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState('RNB-2026-001');

  // Application Data State
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [issues, setIssues] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [hierarchy, setHierarchy] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reseeding, setReseeding] = useState(false);

  // Modals
  const [activeEvaluationModal, setActiveEvaluationModal] = useState(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);

  // Initial Data Load
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [projRes, evalRes, issueRes, tenderRes, hierRes, statsRes] = await Promise.all([
        api.getProjects().catch(() => ({ data: [] })),
        api.getEvaluations().catch(() => ({ data: [] })),
        api.getIssues().catch(() => ({ data: [] })),
        api.getTenders().catch(() => ({ data: [] })),
        api.getHierarchy().catch(() => null),
        api.getStats().catch(() => null),
      ]);

      setProjects(projRes.data || []);
      setEvaluations(evalRes.data || []);
      setIssues(issueRes.data || []);
      setTenders(tenderRes.data || []);
      setHierarchy(hierRes);
      setStats(statsRes);
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
    const res = await api.advanceTimeline(issueId, payload);
    await loadAllData();
    if (selectedProjectId) {
      await loadProjectDetail(selectedProjectId);
    }
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
    const res = await api.createProject(data);
    await loadAllData();
    await loadProjectDetail(res.data.id);
  };

  const activeDistrictName = currentRole === 'District-2' ? 'Surat' : 'Ahmedabad';
  const activeRegionName = currentRole === 'District-2' ? 'Surat Region' : 'Ahmedabad Region';

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
                onAdvanceTimeline={handleAdvanceTimeline}
                onAddComment={handleAddComment}
                onRespondChangeRequest={handleRespondChangeRequest}
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
                onSelectProject={(id) => loadProjectDetail(id)}
                onOpenNewProject={() => setShowNewProjectModal(true)}
                onOpenEvaluation={(ev) => setActiveEvaluationModal(ev)}
                onSelectIssue={(iss) => loadProjectDetail(iss.project_id)}
              />
            )}

            {/* View 4: Projects List */}
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

            {/* View 6: Issues Monitor */}
            {currentView === 'issues' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Active Operational Exceptions</h2>
                    <p className="text-xs text-slate-500">
                      Rule-detected non-conformances with active operational timelines
                    </p>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-700 font-bold">
                    {issues.filter(i => i.status !== 'RESOLVED').length} Active Issues
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
                            Detected: {iss.detected_date}
                          </span>
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                            {iss.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 mt-2">
                        Project: <strong className="text-slate-800">{iss.project_name}</strong> • Jurisdiction: {iss.district} District ({iss.responsible_org})
                      </p>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>
                          Parameter: <strong className="text-rose-700">{iss.parameter}</strong> (Observed: {iss.observed_value})
                        </span>
                        <span className="text-blue-700 font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                          Open Operational Timeline →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View 7: Third-Party Vendor / Tenders Portal */}
            {(currentView === 'tenders' || (currentView === 'dashboard' && currentRole === 'Vendor')) && (
              <VendorTenderView
                tenders={tenders}
                onSelectProject={(id) => loadProjectDetail(id)}
              />
            )}

            {/* View 8: Citizen Public Portal */}
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
    </div>
  );
}
