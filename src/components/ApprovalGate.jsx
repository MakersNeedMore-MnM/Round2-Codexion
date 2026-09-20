import React, { useState } from 'react';
import { 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  FileCheck, 
  ShieldCheck, 
  FileDown, 
  AlertTriangle,
  Fingerprint,
  Stamp
} from 'lucide-react';
import { approveTask, rejectTask } from '../services/api';

export default function ApprovalGate({ 
  activeTask, 
  currentRole, 
  onApproved, 
  onRejected,
  onOpenDeliverable
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(activeTask?.draftContent || '');
  const [approverName, setApproverName] = useState('R. Vance, Lead Mechanical Integrity Engineer');
  const [signatureCode, setSignatureCode] = useState('PE-CERT-API510-8492');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!activeTask || !activeTask.draftContent) {
    return (
      <div className="bg-white border-2 border-navy-900 shadow-panel p-5 text-center text-xs font-mono text-steel-500">
        Deliverable draft has not been synthesized yet. Complete Steps 1 through 4 in the Task Planner to reach the Human Approval Gate.
      </div>
    );
  }

  const isApproved = activeTask.approvalStatus === 'APPROVED';
  const isRejected = activeTask.approvalStatus === 'REJECTED';

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      const res = await approveTask({
        taskId: activeTask.id,
        role: currentRole?.id || 'engineer',
        approverName,
        digitalSignature: signatureCode,
        modifications: isEditing ? draftContent : undefined
      });
      setIsEditing(false);
      if (onApproved) onApproved(res);
    } catch (err) {
      alert('Approval failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide an engineering reason for rejection.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await rejectTask({
        taskId: activeTask.id,
        role: currentRole?.id || 'engineer',
        approverName,
        reason: rejectionReason
      });
      setShowRejectBox(false);
      if (onRejected) onRejected(res);
    } catch (err) {
      alert('Rejection failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border-2 border-navy-900 shadow-panel p-5 space-y-5">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-steel-200 pb-3 gap-2">
        <div className="flex items-center space-x-2.5">
          <Stamp className="w-5 h-5 text-navy-900" />
          <div>
            <h2 className="text-base font-serif font-bold text-navy-900">
              Certified Human Approval & Digital Sign-Off Gate
            </h2>
            <p className="text-xs font-mono text-steel-500">
              Mandatory Gatekeeper: AI synthesizes, certified personnel authorizes. Nothing can be downloaded without an attested signature.
            </p>
          </div>
        </div>

        <div>
          {isApproved ? (
            <span className="flex items-center space-x-1.5 px-3 py-1 bg-status-green/10 text-status-greenDark border border-status-green font-mono text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-status-green" />
              <span>DIGITALLY SIGNED & AUTHORIZED</span>
            </span>
          ) : isRejected ? (
            <span className="flex items-center space-x-1.5 px-3 py-1 bg-status-red/10 text-status-redDark border border-status-red font-mono text-xs font-bold">
              <XCircle className="w-4 h-4 text-status-red" />
              <span>REJECTED BY REVIEWER</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 px-3 py-1 bg-amber-500 text-navy-950 border border-amber-600 font-mono text-xs font-bold animate-pulse">
              <Lock className="w-4 h-4" />
              <span>HOLDING AT APPROVAL GATE</span>
            </span>
          )}
        </div>
      </div>

      {/* Deliverable Review Body */}
      <div className="space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between bg-canvas-subtle p-2 border border-steel-300">
          <span className="text-steel-600 font-semibold">SYNTHESIZED DELIVERABLE DRAFT</span>
          <div className="flex items-center space-x-2">
            {!isApproved && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-2.5 py-1 text-[11px] bg-white border border-steel-300 hover:border-navy-900 text-navy-900 flex items-center space-x-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditing ? 'View Formatted' : 'Edit Text In-Place'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Text Area / Preview */}
        {isEditing ? (
          <textarea
            rows={14}
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            className="w-full p-4 font-mono text-xs text-navy-950 bg-canvas-pure border-2 border-navy-900 focus:outline-none leading-relaxed"
          />
        ) : (
          <div className="bg-[#0B1726] text-steel-200 border-2 border-navy-900 p-4 max-h-72 overflow-y-auto font-mono text-xs leading-relaxed whitespace-pre-wrap">
            {activeTask.draftContent}
          </div>
        )}
      </div>

      {/* Sign-Off & Credentials Terminal Box */}
      {!isApproved && !isRejected && (
        <div className="p-4 bg-canvas-subtle border-2 border-navy-900 space-y-4 font-mono text-xs">
          <div className="flex items-center space-x-2 text-navy-900 font-bold uppercase border-b border-steel-300 pb-2">
            <Fingerprint className="w-4 h-4 text-amber-500" />
            <span>Digital Signature & Authority Credentials</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-steel-600 text-[11px] mb-1">
                CERTIFIED ENGINEER / AUTHORIZING AGENT:
              </label>
              <input
                type="text"
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                className="w-full p-2 bg-white border border-steel-300 font-mono text-xs focus:border-navy-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-steel-600 text-[11px] mb-1">
                ENGINEERING LICENSE / BADGE SEAL CODE:
              </label>
              <input
                type="text"
                value={signatureCode}
                onChange={(e) => setSignatureCode(e.target.value)}
                className="w-full p-2 bg-white border border-steel-300 font-mono text-xs focus:border-navy-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center space-x-2 text-status-greenDark text-[11px]">
              <ShieldCheck className="w-4 h-4 text-status-green shrink-0" />
              <span>Zero-leakage air-gap signature will be cryptographically hashed in SQLite</span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowRejectBox(!showRejectBox)}
                className="px-3.5 py-2 text-status-redDark hover:bg-status-red/10 border border-status-red/40 font-bold uppercase transition-colors"
              >
                Reject with Reason
              </button>

              <button
                onClick={handleApprove}
                disabled={submitting}
                className="px-5 py-2 bg-navy-900 hover:bg-navy-850 text-amber-400 font-bold uppercase tracking-wider flex items-center space-x-2 border border-navy-800 shadow-sm transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>{submitting ? 'SEALING DELIVERABLE...' : 'APPROVE & DIGITALLY SIGN'}</span>
              </button>
            </div>
          </div>

          {/* Rejection input dropdown */}
          {showRejectBox && (
            <div className="mt-3 p-3 bg-white border border-status-red/50 space-y-2">
              <label className="block text-status-redDark font-bold text-[11px]">
                Enter Mandatory Engineering Rejection Rationale:
              </label>
              <input
                type="text"
                placeholder="e.g. Ultrasonic reading in Point 4 requires secondary calibration scan..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2 bg-canvas-subtle border border-steel-300 text-xs font-mono"
              />
              <button
                onClick={handleReject}
                className="px-3 py-1.5 bg-status-red text-white font-bold uppercase text-[11px]"
              >
                Confirm Rejection & Abort Deliverable
              </button>
            </div>
          )}
        </div>
      )}

      {/* Success Banner when Approved */}
      {isApproved && (
        <div className="p-4 bg-status-green/10 border-2 border-status-green text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="font-bold text-status-greenDark flex items-center space-x-2 text-sm">
              <CheckCircle2 className="w-5 h-5 text-status-green" />
              <span>Deliverable Certified & Signed by {activeTask.approvedBy || approverName}</span>
            </div>
            <div className="text-steel-600 mt-1">
              Cryptographic Audit Seal: {activeTask.id} // All citations verified against local NDT repository.
            </div>
          </div>

          <button
            onClick={onOpenDeliverable}
            className="px-5 py-2.5 bg-navy-900 text-amber-400 hover:bg-navy-850 font-bold uppercase tracking-wider flex items-center space-x-2 border border-navy-800 shrink-0 shadow-sm"
          >
            <FileDown className="w-4 h-4" />
            <span>Generate & Download Deliverable</span>
          </button>
        </div>
      )}
    </div>
  );
}
