import React, { useState, useEffect } from 'react';
import { 
  ArrowRight,
  Lock,
  User,
  Shield,
  Layers,
  FileCheck2
} from 'lucide-react';

export default function LoginScreen({ roles = [], onSelectRole }) {
  // Default fallback roles (matching Requirement 1)
  const defaultRoles = [
    {
      id: 'admin',
      name: 'Admin',
      title: 'Chief Plant Administrator & Security Officer',
      department: 'Executive Operations & Compliance',
      description: 'Full access to all 8 document categories, all tasks, audit ledger, sovereignty monitor, and session management.',
      accessibleCategories: ['P&IDs & Drawings', 'SOPs', 'Maintenance', 'Inspection', 'Manuals', 'Operations', 'Spreadsheets', 'Correspondence'],
      suggestedUser: 'admin.director'
    },
    {
      id: 'engineer',
      name: 'Engineer',
      title: 'Process & Reliability Lead Engineer',
      department: 'Engineering & Maintenance',
      description: 'Access to technical/operational documents needed for engineering work: P&IDs, SOPs, maintenance, inspection, manuals, operational reports, spreadsheets. Cannot see internal correspondence.',
      accessibleCategories: ['P&IDs & Drawings', 'SOPs', 'Maintenance', 'Inspection', 'Manuals', 'Operations', 'Spreadsheets'],
      suggestedUser: 'r.vance'
    },
    {
      id: 'reviewer',
      name: 'Reviewer',
      title: 'Compliance & Quality Assurance Reviewer',
      department: 'Quality Assurance & Regulatory Oversight',
      description: 'Access to documents needing review/approval — inspection, maintenance, and internal correspondence — with authority to approve/reject flagged sensitive items. Cannot see P&IDs/drawings.',
      accessibleCategories: ['Inspection Reports', 'Maintenance Reports', 'Internal Correspondence'],
      suggestedUser: 'reviewer.qa'
    },
    {
      id: 'viewer',
      name: 'Viewer',
      title: 'Operations Station Observer',
      department: 'General Operations (Read-Only)',
      description: 'Read-only, narrow access — SOPs and general operational reports only. Cannot upload, cannot approve sensitive content, cannot see maintenance/inspection reports, correspondence, or drawings.',
      accessibleCategories: ['SOPs', 'Operational Reports'],
      suggestedUser: 'ops.viewer'
    }
  ];

  const activeRoles = roles.length > 0 ? roles : defaultRoles;

  const [selectedRoleId, setSelectedRoleId] = useState(activeRoles[0]?.id || 'engineer');
  const [username, setUsername] = useState('r.vance');
  const [password, setPassword] = useState('••••••••••••');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentRole = activeRoles.find(r => r.id === selectedRoleId) || activeRoles[0];

  // Auto-update suggested username when changing role if user hasn't typed a custom one
  const handleRoleChange = (e) => {
    const newRoleId = e.target.value;
    setSelectedRoleId(newRoleId);
    const newRole = activeRoles.find(r => r.id === newRoleId);
    const defaults = {
      admin: 'admin.director',
      engineer: 'r.vance',
      reviewer: 'reviewer.qa',
      viewer: 'ops.viewer'
    };
    setUsername(defaults[newRoleId] || newRole?.suggestedUser || 'user');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!username.trim()) {
      newErrors.username = 'Please enter your username';
    }
    if (!password.trim()) {
      newErrors.password = 'Please enter your password';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      if (onSelectRole) {
        onSelectRole(currentRole, username.trim() || 'r.vance');
      }
    }, 400);
  };

  const isFormValid = username.trim().length > 0 && password.trim().length > 0;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans text-slate-900">
      
      {/* LEFT PANEL (~40%): Solid Deep Navy Branding & Architectural Vector Motif */}
      <div className="w-full md:w-[42%] lg:w-[38%] bg-[#0A192F] text-white p-8 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-navy-800">
        
        {/* Decorative background gradient */}
        <div className="absolute inset-0 opacity-10 pointer-events-none blueprint-grid-dark" />
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Header Brand */}
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-navy-900 border border-amber-500/80 text-amber-400 font-mono font-bold text-base shadow-sm">
              SAI
            </div>
            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight">
              Sovereign-AI
            </h1>
            <p className="text-sm text-slate-300 font-sans leading-relaxed max-w-sm">
              On-premise sovereign intelligence workbench for industrial refinery operations and confidential engineering workflows.
            </p>
          </div>

          {/* Architectural Vector Schematic */}
          <div className="py-2">
            <div className="p-5 rounded-xl bg-navy-950/70 border border-slate-700/70 shadow-inner">
              <svg 
                viewBox="0 0 320 150" 
                className="w-full h-auto text-slate-300 stroke-current fill-none"
                style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }}
              >
                {/* Structural Reference Grid */}
                <path d="M 20 35 L 300 35" stroke="#1E3A5F" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M 20 75 L 300 75" stroke="#1E3A5F" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M 20 115 L 300 115" stroke="#1E3A5F" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M 80 15 L 80 135" stroke="#1E3A5F" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M 160 15 L 160 135" stroke="#1E3A5F" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M 240 15 L 240 135" stroke="#1E3A5F" strokeWidth="1" strokeDasharray="3 3" />

                {/* Primary Data Pathway (Enclosed Local Loop) */}
                <path d="M 50 75 L 110 35 L 210 35 L 270 75 L 210 115 L 110 115 Z" stroke="#F2A104" strokeWidth="1.75" />
                <path d="M 110 35 L 160 75 L 210 35" stroke="#7492AB" strokeWidth="1.2" />
                <path d="M 110 115 L 160 75 L 210 115" stroke="#7492AB" strokeWidth="1.2" />
                
                {/* Node Junctions */}
                <circle cx="50" cy="75" r="4" fill="#0A192F" stroke="#F2A104" strokeWidth="2" />
                <circle cx="110" cy="35" r="4" fill="#0A192F" stroke="#F2A104" strokeWidth="2" />
                <circle cx="210" cy="35" r="4" fill="#0A192F" stroke="#F2A104" strokeWidth="2" />
                <circle cx="270" cy="75" r="4" fill="#0A192F" stroke="#F2A104" strokeWidth="2" />
                <circle cx="210" cy="115" r="4" fill="#0A192F" stroke="#F2A104" strokeWidth="2" />
                <circle cx="110" cy="115" r="4" fill="#0A192F" stroke="#F2A104" strokeWidth="2" />
                <circle cx="160" cy="75" r="5" fill="#F2A104" stroke="#0A192F" strokeWidth="1.5" />

                {/* Vector Labels */}
                <text x="35" y="92" fill="#CBD7E3" fontSize="9" fontFamily="monospace">INPUT</text>
                <text x="135" y="68" fill="#F2A104" fontSize="9" fontFamily="monospace" fontWeight="bold">LOCAL IPC</text>
                <text x="245" y="92" fill="#CBD7E3" fontSize="9" fontFamily="monospace">AIR-GAP</text>
              </svg>

              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>ISOLATED WORKSTATION ENCLAVE</span>
                <span className="text-amber-400 font-semibold">127.0.0.1 : 5000</span>
              </div>
            </div>
          </div>

          {/* Operational Guarantees */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start space-x-3 text-xs text-slate-300">
              <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span><strong>Hardware & Process Socket Guard:</strong> All outbound external calls are trapped and dropped with 0 bytes transmitted.</span>
            </div>
            <div className="flex items-start space-x-3 text-xs text-slate-300">
              <Layers className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span><strong>Server-Enforced Roles:</strong> Data queries strictly filter records matching Admin, Engineer, Reviewer, or Viewer scopes.</span>
            </div>
            <div className="flex items-start space-x-3 text-xs text-slate-300">
              <FileCheck2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span><strong>One-at-a-Time Consent:</strong> Flagged sensitive items are approved individually before entering local model processing.</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-8 border-t border-navy-800 text-xs text-slate-400 font-mono flex items-center justify-between">
          <span>Host: 127.0.0.1</span>
          <span>v2.6 Enterprise</span>
        </div>
      </div>

      {/* RIGHT PANEL (~60%): Clean Workspace with Role Selector Form */}
      <div className="w-full md:w-[58%] lg:w-[62%] flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 sm:p-10 shadow-xl shadow-slate-200/70 border border-slate-200 space-y-6">
          
          {/* Form Header */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
              Sign in to your station
            </h2>
            <p className="text-sm text-slate-500 font-sans mt-1.5 leading-relaxed">
              Select your operational role. Data access is enforced server-side according to role qualifications.
            </p>
          </div>

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Field 1: Role Selector (Admin, Engineer, Reviewer, Viewer) */}
            <div className="space-y-1.5">
              <label htmlFor="role-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Operational Role
              </label>
              <div className="relative">
                <select
                  id="role-select"
                  value={selectedRoleId}
                  onChange={handleRoleChange}
                  className="w-full h-11 px-3.5 pr-9 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer appearance-none font-sans font-semibold"
                >
                  {activeRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — {r.title}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Dynamic Role Scope & Description Box */}
              {currentRole && (
                <div className="text-[12px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider font-mono">
                      Permitted Scope:
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      {currentRole.name} Access
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-sans leading-relaxed">
                    {currentRole.description}
                  </p>
                  <div className="text-[11px] text-slate-700 font-medium pt-1 border-t border-slate-200">
                    <span className="text-slate-500 font-normal">Categories:</span>{' '}
                    {currentRole.accessibleCategories?.join(', ')}
                  </div>
                </div>
              )}
            </div>

            {/* Field 2: Username */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Operator Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors(prev => ({ ...prev, username: null }));
                  }}
                  placeholder="e.g. r.vance"
                  className={`w-full h-11 px-3.5 pl-10 rounded-lg border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-sans ${
                    errors.username ? 'border-red-500 bg-red-50/20' : 'border-slate-300 hover:border-slate-400'
                  }`}
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
              {errors.username && (
                <p className="text-xs text-red-600 mt-1 font-medium">{errors.username}</p>
              )}
            </div>

            {/* Field 3: Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <span className="text-xs text-slate-400 font-mono">
                  local-pin
                </span>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: null }));
                  }}
                  placeholder="••••••••••••"
                  className={`w-full h-11 px-3.5 pl-10 rounded-lg border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-sans ${
                    errors.password ? 'border-red-500 bg-red-50/20' : 'border-slate-300 hover:border-slate-400'
                  }`}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 mt-1 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Field 4: Primary Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="login-submit-button"
                disabled={!isFormValid || isSubmitting}
                className="w-full h-11 rounded-lg bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-sans font-semibold text-sm shadow-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Authorizing credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Station as {currentRole?.name}</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </>
                )}
              </button>
            </div>

            {/* Prototype note */}
            <p className="text-center text-xs text-slate-400 font-sans pt-1">
              On-Premise Demonstration Mode &bull; Any password accepted
            </p>
          </form>
        </div>
      </div>

    </div>
  );
}
