import React from 'react';
import {
  Layers,
  Shield,
  Building2,
  HardHat,
  Briefcase,
  Users,
  RefreshCw,
  ArrowLeftRight
} from 'lucide-react';

export const ROLES = [
  { id: 'State', label: 'State Authority', icon: Shield, color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { id: 'District-1', label: 'District-1 (Ahmedabad)', icon: Building2, color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { id: 'District-2', label: 'District-2 (Surat)', icon: Building2, color: 'text-teal-700 bg-teal-50 border-teal-200' },
  { id: 'Evaluator', label: 'Field Evaluator', icon: HardHat, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { id: 'Vendor', label: 'Third-Party Company', icon: Briefcase, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  { id: 'Citizen', label: 'Citizen (Public Portal)', icon: Users, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
];

export default function Navbar({
  currentRole,
  onSelectRole,
  currentView,
  onNavigate,
  onReseed,
  reseeding
}) {
  const activeRoleConfig = ROLES.find((r) => r.id === currentRole) || ROLES[0];
  const RoleIcon = activeRoleConfig.icon;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-900 tracking-tight font-mono">
                  PRAVI
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  Gujarat R&B
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Infrastructure Monitoring System
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition ${
                currentView === 'dashboard'
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Dashboard
            </button>

            {currentRole !== 'Citizen' && (
              <button
                onClick={() => onNavigate('projects')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  currentView === 'projects'
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                Projects
              </button>
            )}

            {(currentRole === 'State' || currentRole.startsWith('District')) && (
              <button
                onClick={() => onNavigate('issues')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  currentView === 'issues'
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                Issues & Timelines
              </button>
            )}

            {(currentRole === 'State' || currentRole.startsWith('District') || currentRole === 'Evaluator') && (
              <button
                onClick={() => onNavigate('evaluations')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  currentView === 'evaluations'
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                Evaluations
              </button>
            )}

            {(currentRole === 'State' || currentRole.startsWith('District') || currentRole === 'Vendor') && (
              <button
                onClick={() => onNavigate('tenders')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  currentView === 'tenders'
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                Tenders
              </button>
            )}

            {currentRole === 'Citizen' && (
              <button
                onClick={() => onNavigate('citizen')}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200"
              >
                Public Transparency Portal
              </button>
            )}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            {/* Quick Reseed */}
            <button
              onClick={onReseed}
              disabled={reseeding}
              title="Reset Demo Dataset"
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reseeding ? 'animate-spin text-blue-600' : ''}`} />
              <span className="hidden xl:inline text-[11px] font-medium">Reset Demo</span>
            </button>

            {/* Role Switcher Dropdown */}
            <div className="relative group">
              <button
                type="button"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-sm transition ${activeRoleConfig.color}`}
              >
                <RoleIcon className="w-3.5 h-3.5" />
                <span>{activeRoleConfig.label}</span>
                <ArrowLeftRight className="w-3 h-3 opacity-60 ml-0.5" />
              </button>

              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150 z-50">
                <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Switch Active Role
                  </span>
                </div>
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const isActive = role.id === currentRole;
                  return (
                    <button
                      key={role.id}
                      onClick={() => onSelectRole(role.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition text-left ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-slate-500" />
                      <span>{role.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Return to Home / Exit */}
            <button
              onClick={() => onNavigate('landing')}
              title="Return to Home"
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
