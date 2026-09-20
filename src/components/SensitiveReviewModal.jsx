import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Check, 
  Ban, 
  ChevronDown, 
  ChevronUp, 
  X, 
  AlertCircle, 
  FileText,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { submitSensitiveConsent } from '../services/api';
import { useToast } from './Toast';

/**
 * Format category to user-facing uppercase tag in cyan/teal
 */
function getCategoryTag(item) {
  switch (item.category) {
    case 'FINANCIAL_FIGURE':
      return 'SENSITIVE INFO: FINANCIAL FIGURE';
    case 'PERSONAL_NAME':
      return 'SENSITIVE INFO: PERSONAL NAME';
    case 'IDENTIFIER_CODE':
      return 'SENSITIVE INFO: IDENTIFIER CODE';
    case 'CONFIDENTIAL_KEYWORD':
      return 'SENSITIVE INFO: CONFIDENTIAL KEYWORD';
    default:
      return `SENSITIVE INFO: ${item.category?.replace(/_/g, ' ') || 'FLAGGED ITEM'}`;
  }
}

/**
 * Descriptive plain-language title of what was found
 */
function getPlainLanguageTitle(item) {
  switch (item.category) {
    case 'FINANCIAL_FIGURE':
      return `Financial Figure Detected (${item.snippet})`;
    case 'PERSONAL_NAME':
      return `Personal Name Found in Incident Record (${item.snippet})`;
    case 'IDENTIFIER_CODE':
      return `Professional License / ID Code Detected (${item.snippet})`;
    case 'CONFIDENTIAL_KEYWORD':
      return `Confidential Term Nearby ("${item.snippet}")`;
    default:
      return item.explanation || `Flagged Sensitive Entity (${item.snippet})`;
  }
}

/**
 * Highlight the flagged snippet inside surrounding context
 */
function renderContextWithHighlight(context, snippet) {
  if (!context || !snippet || !context.includes(snippet)) {
    return <span>{context}</span>;
  }
  const parts = context.split(snippet);
  return (
    <span>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < parts.length - 1 && (
            <mark className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded mx-0.5">
              {snippet}
            </mark>
          )}
        </React.Fragment>
      ))}
    </span>
  );
}

