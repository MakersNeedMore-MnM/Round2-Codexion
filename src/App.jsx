import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LoginScreen from './components/LoginScreen';
import GuidedWorkflow from './components/GuidedWorkflow';
import DocumentDepot from './components/DocumentDepot';
import KnowledgeBase from './components/KnowledgeBase';
import SovereigntyHero from './components/SovereigntyHero';
import AuditLogView from './components/AuditLogView';

import { 
  fetchRoles, 
  fetchDocuments, 
  fetchSovereigntyMetrics 
} from './services/api';
import { ToastProvider } from './components/Toast';

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

function AppContent() {
  // Authentication state: user starts on LoginScreen (Step 1)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [roles, setRoles] = useState([]);
  const [currentRole, setCurrentRole] = useState(null);
  const [currentUsername, setCurrentUsername] = useState('r.vance');

  // Navigation tab state (default: 'guided' or 'documents' for viewer)
  const [activeTab, setActiveTab] = useState('guided');

  // Document state
  const [documents, setDocuments] = useState([]);
  const [restrictedCount, setRestrictedCount] = useState(0);

  // Sovereignty telemetry
  const [sovereigntyData, setSovereigntyData] = useState(null);

  // Initial load: fetch roles and telemetry
  useEffect(() => {
    loadInitialRoles();
  }, []);

  // Whenever role changes and user is logged in, fetch documents for that role
  useEffect(() => {
    if (currentRole && isLoggedIn) {
      loadDocumentsForRole(currentRole.id);
    }
  }, [currentRole, isLoggedIn]);

  // Periodic sovereignty telemetry polling
  useEffect(() => {
    const pollMetrics = async () => {
      try {
        const metrics = await fetchSovereigntyMetrics();
        setSovereigntyData(metrics);
      } catch (e) {}
    };
    pollMetrics();
    const interval = setInterval(pollMetrics, 6000);
    return () => clearInterval(interval);
  }, []);

  const loadInitialRoles = async () => {
    try {
      const [rolesRes, metricsRes] = await Promise.all([
        fetchRoles(),
        fetchSovereigntyMetrics(),
      ]);
      setRoles(rolesRes.roles || []);
      setSovereigntyData(metricsRes);
    } catch (err) {
      console.error('Initial load error:', err);
    }
  };

  const loadDocumentsForRole = async (roleId) => {
    try {
      const data = await fetchDocuments(roleId);
      setDocuments(data.accessible || []);
      setRestrictedCount(data.restrictedCount || 0);
    } catch (err) {
      console.error('Failed to fetch documents for role:', err);
    }
  };

  // Called when user logs in from LoginScreen
  const handleLogin = (role, username) => {
    setCurrentRole(role);
    setCurrentUsername(username || 'r.vance');
    setIsLoggedIn(true);

    // Default tab per role
    if (role.id === 'viewer') {
      setActiveTab('documents');
    } else {
      setActiveTab('guided');
    }
    loadDocumentsForRole(role.id);
  };

  // Clearly visible Log Out action: ends session and returns to login screen
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentRole(null);
    setCurrentUsername('');
  };

  // If user is not logged in, render the Login Screen
  if (!isLoggedIn) {
    return (
      <LoginScreen
        roles={roles}
        onSelectRole={handleLogin}
      />
    );
  }

  // Once logged in, show the Sovereign-AI Workbench with persistent Header & Stepper
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-amber-500 selection:text-slate-950">
      {/* Persistent Industrial Header with Log Out Button & Role Badge */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        currentUsername={currentUsername}
        onLogout={handleLogout}
        sovereigntyData={sovereigntyData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* TAB 1: GUIDED WORKFLOW */}
        {activeTab === 'guided' && (
          <GuidedWorkflow
            currentRole={currentRole}
            documents={documents}
            restrictedCount={restrictedCount}
            onRefreshDocs={() => loadDocumentsForRole(currentRole.id)}
            onOpenSovereignty={() => setActiveTab('sovereignty')}
            onSwitchRole={handleLogout}
          />
        )}

        {/* TAB 2: DOCUMENT LIBRARY */}
        {activeTab === 'documents' && (
          <DocumentDepot
            documents={documents}
            restrictedCount={restrictedCount}
            currentRole={currentRole}
            onDocumentUploaded={() => loadDocumentsForRole(currentRole.id)}
            onSelectDocumentForAnalysis={(doc) => {
              setActiveTab('guided');
            }}
            onOpenSovereigntyTab={() => setActiveTab('sovereignty')}
          />
        )}

        {/* TAB 3: SEARCH ARCHIVES */}
        {activeTab === 'search' && (
          <KnowledgeBase
            currentRole={currentRole}
            onSelectDocument={(doc) => {
              setActiveTab('guided');
            }}
          />
        )}

        {/* TAB 4: AIR-GAP SOVEREIGNTY PROOF */}
        {activeTab === 'sovereignty' && (
          <SovereigntyHero
            sovereigntyData={sovereigntyData}
            onRefresh={async () => {
              const res = await fetchSovereigntyMetrics();
              setSovereigntyData(res);
            }}
          />
        )}

        {/* TAB 5: COMPLIANCE AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <AuditLogView
            currentRole={currentRole}
          />
        )}
      </main>

      {/* Persistent Workplace Footer */}
      <footer className="border-t border-slate-200 bg-white py-3 px-6 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-navy-900 font-bold font-serif">Sovereign-AI</span>
          <span>&bull;</span>
          <span className="text-emerald-700 font-semibold">100% on-premise air-gapped execution</span>
          <span>&bull;</span>
          <span className="font-mono text-[11px] text-slate-500">Host: 127.0.0.1:5000</span>
        </div>
        <div className="text-xs text-slate-500">
          User: <strong className="text-slate-800">{currentUsername}</strong> &bull; Station Role: <strong className="text-navy-900">{currentRole?.name}</strong> ({currentRole?.department}) &bull; External Calls: <span className="font-mono font-bold text-emerald-700">0</span>
        </div>
      </footer>
    </div>
  );
}
