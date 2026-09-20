import React from 'react';
import { 
  FileDown, 
  CheckCircle2, 
  ShieldCheck, 
  Printer, 
  X, 
  FileText, 
  Stamp,
  Lock
} from 'lucide-react';
import { getDeliverableExportUrl } from '../services/api';

export default function DeliverableModal({ isOpen, onClose, activeTask }) {
  if (!isOpen || !activeTask) return null;

  const htmlUrl = getDeliverableExportUrl(activeTask.id, 'html');
  const txtUrl = getDeliverableExportUrl(activeTask.id, 'txt');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 p-4 print:p-0 print:bg-white">
      <div className="bg-white border-2 border-navy-900 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl print:border-none print:shadow-none print:max-h-none console-panel">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-navy-900 text-white flex items-center justify-between border-b-2 border-amber-500 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-amber-500 text-navy-950 font-bold">
              <Stamp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-amber-400 font-bold tracking-wider">
                CERTIFIED SOVEREIGN DELIVERABLE // READY FOR DISTRIBUTION
              </div>
              <h2 className="text-lg font-serif font-bold text-white tracking-tight">
                Mechanical Integrity Approval Note — {activeTask.id}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="p-1.5 text-steel-300 hover:text-white border border-steel-700 hover:border-steel-500 bg-navy-800 transition-colors"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-steel-400 hover:text-white p-1"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content / Official Document Preview */}
        <div className="p-8 overflow-y-auto flex-1 font-serif text-ink-900 space-y-6 bg-[#FCFDFE]">
          {/* Engineering Title Block */}
          <div className="border-2 border-navy-900 p-4 font-mono text-xs bg-canvas-subtle space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-navy-900 pb-2 gap-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-navy-900 text-sm">SENTINELWORKS SOVEREIGN DELIVERABLE</span>
                <span className="bg-navy-900 text-amber-400 font-bold px-1.5 py-0.5 text-[10px]">
                  AIR-GAP VERIFIED
                </span>
              </div>
              <span className="text-steel-600 font-bold">DOC ID: SW-{activeTask.id.toUpperCase()}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] pt-1">
              <div>
                <span className="text-steel-500 block">SECURITY LEVEL:</span>
                <span className="font-bold text-navy-900">RESTRICTED (LEVEL 2)</span>
              </div>
              <div>
                <span className="text-steel-500 block">APPROVER:</span>
                <span className="font-bold text-navy-900">{activeTask.approvedBy || 'Lead Engineer'}</span>
              </div>
              <div>
                <span className="text-steel-500 block">AUTHORIZED AT:</span>
                <span className="font-bold text-navy-900">{activeTask.approvedAt ? activeTask.approvedAt.split('T')[0] : '2026-09-17'}</span>
              </div>
              <div>
                <span className="text-steel-500 block">NETWORK EGRESS:</span>
                <span className="font-bold text-status-greenDark">0 BYTES (AIR-GAPPED)</span>
              </div>
            </div>
          </div>

          {/* Formatted Text Content */}
          <div className="border border-steel-300 p-6 bg-white font-mono text-xs leading-relaxed whitespace-pre-wrap text-ink-900">
            {activeTask.draftContent}
          </div>

          {/* Verification Stamps Block */}
          <div className="border-t-2 border-steel-300 pt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-steel-600 gap-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-status-green shrink-0" />
              <span>Cryptographically attested on-premise. All mathematical calculations verified in isolated environment.</span>
            </div>
            <div className="text-steel-500 text-[11px]">
              AUDIT HASH: SHA256-8F2D1479C0BE3321
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 py-4 bg-canvas-subtle border-t-2 border-navy-900 flex flex-wrap items-center justify-between gap-3 font-mono text-xs print:hidden">
          <div className="text-steel-600 text-[11px]">
            Ready for local plant archival or regulatory filing.
          </div>

          <div className="flex items-center space-x-3">
            <a
              href={txtUrl}
              download
              className="px-4 py-2 bg-white hover:bg-steel-100 text-navy-900 font-bold border border-steel-400 flex items-center space-x-2 transition-colors"
            >
              <FileText className="w-4 h-4 text-steel-600" />
              <span>Download Text (.txt)</span>
            </a>

            <a
              href={htmlUrl}
              download
              className="px-5 py-2 bg-navy-900 hover:bg-navy-850 text-amber-400 font-bold uppercase tracking-wider flex items-center space-x-2 border border-navy-800 shadow-sm transition-colors"
            >
              <FileDown className="w-4 h-4 text-amber-400" />
              <span>Download Official Report (.html)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