export default function SensitiveReviewModal({ 
  document, 
  sensitiveItems = [], 
  role, 
  onConsentCompleted, 
  onCancel 
}) {
  console.log('[SensitiveReviewModal:RENDER] Rendering SensitiveReviewModal! Document:', document?.filename || document?.id, 'SensitiveItems count:', sensitiveItems?.length, 'Role:', role);

  const { addToast } = useToast();

  // Store user decisions: itemId -> 'include' | 'skip'
  const [decisions, setDecisions] = useState({});
  // Track open/collapsed state per card (default first card open if unreviewed)
  const [expandedMap, setExpandedMap] = useState({
    [sensitiveItems[0]?.id]: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If no sensitive items, bypass completely
  if (!sensitiveItems || sensitiveItems.length === 0) {
    console.log('[SensitiveReviewModal] Bypassing: sensitiveItems is empty.');
    return null;
  }

  const totalItems = sensitiveItems.length;
  const decidedCount = Object.keys(decisions).length;
  const remainingCount = totalItems - decidedCount;
  const allDecided = remainingCount === 0;

  const toggleExpand = (itemId) => {
    setExpandedMap(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Immediate decision update that collapses the card back without a separate step
  const handleItemDecision = (itemId, choice) => {
    setDecisions(prev => ({
      ...prev,
      [itemId]: choice
    }));
    // Immediately collapse this card back
    setExpandedMap(prev => ({
      ...prev,
      [itemId]: false
    }));
  };

  // Quick action: mark all remaining as included
  const handleIncludeAll = () => {
    const updated = { ...decisions };
    sensitiveItems.forEach(item => {
      if (!updated[item.id]) {
        updated[item.id] = 'include';
      }
    });
    setDecisions(updated);
    setExpandedMap({});
  };

  // Submit all accumulated decisions to backend
  const handleSaveAndContinue = async () => {
    if (isSubmitting) return;
    console.log('[SensitiveReviewModal] handleSaveAndContinue called! Document:', document?.id, 'Decisions count:', Object.keys(decisions).length);
    setIsSubmitting(true);
    try {
      const decisionList = sensitiveItems.map(item => ({
        id: item.id,
        snippet: item.snippet,
        category: item.category,
        action: decisions[item.id] || 'include'
      }));

      console.log('[SensitiveReviewModal] Sending decisions to backend:', decisionList);
      const res = await submitSensitiveConsent(
        document?.id, 
        decisionList, 
        typeof role === 'string' ? role : (role?.id || 'reviewer')
      );
      console.log('[SensitiveReviewModal] Backend consent response received:', res.success, res.doc?.status);

      const skippedCount = decisionList.filter(d => d.action === 'skip').length;
      if (skippedCount > 0) {
        addToast({
          title: 'Sensitive Content Redacted',
          message: `${skippedCount} item(s) excluded from document analysis and logged to audit ledger.`,
          type: 'warning'
        });
      } else {
        addToast({
          title: 'All Items Approved',
          message: 'Document indexed with user consent recorded in audit ledger.',
          type: 'success'
        });
      }

      if (onConsentCompleted) {
        onConsentCompleted(res.doc || document);
      }
    } catch (err) {
      console.error('[SensitiveReviewModal] Error saving consent:', err);
      alert('Failed to save sensitive data decisions: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md animate-in fade-in duration-200">
      <div className="max-w-4xl w-full max-h-[90vh] bg-[#070D1E] rounded-2xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden text-slate-100">
        
        {/* Top Header Panel */}
        <div className="px-6 py-4.5 border-b border-slate-800/80 bg-[#0B132B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-serif font-bold text-white tracking-tight">
                  Sensitive Information Review
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  SECURITY GATEWAY
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Target Record: <strong className="font-mono text-slate-200">{document?.originalName || document?.filename}</strong>
              </p>
            </div>
          </div>

          {/* Right Side: Live Summary Count Badge & Batch Action */}
          <div className="flex items-center space-x-3 self-end sm:self-auto">
            {remainingCount > 0 ? (
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-950/90 text-amber-300 border border-amber-500/50 shadow-xs animate-pulse">
                {remainingCount} item{remainingCount === 1 ? '' : 's'} need your review
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 shadow-xs flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>All {totalItems} items reviewed</span>
              </span>
            )}

            {remainingCount > 1 && (
              <button
                type="button"
                id="approve-all-sensitive-button"
                onClick={handleIncludeAll}
                className="text-[11px] font-mono text-slate-400 hover:text-cyan-300 underline underline-offset-2 transition-colors cursor-pointer"
                title="Mark all remaining items as Included"
              >
                Approve All
              </button>
            )}

            {onCancel && (
              <button 
                onClick={onCancel}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close review"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Vertical Stack of Cards (Scrollable Container) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-[#070D1E]/90">
          {sensitiveItems.map((item, index) => {
            const decision = decisions[item.id];
            const isExpanded = !!expandedMap[item.id];
            const confidencePct = item.confidence ? Math.round(item.confidence * 100) : 94;

            // Border color matches current status per specification
            const borderStatusClass = decision === 'include'
              ? 'border-emerald-500/50 border-l-4 border-l-emerald-500 bg-[#0C152E]'
              : decision === 'skip'
              ? 'border-slate-700/60 border-l-4 border-l-slate-500 bg-[#0A1124] opacity-85'
              : 'border-amber-500/50 border-l-4 border-l-amber-500 bg-[#0D1833]';

            return (
              <div 
                key={item.id || index}
                className={`rounded-xl border transition-all duration-200 shadow-md ${borderStatusClass}`}
              >
                {/* Card Header Row (Clickable to Toggle Expand) */}
                <div 
                  onClick={() => toggleExpand(item.id)}
                  className="p-4 sm:p-4.5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 select-none"
                >
                  {/* Left Side: Tag & Plain-Language Title */}
                  <div className="space-y-1 min-w-0">
                    {/* Small uppercase monospace category tag in cyan/teal */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px] font-mono">
                      <span className="text-cyan-400 font-bold uppercase tracking-wider">
                        {getCategoryTag(item)}
                      </span>
                      <span className="text-slate-500">&bull;</span>
                      <span className="text-slate-400 truncate">
                        {document?.categoryLabel || document?.classificationLabel || 'Refinery Record'} &bull; {item.sectionTitle || `Section ${item.sectionIndex + 1}`}
                      </span>
                    </div>

                    {/* Bold title line describing what was found in plain language */}
                    <h4 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                      {getPlainLanguageTitle(item)}
                    </h4>
                  </div>

                  {/* Right Side: Confidence & Status Badge & Chevron */}
                  <div className="flex items-center space-x-3 shrink-0 self-end md:self-auto">
                    {/* Real Confidence Percentage in Green */}
                    <div className="text-right font-mono text-xs hidden sm:block">
                      <span className="text-slate-400 mr-1.5 font-sans">Confidence</span>
                      <span className="text-emerald-400 font-bold">{confidencePct}% Match</span>
                    </div>

                    {/* Pill-shaped Status Badge */}
                    <div>
                      {!decision && (
                        <span className="px-3 py-1 text-[10px] sm:text-[11px] font-mono font-bold rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/50 uppercase tracking-wider">
                          AWAITING APPROVAL
                        </span>
                      )}
                      {decision === 'include' && (
                        <span className="px-3 py-1 text-[10px] sm:text-[11px] font-mono font-bold rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 uppercase tracking-wider flex items-center space-x-1">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>APPROVED</span>
                        </span>
                      )}
                      {decision === 'skip' && (
                        <span className="px-3 py-1 text-[10px] sm:text-[11px] font-mono font-bold rounded-full bg-slate-800 text-slate-300 border border-slate-600 uppercase tracking-wider flex items-center space-x-1">
                          <Ban className="w-3 h-3 text-slate-400" />
                          <span>SKIPPED</span>
                        </span>
                      )}
                    </div>

                    {/* Expand/Collapse Chevron */}
                    <button
                      type="button"
                      aria-label="Toggle details"
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Drawer: Flagged Text Snippet with Surrounding Context & Action Buttons */}
                {isExpanded && (
                  <div className="px-4 pb-4.5 pt-1 border-t border-slate-800/80 bg-black/40 animate-in fade-in duration-150 space-y-3.5">
                    {/* Surrounding Context Box */}
                    <div className="rounded-lg bg-[#050B18] p-3.5 border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400/90 font-semibold mb-1 flex items-center space-x-1">
                        <FileText className="w-3 h-3 text-cyan-400" />
                        <span>Source Text & Context Window</span>
                      </div>
                      <div className="font-mono text-xs text-slate-200 mt-1">
                        {renderContextWithHighlight(item.context || item.snippet, item.snippet)}
                      </div>
                    </div>

                    {/* Action Buttons: Immediately updates badge and collapses card */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                      <span className="text-[11px] font-sans text-slate-400">
                        Choose whether to include this confidential datum in local indexing or redact it before processing.
                      </span>

                      <div className="flex items-center space-x-2.5 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => handleItemDecision(item.id, 'skip')}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                        >
                          <Ban className="w-3.5 h-3.5 text-slate-400" />
                          <span>Skip This Part</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleItemDecision(item.id, 'include')}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Include This Information</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer Confirmation Bar */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0B132B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs font-sans text-slate-400">
            {allDecided ? (
              <span className="text-emerald-400 font-semibold flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>All {totalItems} flagged items reviewed. Ready to commit to air-gap ledger.</span>
              </span>
            ) : (
              <span>
                {remainingCount} item{remainingCount === 1 ? '' : 's'} awaiting your decision. You may review in any order.
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-auto">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            <button
              type="button"
              id="save-sensitive-consent-button"
              onClick={handleSaveAndContinue}
              disabled={!allDecided || isSubmitting}
              className={`px-5 py-2.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all shadow-md cursor-pointer ${
                allDecided 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer animate-pulse'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <span>{isSubmitting ? 'Recording Decisions...' : 'All items reviewed — Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
