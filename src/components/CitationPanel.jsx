import React, { useState } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink, 
  CheckCircle2, 
  Info,
  Bookmark
} from 'lucide-react';

export default function CitationPanel({ citations = [] }) {
  const [selectedCitation, setSelectedCitation] = useState(null);

  if (!citations || citations.length === 0) {
    return (
      <div className="bg-white border-2 border-navy-900 console-panel p-5 text-center text-xs font-mono text-steel-500">
        No active citations yet. Run retrieval step in the Task Planner to extract evidence anchors.
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-navy-900 console-panel p-5 space-y-4">
      {/* Titleblock */}
      <div className="flex items-center justify-between border-b border-steel-200 pb-3">
        <div className="flex items-center space-x-2.5">
          <Bookmark className="w-5 h-5 text-navy-900" />
          <div>
            <h2 className="text-base font-serif font-bold text-navy-900">
              Evidence & Citation Verification Panel
            </h2>
            <p className="text-xs font-mono text-steel-500">
              Strict Provenance Rule: Every engineering finding is anchored to an on-premise source file and page.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="flex items-center space-x-1 text-status-greenDark font-bold">
            <ShieldCheck className="w-4 h-4 text-status-green" />
            <span>{citations.filter(c => c.verified).length} VERIFIED</span>
          </span>
          <span className="flex items-center space-x-1 text-amber-600 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>{citations.filter(c => !c.verified).length} UNVERIFIED</span>
          </span>
        </div>
      </div>

      {/* Citations List */}
      <div className="space-y-3 font-mono text-xs">
        {citations.map((cit, idx) => {
          const isVerified = cit.verified;

          return (
            <div
              key={cit.id || idx}
              className={`p-3.5 border-2 transition-all ${
                isVerified 
                  ? 'border-steel-300 bg-white hover:border-navy-900' 
                  : 'border-amber-500 bg-amber-50/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-steel-200 pb-2 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 bg-navy-900 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 border border-navy-800">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-navy-900 font-serif text-sm">
                    {cit.section || 'General Operational Data'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {isVerified ? (
                    <span className="flex items-center space-x-1 text-[10px] font-bold text-status-greenDark bg-status-green/10 px-2 py-0.5 border border-status-green/30">
                      <CheckCircle2 className="w-3 h-3 text-status-green" />
                      <span>VERIFIED CITATION</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-[10px] font-bold text-amber-800 bg-amber-200 px-2 py-0.5 border border-amber-400 animate-pulse">
                      <AlertTriangle className="w-3 h-3 text-amber-700" />
                      <span>UNVERIFIED CLAIM — NEEDS REVIEW</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Finding / Claim Statement */}
              <div className="text-ink-900 text-xs font-sans leading-relaxed">
                "{cit.claim}"
              </div>

              {/* Provenance Metadata Chip */}
              <div className="mt-2.5 pt-2 border-t border-dashed border-steel-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-steel-600">
                <div className="flex items-center space-x-2">
                  <FileText className="w-3.5 h-3.5 text-steel-500" />
                  <span className="font-bold text-navy-900">{cit.documentName}</span>
                  {cit.page && (
                    <span className="bg-steel-100 px-1.5 py-0.5 border border-steel-300 font-bold text-steel-700">
                      Page {cit.page}
                    </span>
                  )}
                </div>

                <div className="text-[10px] text-steel-500 font-mono">
                  CONFIDENCE: {Math.round((cit.confidence || 0.95) * 100)}%
                </div>
              </div>

              {/* Warning box if unverified */}
              {!isVerified && (
                <div className="mt-2.5 p-2 bg-amber-100/70 border border-amber-300 text-[11px] text-amber-900 font-sans flex items-start space-x-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Mandatory Flag:</strong> This parameter was not found in indexed inspection files and represents an operational assumption. The human review gate will require manual authorization before signing off.
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
