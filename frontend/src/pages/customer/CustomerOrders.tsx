import { useState, useEffect, useCallback } from 'react';
import { Download, RefreshCw, PackageCheck } from 'lucide-react'; 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Receipt {
  id: number;
  user_id: number;
  product_id: number;
  product_name: string; // From the JOIN in backend
  quantity: number;
  total_price: number;
  status: 'pending' | 'verified' | 'rejected';
  payment_method?: string;      // Added field mapping from backend model
  reference_number?: string | null; // Added field mapping from backend model
  created_at: string;
}

const CustomerOrders = ({ user }: { user: any }) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReceipts = useCallback(async () => {
    if (!user?.id) return;
    
    const token = localStorage.getItem('token'); 

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/user/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });

      if (res.status === 401) {
        console.error("Authorization failed: Token is missing or expired.");
        setReceipts([]);
        return;
      }

      const data = await res.json();
      
      if (Array.isArray(data)) {
        setReceipts(data);
      } else {
        setReceipts([]);
      }
    } catch (err) {
      console.error("Error fetching receipts:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  // Export Full History List to PDF
  const handleDownloadFullHistoryPDF = () => {
    if (receipts.length === 0) return;

    const doc = new jsPDF();
    
    // Add corporate system branding header elements
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text("OrderClick Purchase History Statement", 14, 20);
    
    // Subtext meta-references
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Account Holder: ${user?.fullname || user?.name || 'Valued Shopper'}`, 14, 27);
    doc.text(`Statement Generated: ${new Date().toLocaleString()}`, 14, 33);

    // Map rows cleanly out of raw receipts storage array
    const tableRows = receipts.map((r) => [
      `#ORD-${r.id}`,
      r.product_name,
      r.quantity.toString(),
      r.payment_method || 'N/A',
      r.reference_number || 'None',
      `PHP ${Number(r.total_price).toLocaleString()}`,
      r.status.toUpperCase()
    ]);

    // Calculate aggregated expenditure volume
    const totalExpenditure = receipts.reduce((sum, r) => sum + Number(r.total_price), 0);

    // Render using autotable functional handler wrapper context
    autoTable(doc, {
      startY: 40,
      head: [['Order ID', 'Product Details', 'Qty', 'Method', 'Reference No', 'Total Price', 'Status']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [0, 61, 61], fontSize: 9, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8.5 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      foot: [['', '', '', '', 'AGGREGATE TOTAL:', `PHP ${totalExpenditure.toLocaleString()}`, '']],
      footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', fontSize: 9 }
    });

    doc.save(`Purchase_History_${user?.id || 'User'}_${Date.now()}.pdf`);
  };

  const generatePDF = (receipt: Receipt) => {
    const doc = new jsPDF();
    
    // UI Styling for PDF Header
    doc.setFontSize(22);
    doc.setTextColor(0, 61, 61); 
    doc.text("OrderClick Official Receipt", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    
    // Left Metadata Block
    doc.text(`Customer Name: ${user?.fullname || user?.name || 'Valued Shopper'}`, 14, 32);
    doc.text(`Order ID: #ORD-${receipt.id}`, 14, 38);
    doc.text(`Date Ordered: ${new Date(receipt.created_at).toLocaleDateString()}`, 14, 44);

    // Right Metadata Block (Dynamic Payment info rendering)
    if (receipt.payment_method) {
      doc.text(`Payment Method: ${receipt.payment_method}`, 130, 32);
    }
    if (receipt.reference_number) {
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(13, 148, 136); // Teal-600 colored text accent match
      doc.text(`Reference No: ${receipt.reference_number}`, 130, 38);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(100);
    }

    autoTable(doc, {
      startY: 50,
      head: [['Product Name', 'Quantity', 'Unit Price', 'Total Payment']],
      body: [[
        receipt.product_name,
        receipt.quantity.toString(),
        `PHP ${(Number(receipt.total_price) / receipt.quantity).toLocaleString()}`,
        `PHP ${Number(receipt.total_price).toLocaleString()}`
      ]],
      headStyles: { fillColor: [0, 61, 61], fontStyle: 'bold' },
      foot: [['', '', 'TOTAL PAID', `PHP ${Number(receipt.total_price).toLocaleString()}`]],
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
      theme: 'striped'
    });

    doc.save(`OrderClick_Receipt_${receipt.id}.pdf`);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto p-4">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800">My Purchase History</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Verified Transactions Only</p>
        </div>
        
        {/* Actions Button Row Setup Layout */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleDownloadFullHistoryPDF}
            disabled={receipts.length === 0}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 transition-all border border-slate-200/80 px-5 py-2.5 rounded-xl shadow-sm disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
          >
            <Download size={14} />
            Export Full History (PDF)
          </button>

          <button 
            onClick={fetchReceipts} 
            disabled={loading}
            className="flex items-center gap-2 text-xs font-bold text-teal-600 bg-teal-50 px-5 py-2.5 rounded-xl hover:bg-teal-100 transition-all border border-teal-100 shadow-sm cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> 
            {loading ? 'Updating...' : 'Refresh List'}
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {receipts.length > 0 ? (
                receipts.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 font-mono text-xs text-slate-400">
                      <div className="flex flex-col">
                        <span className="font-bold">#ORD-{r.id}</span>
                        {r.reference_number && (
                          <span className="text-[9px] font-mono font-black text-teal-600 mt-1 bg-teal-50/50 px-1.5 py-0.5 rounded w-max">
                            {r.reference_number}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{r.product_name}</span>
                        <div className="flex gap-2 items-center mt-0.5">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Qty: {r.quantity}</span>
                          {r.payment_method && (
                            <>
                              <span className="text-[10px] text-slate-300">•</span>
                              <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                                {r.payment_method}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center font-black text-[#003d3d] text-lg">
                      ₱{Number(r.total_price).toLocaleString()}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border ${
                        r.status === 'verified' ? 'bg-green-50 text-green-600 border-green-100' :
                        r.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                        r.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => generatePDF(r)} 
                        className="inline-flex items-center gap-2 bg-[#003d3d] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        <Download size={14} /> Receipt
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <PackageCheck size={64} className="mb-4" />
                      <p className="text-xl font-black uppercase tracking-widest">No orders found</p>
                    </div>
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

export default CustomerOrders;