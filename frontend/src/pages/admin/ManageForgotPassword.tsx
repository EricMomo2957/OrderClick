import { useState, useEffect } from 'react';

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
        // Optimistically update status locally in UI
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

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6 font-['Inter']">
      
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">
            Account Recovery Matrix
          </h1>
          <p className="text-slate-500 text-sm">
            Review, verify, and resolve customer-submitted forgot password operations.
          </p>
        </div>

        {/* CONTROLS FILTER TABS */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition-all ${filter === 'pending' ? 'bg-white text-[#003d3d] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Pending ({requests.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 rounded-lg transition-all ${filter === 'resolved' ? 'bg-white text-[#003d3d] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Resolved
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-all ${filter === 'all' ? 'bg-white text-[#003d3d] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            All Logs
          </button>
        </div>
      </div>

      {/* CORE CONTENT REGION */}
      {loading ? (
        <div className="flex justify-center items-center h-48 text-slate-400 font-medium text-sm animate-pulse">
          Querying secure system logs...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center max-w-md mx-auto mt-8">
          <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">✓</div>
          <h3 className="text-slate-800 font-bold text-lg mb-1">System is Clear</h3>
          <p className="text-slate-400 text-sm">
            No customer accounts are currently flag-locked or waiting for password intervention adjustments.
          </p>
        </div>
      ) : (
        /* RESPONSIVE TABLE STRUCTURE */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_30px_rgba(0,61,61,0.02)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Customer Identity</th>
                  <th className="px-6 py-4">Recovery Email</th>
                  <th className="px-6 py-4">Timestamp Requested</th>
                  <th className="px-6 py-4">Status Flag</th>
                  <th className="px-6 py-4 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700 font-medium">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50/40 transition-colors">
                    
                    {/* FULL NAME */}
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {request.fullname || "Unknown Account"}
                    </td>

                    {/* EMAIL ADDRESS */}
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                      {request.email}
                    </td>

                    {/* DATE */}
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(request.created_at).toLocaleString()}
                    </td>

                    {/* STATUS PILL */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        request.status === 'pending' 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/50' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                      }`}>
                        {request.status}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 text-right">
                      {request.status === 'pending' ? (
                        <button
                          onClick={() => handleResolve(request.id)}
                          className="bg-[#003d3d] hover:bg-[#002828] text-white px-4 py-2 rounded-xl text-xs font-black tracking-wide shadow-md shadow-[#003d3d]/10 transition-all active:scale-[0.98]"
                        >
                          Mark as Resolved
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest italic pr-2">
                          Handled
                        </span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageForgotPassword;