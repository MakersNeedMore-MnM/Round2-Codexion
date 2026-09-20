import React, { useState, useEffect } from 'react';
import { 
  Search, 
  FileText, 
  Lock, 
  ShieldCheck, 
  AlertTriangle, 
  BookOpen, 
  ArrowRight,
  FolderOpen,
  Info
} from 'lucide-react';
import { searchKnowledgeBase } from '../services/api';

export default function KnowledgeBase({ currentRole, onSelectDocument }) {
  const [query, setQuery] = useState('corrosion rate');
  const [results, setResults] = useState([]);
  const [withheldCount, setWithheldCount] = useState(0);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    handleSearch('corrosion rate');
  }, [currentRole]);

  const handleSearch = async (searchQuery) => {
    const q = searchQuery !== undefined ? searchQuery : query;
    if (!q.trim()) return;

    setSearching(true);
    setHasSearched(true);
    try {
      const data = await searchKnowledgeBase(q, currentRole?.id || 'engineer');
      setResults(data.results || []);
      setWithheldCount(data.withheldCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const sampleQueries = [
    'corrosion rate',
    'relief valve pop test',
    'vibration harmonic',
    'flaring incident investigation',
    'tube bundle erosion'
  ];

  return (
    <div className="space-y-6">
      {/* Sample Demo Data Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-300 p-3 flex items-center justify-between text-xs font-mono text-amber-900">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Sample demo data — not real records.</strong> Document excerpts returned by this search are from demonstration files.
          </span>
        </div>
        <span className="text-[10px] uppercase font-bold text-amber-700 hidden sm:inline">
          Demonstration Environment
        </span>
      </div>

      {/* Title block with One-Line Purpose Statement */}
      <div className="bg-white border-2 border-navy-900 p-5 console-panel flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-mono text-steel-500 uppercase tracking-wider font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-navy-900" />
            <span>Document Search</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-navy-900 tracking-tight mt-0.5">
            Search through your documents using everyday language.
          </h2>
          <p className="text-xs text-steel-700 font-sans mt-1">
            Search across inspection reports, calibration logs, vibration data, and operating procedures. Results are filtered according to your role permissions.
          </p>
        </div>

        <div className="text-right font-mono text-xs shrink-0">
          <span className="text-steel-500 block text-[10px]">LOGGED IN ROLE</span>
          <strong className="text-navy-900 text-sm">{currentRole?.name} ({currentRole?.clearanceBadge})</strong>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="bg-white border-2 border-navy-900 p-5 console-panel space-y-3">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex items-center space-x-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-steel-500 absolute left-3 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search local documents (e.g. wall thickness, valve calibration, bearing vibration)..."
              className="w-full pl-9 pr-4 py-2.5 bg-canvas-subtle border-2 border-steel-300 font-mono text-xs focus:border-navy-900 focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={searching}
            className="px-6 py-2.5 bg-navy-900 hover:bg-navy-850 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider border border-navy-800 transition-colors shrink-0 disabled:opacity-50"
          >
            {searching ? 'Searching...' : 'Search Documents'}
          </button>
        </form>

        {/* Query Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono pt-1">
          <span className="text-steel-500 text-[11px]">EXAMPLE SEARCHES:</span>
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(sq);
                handleSearch(sq);
              }}
              className="px-2.5 py-1 bg-steel-100 hover:bg-steel-200 text-navy-900 border border-steel-300 text-[11px] transition-colors"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Role Permission Scope Notification */}
      {withheldCount > 0 && (
        <div className="p-3.5 bg-canvas-subtle border border-steel-300 text-xs font-mono text-steel-700 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Lock className="w-4 h-4 text-steel-500 shrink-0" />
            <div>
              <span>
                {withheldCount} relevant document{withheldCount > 1 ? 's are' : ' is'} restricted to Plant Manager or Administrator access.
              </span>
            </div>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 bg-steel-200 text-steel-700">
            Role Filter Active
          </span>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-3 font-mono text-xs">
        {results.length > 0 ? (
          results.map((res, idx) => (
            <div
              key={idx}
              className="p-4 bg-white border-2 border-navy-900 hover:border-steel-600 transition-all console-panel space-y-2 text-left"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-steel-200 pb-2">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-navy-900 text-amber-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-serif font-bold text-navy-900 text-sm">
                        {res.filename}
                      </h3>
                      <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 border border-amber-300">
                        Sample Demo Data
                      </span>
                    </div>
                    <div className="text-[11px] text-steel-500">
                      Section: {res.sectionTitle} &bull; Page {res.page}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-semibold text-status-greenDark bg-status-green/10 px-2 py-0.5 border border-status-green/30">
                    MATCH {Math.round(res.relevanceScore * 100)}%
                  </span>
                </div>
              </div>

              {/* Snippet preview */}
              <div className="text-ink-900 font-sans text-xs bg-canvas-subtle p-3 border border-steel-200 leading-relaxed">
                "{res.snippet}"
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-steel-500">
                  Local ID: {res.documentId}
                </span>

                <button
                  onClick={() => onSelectDocument && onSelectDocument({ id: res.documentId, filename: res.filename })}
                  className="px-3 py-1 bg-navy-900 text-amber-400 hover:bg-navy-850 font-bold uppercase text-[11px] flex items-center space-x-1.5 transition-colors"
                >
                  <span>Use in Guided Workflow</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : hasSearched ? (
          <div className="p-8 bg-white border-2 border-navy-900 text-center font-mono text-xs text-steel-600 console-panel">
            <FolderOpen className="w-8 h-8 text-steel-500 mx-auto mb-2" />
            <h4 className="font-serif font-bold text-navy-900 text-base">No Matching Documents Found</h4>
            <p className="mt-1 max-w-md mx-auto">
              No accessible records matched your query "{query}". Try one of the example searches above or switch roles to inspect other records.
            </p>
          </div>
        ) : (
          <div className="p-8 bg-white border-2 border-navy-900 text-center font-mono text-xs text-steel-600 console-panel">
            <Search className="w-8 h-8 text-steel-500 mx-auto mb-2" />
            <h4 className="font-serif font-bold text-navy-900 text-base">Ready to Search Documents</h4>
            <p className="mt-1 max-w-md mx-auto">
              Type an engineering keyword or click one of the example topics above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
