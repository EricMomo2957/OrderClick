import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  FileText, 
  Search, 
  X, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  RefreshCw, 
  AlertCircle,
  User,
  HelpCircle,
  Download
} from 'lucide-react';

interface Receipt {
  id: number;
  display_name: string; 
  guest_name: string | null;
  registered_name: string | null;
  product_name: string;
  quantity: number;
  total_price: number;
  status: 'pending' | 'verified' | 'rejected';
  created_at?: string; 
  reference_number: string | null;
  payment_method: string;
}

const ManageReceipt = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom interactive notification popup state management
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const API_BASE = 'http://localhost:5000/api/orders'; 

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMessage({ text, type });
    setTimeout(() => setAlertMessage(null), 4000);
  };

  const fetchAllReceipts = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      const res = await axios.get(`${API_BASE}/all`, getAuthHeader());
      setReceipts(Array.isArray(res.data) ? res.data : []);
    } catch (error: any) {
      console.error("Failed to fetch receipts:", error);
      showAlert(error.response?.status === 401 ? "Unauthorized access token clearance." : "Failed loading system transactions.", "error");
    } finally {
      loading && setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { 
    fetchAllReceipts(); 
  }, []);

  // Filter computation engine mapping logic
  const filteredReceipts = receipts.filter((receipt) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const customerName = (receipt.display_name || '').toLowerCase();
    const productName = (receipt.product_name || '').toLowerCase();
    const explicitRef = (receipt.reference_number || '').toLowerCase();
    const statusState = (receipt.status || '').toLowerCase();
    const standardFallbackRef = `ref-${receipt.id}`;

    return (
      customerName.includes(query) ||
      productName.includes(query) ||
      explicitRef.includes(query) ||
      statusState.includes(query) ||
      standardFallbackRef.includes(query)
    );
  });

  // Individual Receipt PDF Generation logic
  const generatePDF = (receipt: Receipt) => {
    const doc = new jsPDF();
    const date = receipt.created_at ? new Date(receipt.created_at).toLocaleString() : new Date().toLocaleString();

    // Styled branding header
    doc.setFontSize(22);
    doc.setTextColor(0, 74, 128); // Matches UI theme primary palette
    doc.text("ORDERCLICK RECEIPT ARCHIVE", 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`System Generated Ledger Extract: ${new Date().toLocaleString()}`, 105, 27, { align: 'center' });

    // Transaction detail metadata cards
    doc.setFontSize(11);
    doc.setTextColor(50);
    doc.text(`Receipt Reference Identifier:`, 20, 42);
    doc.setFont("Helvetica", "bold");
    doc.text(`#REC-${receipt.id}`, 75, 42);

    doc.setFont("Helvetica", "normal");
    doc.text(`Customer Entity Assignment:`, 20, 50);
    doc.setFont("Helvetica", "bold");
    doc.text(`${receipt.display_name} ${receipt.guest_name ? '(GUEST)' : '(REGISTERED)'}`, 75, 50);
    
    doc.setFont("Helvetica", "normal");
    doc.text(`Timestamp of Execution:`, 20, 58);
    doc.text(`${date}`, 75, 58);
    
    const fallbackRef = receipt.reference_number && receipt.reference_number.trim() !== "" 
      ? receipt.reference_number 
      : `REF-${receipt.id}`;

    doc.text(`Payment Instrument Channel:`, 20, 66);
    doc.text(`${receipt.payment_method.toUpperCase()} [${fallbackRef}]`, 75, 66);
    
    doc.text(`Verification Clearing Status:`, 20, 74);
    doc.setFont("Helvetica", "bold");
    doc.text(`${receipt.status.toUpperCase()}`, 75, 74);

    // Build line-item transaction pricing matrices
    autoTable(doc, {
      startY: 84,
      head: [['Purchased Product Allocation Catalog', 'Quantity Base', 'Line Total']],
      body: [
        [receipt.product_name, `x${receipt.quantity}`, `PHP ${Number(receipt.total_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}`]
      ],
      headStyles: { fillColor: [0, 74, 128], fontSize: 10, fontStyle: 'bold' }, 
      alternateRowStyles: { fillColor: [245, 248, 250] },
      theme: 'striped',
      margin: { left: 20, right: 20 }
    });

    doc.save(`Receipt_REC-${receipt.id}.pdf`);
    showAlert(`Successfully printed receipt #REC-${receipt.id}`);
  };

  // Master List PDF Export Function 
  const exportFullLedgerPDF = () => {
    if (filteredReceipts.length === 0) return;

    const doc = new jsPDF();
    
    // Header Branding
    doc.setFontSize(20);
    doc.setTextColor(0, 74, 128); // Theme matching #004a80
    doc.text("ORDERCLICK: SYSTEM MANAGEMENT LEDGER", 105, 15, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Exported Registry Records: ${filteredReceipts.length} Entries Found | Generated on: ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });

    // Table Row Mapping 
    const tableRows = filteredReceipts.map(receipt => {
      const fallbackRef = receipt.reference_number && receipt.reference_number.trim() !== "" 
        ? receipt.reference_number 
        : `REF-${receipt.id}`;
      
      return [
        `#REC-${receipt.id}`,
        `${receipt.display_name} ${receipt.guest_name ? '(Guest)' : '(Reg)'}`,
        receipt.product_name,
        `x${receipt.quantity}`,
        fallbackRef,
        receipt.payment_method ? receipt.payment_method.toUpperCase() : 'CASH',
        `PHP ${Number(receipt.total_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        receipt.status.toUpperCase()
      ];
    });

    // AutoTable Structure Definition
    autoTable(doc, {
      startY: 30,
      head: [['ID', 'Customer Entity', 'Allocated Product', 'Qty', 'Reference Key', 'Method', 'Total Price', 'Status']],
      body: tableRows,
      headStyles: { fillColor: [0, 74, 128], textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      theme: 'striped',
      styles: { fontSize: 8.5, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold' },
        6: { fontStyle: 'bold', halign: 'right' },
        7: { fontStyle: 'bold' }
      },
      margin: { top: 30 },
    });

    doc.save("OrderClick_Receipts_Master_Ledger.pdf");
    showAlert("Successfully downloaded master records summary report.");
  };

  // FIXED: Expanded parameters to accurately match all expected string literals from the UI actions
  const handleUpdateStatus = async (id: number, status: 'pending' | 'verified' | 'rejected') => {
    try {
      await axios.put(`${API_BASE}/status/${id}`, { status }, getAuthHeader());
      showAlert(`Receipt verification successfully updated to "${status}".`);
      fetchAllReceipts();
    } catch (error) {
      showAlert("Authorization rejection: Update parameters denied.", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm(`Are you sure you want to permanently purge record ledger reference entry #REC-${id}?`)) {
      try {
        await axios.delete(`${API_BASE}/${id}`, getAuthHeader());
        showAlert(`Successfully purged transaction entry #REC-${id} from active schema arrays.`, 'success');
        fetchAllReceipts();
      } catch (error) {
        showAlert("Clearance verification error: Failed to drop record database keys.", "error");
      }
    }
  };

  return (
    <div className="p-4 relative min-h-screen animate-in fade-in duration-500">
      
      {/* Floating System Operational Notification Banner */}
      {alertMessage && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl transition-all border animate-bounce ${
          alertMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
            : 'bg-rose-50 text-rose-800 border-rose-100'
        }`}>
          <AlertCircle size={18} className={alertMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'} />
          <span className="text-xs font-black tracking-wide">{alertMessage.text}</span>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
        
        {/* Header Interactive Interface Control Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Orders & <span className="text-[#004a80]">Receipts Ledger</span>
              </h2>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => fetchAllReceipts(true)} 
                  disabled={refreshing || loading}
                  className="p-1.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-[#004a80] hover:bg-blue-50 transition-all disabled:opacity-50"
                  title="Force Reload Registries"
                >
                  <RefreshCw size={14} className={refreshing ? 'animate-spin text-[#004a80]' : ''} />
                </button>

                {/* Added Export Master PDF Report Button */}
                <button 
                  onClick={exportFullLedgerPDF} 
                  disabled={loading || filteredReceipts.length === 0}
                  className="flex items-center gap-1.5 text-[11px] font-black tracking-wide text-white bg-[#004a80] px-4 py-1.5 rounded-xl hover:bg-[#003861] transition-all disabled:opacity-50 shadow-sm"
                  title="Export Current Filtered Registry View"
                >
                  <Download size={13} /> Export Summary
                </button>
              </div>
            </div>
            <p className="text-gray-400 text-sm font-medium">Review transactions, issue invoice reports, and clear pending customer balance entries.</p>
          </div>
          
          {/* Dynamic Search Parameter Wrapper */}
          <div className="relative w-full lg:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search by customer name, products, or reference key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs focus:outline-none focus:border-blue-200 focus:bg-white text-slate-700 font-bold tracking-wide transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        
        {/* Responsive Content Table Registry Matrix */}
        <div className="overflow-x-auto rounded-3xl border border-slate-50">
          {loading ? (
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                  <th className="py-4 px-6 text-left">Customer</th>
                  <th className="py-4 px-6 text-left">Product</th>
                  <th className="py-4 px-6 text-left">Reference No.</th>
                  <th className="py-4 px-6 text-left">Method</th>
                  <th className="py-4 px-6 text-center">Total</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`receipt-skeleton-${idx}`} className="animate-pulse">
                    <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded-md w-28 mb-1" /><div className="h-3 bg-slate-100 rounded-md w-12" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded-md w-36" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded-md w-24" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded-md w-14" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded-md w-16 mx-auto" /></td>
                    <td className="py-4 px-6"><div className="h-5 bg-slate-100 rounded-xl w-16 mx-auto" /></td>
                    <td className="py-4 px-6"><div className="h-8 bg-slate-100 rounded-xl w-20 ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : filteredReceipts.length === 0 ? (
            <div className="text-center py-20 bg-slate-50/30 rounded-3xl border border-dashed border-slate-100">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <HelpCircle size={20} />
              </div>
              <p className="text-slate-400 text-xs font-bold tracking-wide">No transaction entries matched your criteria parameter query.</p>
              <p className="text-slate-300 text-[11px] font-medium mt-0.5">Try verifying spacing or running a partial alphanumeric character sequence search.</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                  <th className="py-4 px-6 text-left">Customer</th>
                  <th className="py-4 px-6 text-left">Product Allocation</th>
                  <th className="py-4 px-6 text-left">Reference No.</th>
                  <th className="py-4 px-6 text-left">Method</th>
                  <th className="py-4 px-6 text-center">Total Balance</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions Workflow</th>
                </tr>
              </thead>
              <tbody className="text-slate-600 text-xs font-medium divide-y divide-slate-50 bg-white">
                {filteredReceipts.map((r) => (
                  <tr key={r.id} className="hover:bg-blue-50/10 transition-colors group">
                    
                    {/* Customer Account Avatar Row Block */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${r.guest_name ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-[#004a80]'}`}>
                          <User size={13} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-800 tracking-tight">{r.display_name}</span>
                          <span className="text-[9px] text-slate-400 tracking-wider font-semibold">ID: #REC-{r.id}</span>
                          {r.guest_name && (
                            <span className="text-[8px] tracking-widest bg-amber-50 border border-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md font-black w-fit mt-1 uppercase">
                              Public Visitor
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Product Order Allocation Column */}
                    <td className="py-4 px-6 font-bold text-slate-700">
                      {r.product_name} <span className="text-slate-400 font-medium ml-1 bg-slate-50 px-1.5 py-0.5 rounded-md text-[10px]">x{r.quantity}</span>
                    </td>
                    
                    {/* Alphanumeric Payment Token Column */}
                    <td className="py-4 px-6 font-mono font-black text-teal-600 tracking-wider text-[11px]">
                      {r.reference_number && r.reference_number.trim() !== "" ? (
                        r.reference_number
                      ) : (
                        <span className="text-slate-300 italic font-normal tracking-wide">
                          REF-{r.id} (Auto)
                        </span>
                      )}
                    </td>
                    
                    {/* Billing Method Identifier */}
                    <td className="py-4 px-6">
                      <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md tracking-wider">
                        {r.payment_method || 'Cash'}
                      </span>
                    </td>

                    {/* Total Aggregated Financial Balance */}
                    <td className="py-4 px-6 text-center font-black text-[#004a80] text-sm">
                      ₱{Number(r.total_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    {/* Styled Badge Cleared State Wrapper */}
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border ${
                        r.status === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                        r.status === 'verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        'bg-rose-50 text-rose-800 border-rose-100'
                      }`}>
                        {r.status}
                      </span>
                    </td>

                    {/* Operational Action Workflow Suite Container */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        
                        {/* Dynamic Multi-state Toggle Framework Options */}
                        {r.status === 'pending' ? (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(r.id, 'verified')} 
                              className="bg-[#004a80] hover:bg-[#003861] text-white p-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1 text-[10px] font-bold px-2.5"
                              title="Approve Reference Document"
                            >
                              <CheckCircle size={12} /> Clear
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(r.id, 'rejected')} 
                              className="bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 p-1.5 rounded-xl transition-all flex items-center gap-1 text-[10px] font-bold px-2"
                              title="Deny Transaction Clearance"
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => generatePDF(r)} 
                              className="bg-slate-50 hover:bg-blue-50 border border-slate-100 text-[#004a80] px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wide transition-all flex items-center gap-1"
                              title="Export Document Summary"
                            >
                              <FileText size={12} /> Invoice PDF
                            </button>
                            
                            {/* Allow status reversals if a mistake was made during rapid moderation processing */}
                            <button 
                              onClick={() => handleUpdateStatus(r.id, 'pending')}
                              className="text-[10px] text-slate-400 hover:text-slate-600 px-2 py-1 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all font-bold"
                              title="Revert verification clearance to review pipeline"
                            >
                              Reset
                            </button>
                          </>
                        )}

                        {/* Purge / Eradicate Entry Drop Action */}
                        <button 
                          onClick={() => handleDelete(r.id)} 
                          className="text-slate-300 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50/50 transition-all ml-1"
                          title="Purge Entry Key"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageReceipt;