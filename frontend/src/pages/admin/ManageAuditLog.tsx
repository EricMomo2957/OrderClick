import { useState, useEffect } from 'react';
import { Search, ShieldAlert, Terminal, RefreshCw, Layers, User, Settings, Info, Trash2, PlusCircle, Edit3, AlertTriangle } from 'lucide-react';

interface AuditLog {
  id: number;
  user_id: number | null;
  fullname: string | null;
  role: 'admin' | 'customer' | 'system';
  action: string;
  resource: string;
  resource_id: number | null; // Ensures matching with database schemas
  ip_address: string | null;   // Ensures alignment with Express logger captures
  user_agent: string | null;   // Ensures alignment with Express user-agent strings
  details: string | null;
  created_at: string;
}

const ManageAuditLog = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'customer'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [purging, setPurging] = useState<boolean>(false);

  // Fetch security audit logs from the backend configuration
  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/audit-logs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok) {
        // Enforce safe array parsing to eliminate UI blankouts
        setLogs(Array.isArray(data) ? data : []);
      } else {
        console.error(data.error || "Failed to load audit registry stream");
      }
    } catch (err) {
      console.error("Network interface connection failure:", err);
    } finally {
      setLoading(false);
    }
  };

  // Administrative command pipeline to wipe the system operations audit trail
  const handlePurgeLogs = async () => {
    const doubleCheck = window.confirm(
      "CRITICAL SECURITY ACTION:\nAre you sure you want to permanently delete all system operation audit logs? This action is irreversible."
    );
    if (!doubleCheck) return;

    setPurging(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/audit-logs/purge', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        alert("System operations audit trails have been cleared successfully.");
        setLogs([]); // Wipe local UI layout representation immediately
      } else {
        alert(data.error || "Failed to purge structural system matrix log files.");
      }
    } catch (err) {
      console.error("Failed executing purge sequence:", err);
      alert("Network communication timeout handling server data deletion context.");
    } finally {
      setPurging(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Live client-side processing pipeline for search keyword tracking & tab selection
  const filteredLogs = logs.filter(log => {
    const matchesTab = roleFilter === 'all' ? true : log.role === roleFilter;
    
    const searchTarget = `
      ${log.fullname || ''} 
      ${log.action || ''} 
      ${log.resource || ''} 
      ${log.ip_address || ''} 
      ${log.details || ''}
    `.toLowerCase();
    
    const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Helper method to resolve dynamic badge styles depending on database mutation contexts
  const getActionBadgeStyle = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('CREATE') || act.includes('ADD') || act.includes('INSERT')) {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        icon: <PlusCircle size={12} className="shrink-0" />
      };
    }
    if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('MODIFY')) {
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-100',
        icon: <Edit3 size={12} className="shrink-0" />
      };
    }
    if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('PURGE') || act.includes('CLEAR')) {
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-100',
        icon: <Trash2 size={12} className="shrink-0" />
      };
    }
    return {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: <AlertTriangle size={12} className="shrink-0" />
    };
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6 font-['Inter'] animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER SECTION PANEL */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[#003d3d]">
            <Terminal size={20} className="stroke-[2.5]" />
            <h1 className="text-2xl font-black tracking-tight text-slate-800">
              System Operations Audit Log
            </h1>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            Immutable tracking matrix capturing backend events, configuration alterations, and administrative execution records.
          </p>
        </div>

        {/* INTERACTIVE CONTROLS: REFRESH, PURGE, & TAB SEGMENTATION */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button 
            onClick={fetchAuditLogs}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-bold text-[#003d3d] bg-emerald-50 px-4 py-2.5 rounded-xl hover:bg-emerald-100 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> 
            Refresh Feed
          </button>

          {logs.length > 0 && (
            <button 
              onClick={handlePurgeLogs}
              disabled={purging || loading}
              className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 px-4 py-2.5 rounded-xl hover:bg-red-100 transition-all active:scale-95 disabled:opacity-50"
            >
              <Trash2 size={14} /> 
              {purging ? 'Purging Trails...' : 'Purge All Logs'}
            </button>
          )}

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all ${roleFilter === 'all' ? 'bg-white text-[#003d3d] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              All Logs ({logs.length})
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-4 py-2 rounded-lg transition-all ${roleFilter === 'admin' ? 'bg-white text-[#003d3d] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Admin ({logs.filter(l => l.role === 'admin').length})
            </button>
            <button
              onClick={() => setRoleFilter('customer')}
              className={`px-4 py-2 rounded-lg transition-all ${roleFilter === 'customer' ? 'bg-white text-[#003d3d] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Customers ({logs.filter(l => l.role === 'customer').length})
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH FIELD */}
      <div className="relative w-full max-w-md">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
          <Search size={16} />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search logs by operator, actions, or schemas..."
          className="w-full pl-11 pr-4 py-2.5 bg-slate-50 text-slate-800 text-sm font-medium rounded-2xl border border-slate-200 focus:outline-none focus:bg-white focus:border-[#003d3d] focus:ring-1 focus:ring-[#003d3d] transition-all placeholder:text-slate-400"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider"
          >
            Clear
          </button>
        )}
      </div>

      {/* RENDER DYNAMIC ACTIVITY BUFFER MATRIX */}
      {loading ? (
        <div className="flex justify-center items-center h-56 text-slate-400 font-medium text-sm animate-pulse">
          Syncing cryptographic environment activity stream...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center max-w-md mx-auto">
          <div className="h-12 w-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            <Layers size={20} />
          </div>
          <h3 className="text-slate-800 font-bold text-lg mb-1">No Activity Records Matched</h3>
          <p className="text-slate-400 text-sm">
            {searchQuery 
              ? `We couldn't track logs corresponding to your keyword string "${searchQuery}".` 
              : "The secure activity buffer schema is completely unpopulated or empty."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_30px_rgba(0,61,61,0.02)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Actor Entity</th>
                  <th className="px-6 py-4">Action Signature</th>
                  <th className="px-6 py-4">Target Resource</th>
                  <th className="px-6 py-4">Mutation Description Snippet</th>
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4">Execution Timestamp</th>
                  <th className="px-6 py-4 text-right">Diagnostic Parameters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700 font-medium">
                {filteredLogs.map((log) => {
                  const badge = getActionBadgeStyle(log.action);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                      
                      {/* ACTOR CAPTURE */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            log.role === 'admin' 
                              ? 'bg-orange-50 text-orange-600 border border-orange-100' 
                              : log.role === 'customer'
                              ? 'bg-blue-50 text-blue-600 border border-blue-100'
                              : 'bg-purple-50 text-purple-600 border border-purple-100'
                          }`}>
                            {log.role === 'admin' ? <Settings size={13} /> : log.role === 'customer' ? <User size={13} /> : <ShieldAlert size={13} />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 line-clamp-1">{log.fullname || "System Runtime"}</p>
                            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">{log.role}</span>
                          </div>
                        </div>
                      </td>

                      {/* ACTION DESCRIPTION */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 font-mono text-xs border px-2.5 py-1 rounded-md tracking-tight ${badge.bg}`}>
                          {badge.icon}
                          {log.action}
                        </span>
                      </td>

                      {/* TARGET RESOURCE SCHEMA MATCH */}
                      <td className="px-6 py-4">
                        <div className="text-slate-600">
                          <span className="font-semibold text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 text-xs">{log.resource}</span>
                          {log.resource_id && <span className="text-xs text-slate-400 ml-1.5 font-mono font-bold">#{log.resource_id}</span>}
                        </div>
                      </td>

                      {/* MUTATION CONTEXT DETAILED STRING OVERVIEW */}
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                          {log.details || <span className="italic text-slate-300">No descriptive string context.</span>}
                        </p>
                      </td>

                      {/* NETWORK LOCATION ADDRESS */}
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                        {log.ip_address || "0.0.0.0 (Internal)"}
                      </td>

                      {/* CAPTURED TIMESTAMP */}
                      <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                      </td>

                      {/* LOG INSPECTOR CONTROLLER */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-[#003d3d] transition-all inline-flex items-center gap-1 text-xs font-bold"
                          title="Inspect Log Packet JSON Payload"
                        >
                          <Info size={15} /> Inspect
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LOG DATA PAYLOAD MODAL OVERLAY (INSPECTOR HUD) */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Terminal size={16} className="text-[#003d3d]" />
                  Log Frame Diagnostic Matrix
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Transaction Packet ID: #{selectedLog.id}</p>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="text-xs font-bold uppercase bg-slate-200/60 hover:bg-slate-200 text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-xl transition-all"
              >
                Close
              </button>
            </div>

            {/* Modal Inspector Body Content */}
            <div className="p-6 space-y-5 overflow-y-auto text-sm text-slate-700">
              
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 font-mono text-xs">
                <div>
                  <span className="text-slate-400 block uppercase text-[10px] font-bold tracking-wider mb-0.5">Operator Execution Entity</span>
                  <span className="text-slate-800 font-bold">{selectedLog.fullname || "System Engine"} ({selectedLog.role})</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[10px] font-bold tracking-wider mb-0.5">Network IP Signature</span>
                  <span className="text-slate-800 font-bold">{selectedLog.ip_address || "Direct Core Pipe"}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase font-black text-slate-400 tracking-wider mb-2">Operation Parameters Overview</h4>
                <div className="space-y-2 bg-white border border-slate-200/80 rounded-2xl p-4 text-xs font-semibold text-slate-600 shadow-inner">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Action Namespace:</span> 
                    <span className={`font-mono border px-2 py-0.5 rounded text-[11px] ${getActionBadgeStyle(selectedLog.action).bg}`}>
                      {selectedLog.action}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1"><span className="text-slate-400">Database Schema Context:</span> <span className="text-slate-800 font-mono font-bold text-xs bg-slate-100 px-1.5 py-0.5 rounded">{selectedLog.resource}</span></div>
                  <div className="flex justify-between pt-1"><span className="text-slate-400">Target Object Row ID:</span> <span className="font-mono text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded font-bold">{selectedLog.resource_id || 'N/A'}</span></div>
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase font-black text-slate-400 tracking-wider mb-2">Extended Action Details Payload</h4>
                <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-2xl overflow-x-auto max-h-40 shadow-inner leading-relaxed">
                  {selectedLog.details ? (
                    selectedLog.details.trim().startsWith('{') || selectedLog.details.trim().startsWith('[') ? (
                      (() => {
                        try {
                          return <pre className="whitespace-pre-wrap">{JSON.stringify(JSON.parse(selectedLog.details), null, 2)}</pre>;
                        } catch {
                          return <p className="whitespace-pre-wrap">{selectedLog.details}</p>;
                        }
                      })()
                    ) : (
                      <p className="whitespace-pre-wrap">{selectedLog.details}</p>
                    )
                  ) : (
                    <span className="italic text-slate-500">No telemetry change payload attached.</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase font-black text-slate-400 tracking-wider mb-2">Browser User-Agent Header Details</h4>
                <p className="bg-slate-50 text-slate-600 border border-slate-200 rounded-2xl p-3 font-mono text-xs leading-relaxed">
                  {selectedLog.user_agent || "No software headers present."}
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageAuditLog;