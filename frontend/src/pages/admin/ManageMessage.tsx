import { useState, useEffect, useCallback } from 'react';
import { Mail, User, Calendar, CheckCircle, Archive, Trash2, RefreshCw, MessageSquare, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface VisitorMessage {
  id: number;
  fullname: string;
  email: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  created_at: string;
}

const ManageMessage = () => {
  const [messages, setMessages] = useState<VisitorMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'archived'>('all');

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/admin/messages/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Could not collect customer inquiries.');
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error("Error gathering message tracking lists:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleUpdateStatus = async (id: number, newStatus: 'read' | 'archived') => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/admin/messages/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Could not modify state details.');
      
      setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, status: newStatus } : msg));
    } catch (err) {
      alert("Failed to adjust status lifecycle configuration.");
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this visitor inquiry?")) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/admin/messages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Could not drop row from database.');
      
      setMessages(prev => prev.filter(msg => msg.id !== id));
    } catch (err) {
      alert("Failed to delete message.");
    }
  };

  const filteredMessages = messages.filter(msg => filter === 'all' ? true : msg.status === filter);

  // Export Filtered Messages to PDF Action Method
  const handleExportPDF = () => {
    if (filteredMessages.length === 0) return;

    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Header styling
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text("Visitor Communications Statement", 14, 18);
    
    // Metadata block
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Active Filter Focus: [${filter.toUpperCase()}]`, 14, 24);
    doc.text(`Report Export Handshake: ${new Date().toLocaleString()} • Record Vol: ${filteredMessages.length} Items`, 14, 29);

    const tableRows = filteredMessages.map((msg) => [
      `inq-${msg.id}`,
      `${msg.fullname}\n(${msg.email})`,
      msg.message,
      msg.status.toUpperCase(),
      msg.created_at ? new Date(msg.created_at).toLocaleString() : 'N/A'
    ]);

    autoTable(doc, {
      startY: 34,
      head: [['Inquiry ID', 'Sender Identity', 'Message Context Payload', 'Status', 'Dispatched Time']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42], fontSize: 9, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8.5, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 45 },
        2: { cellWidth: 70 },
        3: { cellWidth: 20, fontStyle: 'bold' },
        4: { cellWidth: 30 }
      },
      alternateRowStyles: { fillColor: [250, 250, 250] }
    });

    doc.save(`Visitor_Messages_Statement_${Date.now()}.pdf`);
  };

  return (
    <div className="relative text-slate-700 min-h-screen px-4 py-2 animate-in fade-in duration-300">
      
      {/* Header Path Tracker */}
      <div className="text-[11px] font-black tracking-widest text-slate-400 uppercase mb-1">
        System / Feedback
      </div>

      {/* Title Header Section Layout */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          Visitor Communications Matrix
        </h1>
        <p className="text-xs font-medium text-slate-500 mt-1">
          Review, track, and audit incoming inquiries and user feedback payloads routed from the main landing page.
        </p>
      </div>

      {/* Control Feed Filter Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={fetchMessages}
            disabled={loading}
            className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 bg-emerald-50/60 border border-emerald-100/70 px-4 py-2 rounded-full hover:bg-emerald-100/80 transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh Feed
          </button>

          <button
            onClick={handleExportPDF}
            disabled={filteredMessages.length === 0 || loading}
            className="flex items-center gap-2 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-full hover:bg-slate-50 transition-all disabled:opacity-40 cursor-pointer"
          >
            <Download size={12} />
            Export Report (PDF)
          </button>
        </div>

        {/* Dynamic State Selection Filter Dropdown */}
        <div className="relative">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="appearance-none text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200/70 pl-4 pr-10 py-2 rounded-full outline-none focus:bg-white focus:border-slate-300 transition-all cursor-pointer"
          >
            <option value="all">All Inquiries</option>
            <option value="unread">Unread Feed</option>
            <option value="read">Read Content</option>
            <option value="archived">Archived Log</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            <MessageSquare size={10} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* Clean Flat Table Layout Board Area */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100">
                <th className="pl-6 pr-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-24">Inquiry Link</th>
                <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-56">Sender Identity</th>
                <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Message Context Payload</th>
                <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-44">Dispatched Time</th>
                <th className="pl-4 pr-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right w-56">Diagnostic Matrix Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2 text-xs font-medium">
                      <RefreshCw size={14} className="animate-spin text-slate-400" />
                      <span>Syncing global messages array data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMessages.length > 0 ? (
                filteredMessages.map((msg) => (
                  <tr 
                    key={msg.id} 
                    className={`transition-colors border-l-2 ${
                      msg.status === 'unread' 
                        ? 'bg-emerald-50/10 border-l-emerald-500 font-medium hover:bg-emerald-50/20' 
                        : 'border-l-transparent hover:bg-slate-50/40'
                    }`}
                  >
                    {/* Identity Reference Tag Badge */}
                    <td className="pl-6 pr-4 py-4">
                      <span className="inline-block px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200/50 rounded">
                        inq-{msg.id}
                      </span>
                    </td>

                    {/* Sender Compound Column */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded flex items-center justify-center text-slate-500 shrink-0 ${
                            msg.status === 'unread' ? 'bg-emerald-100/70 text-emerald-700' : 'bg-slate-100'
                          }`}>
                            <User size={10} className="stroke-[2.5]" />
                          </div>
                          <span className={`text-xs tracking-tight ${msg.status === 'unread' ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                            {msg.fullname}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 pl-7">
                          <Mail size={10} />
                          <span>{msg.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Message Text Payload Block */}
                    <td className="px-4 py-4 max-w-sm lg:max-w-md">
                      <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </div>
                    </td>

                    {/* Generation Date Metric Column */}
                    <td className="px-4 py-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-300" />
                        <span>{new Date(msg.created_at).toLocaleString()}</span>
                      </div>
                    </td>

                    {/* Operational Management Actions Flex Array */}
                    <td className="pl-4 pr-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3.5 text-xs">
                        {msg.status === 'unread' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(msg.id, 'read')}
                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold text-[11px] cursor-pointer"
                          >
                            <CheckCircle size={12} />
                            <span>Read</span>
                          </button>
                        )}
                        
                        {msg.status !== 'archived' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(msg.id, 'archived')}
                            className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-700 transition-colors font-medium text-[11px] cursor-pointer"
                          >
                            <Archive size={12} />
                            <span>Archive</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="text-slate-300 hover:text-rose-600 transition-colors p-0.5 ml-1 cursor-pointer"
                          title="Purge Communication Data"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-xs text-slate-400 font-medium italic">
                    No matching visitor approaches found inside this storage filter partition.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageMessage;