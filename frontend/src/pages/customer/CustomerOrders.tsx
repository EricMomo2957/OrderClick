import { useState, useEffect } from 'react';
import { Download, RefreshCw } from 'lucide-react'; 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Receipt {
  id: number;
  user_id: number;
  product_id: number;
  product_name: string; 
  quantity: number;
  total_price: number;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

interface CustomerOrdersProps {
  user: any;
}

const CustomerOrders = ({ user }: CustomerOrdersProps) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`http://localhost:5000/api/orders/user/${user.id}`);
      const data = await res.json();
      setReceipts(data);
    } catch (err) {
      console.error("Error fetching receipts:", err);
    }
  };

  const generatePDF = (receipt: Receipt) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(0, 61, 61); 
    doc.text("OrderClick Official Receipt", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Customer: ${user?.name || 'Valued Shopper'}`, 14, 32);
    doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 14, 38);

    autoTable(doc, {
      startY: 45,
      head: [['Order ID', 'Product', 'Quantity', 'Price', 'Status', 'Date']],
      body: [[
        `#ORD-${receipt.id}`,
        receipt.product_name || `Item #${receipt.product_id}`,
        receipt.quantity.toString(),
        `PHP ${Number(receipt.total_price).toLocaleString()}`,
        receipt.status.toUpperCase(),
        new Date(receipt.created_at).toLocaleDateString()
      ]],
      headStyles: { fillColor: [0, 61, 61] },
      theme: 'grid'
    });

    doc.save(`Receipt_ORD_${receipt.id}.pdf`);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-slate-800">My Purchase History</h2>
        <button onClick={fetchReceipts} className="flex items-center gap-2 text-xs font-bold text-teal-600 bg-teal-50 px-4 py-2 rounded-xl hover:bg-teal-100 transition-all">
          <RefreshCw size={14} /> Refresh List
        </button>
      </div>
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {receipts.length > 0 ? (
              receipts.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 font-mono text-xs text-slate-400">#ORD-{r.id}</td>
                  <td className="px-8 py-5 font-bold text-slate-800">
                    {r.product_name || `Product #${r.product_id}`} 
                    <span className="text-[10px] text-slate-400 ml-2">x{r.quantity}</span>
                  </td>
                  <td className="px-8 py-5 font-black text-[#003d3d]">₱{Number(r.total_price).toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      r.status === 'verified' ? 'bg-green-100 text-green-600' :
                      r.status === 'rejected' ? 'bg-red-100 text-red-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <button onClick={() => generatePDF(r)} className="flex items-center gap-2 bg-[#003d3d] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#002d2d] transition-all shadow-md active:scale-95">
                      <Download size={14} /> Receipt
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic">No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerOrders;