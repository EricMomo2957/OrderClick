import { useState, useEffect, useCallback } from 'react';
import { User, Mail, Phone, MapPin, Calendar, RefreshCw, FileText, CheckCircle2, XCircle, Search, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface GuestOrder {
  id: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  guest_address: string;
  product_id: number;
  quantity: number;
  total_price: string;
  reference_number: string | null;
  payment_method: string | null;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

const ManageGuestOrder = () => {
  const [orders, setOrders] = useState<GuestOrder[]>([]);
  const [loading, setLoading] = useState(true);
  // State layer for filtering engine input
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch guest orders from API
  const fetchGuestOrders = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/admin/guest-orders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 403) {
        alert("Unauthorized Access. Admin credentials required.");
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch guest orders');

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load guest orders", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuestOrders();
  }, [fetchGuestOrders]);

  // Comprehensive client-side lookup filtering core engine
  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const matchesName = (order.guest_name || '').toLowerCase().includes(query);
    const matchesEmail = (order.guest_email || '').toLowerCase().includes(query);
    const matchesPhone = (order.guest_phone || '').toLowerCase().includes(query);
    const matchesRef = (order.reference_number || '').toLowerCase().includes(query);
    const matchesIdString = `#ord-${order.id}`.includes(query) || `ord-${order.id}`.includes(query);

    return matchesName || matchesEmail || matchesPhone || matchesRef || matchesIdString;
  });

  // Handle verification status modifications
  const handleUpdateStatus = async (orderId: number, newStatus: 'verified' | 'rejected') => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/admin/guest-orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');

      // Locally update state array items efficiently
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Error changing status structural state", err);
      alert("Failed to update status.");
    }
  };

  // PDF generation report structure for external auditing
  const exportGuestOrdersPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape rotation layout for wider data sets
    
    doc.setFontSize(18);
    doc.setTextColor(0, 61, 61); // Matches brand identity palette #003d3d
    doc.text("ORDERCLICK: GUEST ORDERS DIRECTORY", 148, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 148, 22, { align: 'center' });

    // Use filtered orders list if active, ensuring matching reports
    const targetDataset = filteredOrders.length > 0 ? filteredOrders : orders;

    const tableRows = targetDataset.map(order => [
      `#ORD-${order.id}`,
      order.guest_name,
      order.guest_email,
      order.guest_phone,
      order.payment_method || 'N/A',
      order.reference_number || 'N/A',
      `PHP ${parseFloat(order.total_price).toFixed(2)}`,
      order.status.toUpperCase(),
      new Date(order.created_at).toLocaleDateString()
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Order ID', 'Guest Name', 'Email Address', 'Phone No.', 'Method', 'Reference No.', 'Total Price', 'Status', 'Date']],
      body: tableRows,
      headStyles: { fillColor: [0, 61, 61], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      margin: { top: 30 },
    });

    doc.save("OrderClick_Guest_Orders_Report.pdf");
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Upper Dashboard Grid Panel Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Guest Order Requests</h2>
          <p className="text-slate-500 text-sm">Review transactions, audit credentials and verify GCash Reference numbers from unauthenticated guests.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Functional Responsive Engine Layout Box */}
          <div className="relative min-w-[280px]">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input 
              type="text"
              placeholder="Search guest name, ref, contact..."
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
            <button 
              onClick={exportGuestOrdersPDF}
              disabled={orders.length === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-bold text-white bg-[#003d3d] px-5 py-2.5 rounded-xl hover:bg-[#002d2d] transition-all disabled:opacity-50"
            >
              <FileText size={14} /> Export PDF
            </button>

            <button 
              onClick={fetchGuestOrders}
              disabled={loading}
              className="flex items-center justify-center gap-2 text-xs font-bold text-[#003d3d] bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh List
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Info</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest Details</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Summary</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Order Meta Info */}
                    <td className="px-6 py-5 font-mono text-xs text-slate-500">
                      <span className="font-bold block text-slate-700">#ORD-${order.id}</span>
                      <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400">
                        <Calendar size={12} />
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Guest Contact Profiles */}
                    <td className="px-6 py-5">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 mt-0.5 rounded-full bg-[#003d3d]/10 flex items-center justify-center text-[#003d3d] shrink-0">
                          <User size={14} />
                        </div>
                        <div className="flex flex-col max-w-[200px]">
                          <span className="font-bold text-slate-800 truncate">{order.guest_name}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Mail size={12} className="shrink-0" />{order.guest_email}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Phone size={12} className="shrink-0" />{order.guest_phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Guest Shipping Addresses */}
                    <td className="px-6 py-5 max-w-[180px]">
                      <div className="text-xs text-slate-600 flex items-start gap-1">
                        <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{order.guest_address}</span>
                      </div>
                    </td>

                    {/* Gateway Payment Credentials */}
                    <td className="px-6 py-5">
                      <div className="text-xs">
                        <span className="font-bold text-slate-800 block">PHP {parseFloat(order.total_price).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        <div className="mt-1 flex flex-col gap-0.5 text-slate-500 text-[11px]">
                          <span>Method: <b className="text-slate-700 uppercase">{order.payment_method || 'Unspecified'}</b></span>
                          {order.reference_number && (
                            <span className="font-mono text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5 inline-block w-fit">
                              REF: {order.reference_number}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* UI Status Badging components */}
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        order.status === 'verified' ? 'bg-green-50 text-green-700 border border-green-200' :
                        order.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {order.status}
                      </span>
                    </td>

                    {/* Action Execution Intersections */}
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        {order.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'verified')}
                              className="flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <CheckCircle2 size={13} /> Verify
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'rejected')}
                              className="flex items-center gap-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <XCircle size={13} /> Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Action Completed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 italic">
                    {loading ? 'Fetching guest database rows...' : searchQuery ? `No records found matching "${searchQuery}"` : 'No guest orders found.'}
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

export default ManageGuestOrder;