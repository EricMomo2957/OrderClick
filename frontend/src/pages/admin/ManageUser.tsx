import { useState, useEffect, useCallback } from 'react';
import { User, Mail, Calendar, RefreshCw, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Customer {
  id: number;
  fullname: string;
  email: string;
  created_at: string;
}

const ManageUser = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Unified Fetch Function pointing to the REAL backend endpoint path with structural fixes
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    
    // Get token and trim any accidental whitespace or quotes
    let token = localStorage.getItem('token'); 
    if (token) {
      token = token.replace(/^"|"$/g, ''); // Removes wrapping quotes if stored as JSON string
    }

    console.log("Current Admin Token being sent:", token); // <-- Diagnostic log

    try {
      // NOTE: Using port 5000 based on your working backend configuration setup
      const response = await fetch('http://localhost:5000/api/admin/customers', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Server Response Status:", response.status); // <-- Diagnostic log

      if (response.status === 401 || response.status === 403) {
        alert("Session expired or unauthorized access. Please re-login.");
        return;
      }

      if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

      const data = await response.json();
      console.log("Data successfully fetched:", data); // <-- Diagnostic log
      setCustomers(data);
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Triggers automatically when you enter the tab layout view
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // PDF Generation for the full list
  const exportUserListPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(0, 61, 61); // Matches #003d3d theme
    doc.text("ORDERCLICK: USER DIRECTORY", 105, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });

    // Table Generation
    const tableRows = customers.map(user => [
      `#USR-${user.id}`,
      user.fullname,
      user.email,
      new Date(user.created_at).toLocaleDateString()
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['ID', 'Customer Name', 'Email Address', 'Joined Date']],
      body: tableRows,
      headStyles: { fillColor: [0, 61, 61], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      margin: { top: 30 },
    });

    doc.save("OrderClick_User_Directory.pdf");
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800">User Directory</h2>
          <p className="text-slate-500 text-sm">Manage and view all registered customer accounts.</p>
        </div>
        
        <div className="flex gap-3">
          {/* PDF Download Button */}
          <button 
            onClick={exportUserListPDF}
            disabled={customers.length === 0 || loading}
            className="flex items-center gap-2 text-xs font-bold text-white bg-[#003d3d] px-5 py-2.5 rounded-xl hover:bg-[#002d2d] transition-all disabled:opacity-50"
          >
            <FileText size={14} /> Export PDF
          </button>

          {/* Refresh Button */}
          <button 
            onClick={fetchCustomers}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-bold text-[#003d3d] bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh List
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Name</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-slate-400 italic">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw size={14} className="animate-spin text-[#003d3d]" />
                    <span>Fetching users...</span>
                  </div>
                </td>
              </tr>
            ) : customers.length > 0 ? (
              customers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 font-mono text-xs text-slate-400">#USR-{user.id}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#003d3d]/10 flex items-center justify-center text-[#003d3d]">
                        <User size={14} />
                      </div>
                      <span className="font-bold text-slate-800">{user.fullname}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail size={14} className="text-slate-400" />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Calendar size={14} />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-slate-400 italic">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUser;