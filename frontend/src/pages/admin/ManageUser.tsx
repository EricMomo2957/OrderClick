import { useState, useEffect, useCallback } from 'react';
import { User, Mail, Calendar, RefreshCw, FileText, Search, X, Edit3, Trash2, ShieldAlert, CheckCircle, AlertCircle, Phone, MapPin, Smile, Fingerprint, Ban, UserCheck } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Customer {
  id: number;
  fullname: string;
  email: string;
  created_at: string;
  is_disabled?: number | boolean; 
  customer_id?: string;
  contact_number?: string;
  gender?: string;
  location?: string;
}

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
  const [editContactNumber, setEditContactNumber] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editLocation, setEditLocation] = useState('');

  const [actionLoading, setActionLoading] = useState(false);

  // Custom Toast State Layout Configuration
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'success'
  });

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const getAuthToken = () => {
    let token = localStorage.getItem('token');
    if (token) {
      token = token.replace(/^"|"$/g, ''); 
    }
    return token;
  };

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

  useEffect(() => {
    ui: fetchCustomers();
  }, [fetchCustomers]);

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditFullname(customer.fullname);
    setEditEmail(customer.email);
    setEditContactNumber(customer.contact_number || '');
    setEditGender(customer.gender || '');
    setEditLocation(customer.location || '');
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedCustomer(null);
    setEditFullname('');
    setEditEmail('');
    setEditContactNumber('');
    setEditGender('');
    setEditLocation('');
    setIsEditModalOpen(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    setActionLoading(true);
    const token = getAuthToken();

    try {
      // FIXED ENDPOINT ROUTE PATH MATCHING YOUR NEW EXPRESS MANAGEMENT ROUTES
      const response = await fetch(`http://localhost:5000/api/admin/customers/${selectedCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullname: editFullname,
          email: editEmail,
          contact_number: editContactNumber,
          gender: editGender,
          location: editLocation
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

  const handleToggleDisableCustomer = async (id: number, currentStatus: number | boolean | undefined) => {
    const actionText = currentStatus ? "re-enable" : "disable";
    const confirmAction = window.confirm(`Are you sure you want to ${actionText} this customer profile record?`);
    if (!confirmAction) return;

    const token = getAuthToken();
    try {
      const response = await fetch(`http://localhost:5000/api/admin/disable-customer/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        triggerToast(`Customer profile target account cleanly ${currentStatus ? 'enabled' : 'disabled'}.`, 'success');
        fetchCustomers();
      } else {
        const errorData = await response.json();
        triggerToast(`Status mutation failed: ${errorData.message || 'Access Denied'}`, 'error');
      }
    } catch (err) {
      console.error("Failed mutating block state context:", err);
      triggerToast("Error communicating with authentication matrix pipeline.", 'error');
    }
  };

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

  const filteredCustomers = customers.filter((user) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const matchesName = (user.fullname || '').toLowerCase().includes(query);
    const matchesEmail = (user.email || '').toLowerCase().includes(query);
    const matchesContactNumber = (user.contact_number || '').toLowerCase().includes(query);
    const matchesCustomerId = (user.customer_id || '').toLowerCase().includes(query);
    const matchesLocation = (user.location || '').toLowerCase().includes(query);
    const matchesIdString = `#usr-${user.id}`.includes(query) || `usr-${user.id}`.includes(query);

    return matchesName || matchesEmail || matchesContactNumber || matchesCustomerId || matchesLocation || matchesIdString;
  });

  const exportUserListPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); 
    
    doc.setFontSize(20);
    doc.setTextColor(0, 61, 61); 
    doc.text("ORDERCLICK: USER DIRECTORY", 148, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 148, 22, { align: 'center' });

    const targetDataset = filteredCustomers.length > 0 ? filteredCustomers : customers;

    const tableRows = targetDataset.map(user => [
      `#USR-${user.id}`,
      user.fullname,
      user.email,
      user.customer_id || '',
      user.contact_number || '',
      user.gender || '',
      user.location || '',
      user.is_disabled ? 'Disabled' : 'Active',
      new Date(user.created_at).toLocaleDateString()
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['ID', 'Customer Name', 'Email Address', 'Cust. ID', 'Contact #', 'Gender', 'Location', 'Status', 'Joined Date']],
      body: tableRows,
      headStyles: { fillColor: [0, 61, 61], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      margin: { top: 30 },
    });

    doc.save("OrderClick_User_Directory.pdf");
  };

  return (
    <div className="relative text-slate-700 min-h-screen px-4 py-2 animate-in fade-in duration-300">
      
      {/* Toast System Notification */}
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

      {/* Header Path Tracker */}
      <div className="text-[11px] font-black tracking-widest text-slate-400 uppercase mb-1">
        System / Customers
      </div>

      {/* Title Header Section Layout */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          Customer Directory Panel
        </h1>
        <p className="text-xs font-medium text-slate-500 mt-1">
          Immutable matrix monitoring registered system identities, record profiles, and authentication logs.
        </p>
      </div>

      {/* Control Feed Filter Actions Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={fetchCustomers}
            disabled={loading}
            className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 bg-emerald-50/60 border border-emerald-100/70 px-4 py-2 rounded-full hover:bg-emerald-100/80 transition-all disabled:opacity-50"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh Feed
          </button>
          
          <button 
            onClick={exportUserListPDF}
            disabled={customers.length === 0 || loading}
            className="flex items-center gap-2 text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200/60 px-4 py-2 rounded-full hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            <FileText size={12} />
            Export Document
          </button>
        </div>

        {/* Global Directory Lookups Search Input Framework */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={14} className="text-slate-400" />
          </div>
          <input 
            type="text"
            placeholder="Search directories by name, ID, contact, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200/70 rounded-full text-[11px] font-medium text-slate-700 placeholder-slate-400/90 focus:outline-none focus:border-slate-300 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Clean Flat Table Layout Board Area */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100">
                <th className="pl-6 pr-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-24">Actor Entity</th>
                <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Customer Name</th>
                <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
                <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Customer ID</th>
                <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contact Number</th>
                <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gender</th>
                <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Execution Timestamp</th>
                <th className="pl-4 pr-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right w-56">Diagnostic Matrix Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-24 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2 text-xs font-medium">
                      <RefreshCw size={14} className="animate-spin text-slate-400" />
                      <span>Syncing customer cluster nodes...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((user) => (
                  <tr key={user.id} className={`hover:bg-slate-50/40 transition-colors ${user.is_disabled ? 'bg-rose-50/20' : ''}`}>
                    {/* Mono Identity Block Badge */}
                    <td className="pl-6 pr-4 py-4">
                      <span className="inline-block px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200/50 rounded">
                        usr-{user.id}
                      </span>
                    </td>
                    
                    {/* Customer Profile Column */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${user.is_disabled ? 'bg-rose-50 border border-rose-200/50 text-rose-600' : 'bg-amber-50 border border-amber-200/50 text-amber-600'}`}>
                          <User size={12} className="stroke-[2.5]" />
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-semibold text-xs tracking-tight capitalize ${user.is_disabled ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                            {user.fullname}
                          </span>
                          {/* Check explicitly for a truthy value or equal to 1/true */}
                          {!!user.is_disabled && (
                            <span className="text-[9px] text-rose-500 font-extrabold tracking-wide uppercase">Suspended</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email Track Path */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <Mail size={12} className="text-slate-400 shrink-0" />
                        <span className={user.is_disabled ? 'text-slate-400' : ''}>{user.email}</span>
                      </div>
                    </td>

                    {/* Customer ID Cell */}
                    <td className="px-4 py-4 text-xs font-semibold text-slate-800 font-mono tracking-tight">
                        {user.customer_id || <span className="text-slate-300 font-normal text-[11px]">N/A</span>}
                    </td>

                    {/* Contact Number Cell */}
                    <td className="px-4 py-4 text-xs text-slate-700 font-medium">
                        {user.contact_number || <span className="text-slate-300 font-normal text-[11px]">None</span>}
                    </td>

                    {/* Gender Cell */}
                    <td className="px-4 py-4 text-xs text-slate-600 font-medium capitalize">
                        {user.gender || <span className="text-slate-300 font-normal text-[11px]">None</span>}
                    </td>

                    {/* Location Cell */}
                    <td className="px-4 py-4 text-xs text-slate-600 font-medium truncate max-w-[150px]">
                        {user.location || <span className="text-slate-300 font-normal text-[11px]">None Set</span>}
                    </td>

                    {/* Execution Registry Date Column */}
                    <td className="px-4 py-4 text-xs text-slate-400 font-normal">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-300" />
                        <span>{new Date(user.created_at).toLocaleString()}</span>
                      </div>
                    </td>

                    {/* Management Actions Inline Grid System */}
                    <td className="pl-4 pr-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3.5 text-xs">
                        <button
                          onClick={() => openEditModal(user)}
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-700 transition-colors font-medium text-[11px]"
                        >
                          <Edit3 size={11} />
                          <span>Inspect</span>
                        </button>

                        {/* BLOCK PROFILE ACTIONS INTERCEPTOR */}
                        <button
                          onClick={() => handleToggleDisableCustomer(user.id, user.is_disabled)}
                          className={`inline-flex items-center gap-1 transition-colors font-medium text-[11px] ${user.is_disabled ? 'text-emerald-500 hover:text-emerald-700' : 'text-amber-500 hover:text-rose-600'}`}
                          title={user.is_disabled ? "Authorize Access" : "Revoke Access"}
                        >
                          {user.is_disabled ? <UserCheck size={12} /> : <Ban size={12} />}
                          <span>{user.is_disabled ? "Enable" : "Disable"}</span>
                        </button>
                        
                        <button
                          onClick={() => handleDeleteClick(user.id, user.fullname)}
                          className="text-slate-300 hover:text-rose-600 transition-colors p-0.5"
                          title="Purge Record"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-20 text-center text-xs text-slate-400 font-medium italic">
                    {searchQuery ? `No system identities match lookup sequence: "${searchQuery}"` : 'No registered records discovered inside partition storage.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================== */}
      {/* ---      MODAL: EDIT MODIFIER FORM    --- */}
      {/* ========================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-100 w-full max-w-lg p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-5">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-0.5">
                  <ShieldAlert size={12} />
                  <span>Administrative Mutation</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 capitalize">Modify Profile of {selectedCustomer?.fullname}</h3>
              </div>
              <button 
                onClick={closeEditModal} 
                className="text-slate-400 hover:text-slate-600 bg-slate-50 p-1 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              
              {/* --- READ-ONLY SECTION --- */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Customer ID (Read Only)</label>
                <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-2">
                    <Fingerprint size={14} className="text-slate-500"/>
                    <span className="text-xs font-semibold text-slate-600 font-mono tracking-tight">
                      {selectedCustomer?.customer_id || 'NOT GENERATED'}
                    </span>
                </div>
              </div>

              {/* Core fields (Fullname & Email) in grid */}
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={editFullname}
                      onChange={(e) => setEditFullname(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-300 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-300 focus:bg-white transition-all"
                    />
                  </div>
              </div>

              {/* --- NEW EDITABLE FIELDS SECTION --- */}
              <div className="grid grid-cols-2 gap-4">
                  {/* Contact Number */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Contact Number</label>
                    <div className="relative">
                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                        <input 
                            type="text" 
                            placeholder="e.g., 0917XXXXXXX"
                            value={editContactNumber}
                            onChange={(e) => setEditContactNumber(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-300 focus:bg-white transition-all"
                        />
                    </div>
                  </div>

                  {/* Gender Select */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Gender Identification</label>
                    <div className="relative">
                        <Smile size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                        <select 
                            value={editGender}
                            onChange={(e) => setEditGender(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-300 focus:bg-white transition-all appearance-none"
                        >
                            <option value="">Select...</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                  </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Location / Address</label>
                <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input 
                        type="text" 
                        placeholder="e.g., Cebu City, Philippines"
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-300 focus:bg-white transition-all"
                    />
                </div>
              </div>
              
              {/* --- SUBMIT ACTIONS SECTION --- */}
              <div className="flex gap-2.5 pt-3 border-t border-slate-100 mt-5">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={actionLoading}
                  className="flex-1 text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 py-2 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 py-2 rounded-lg transition-all disabled:opacity-50"
                >
                  {actionLoading ? (
                    <RefreshCw size={12} className="animate-spin" />
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