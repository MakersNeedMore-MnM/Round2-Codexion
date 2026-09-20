import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  X,
  FolderOpen
} from 'lucide-react';
import { fetchAuditLogs } from '../services/api';

export default function AuditLogView({ currentRole }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    loadLogs();
  }, [roleFilter, actionFilter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchAuditLogs(roleFilter, actionFilter, searchQuery);
      setLogs(data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadLogs();
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SentinelWorks_Activity_Log_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getActionBadgeColor = (action) => {
    if (action.includes('APPROVED') || action.includes('ATTESTATION')) return 'bg-status-green/10 text-status-greenDark border-status-green/30';
    if (action.includes('REJECTED')) return 'bg-status-red/10 text-status-redDark border-status-red/30';
    if (action.includes('CALCULATION') || action.includes('SANDBOX')) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (action.includes('INGESTED')) return 'bg-navy-100 text-navy-900 border-navy-300';
    return 'bg-steel-100 text-steel-700 border-steel-300';
  };

  return (
    <div className="space-y-6">
      {/* Titleblock */}
      <div className="bg-white border-2 border-navy-900 p-5 console-panel flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-mono text-steel-500 uppercase tracking-wider font-semibold">
            <FileCheck className="w-3.5 h-3.5 text-navy-900" />
            <span>Activity Log</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-navy-900 tracking-tight mt-0.5">
            A chronological record of document access, calculations, and signed approvals.
          </h2>
          <p className="text-xs text-steel-700 font-sans mt-1">
            Every document viewed, calculation evaluated, and deliverable signed is saved to the local database with a cryptographic hash.
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="px-4 py-2.5 bg-navy-900 hover:bg-navy-850 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border border-navy-800 shadow-sm transition-colors shrink-0"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Export Activity Log (.JSON)</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white border-2 border-navy-900 p-4 console-panel flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-steel-500" />
            <span className="text-steel-600 font-bold uppercase text-[11px]">ROLE:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="p-1.5 bg-canvas-subtle border border-steel-300 font-mono text-xs focus:outline-none"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin (Executive & Compliance)</option>
              <option value="engineer">Engineer (Technical & Reliability)</option>
              <option value="reviewer">Reviewer (Quality & Compliance)</option>
              <option value="viewer">Viewer (General Operations)</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-steel-600 font-bold uppercase text-[11px]">EVENT TYPE:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="p-1.5 bg-canvas-subtle border border-steel-300 font-mono text-xs focus:outline-none"
            >
              <option value="">All Events</option>
              <option value="DOCUMENT_INGESTED">Document Upload</option>
              <option value="DOCUMENT_VIEW">Document View</option>
              <option value="RAG_SEARCH_QUERY">Document Search</option>
              <option value="TASK_PLANNED">Task Planned</option>
              <option value="STEP_EXECUTED">Step Execution</option>
              <option value="CODE_SANDBOX_EXECUTION">Calculation Run</option>
              <option value="HUMAN_APPROVAL_GRANTED">Report Signed</option>
              <option value="DELIVERABLE_EXPORTED">Report Downloaded</option>
            </select>
          </div>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records..."
            className="p-1.5 bg-canvas-subtle border border-steel-300 font-mono text-xs focus:outline-none w-48"
          />
          <button
            type="submit"
            className="p-1.5 bg-steel-100 hover:bg-steel-200 border border-steel-300 text-navy-900"
            title="Search records"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={loadLogs}
            className="p-1.5 bg-steel-100 hover:bg-steel-200 border border-steel-300 text-navy-900"
            title="Refresh logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </form>
      </div>

      {/* Log Table */}
      <div className="bg-white border-2 border-navy-900 console-panel overflow-hidden">
        <div className="overflow-x-auto">
          {logs.length > 0 ? (
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-navy-950 text-steel-300 border-b border-navy-800 text-[11px]">
                  <th className="py-2.5 px-4 font-semibold">TIMESTAMP</th>
                  <th className="py-2.5 px-4 font-semibold">USER / ROLE</th>
                  <th className="py-2.5 px-4 font-semibold">EVENT TYPE</th>
                  <th className="py-2.5 px-4 font-semibold">RESOURCE</th>
                  <th className="py-2.5 px-4 font-semibold">ENGINE</th>
                  <th className="py-2.5 px-4 font-semibold">HASH</th>
                  <th className="py-2.5 px-4 font-semibold text-right">DETAILS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-200 text-ink-800">
                {logs.map((item) => (
                  <tr key={item.id} className="hover:bg-canvas-subtle transition-colors">
                    <td className="py-3 px-4 text-steel-700 text-[11px] whitespace-nowrap">
                      {item.timestamp.split('T')[0]} {item.timestamp.split('T')[1]?.slice(0, 8)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-navy-900">{item.user_name || item.role}</div>
                      <div className="text-[10px] text-steel-500 uppercase">{item.role}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 border ${getActionBadgeColor(item.action_type)}`}>
                        {item.action_type.replace('RAG_SEARCH_QUERY', 'SEARCH').replace('CODE_SANDBOX_EXECUTION', 'CALCULATION')}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-steel-800" title={item.target_resource}>
                      {item.target_resource}
                    </td>
                    <td className="py-3 px-4 text-navy-900 text-[11px]">
                      {item.model_dispatched || 'None'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-steel-600">
                      {item.hash ? item.hash.slice(0, 10) + '...' : 'SEALED'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(item)}
                        className="px-2 py-1 text-[11px] bg-steel-100 hover:bg-navy-900 hover:text-white border border-steel-300 transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center bg-canvas-subtle">
              <FolderOpen className="w-8 h-8 text-steel-500 mx-auto mb-2" />
              <h4 className="font-serif font-bold text-navy-900 text-base">No Records Found</h4>
              <p className="text-xs text-steel-600 font-sans mt-1 max-w-md mx-auto">
                No activity matches your filter. Adjust your filter selections above or reset them.
              </p>
              <button
                onClick={() => {
                  setRoleFilter('');
                  setActionFilter('');
                  setSearchQuery('');
                }}
                className="mt-3 px-3 py-1 bg-navy-900 text-amber-400 font-mono text-xs font-bold uppercase"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 p-4">
          <div className="bg-canvas border-2 border-navy-900 max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl font-mono text-xs console-panel">
            <div className="px-5 py-3 bg-navy-900 text-white flex items-center justify-between border-b-2 border-amber-500">
              <span className="font-bold">Record Details: {selectedLog.id}</span>
              <button onClick={() => setSelectedLog(null)} className="text-steel-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3 flex-1 bg-white">
              <div>
                <span className="text-steel-500 text-[10px] block">EVENT:</span>
                <strong className="text-navy-900 text-sm">{selectedLog.action_type}</strong>
              </div>
              <div className="grid grid-cols-2 gap-3 bg-canvas-subtle p-3 border border-steel-200">
                <div>
                  <span className="text-steel-500 text-[10px] block">USER:</span>
                  <span>{selectedLog.user_name} ({selectedLog.role})</span>
                </div>
                <div>
                  <span className="text-steel-500 text-[10px] block">TIMESTAMP:</span>
                  <span>{selectedLog.timestamp}</span>
                </div>
                <div>
                  <span className="text-steel-500 text-[10px] block">ENGINE:</span>
                  <span>{selectedLog.model_dispatched}</span>
                </div>
                <div>
                  <span className="text-steel-500 text-[10px] block">ACCESS STATUS:</span>
                  <span className="text-status-greenDark font-bold">Authorized</span>
                </div>
              </div>
              <div>
                <span className="text-steel-500 text-[10px] block">CRYPTOGRAPHIC HASH:</span>
                <span className="text-steel-800 bg-canvas-subtle p-1.5 border border-steel-300 block select-all break-all text-[11px]">
                  {selectedLog.hash}
                </span>
              </div>
              <div>
                <span className="text-steel-500 text-[10px] block mb-1">EVENT PAYLOAD:</span>
                <pre className="p-3 bg-[#0B1726] text-steel-200 border border-navy-900 overflow-x-auto text-[11px]">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>
            <div className="px-5 py-2.5 bg-canvas-subtle border-t border-steel-300 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1 bg-navy-900 text-amber-400 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
