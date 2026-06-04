import { useState, useEffect, useCallback } from 'react';
import { User, Mail, Calendar, RefreshCw, FileText, Search, X, Edit3, Trash2, ShieldAlert, CheckCircle, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Customer {
  id: number;
  fullname: string;
  email: string;
  created_at: string;
}

// Interface configuration schema for our custom inline status banners
interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

const ManageUser = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State Layers for the Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editFullname, setEditFullname] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Custom Toast State Layout Configuration
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'success'
  });

  // Helper utility to trigger smooth modal notification toasts
  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
  };

  // Automatically clear notification banners over time
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Helper helper to get cleaned admin token securely
  const getAuthToken = () => {
    let token = localStorage.getItem('token');
    if (token) {
      token = token.replace(/^"|"$/g, ''); 
    }
    return token;
  };

  // Unified Fetch Function pointing to backend endpoints
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const token = getAuthToken();

    try {
      const response = await fetch('http://localhost:5000/api/admin/customers', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401 || response.status === 403) {
        triggerToast("Session expired or unauthorized access. Please re-login.", 'error');
        return;
      }

      if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to load customers:", err);
      triggerToast("Failed to fetch customer directories from cluster.", 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Triggers automatically when dashboard view mounts
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Open Edit Dialog Modal Framework
  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditFullname(customer.fullname);
    setEditEmail(customer.email);
    setIsEditModalOpen(true);
  };

  // Close Edit Dialog Framework Reset
  const closeEditModal = () => {
    setSelectedCustomer(null);
    setEditFullname('');
    setEditEmail('');
    setIsEditModalOpen(false);
  };

  // PUT: Update Profile Records Submission Handler
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    setActionLoading(true);
    const token = getAuthToken();

    try {
      const response = await fetch(`http://localhost:5000/api/admin/update-customer/${selectedCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullname: editFullname,
          email: editEmail
        })
      });

      if (response.ok) {
        triggerToast("Customer details updated successfully.", 'success');
        closeEditModal();
        fetchCustomers(); 
      } else {
        const errorData = await response.json();
        triggerToast(`Update failed: ${errorData.message || 'Server error'}`, 'error');
      }
    } catch (err) {
      console.error("Error modifying customer record context:", err);
      triggerToast("Failed to contact API server layout system.", 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // DELETE: Permanent database deletion routine
  const handleDeleteClick = async (id: number, name: string) => {
    const confirmDeletion = window.confirm(`Are you absolutely sure you want to permanently delete account signature context for "${name}" (#USR-${id})? This will generate a transaction log record.`);
    if (!confirmDeletion) return;

    const token = getAuthToken();

    try {
      const response = await fetch(`http://localhost:5000/api/admin/delete-customer/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        triggerToast("Customer trace logs deleted from system storage.", 'success');
        fetchCustomers();
      } else {
        const errorData = await response.json();
        triggerToast(`Deletion failed: ${errorData.message || 'Ensure authorization permissions'}`, 'error');
      }
    } catch (err) {
      console.error("Database structural drops exception processing:", err);
      triggerToast("Failed to reach server for account removal context.", 'error');
    }
  };

  // Comprehensive client-side lookup filtering core engine
  const filteredCustomers = customers.filter((user) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const matchesName = (user.fullname || '').toLowerCase().includes(query);
    const matchesEmail = (user.email || '').toLowerCase().includes(query);
    const matchesIdString = `#usr-${user.id}`.includes(query) || `usr-${user.id}`.includes(query);

    return matchesName || matchesEmail || matchesIdString;
  });

  // PDF Generation for the filtered list
  const exportUserListPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(0, 61, 61); // Matches #003d3d theme
    doc.text("ORDERCLICK: USER DIRECTORY", 105, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });

    const targetDataset = filteredCustomers.length > 0 ? filteredCustomers : customers;

    const tableRows = targetDataset.map(user => [
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
    <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ========================================== */}
      {/* ---      CUSTOM TOAST NOTIFICATION     --- */}
      {/* ========================================== */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 min-w-[320px] bg-white border border-slate-100 rounded-2xl shadow-xl animate-in slide-in-from-top-6 duration-300">
          <div className={`p-2 rounded-xl ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">System Notice</h4>
            <p className="text-slate-500 font-medium text-[11px] mt-0.5 leading-relaxed">{toast.message}</p>
          </div>
          <button 
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Upper Layout Controls Flex Grid Panel */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800">User Directory</h2>
          <p className="text-slate-500 text-sm">Manage and view all registered customer accounts.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Functional Search Engine Inline Input Box */}
          <div className="relative min-w-[280px]">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input 
              type="text"
              placeholder="Search customer name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#003d3d]/20 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex gap-2 shrink-0">
            {/* PDF Download Button */}
            <button 
              onClick={exportUserListPDF}
              disabled={customers.length === 0 || loading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-bold text-white bg-[#003d3d] px-5 py-2.5 rounded-xl hover:bg-[#002d2d] transition-all disabled:opacity-50"
            >
              <FileText size={14} /> Export PDF
            </button>

            {/* Refresh Button */}
            <button 
              onClick={fetchCustomers}
              disabled={loading}
              className="flex items-center justify-center gap-2 text-xs font-bold text-[#003d3d] bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh List
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid View Controller Interface Layout Panel */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Name</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined Date</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Diagnostic Matrix Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw size={14} className="animate-spin text-[#003d3d]" />
                    <span>Fetching users...</span>
                  </div>
                </td>
              </tr>
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map((user) => (
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
                  {/* Action Layout Buttons Panel */}
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => openEditModal(user)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#003d3d] bg-slate-100 hover:bg-[#003d3d]/10 px-3 py-1.5 rounded-xl transition-all"
                      >
                        <Edit3 size={12} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user.id, user.fullname)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 px-3 py-1.5 rounded-xl transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic">
                  {searchQuery ? `No customers found matching "${searchQuery}"` : 'No customers found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================== */}
      {/* ---       MODAL: EDIT MODIFIER FORM    --- */}
      {/* ========================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] border border-slate-100 w-full max-w-md p-8 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#003d3d] uppercase tracking-wider mb-1">
                  <ShieldAlert size={14} />
                  <span>Administrative Mutation</span>
                </div>
                <h3 className="text-xl font-black text-slate-800">Modify Account Profile</h3>
              </div>
              <button 
                onClick={closeEditModal} 
                className="text-slate-400 hover:text-slate-600 bg-slate-50 p-1.5 rounded-xl transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Customer Full Name</label>
                <input 
                  type="text" 
                  required
                  value={editFullname}
                  onChange={(e) => setEditFullname(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#003d3d]/30 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address Target</label>
                <input 
                  type="email" 
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#003d3d]/30 focus:bg-white transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={actionLoading}
                  className="flex-1 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200/70 py-3 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-[#003d3d] hover:bg-[#002d2d] py-3 rounded-xl transition-all shadow-md disabled:opacity-50"
                >
                  {actionLoading ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUser;