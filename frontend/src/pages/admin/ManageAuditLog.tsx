import { useState, useEffect } from 'react';
import { 
  Search, ShieldAlert, Terminal, RefreshCw, Layers, User, Settings, 
  Info, Trash2, PlusCircle, Edit3, AlertTriangle, CheckSquare, Square, 
  FileText, CheckCircle2, XCircle, Calendar, Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AuditLog {
  id: number;
  user_id: number | null;
  fullname: string | null;
  role: 'all' | 'admin' | 'customer' | 'system';
  action: string;
  resource: string;
  resource_id: number | null; 
  ip_address: string | null;   
  user_agent: string | null;   
  details: string | null;
  created_at: string;
}

const ManageAuditLog = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'customer' | 'system'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [purging, setPurging] = useState<boolean>(false);
  const [selectedLogIds, setSelectedLogIds] = useState<number[]>([]);

  // Time-based sorting and filtering states
  const [filterDate, setFilterDate] = useState<string>(''); // YYYY-MM-DD format from native HTML input
  const [timeGranularity, setTimeGranularity] = useState<'month' | 'week' | 'day'>('month');

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
        setLogs(Array.isArray(data) ? data : []);
        setSelectedLogIds([]); 
      } else {
        console.error(data.error || "Failed to load audit registry stream");
      }
    } catch (err) {
      console.error("Network interface connection failure:", err);
    } finally {
      setLoading(false);
    }
  };

  // Administrative command pipeline to wipe the system operations audit trail completely
  const handlePurgeLogs = async () => {
    const doubleCheck = window.confirm(
      "CRITICAL SECURITY ACTION:\nAre you sure you want to permanently delete ALL system operation audit logs? This action is completely irreversible."
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
        setLogs([]);
        setSelectedLogIds([]);
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

  // Delete a specific target row entry
  const handleDeleteSingleLog = async (id: number) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete Log Record #${id}?`);
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/audit-logs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        setLogs(prev => prev.filter(log => log.id !== id));
        setSelectedLogIds(prev => prev.filter(selectedId => selectedId !== id));
      } else {
        alert(data.error || "Failed to delete target log item instance.");
      }
    } catch (err) {
      console.error("Error executing row delete context:", err);
      alert("Network failure interface communicating singular row removal.");
    }
  };

  // Batch delete the collection of checked row entities
  const handleBulkDeleteLogs = async () => {
    if (selectedLogIds.length === 0) return;

    const confirmBulk = window.confirm(`Are you sure you want to delete the ${selectedLogIds.length} selected audit log records?`);
    if (!confirmBulk) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/audit-logs/bulk-delete', {
        method: 'POST', 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logIds: selectedLogIds }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Selected operation logs deleted successfully.");
        setLogs(prev => prev.filter(log => !selectedLogIds.includes(log.id)));
        setSelectedLogIds([]);
      } else {
        alert(data.error || "Failed to process structural bulk deletion requests.");
      }
    } catch (err) {
      console.error("Error executing collection batch deletion stream:", err);
      alert("Network timeout parsing array configuration context elements.");
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Selection toggle handling logic pipelines
  const toggleSelectLog = (id: number) => {
    setSelectedLogIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllFiltered = (filteredList: AuditLog[]) => {
    const filteredIds = filteredList.map(l => l.id);
    const allFilteredSelected = filteredIds.every(id => selectedLogIds.includes(id));

    if (allFilteredSelected) {
      setSelectedLogIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedLogIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  // Advanced Date helper calculation mechanics
  const getWeekNumber = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  // Comprehensive client-side log filtration engine
  const filteredLogs = logs.filter(log => {
    // 1. Role-based filtration processing
    const matchesTab = roleFilter === 'all' ? true : log.role === roleFilter;
    
    // 2. Main textual keywords parsing
    const searchTarget = `
      ${log.fullname || ''} 
      ${log.action || ''} 
      ${log.resource || ''} 
      ${log.ip_address || ''} 
      ${log.details || ''}
    `.toLowerCase();
    const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());

    // 3. Calendar timeframe extraction mechanics
    let matchesTimeframe = true;
    if (filterDate && log.created_at) {
      const logDate = new Date(log.created_at);
      const targetDate = new Date(filterDate);

      if (timeGranularity === 'day') {
        matchesTimeframe = logDate.toDateString() === targetDate.toDateString();
      } else if (timeGranularity === 'week') {
        const logYear = logDate.getFullYear();
        const targetYear = targetDate.getFullYear();
        const logWeek = getWeekNumber(logDate);
        const targetWeek = getWeekNumber(targetDate);
        matchesTimeframe = logYear === targetYear && logWeek === targetWeek;
      } else if (timeGranularity === 'month') {
        matchesTimeframe = logDate.getFullYear() === targetDate.getFullYear() && 
                           logDate.getMonth() === targetDate.getMonth();
      }
    }

    return matchesTab && matchesSearch && matchesTimeframe;
  });

  // Export Filtered View Matrix Dataset to a clean standalone PDF table
  const handleExportPDF = () => {
    if (filteredLogs.length === 0) return;

    const doc = new jsPDF('l', 'mm', 'a4'); // Use landscape mode for detailed operational matrix columns
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text("OrderClick Security Operations Audit Log Statement", 14, 18);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100);
    
    let filtersString = `Role Level Focus: [${roleFilter.toUpperCase()}]`;
    if (filterDate) {
      filtersString += ` • Temporal Boundary: [${timeGranularity.toUpperCase()}: ${filterDate}]`;
    }
    if (searchQuery) {
      filtersString += ` • Custom Search Expression: "${searchQuery}"`;
    }

    doc.text(`Active Filters Applied — ${filtersString}`, 14, 24);
    doc.text(`Report Export Handshake: ${new Date().toLocaleString()} • Active Record Vol: ${filteredLogs.length} Rows`, 14, 29);

    const tableRows = filteredLogs.map((log) => [
      `#${log.id}`,
      `${log.fullname || 'System Runtime'} (${log.role.toUpperCase()})`,
      log.action,
      `${log.resource.toUpperCase()} ${log.resource_id ? `#${log.resource_id}` : ''}`,
      log.details || 'None',
      log.ip_address || '0.0.0.0',
      log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'
    ]);

    autoTable(doc, {
      startY: 34,
      head: [['ID', 'Actor Entity (Role)', 'Action Name Signature', 'Resource Scope', 'Description Snippet', 'IP Address', 'Timestamp']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [0, 61, 61], fontSize: 8.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 40 },
        2: { cellWidth: 35 },
        3: { cellWidth: 30 },
        4: { cellWidth: 75 }, // Assigns wider wrapping space context for the mutation string details
        5: { cellWidth: 30 },
        6: { cellWidth: 40 }
      },
      alternateRowStyles: { fillColor: [250, 250, 250] }
    });

    doc.save(`Audit_Trails_Statement_${Date.now()}.pdf`);
  };

  // Dynamic badge style generator including verification actions
  const getActionBadgeStyle = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('APPROVE') || act.includes('VALIDATE') || act.includes('VERIFY') || act.includes('ACCEPT')) {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
        icon: <CheckCircle2 size={12} className="shrink-0 text-emerald-600" />
      };
    }
    if (act.includes('REJECT') || act.includes('DECLINE') || act.includes('DENY')) {
      return {
        bg: 'bg-red-50 text-red-700 border-red-200 font-bold',
        icon: <XCircle size={12} className="shrink-0 text-red-600" />
      };
    }
    if (act.includes('CREATE') || act.includes('ADD') || act.includes('INSERT')) {
      return {
        bg: 'bg-teal-50 text-teal-700 border-teal-100',
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
            Immutable tracking matrix capturing backend events, document approvals, receipt configurations, and administrative streams.
          </p>
        </div>

        {/* INTERACTIVE CONTROLS: REFRESH, EXPORT, PURGE, & BULK DELETIONS */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button 
            onClick={fetchAuditLogs}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-bold text-[#003d3d] bg-emerald-50 px-4 py-2.5 rounded-xl hover:bg-emerald-100 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> 
            Refresh Feed
          </button>

          <button
            onClick={handleExportPDF}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-2 text-xs font-bold text-white bg-[#003d3d] px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
          >
            <Download size={14} />
            Export Report (PDF)
          </button>

          {selectedLogIds.length > 0 && (
            <button 
              onClick={handleBulkDeleteLogs}
              disabled={loading}
              className="flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 px-4 py-2.5 rounded-xl hover:bg-rose-100 transition-all active:scale-95 cursor-pointer"
            >
              <Trash2 size={14} /> 
              Delete Selected ({selectedLogIds.length})
            </button>
          )}

          {logs.length > 0 && (
            <button 
              onClick={handlePurgeLogs}
              disabled={purging || loading}
              className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 px-4 py-2.5 rounded-xl hover:bg-red-100 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Trash2 size={14} /> 
              {purging ? 'Purging Trails...' : 'Purge All Logs'}
            </button>
          )}
        </div>
      </div>

      {/* FILTER CONTROL BAR: SEARCH PARAMETERS AND MULTI-GRAIN DATETIME SORTING */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
        
        {/* TEXT SEARCH */}
        <div className="relative w-full lg:col-span-4">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs by keyword patterns..."
            className="w-full pl-11 pr-4 py-2 bg-white text-slate-800 text-sm font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-[#003d3d] focus:ring-1 focus:ring-[#003d3d] transition-all placeholder:text-slate-400"
          />
        </div>

        {/* ADVANCED TIMEFRAME RADIAL CALENDAR CONTROLLER */}
        <div className="flex flex-wrap items-center gap-2 lg:col-span-5 w-full">
          <div className="relative flex-1 min-w-[160px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Calendar size={14} />
            </span>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-[#003d3d] text-center"
            />
          </div>

          {filterDate && (
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-tight shadow-sm shrink-0">
              {(['month', 'week', 'day'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTimeGranularity(mode)}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${timeGranularity === mode ? 'bg-[#003d3d] text-white' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          )}

          {filterDate && (
            <button
              onClick={() => { setFilterDate(''); setSearchQuery(''); }}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-xl transition-all cursor-pointer uppercase tracking-wider shrink-0"
            >
              Reset Time
            </button>
          )}
        </div>

        {/* ROLE FILTER SEGMENTATION TAB SYSTEM */}
        <div className="flex justify-end lg:col-span-3 w-full">
          <div className="flex bg-slate-200/60 p-0.5 rounded-xl border border-slate-200 text-[10px] font-bold uppercase tracking-wider w-full lg:w-auto overflow-x-auto scrollbar-none">
            {(['all', 'admin', 'customer', 'system'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-2 flex-1 lg:flex-none text-center rounded-lg transition-all whitespace-nowrap cursor-pointer ${roleFilter === role ? 'bg-white text-[#003d3d] shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {role === 'all' ? 'All' : role}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* DYNAMIC ACTIVITY TRAILS FEED */}
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
            We couldn't track logs corresponding to your specified timeframe or filter configurations.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_30px_rgba(0,61,61,0.02)] overflow-hidden">
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-left table-fixed border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4 w-[5%]">
                    <button 
                      type="button"
                      onClick={() => toggleSelectAllFiltered(filteredLogs)} 
                      className="text-slate-400 hover:text-[#003d3d] transition-colors focus:outline-none"
                    >
                      {filteredLogs.length > 0 && filteredLogs.every(l => selectedLogIds.includes(l.id)) ? (
                        <CheckSquare size={16} className="text-[#003d3d]" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="px-5 py-4 w-[15%]">Actor Entity</th>
                  <th className="px-5 py-4 w-[18%]">Action Signature</th>
                  <th className="px-5 py-4 w-[12%]">Target Resource</th>
                  <th className="px-5 py-4 w-[22%]">Mutation Description Snippet</th>
                  <th className="px-5 py-4 w-[10%]">IP Address</th>
                  <th className="px-5 py-4 w-[13%]">Execution Timestamp</th>
                  <th className="px-5 py-4 w-[15%] text-right">Diagnostic Matrix Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700 font-medium">
                {filteredLogs.map((log) => {
                  const badge = getActionBadgeStyle(log.action);
                  const isChecked = selectedLogIds.includes(log.id);
                  return (
                    <tr key={log.id} className={`hover:bg-slate-50/40 transition-colors ${isChecked ? 'bg-slate-50/70' : ''}`}>
                      
                      {/* CHECKBOX CELL */}
                      <td className="px-5 py-4 truncate">
                        <button 
                          type="button"
                          onClick={() => toggleSelectLog(log.id)}
                          className="text-slate-400 hover:text-[#003d3d] transition-colors focus:outline-none"
                        >
                          {isChecked ? (
                            <CheckSquare size={16} className="text-[#003d3d]" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>

                      {/* ACTOR CAPTURE */}
                      <td className="px-5 py-4 truncate">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            log.role === 'admin' 
                              ? 'bg-orange-50 text-orange-600 border border-orange-100' 
                              : log.role === 'customer'
                              ? 'bg-blue-50 text-blue-600 border border-blue-100'
                              : 'bg-purple-50 text-purple-600 border border-purple-100'
                          }`}>
                            {log.role === 'admin' ? <Settings size={13} /> : log.role === 'customer' ? <User size={13} /> : <ShieldAlert size={13} />}
                          </div>
                          <div className="overflow-hidden truncate">
                            <p className="font-bold text-slate-800 truncate">{log.fullname || "System Runtime"}</p>
                            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase block truncate">{log.role}</span>
                          </div>
                        </div>
                      </td>

                      {/* ACTION DESCRIPTION */}
                      <td className="px-5 py-4 truncate">
                        <span className={`inline-flex items-center gap-1.5 font-mono text-xs border px-2.5 py-1 rounded-md tracking-tight max-w-full truncate ${badge.bg}`}>
                          {badge.icon}
                          <span className="truncate">{log.action}</span>
                        </span>
                      </td>

                      {/* TARGET RESOURCE SCHEMA MATCH */}
                      <td className="px-5 py-4 truncate">
                        <div className="text-slate-600 flex items-center gap-1.5 overflow-hidden">
                          <span className={`font-semibold px-2 py-0.5 rounded border text-xs truncate ${
                            log.resource === 'receipts' || log.resource === 'orders' || log.resource === 'documents'
                              ? 'bg-teal-50 text-[#003d3d] border-teal-100 font-bold'
                              : 'bg-slate-50 text-slate-800 border-slate-100'
                          }`}>
                            {log.resource}
                          </span>
                          {log.resource_id && <span className="text-xs text-slate-400 font-mono font-bold shrink-0">#{log.resource_id}</span>}
                        </div>
                      </td>

                      {/* MUTATION DETAILS CELL */}
                      <td className="px-5 py-4 truncate">
                        <p className="text-xs text-slate-600 leading-relaxed font-normal truncate">
                          {(() => {
                            try {
                              if (!log.details) return <span className="italic text-slate-300">No description context attached.</span>;
                              
                              if (log.details.trim().startsWith('{') || log.details.trim().startsWith('[')) {
                                const parsedDetails = JSON.parse(log.details);
                                if (parsedDetails.message) return parsedDetails.message;
                                if (parsedDetails.status) return `Document status shifted to [${parsedDetails.status.toUpperCase()}]`;
                                if (parsedDetails.approver) return `Verified and authorized by ${parsedDetails.approver}`;
                                if (parsedDetails.updated_fields) {
                                  const fields = Object.keys(parsedDetails.updated_fields).filter(key => key !== 'timestamp').join(', ');
                                  return `Modified parameters: [${fields}]`;
                                }
                                return parsedDetails.details || log.details;
                              }
                              return log.details;
                            } catch (e) {
                              return log.details || "No description provided";
                            }
                          })()}
                        </p>
                      </td>

                      {/* NETWORK SIGNATURE */}
                      <td className="px-5 py-4 font-mono text-xs text-slate-500 truncate">
                        {log.ip_address || "0.0.0.0 (Internal)"}
                      </td>

                      {/* TIMESTAMP */}
                      <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap truncate">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                      </td>

                      {/* INSPECT & ACTIONS */}
                      <td className="px-5 py-4 text-right truncate">
                        <div className="flex items-center justify-end gap-1 overflow-hidden">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-[#003d3d] transition-all inline-flex items-center gap-1 text-xs font-bold shrink-0 cursor-pointer"
                            title="Inspect Log Packet Payload"
                          >
                            <Info size={15} /> <span className="hidden xl:inline">Inspect</span>
                          </button>
                          <button
                            onClick={() => handleDeleteSingleLog(log.id)}
                            className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-all inline-flex items-center gap-1 shrink-0 cursor-pointer"
                            title="Delete This Record Entry"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INSPECTOR HUD OVERLAY MODAL */}
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
                className="text-xs font-bold uppercase bg-slate-200/60 hover:bg-slate-200 text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto text-sm text-slate-700 scrollbar-none">
              
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

              {/* SPECIAL SYSTEM DOCUMENTS NOTIFICATION BANNER */}
              {(selectedLog.resource === 'receipts' || selectedLog.resource === 'orders' || selectedLog.resource === 'documents') && (
                <div className="bg-teal-50/50 border border-teal-100 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="text-[#003d3d]" size={18} />
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">Operational Verification Stream</h5>
                      <p className="text-[11px] text-slate-500">This event adjusted data elements belonging to digital receipts or documents.</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-black text-[#003d3d] bg-white border border-teal-100 px-2 py-1 rounded-lg">
                    Target #{selectedLog.resource_id || 'N/A'}
                  </span>
                </div>
              )}

              <div>
                <h4 className="text-xs uppercase font-black text-slate-400 tracking-wider mb-2">Operation Parameters</h4>
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
                <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-2xl overflow-x-auto max-h-40 shadow-inner leading-relaxed scrollbar-none">
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
                <div className="bg-slate-50 text-slate-600 border border-slate-200 rounded-2xl p-3 font-mono text-xs leading-relaxed">
                  {selectedLog.user_agent || "No software headers present."}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageAuditLog;