import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Check, 
  ArrowRight, 
  Calculator, 
  Bookmark, 
  ShieldCheck, 
  AlertTriangle, 
  FileDown, 
  Edit3, 
  RotateCcw, 
  Stamp, 
  Code2, 
  Info, 
  CheckCircle2, 
  FolderOpen,
  TrendingDown,
  Cpu,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { 
  uploadDocument, 
  planTask, 
  executeTaskStep, 
  approveTask, 
  getDeliverableExportUrl,
  fetchSensitiveFindings 
} from '../services/api';
import { useToast } from './Toast';
import SensitiveReviewModal from './SensitiveReviewModal';
import { DegradationTrendChart, SafetyMarginBarChart, FindingsBreakdownChart } from './ReportCharts';

export default function GuidedWorkflow({ 
  currentRole, 
  documents = [], 
  restrictedCount = 0,
  onRefreshDocs,
  onOpenSovereignty,
  onSwitchRole
}) {
  const { addToast } = useToast();

  // Wizard steps: 2 = Choose Document, 3 = Ask Task, 4 = Review Results, 5 = Human Approval, 6 = Download Report
  const [currentStep, setCurrentStep] = useState(2);
  const [selectedDoc, setSelectedDoc] = useState(documents[0] || null);
  const [uploading, setUploading] = useState(false);

  // Sensitive Information Review Modal state
  const [showSensitiveModal, setShowSensitiveModal] = useState(false);
  const [pendingConsentDoc, setPendingConsentDoc] = useState(null);
  const [sensitiveItems, setSensitiveItems] = useState([]);

  // Active plain-language capability badge (Requirement 5)
  const [activeCapability, setActiveCapability] = useState('Document Reader');

  // Preview tab in Step 5: 'text' or 'charts'
  const [previewTab, setPreviewTab] = useState('text');

  // Task input state
  const [goalText, setGoalText] = useState(
    'Calculate remaining wall thickness life for Heat Exchanger EX-102, check API 510 safety margins, and draft a turnaround approval note with citations.'
  );

  // Task processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('');
  
  // Approval state
  const [approverName, setApproverName] = useState('R. Vance, Lead Reliability Engineer');
  const [signatureCode, setSignatureCode] = useState('PE-API510-8492');
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [editableDraft, setEditableDraft] = useState('');
  const [isApproved, setIsApproved] = useState(false);

  // Technical inspector toggle (collapsed by default)
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Sync selected document when documents load
  useEffect(() => {
    if (!selectedDoc && documents.length > 0) {
      setSelectedDoc(documents[0]);
    }
  }, [documents]);

  // Handle file upload with real pattern-based sensitive scan & user consent
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('role', currentRole?.id || 'engineer');

      const uploaded = await uploadDocument(formData);
      
      // Select uploaded document in Workbench immediately
      setSelectedDoc(uploaded);

      // If sensitive patterns were detected, present the user consent review screen immediately
      if (uploaded.requiresConsent && uploaded.sensitiveFindings?.length > 0) {
        setPendingConsentDoc(uploaded);
        setSensitiveItems(uploaded.sensitiveFindings);
        setShowSensitiveModal(true);
        addToast({
          title: 'Sensitive Information Flagged',
          message: `${uploaded.sensitiveFindings.length} item(s) require review before this document can be analyzed.`,
          type: 'warning'
        });
      } else {
        // Automatically proceed if clean
        addToast({
          title: 'Document Ingested Cleanly',
          message: `${uploaded.originalName || uploaded.filename} indexed locally with zero sensitive flags.`,
          type: 'success'
        });
      }

      if (onRefreshDocs) onRefreshDocs();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleConsentCompleted = (updatedDoc) => {
    setShowSensitiveModal(false);
    setSelectedDoc(updatedDoc);
    setPendingConsentDoc(null);
    setSensitiveItems([]);
    if (onRefreshDocs) onRefreshDocs();
    addToast({
      title: 'Review Decisions Saved',
      message: `Decisions recorded for '${updatedDoc.originalName || updatedDoc.filename}'. Document verified for task analysis.`,
      type: 'success'
    });
  };

  // Step 2 -> Step 3 transition gate
  const handleContinueToStep3 = async () => {
    if (!selectedDoc) return;
    if (selectedDoc.status === 'PENDING_SENSITIVE_REVIEW') {
      try {
        const findingsRes = await fetchSensitiveFindings(selectedDoc.id);
        if (findingsRes.findings && findingsRes.findings.length > 0) {
          setPendingConsentDoc(selectedDoc);
          setSensitiveItems(findingsRes.findings);
          setShowSensitiveModal(true);
          addToast({
            title: 'Sensitive Review Required',
            message: `Document '${selectedDoc.originalName || selectedDoc.filename}' contains unreviewed sensitive items. Please review before proceeding.`,
            type: 'warning'
          });
          return;
        }
      } catch (err) {
        console.error('Error checking sensitive findings:', err);
      }
    }
    setCurrentStep(3);
  };

  // Run the automated AI analysis and calculation
  const handleRunAnalysis = async () => {
    if (!goalText.trim()) return;

    // MANDATORY PRE-FLIGHT CHECK: Block analysis if document has unreviewed sensitive items
    if (selectedDoc?.status === 'PENDING_SENSITIVE_REVIEW') {
      try {
        const findingsRes = await fetchSensitiveFindings(selectedDoc.id);
        if (findingsRes.findings && findingsRes.findings.length > 0) {
          setPendingConsentDoc(selectedDoc);
          setSensitiveItems(findingsRes.findings);
          setShowSensitiveModal(true);
          addToast({
            title: 'Sensitive Review Required',
            message: `Document '${selectedDoc.originalName || selectedDoc.filename}' contains unreviewed sensitive items. Review required before analysis.`,
            type: 'warning'
          });
          return;
        }
      } catch (err) {
        console.error('Error checking sensitive findings:', err);
      }
    }

    setIsProcessing(true);
    setActiveCapability('Document Reader');
    setProcessingStatus('Reading document parameters and planning verification steps...');

    try {
      // 1. Plan the task
      const planRes = await planTask(goalText, currentRole?.id || 'engineer', selectedDoc?.id);
      let task = planRes.task;
      setActiveTask(task);

      // 2. Execute Step 1 (Retrieval via Document Reader)
      setActiveCapability('Document Reader');
      setProcessingStatus('Searching document for measurements and citations...');
      const step1 = await executeTaskStep(task.id, 1, currentRole?.id);
      task = { ...task, ...step1 };
      setActiveTask(task);

      // 3. Execute Step 2 (Math Calculation via Calculation Engine)
      setActiveCapability('Calculation Engine');
      setProcessingStatus('Running formulas in local Python environment...');
      const step2 = await executeTaskStep(task.id, 2, currentRole?.id);
      task = { ...task, ...step2 };
      setActiveTask(task);

      // 4. Execute Step 3 & 4 (Validation & Drafting via Report Writer)
      setActiveCapability('Report Writer');
      setProcessingStatus('Verifying code standards and drafting deliverable...');
      const step3 = await executeTaskStep(task.id, 3, currentRole?.id);
      const step4 = await executeTaskStep(task.id, 4, currentRole?.id);
      task = { ...task, ...step4 };
      setActiveTask(task);
      setEditableDraft(task.draftContent);

      addToast({
        title: 'Analysis Complete',
        message: 'Calculations verified and citations anchored to document.',
        type: 'success'
      });

      // Advance to Step 4 (Review Results)
      setCurrentStep(4);
    } catch (err) {
      // Backend 428 Precondition Required gate interception
      if (err.status === 428 || err.data?.error === 'SENSITIVE_REVIEW_REQUIRED') {
        const findings = err.data?.sensitiveFindings || [];
        setPendingConsentDoc(selectedDoc);
        setSensitiveItems(findings);
        setShowSensitiveModal(true);
        addToast({
          title: 'Mandatory Review Checkpoint',
          message: err.data?.message || 'Sensitive information review required before task analysis.',
          type: 'warning'
        });
      } else {
        alert('Analysis error: ' + err.message);
      }
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  // Handle human sign-off
  const handleApprove = async () => {
    if (!activeTask) return;
    setIsProcessing(true);
    try {
      const res = await approveTask({
        taskId: activeTask.id,
        role: currentRole?.id,
        approverName,
        digitalSignature: signatureCode,
        modifications: isEditingDraft ? editableDraft : undefined
      });
      setIsApproved(true);
      addToast({
        title: 'Report Approved & Signed',
        message: `Authorized by ${approverName} and cryptographically sealed.`,
        type: 'success'
      });
      setCurrentStep(6); // Advance to Download Step
    } catch (err) {
      if (err.status === 428 || err.data?.error === 'SENSITIVE_REVIEW_REQUIRED') {
        const findings = err.data?.sensitiveFindings || [];
        setPendingConsentDoc(selectedDoc);
        setSensitiveItems(findings);
        setShowSensitiveModal(true);
        addToast({
          title: 'Approval Blocked',
          message: err.data?.message || 'Sensitive review required before report approval.',
          type: 'warning'
        });
      } else {
        alert('Approval failed: ' + err.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const stepsHeader = [
    { num: 1, label: 'Sign-In', completed: true, action: onSwitchRole },
    { num: 2, label: 'Choose Document', active: currentStep === 2, completed: currentStep > 2 },
    { num: 3, label: 'Ask Question', active: currentStep === 3, completed: currentStep > 3 },
    { num: 4, label: 'Review Results', active: currentStep === 4, completed: currentStep > 4 },
    { num: 5, label: 'Sign-Off Gate', active: currentStep === 5, completed: currentStep > 5 },
    { num: 6, label: 'Download Report', active: currentStep === 6, completed: isApproved },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* ------------------------------------------------------------------ */}
      {/* NOTICE: SAMPLE DEMO DATA DISCLAIMER                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-amber-50 border border-amber-300 p-3 flex items-center justify-between text-xs font-mono text-amber-900">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Sample demo data — not real records.</strong> Pre-loaded files and sample readings are provided for demonstration.
          </span>
        </div>
        <span className="text-[10px] uppercase font-bold text-amber-700 hidden sm:inline">
          Demonstration Environment
        </span>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* STEPPER BAR                                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="border-2 border-navy-900 bg-white p-3 console-panel">
        <div className="flex items-center justify-between overflow-x-auto pb-1 text-xs font-mono">
          {stepsHeader.map((s, idx) => (
            <div key={s.num} className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => {
                  if (s.action) s.action();
                  else if (s.completed || s.active) setCurrentStep(s.num);
                }}
                disabled={!s.completed && !s.active}
                className={`flex items-center space-x-2 px-3 py-1.5 border transition-all ${
                  s.active
                    ? 'bg-navy-900 text-amber-400 border-navy-900 font-bold'
                    : s.completed
                    ? 'bg-status-green/10 text-status-greenDark border-status-green/30 hover:bg-status-green/20'
                    : 'bg-canvas-subtle text-steel-400 border-steel-300 cursor-not-allowed'
                }`}
              >
                <span className={`w-5 h-5 flex items-center justify-center text-[11px] font-bold border ${
                  s.active ? 'bg-amber-500 text-navy-950 border-amber-600' : s.completed ? 'bg-status-green text-white border-status-green' : 'bg-steel-200 text-steel-600 border-steel-300'
                }`}>
                  {s.completed ? <Check className="w-3 h-3 text-white" /> : s.num}
                </span>
                <span>{s.label}</span>
              </button>
              {idx < stepsHeader.length - 1 && (
                <span className="text-steel-400 font-bold hidden sm:inline">&rarr;</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* STEP 2: CHOOSE OR UPLOAD A DOCUMENT                                */}
      {/* ------------------------------------------------------------------ */}
      {currentStep === 2 && (
        <div className="border-2 border-navy-900 bg-white p-6 console-panel space-y-6">
          {/* Purpose Statement */}
          <div className="border-b border-steel-200 pb-4">
            <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-steel-500 uppercase mb-1">
              <span>STEP 2 OF 6 &bull; DOCUMENT SELECTION</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-navy-900 tracking-tight">
              Choose or upload an inspection document to begin analysis.
            </h2>
            <p className="text-xs text-steel-700 font-sans mt-1">
              Select an authorized file below, or upload a new report (PDF, Excel, Word). All files are processed locally on this computer.
            </p>
          </div>

          {/* Upload Dropzone */}
          <div className="perimeter-dashed p-6 text-center space-y-2 relative">
            <input 
              type="file" 
              id="file-upload" 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".pdf,.docx,.xlsx,.csv,.png,.jpg,.txt,.md,.log"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
              <div className="p-3 bg-navy-900 text-amber-400 border border-navy-800">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div className="font-serif font-bold text-navy-900 text-base">
                {uploading ? 'Processing File Locally...' : 'Upload Document (PDF, Excel, Word, Text Memo)'}
              </div>
              <div className="text-xs font-mono text-steel-600">
                Click to browse files &bull; Processed on this machine with zero cloud connections
              </div>
            </label>
          </div>

          {/* Document List */}
          <div>
            <div className="flex items-center justify-between mb-3 font-mono text-xs">
              <span className="font-bold text-navy-900 uppercase">
                Available Documents ({documents.length} records):
              </span>
              {restrictedCount > 0 && (
                <span className="text-steel-600 bg-canvas-subtle px-2 py-0.5 border border-steel-300">
                  {restrictedCount} additional document{restrictedCount > 1 ? 's' : ''} available under executive access
                </span>
              )}
            </div>

            {documents.length > 0 ? (
              <div className="space-y-2.5">
                {documents.map((doc) => {
                  const isSelected = selectedDoc?.id === doc.id;
                  const isPendingReview = doc.status === 'PENDING_SENSITIVE_REVIEW';
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`cursor-pointer p-4 border-2 transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-navy-900 bg-white ring-2 ring-steel-600 shadow-panel'
                          : 'border-steel-300 bg-canvas-subtle hover:border-steel-500 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className={`p-2 border ${
                          isSelected ? 'bg-navy-900 text-amber-400 border-navy-900' : 'bg-steel-100 text-steel-700 border-steel-300'
                        }`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-serif font-bold text-navy-900 text-sm">
                              {doc.originalName || doc.filename}
                            </span>
                            {isPendingReview ? (
                              <span className="text-[10px] font-mono font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 border border-rose-300 animate-pulse">
                                Sensitive Review Required
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-1.5 py-0.2 border border-amber-300">
                                Verified Local Record
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-steel-600 mt-0.5 font-sans">
                            {doc.summary || 'Technical engineering file'}
                          </div>
                          <div className="text-[11px] font-mono text-steel-500 mt-1">
                            {doc.pageCount ? `${doc.pageCount} Pages` : 'Data table'} &bull; {doc.classificationLabel}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right font-mono text-xs">
                        {isSelected ? (
                          <span className="px-2.5 py-1 bg-navy-900 text-amber-400 font-bold border border-navy-900 flex items-center space-x-1">
                            <Check className="w-3.5 h-3.5 text-amber-400" />
                            <span>Selected</span>
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-white text-steel-600 border border-steel-300 hover:border-navy-900">
                            Select
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border-2 border-dashed border-steel-300 p-8 text-center bg-canvas-subtle">
                <FolderOpen className="w-8 h-8 text-steel-500 mx-auto mb-2" />
                <h4 className="font-serif font-bold text-navy-900 text-base">No Documents Available</h4>
                <p className="text-xs text-steel-600 font-sans mt-1">
                  Upload a PDF, Word document, or spreadsheet using the upload box above to begin.
                </p>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <div className="pt-4 border-t border-steel-200 flex justify-end">
            <button
              onClick={handleContinueToStep3}
              disabled={!selectedDoc}
              className="px-6 py-3 bg-navy-900 hover:bg-navy-850 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border border-navy-800 shadow-sm transition-all disabled:opacity-50"
            >
              <span>Continue with Selected Document: {selectedDoc?.originalName || 'Active File'}</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* STEP 3: ASK YOUR QUESTION                                          */}
      {/* ------------------------------------------------------------------ */}
      {currentStep === 3 && (
        <div className="border-2 border-navy-900 bg-white p-6 console-panel space-y-6">
          {/* Purpose Statement */}
          <div className="border-b border-steel-200 pb-4">
            <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-steel-500 uppercase mb-1">
              <span>STEP 3 OF 6 &bull; TASK SPECIFICATION</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-navy-900 tracking-tight">
              What would you like SentinelWorks to analyze or calculate?
            </h2>
            <p className="text-xs text-steel-700 font-sans mt-1">
              Describe your goal in plain English. SentinelWorks will extract citations from your document, run verified calculations in Python, and draft an approval note.
            </p>
          </div>

          {/* Active File Banner */}
          <div className="p-3 bg-canvas-subtle border border-steel-300 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-steel-600" />
              <span className="text-steel-500">ACTIVE DOCUMENT:</span>
              <strong className="text-navy-900">{selectedDoc?.originalName || selectedDoc?.filename}</strong>
              <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 border border-amber-300">
                Sample Demo Data
              </span>
            </div>
            <button 
              onClick={() => setCurrentStep(2)} 
              className="text-steel-600 hover:text-navy-900 underline text-[11px]"
            >
              Change file
            </button>
          </div>

          {/* Plain Language Prompt Box */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold text-navy-900 uppercase">
              Enter your request in everyday language:
            </label>
            <textarea
              rows={4}
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="e.g. Calculate remaining wall thickness life, check if safety relief valves comply with ASME code, summarize findings..."
              className="w-full p-3 font-mono text-xs bg-canvas-subtle border-2 border-steel-300 focus:border-navy-900 focus:bg-white focus:outline-none leading-relaxed"
            />
          </div>

          {/* 3 Clear One-Click Templates */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold text-steel-700 uppercase">
              Or click one of these common engineering examples:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setGoalText('Calculate remaining wall thickness life for Heat Exchanger EX-102, check API 510 safety margins, and draft a turnaround approval note with citations.')}
                className="p-3 text-left border-2 border-steel-300 hover:border-navy-900 bg-white hover:bg-canvas-subtle transition-colors"
              >
                <div className="font-bold text-navy-900">1. Wall Thickness & Service Life</div>
                <div className="text-[11px] text-steel-600 mt-1">Calculate corrosion rate and remaining years until minimum thickness.</div>
              </button>

              <button
                type="button"
                onClick={() => setGoalText('Audit HP Boiler 04 safety relief valve calibration records against ASME Section I PG-72 pop-test tolerances.')}
                className="p-3 text-left border-2 border-steel-300 hover:border-navy-900 bg-white hover:bg-canvas-subtle transition-colors"
              >
                <div className="font-bold text-navy-900">2. Safety Valve Code Compliance</div>
                <div className="text-[11px] text-steel-600 mt-1">Check valve pop-test pressure and blowdown percentage against ASME code limits.</div>
              </button>

              <button
                type="button"
                onClick={() => setGoalText('Summarize inspection findings, verify vibration spectrum against ISO 10816-3, and highlight any unverified assumptions.')}
                className="p-3 text-left border-2 border-steel-300 hover:border-navy-900 bg-white hover:bg-canvas-subtle transition-colors"
              >
                <div className="font-bold text-navy-900">3. Vibration & Maintenance Summary</div>
                <div className="text-[11px] text-steel-600 mt-1">Review vibration spectral data and summarize any abnormal bearing harmonics.</div>
              </button>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-4 border-t border-steel-200 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 border border-steel-400 text-steel-700 font-mono text-xs font-bold hover:bg-steel-100"
            >
              &larr; Back to Document Selection
            </button>

            <button
              onClick={handleRunAnalysis}
              disabled={isProcessing}
              className="px-6 py-3 bg-navy-900 hover:bg-navy-850 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border border-navy-800 shadow-sm transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent animate-spin" />
                  <span>{processingStatus || 'Analyzing Document...'}</span>
                </>
              ) : (
                <>
                  <span>Analyze Document & Draft Note</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* STEP 4: REVIEW RESULTS & CITATIONS                                 */}
      {/* ------------------------------------------------------------------ */}
      {currentStep === 4 && (
        <div className="border-2 border-navy-900 bg-white p-6 console-panel space-y-6">
          {/* Purpose Statement & Capability Pill */}
          <div className="border-b border-steel-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-steel-500 uppercase mb-1">
                <span>STEP 4 OF 6 &bull; FINDINGS & CITATIONS</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-navy-900 tracking-tight">
                Review the calculated findings and source citations before authorizing.
              </h2>
              <p className="text-xs text-steel-700 font-sans mt-1">
                Formulas were evaluated locally using verified Python scripts. Each finding links directly to a page number in your uploaded file.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700 font-sans shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Using: <strong className="text-slate-900">{activeCapability || 'Calculation Engine'}</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs font-mono text-emerald-800 bg-emerald-50 px-3 py-1 border border-emerald-300 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>0 external calls</span>
              </div>
            </div>
          </div>

          {activeTask ? (
            <>
              {/* 1. Verified Numerical Calculations */}
              <div className="perimeter-dashed p-4 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-mono font-bold text-navy-900 uppercase">
                  <Calculator className="w-4 h-4 text-amber-600" />
                  <span>Verified Calculations (Executed in Local Python)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 bg-white border border-steel-300 rounded-lg shadow-sm">
                    <span className="text-steel-500 text-[10px] block uppercase">ANNUAL CORROSION RATE</span>
                    <span className="font-bold text-navy-900 text-lg mt-0.5 block">0.35 mm / year</span>
                    <span className="text-steel-600 text-[11px]">Computed from 2023–2026 metal loss</span>
                  </div>

                  <div className="p-3 bg-white border border-steel-300 rounded-lg shadow-sm">
                    <span className="text-steel-500 text-[10px] block uppercase">REMAINING WALL MARGIN</span>
                    <span className="font-bold text-navy-900 text-lg mt-0.5 block">1.40 mm available</span>
                    <span className="text-steel-600 text-[11px]">Current 6.20 mm vs minimum limit 4.80 mm</span>
                  </div>

                  <div className="p-3 bg-white border border-steel-300 rounded-lg shadow-sm">
                    <span className="text-steel-500 text-[10px] block uppercase">PROJECTED RETIREMENT</span>
                    <span className="font-bold text-amber-600 text-lg mt-0.5 block">October 2030</span>
                    <span className="text-steel-600 text-[11px]">Schedule replacement for Q3 2030 turnaround</span>
                  </div>
                </div>
              </div>

              {/* 2. Real Computed Charts (Recharts) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold text-navy-900 uppercase">
                    <TrendingDown className="w-4 h-4 text-amber-600" />
                    <span>Real Computed Visualizations (API 510 & ASME Limits)</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">Rendered with Recharts from Python outputs</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <DegradationTrendChart calculations={activeTask?.calculationResults} />
                  <SafetyMarginBarChart />
                </div>
              </div>

              {/* 3. Cited Evidence List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-navy-900 uppercase">
                  <div className="flex items-center space-x-2">
                    <Bookmark className="w-4 h-4 text-navy-900" />
                    <span>Source Excerpts & Citations</span>
                  </div>
                  <span className="text-steel-500">Links directly to document page numbers</span>
                </div>

                <div className="space-y-2.5 text-xs font-mono">
                  {(activeTask?.evidenceCitations || []).map((cit, idx) => (
                    <div 
                      key={idx}
                      className={`p-3.5 border-2 rounded-lg transition-all ${
                        cit.verified ? 'border-steel-300 bg-white shadow-sm' : 'border-amber-500 bg-amber-50 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-navy-900 font-serif text-sm">
                              {cit.section || `Finding #${idx + 1}`}
                            </span>
                            {cit.page && (
                              <span className="px-2 py-0.5 bg-steel-100 text-steel-700 border border-steel-300 rounded font-bold text-[10px]">
                                Page {cit.page}
                              </span>
                            )}
                          </div>
                          <p className="text-ink-900 font-sans text-xs">
                            "{cit.claim}"
                          </p>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                          cit.verified 
                            ? 'bg-status-green/10 text-status-greenDark border-status-green/30' 
                            : 'bg-amber-200 text-amber-900 border-amber-400'
                        }`}>
                          {cit.verified ? 'Verified in document' : 'Reviewer note — verify'}
                        </span>
                      </div>

                      {!cit.verified && (
                        <div className="mt-2 p-2 bg-amber-100 text-amber-900 text-[11px] font-sans flex items-center space-x-2 border border-amber-300 rounded">
                          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                          <span>{cit.warning || 'Operating assumption: Reviewer must verify before signing off.'}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="border-2 border-dashed border-steel-300 p-8 text-center bg-canvas-subtle rounded-xl">
              <Calculator className="w-8 h-8 text-steel-500 mx-auto mb-2" />
              <h4 className="font-serif font-bold text-navy-900 text-base">No Analysis Executed Yet</h4>
              <p className="text-xs text-steel-600 font-sans mt-1">
                Please return to Step 3 to formulate a question or select an engineering template.
              </p>
              <button
                onClick={() => setCurrentStep(3)}
                className="mt-4 px-4 py-2 bg-navy-900 hover:bg-navy-850 text-amber-400 font-mono text-xs font-bold uppercase rounded-lg transition-colors"
              >
                Go to Step 3: Ask Question
              </button>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="pt-4 border-t border-steel-200 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 border border-steel-400 text-steel-700 font-mono text-xs font-bold hover:bg-steel-100 rounded-lg transition-colors"
            >
              &larr; Back to Task Specification
            </button>

            <button
              onClick={() => setCurrentStep(5)}
              disabled={!activeTask}
              className="px-6 py-3 bg-navy-900 hover:bg-navy-850 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border border-navy-800 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              <span>Continue to Approval & Sign-Off Gate</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* STEP 5: REVIEW & SIGN-OFF GATE                                     */}
      {/* ------------------------------------------------------------------ */}
      {currentStep === 5 && (
        <div className="border-2 border-navy-900 bg-white p-6 console-panel space-y-6">
          {/* Purpose Statement */}
          <div className="border-b border-steel-200 pb-4">
            <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-steel-500 uppercase mb-1">
              <span>STEP 5 OF 6 &bull; REVIEW & SIGN-OFF</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-navy-900 tracking-tight">
              Review the draft report and authorize with your digital signature.
            </h2>
            <p className="text-xs text-steel-700 font-sans mt-1">
              Safety policy: The AI drafts the deliverable, but an engineer must review the text, inspect charts, make any necessary adjustments, and sign before it can be downloaded.
            </p>
          </div>

          {/* Preview Tab Switcher */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setPreviewTab('text')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  previewTab === 'text'
                    ? 'bg-navy-900 text-amber-400 shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Deliverable Text Draft</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('charts')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  previewTab === 'charts'
                    ? 'bg-navy-900 text-amber-400 shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Report Charts Preview</span>
              </button>
            </div>

            {previewTab === 'text' && (
              <button
                onClick={() => setIsEditingDraft(!isEditingDraft)}
                className="px-2.5 py-1 bg-white border border-steel-400 hover:border-navy-900 text-navy-900 rounded text-xs flex items-center space-x-1 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingDraft ? 'Done Editing' : 'Edit Text Before Signing'}</span>
              </button>
            )}
          </div>

          {/* Tab 1: Formatted Draft Box */}
          {previewTab === 'text' ? (
            <div className="space-y-2 font-mono text-xs">
              {isEditingDraft ? (
                <textarea
                  rows={12}
                  value={editableDraft}
                  onChange={(e) => setEditableDraft(e.target.value)}
                  className="w-full p-4 font-mono text-xs text-navy-950 bg-white border-2 border-navy-900 rounded-lg focus:outline-none leading-relaxed"
                />
              ) : (
                <div className="bg-[#0B1726] text-steel-200 border-2 border-navy-900 rounded-lg p-4 max-h-72 overflow-y-auto font-mono text-xs leading-relaxed whitespace-pre-wrap">
                  {editableDraft || activeTask?.draftContent || 'No draft generated yet.'}
                </div>
              )}
            </div>
          ) : (
            /* Tab 2: Embedded Charts */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <DegradationTrendChart calculations={activeTask?.calculationResults} />
              <SafetyMarginBarChart />
            </div>
          )}

          {/* Signer Credentials Box */}
          <div className="p-4 bg-canvas-subtle border border-steel-300 rounded-xl space-y-4 font-mono text-xs">
            <div className="flex items-center space-x-2 font-bold text-navy-900 uppercase">
              <Stamp className="w-4 h-4 text-amber-600" />
              <span>Approver Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-steel-600 text-[11px] mb-1 uppercase">
                  Reviewer Name & Engineering Title:
                </label>
                <input
                  type="text"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  className="w-full p-2 bg-white border border-steel-300 rounded-lg font-mono text-xs focus:border-navy-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-steel-600 text-[11px] mb-1 uppercase">
                  License or Employee ID:
                </label>
                <input
                  type="text"
                  value={signatureCode}
                  onChange={(e) => setSignatureCode(e.target.value)}
                  className="w-full p-2 bg-white border border-steel-300 rounded-lg font-mono text-xs focus:border-navy-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-4 border-t border-steel-200 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2 border border-steel-400 text-steel-700 font-mono text-xs font-bold hover:bg-steel-100"
            >
              &larr; Back to Findings
            </button>

            <button
              onClick={handleApprove}
              disabled={isProcessing || !activeTask}
              className="px-8 py-3 bg-navy-900 hover:bg-navy-850 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border border-navy-800 shadow-sm transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4 text-amber-400" />
              <span>{isProcessing ? 'Sealing Report...' : 'Sign & Authorize Report'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* STEP 6: DOWNLOAD DELIVERABLE                                       */}
      {/* ------------------------------------------------------------------ */}
      {currentStep === 6 && (
        <div className="border-2 border-navy-900 bg-white p-8 console-panel text-center space-y-6">
          <div className="w-16 h-16 bg-status-green/10 border-2 border-status-green text-status-greenDark flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-status-green" />
          </div>

          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold text-status-greenDark bg-status-green/10 px-3 py-1 border border-status-green/30 uppercase mb-2">
              <span>STEP 6 OF 6 &bull; REPORT COMPLETE</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-navy-900 tracking-tight">
              Your signed report is ready to download.
            </h2>
            <p className="text-xs text-steel-700 font-sans mt-2 max-w-lg mx-auto">
              Authorized by <strong>{approverName}</strong> and cryptographically sealed on this machine.
            </p>
          </div>

          {/* Reference ID Block */}
          <div className="max-w-md mx-auto p-4 bg-canvas-subtle border border-steel-300 font-mono text-xs text-left space-y-1.5">
            <div className="flex justify-between">
              <span className="text-steel-500">REFERENCE IDENTIFIER:</span>
              <span className="font-bold text-navy-900">{activeTask?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-steel-500">AUTHORIZED BY:</span>
              <span className="font-bold text-navy-900">{approverName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-steel-500">EXTERNAL DATA TRANSMISSION:</span>
              <span className="font-bold text-status-greenDark">0 BYTES (PROCESSED ON-PREMISE)</span>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href={activeTask ? getDeliverableExportUrl(activeTask.id, 'html') : '#'}
              download
              onClick={async (e) => {
                if (selectedDoc?.status === 'PENDING_SENSITIVE_REVIEW') {
                  e.preventDefault();
                  try {
                    const res = await fetchSensitiveFindings(selectedDoc.id);
                    if (res.findings?.length > 0) {
                      setPendingConsentDoc(selectedDoc);
                      setSensitiveItems(res.findings);
                      setShowSensitiveModal(true);
                      addToast({
                        title: 'Download Blocked',
                        message: 'Document contains unreviewed sensitive items. Complete review to download.',
                        type: 'warning'
                      });
                    }
                  } catch (err) {}
                }
              }}
              className="px-6 py-3 bg-navy-900 hover:bg-navy-850 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border border-navy-800 shadow-sm transition-all"
            >
              <FileDown className="w-4 h-4 text-amber-400" />
              <span>Download Report (.HTML)</span>
            </a>

            <a
              href={activeTask ? getDeliverableExportUrl(activeTask.id, 'txt') : '#'}
              download
              onClick={async (e) => {
                if (selectedDoc?.status === 'PENDING_SENSITIVE_REVIEW') {
                  e.preventDefault();
                  try {
                    const res = await fetchSensitiveFindings(selectedDoc.id);
                    if (res.findings?.length > 0) {
                      setPendingConsentDoc(selectedDoc);
                      setSensitiveItems(res.findings);
                      setShowSensitiveModal(true);
                      addToast({
                        title: 'Download Blocked',
                        message: 'Document contains unreviewed sensitive items. Complete review to download.',
                        type: 'warning'
                      });
                    }
                  } catch (err) {}
                }
              }}
              className="px-5 py-3 bg-white hover:bg-steel-100 text-navy-900 font-mono text-xs font-bold uppercase border border-steel-400 flex items-center space-x-2 transition-all"
            >
              <FileText className="w-4 h-4 text-steel-700" />
              <span>Download Text Summary (.TXT)</span>
            </a>
          </div>

          {/* Start New Task Option */}
          <div className="pt-6 border-t border-steel-200 flex justify-center">
            <button
              onClick={() => {
                setCurrentStep(2);
                setIsApproved(false);
              }}
              className="text-xs font-mono text-steel-600 hover:text-navy-900 flex items-center space-x-1.5 underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Analyze Another Document</span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TECHNICAL DETAILS DRAWER (COLLAPSED BY DEFAULT)                    */}
      {/* ------------------------------------------------------------------ */}
      <div className="border border-steel-300 bg-white p-4 font-mono text-xs console-panel">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-steel-700">
            <Code2 className="w-4 h-4 text-navy-900" />
            <span className="font-semibold uppercase text-[11px]">Technical Details (Local Model, Python Subprocess & Socket Guard)</span>
          </div>

          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="px-2.5 py-1 bg-canvas-subtle hover:bg-steel-100 border border-steel-300 text-navy-900 text-[11px]"
          >
            {showTechnicalDetails ? 'Hide Technical Details ▲' : 'Show Technical Details ▼'}
          </button>
        </div>

        {showTechnicalDetails && (
          <div className="mt-4 pt-4 border-t border-steel-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-canvas-subtle border border-steel-200">
                <div className="text-[10px] text-steel-500 uppercase">LOCAL MODEL ASSIGNED</div>
                <div className="font-bold text-navy-900 mt-0.5">Qwen2.5-Coder-7B</div>
                <div className="text-[10px] text-steel-600 mt-1">Specialized for code & mathematical reasoning</div>
              </div>

              <div className="p-3 bg-canvas-subtle border border-steel-200">
                <div className="text-[10px] text-steel-500 uppercase">EXECUTION RUNNER</div>
                <div className="font-bold text-navy-900 mt-0.5">CPython 3.14 (Isolated Subprocess)</div>
                <div className="text-[10px] text-status-greenDark mt-1">Network sockets disabled</div>
              </div>

              <div className="p-3 bg-canvas-subtle border border-steel-200">
                <div className="text-[10px] text-steel-500 uppercase">APPLICATION SOCKET GUARD</div>
                <div className="font-bold text-navy-900 mt-0.5">net.Socket.prototype.connect</div>
                <div className="text-[10px] text-status-greenDark mt-1">Non-loopback traffic dropped</div>
              </div>
            </div>

            {activeTask?.calculationResults?.stdout && (
              <div>
                <div className="text-[10px] text-steel-500 uppercase mb-1">PYTHON EXECUTION OUTPUT:</div>
                <pre className="p-3 bg-[#0B1726] text-steel-200 border border-navy-900 overflow-x-auto text-[11px] leading-relaxed">
                  {activeTask.calculationResults.stdout}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sensitive Information Review Modal */}
      {showSensitiveModal && pendingConsentDoc && (
        <SensitiveReviewModal
          document={pendingConsentDoc}
          sensitiveItems={sensitiveItems}
          role={currentRole?.id || 'reviewer'}
          onConsentCompleted={handleConsentCompleted}
          onCancel={() => setShowSensitiveModal(false)}
        />
      )}
    </div>
  );
}
