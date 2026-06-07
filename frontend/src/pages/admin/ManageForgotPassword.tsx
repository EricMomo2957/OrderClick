import { useState, useEffect } from 'react';
import { Search, User, Mail, Calendar, CheckCircle, FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Clean functional registration declaration

interface ResetRequest {
  id: number;
  user_id: number;
  fullname: string;
  email: string;
  status: 'pending' | 'resolved';
  created_at: string;
}

const ManageForgotPassword = () => {
  const [requests, setRequests] = useState<ResetRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch password reset tickets from backend
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/forgot-password-requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok) {
        setRequests(data);
      } else {
        console.error(data.error || "Failed to load requests");
      }
    } catch (err) {
      console.error("Network error loading password reset items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Update request ticket to 'resolved'
  const handleResolve = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/forgot-password-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'resolved' }),
      });

      if (response.ok) {
        setRequests(prev =>
          prev.map(req => req.id === id ? { ...req, status: 'resolved' } : req)
        );
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update system state");
      }
    } catch (err) {
      console.error("Error patching database entry:", err);
      alert("Network connectivity issue.");
    }
  };

  // Combined Status Filter and Search Logic
  const filteredRequests = requests.filter(req => {
    const matchesStatus = filter === 'all' ? true : req.status === filter;
    const matchesSearch = 
      (req.fullname || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      req.email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Safe Explicit AutoTable Parameter Execution Loop
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add branding title elements
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(18);
      doc.text("OrderClick Recovery Audit Matrix Log", 14, 20);
      
      // Sub-text context notes
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 27);
      doc.text(`Active Partition Filter: ${filter.toUpperCase()} | Search Query: "${searchQuery || 'None'}"`, 14, 33);

      // Map table structural rows
      const tableRows = filteredRequests.map((req) => [
        `TK-${req.id}`,
        req.fullname || "Unknown Account",
        req.email,
        new Date(req.created_at).toLocaleString(),
        req.status.toUpperCase()
      ]);

      // Direct functional invocation instead of mutating the prototype chain
      autoTable(doc, {
        startY: 40,
        head: [['Ticket ID', 'Customer Identity', 'Recovery Email Address', 'Timestamp Dispatched', 'Status Flag']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [0, 61, 61], fontSize: 10, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });

      doc.save(`recovery-matrix-log-${filter}-${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF engine initialization failed:", error);
      alert("An issue occurred while generating your report. Check the dev console.");
    }
  };

  return (
    <div className="relative text-slate-700 min-h-screen px-4 py-2 animate-in fade-in duration-300">
      
      {/* Header Path Tracker */}
      <div className="text-[11px] font-black tracking-widest text-slate-400 uppercase mb-1">
        System / Authentication
      </div>

      {/* Title Header Section Layout */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          Account Recovery Matrix
        </h1>
        <p className="text-xs font-medium text-slate-500 mt-1">
          Review, verify, and track secure lifecycle tokens for customer-submitted password recovery operations.
        </p>
      </div>

      {/* Controls and Actions Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        
        {/* Search Field & PDF Button Sub-Flex Container */}
        <div className="flex flex-wrap items-center gap-3 w-full md:max-w-2xl">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
              <Search size={14} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search identity or email ledger..."
              className="w-full pl-10 pr-12 py-2 bg-slate-50 text-slate-800 text-xs font-bold rounded-full border border-slate-200/70 focus:outline-none focus:bg-white focus:border-slate-300 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-wider"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={filteredRequests.length === 0}
            className="flex items-center gap-2 text-[11px] font-bold text-slate-600 bg-white border border-slate-200/80 px-4 py-2 rounded-full hover:bg-slate-50 hover:text-slate-800 transition-all disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600 cursor-pointer"
          >
            <Download size={12} />
            Export Summary (PDF)
          </button>
        </div>

        {/* CONTROLS FILTER TABS BUTTON SET */}
        <div className="flex bg-slate-100/80 p-0.5 rounded-full border border-slate-200/60 text-[10px] font-black uppercase tracking-wider self-start md:self-auto">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer ${filter === 'pending' ? 'bg-white text-[#003d3d] shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Pending ({requests.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer ${filter === 'resolved' ? 'bg-white text-[#003d3d] shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Resolved
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer ${filter === 'all' ? 'bg-white text-[#003d3d] shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'}`}
          >
            All Logs
          </button>
        </div>
      </div>

      {/* CORE FLAT AUDIT TABLE VIEW */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 subpixel-antialiased text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="pl-6 pr-4 py-4 w-28">Ticket ID</th>
                <th className="px-4 py-4 w-60">Customer Identity</th>
                <th className="px-4 py-4">Recovery Email Address</th>
                <th className="px-4 py-4 w-52">Timestamp Dispatched</th>
                <th className="pl-4 pr-6 py-4 text-right w-48">System Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2 font-medium">
                      <span className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" />
                      <span>Syncing secure recovery tables...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium italic">
                    {searchQuery ? 'No operational parameters found matching the current input string query.' : 'No customer accounts require technical verification data.'}
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr 
                    key={request.id} 
                    className={`transition-colors border-l-2 ${
                      request.status === 'pending' 
                        ? 'bg-amber-50/10 border-l-amber-500 hover:bg-amber-50/20' 
                        : 'border-l-transparent hover:bg-slate-50/40'
                    }`}
                  >
                    
                    <td className="pl-6 pr-4 py-4">
                      <span className="inline-block px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200/50 rounded">
                        tk-{request.id}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded flex items-center justify-center text-slate-500 shrink-0 ${
                          request.status === 'pending' ? 'bg-amber-100/70 text-amber-800' : 'bg-slate-100'
                        }`}>
                          <User size={10} className="stroke-[2.5]" />
                        </div>
                        <span className={`tracking-tight ${request.status === 'pending' ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                          {request.fullname || "Unknown Account"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                        <Mail size={11} className="text-slate-300 shrink-0" />
                        <span>{request.email}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-400">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Calendar size={12} className="text-slate-300" />
                        <span>{new Date(request.created_at).toLocaleString()}</span>
                      </div>
                    </td>

                    <td className="pl-4 pr-6 py-4 text-right">
                      {request.status === 'pending' ? (
                        <button
                          onClick={() => handleResolve(request.id)}
                          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 transition-colors font-bold text-[11px] cursor-pointer"
                        >
                          <CheckCircle size={12} />
                          <span>Resolve Ticket</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider italic pr-1">
                          <FileText size={10} className="text-slate-300" />
                          Handled
                        </span>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageForgotPassword;