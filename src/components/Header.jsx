import React from 'react';
import { 
  FileText, 
  Search, 
  FileCheck, 
  Activity, 
  LogOut,
  Layers
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  currentRole, 
  currentUsername,
  onLogout
}) {
  // All possible tabs
  const allNavItems = [
    { id: 'guided', label: 'Guided Workflow', icon: Layers, primary: true, roles: ['admin', 'engineer', 'reviewer'] },
    { id: 'documents', label: 'Document Library', icon: FileText, roles: ['admin', 'engineer', 'reviewer', 'viewer'] },
    { id: 'search', label: 'Search Documents', icon: Search, roles: ['admin', 'engineer', 'reviewer', 'viewer'] },
    { id: 'sovereignty', label: 'Sovereignty', icon: Activity, roles: ['admin', 'engineer', 'reviewer', 'viewer'] },
    { id: 'audit', label: 'Activity Log', icon: FileCheck, roles: ['admin', 'reviewer'] },
  ];

  const roleId = currentRole?.id || 'engineer';
  const navItems = allNavItems.filter(item => item.roles.includes(roleId));

  return (
    <header className="border-b border-navy-800 bg-[#0A192F] text-slate-100 select-none">
      {/* Top Offline & Local Sovereignty Status Strip */}
      <div className="border-b border-navy-800/80 bg-[#071322] px-4 sm:px-6 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-[11px] text-slate-300 font-sans">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span className="font-semibold text-emerald-400">Air-Gapped & Local</span>
          <span className="text-slate-500">—</span>
          <span className="text-slate-300">All data & calculations stay on this machine. Zero external transmission.</span>
        </div>
        <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-2">
          <span>Host: 127.0.0.1:5000</span>
          <span>&bull;</span>
          <span className="text-emerald-400 font-semibold">External Calls: 0</span>
        </div>
      </div>

      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Subtitle */}
        <div className="flex items-center space-x-3">
          <div className="rounded-lg border border-amber-500/80 bg-navy-900 p-2 text-amber-400 font-mono font-bold text-base shadow-sm">
            SAI
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-serif font-bold text-white tracking-tight">Sovereign-AI</h1>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700">
                v2.6 Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              On-Premise Industrial AI Workbench
            </p>
          </div>
        </div>

        {/* Navigation Tabs Filtered by Role */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs font-sans">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg transition-all duration-150 border ${
                  isActive
                    ? 'bg-navy-800 text-amber-400 border-amber-500/80 font-semibold shadow-sm'
                    : item.primary
                    ? 'bg-navy-900/80 text-slate-200 border-slate-700 hover:border-slate-500 hover:bg-navy-800'
                    : 'bg-transparent text-slate-300 border-transparent hover:border-slate-700 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Corner: User Profile & Clearly Visible "Log Out" Button */}
        <div className="flex items-center space-x-3 shrink-0">
          {/* Current User & Role Badge */}
          <div className="px-3 py-1.5 bg-navy-900/90 rounded-lg border border-slate-700 flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold font-mono text-xs">
              {currentRole?.avatar || 'ID'}
            </div>
            <div className="text-left font-sans">
              <div className="text-xs font-bold text-white leading-tight flex items-center space-x-1.5">
                <span>{currentUsername || 'user'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">
                  {currentRole?.name || 'Engineer'}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-sans leading-none mt-0.5">
                {currentRole?.department || 'Operations'}
              </div>
            </div>
          </div>

          {/* Clearly Visible Log Out Button visible on every authenticated screen */}
          <button
            onClick={onLogout}
            id="header-logout-button"
            className="px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/60 active:bg-rose-900 text-rose-200 hover:text-white rounded-lg border border-rose-800/60 hover:border-rose-600 text-xs font-semibold flex items-center space-x-1.5 transition-all duration-150 shadow-sm"
            title="End session and return to login screen"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
