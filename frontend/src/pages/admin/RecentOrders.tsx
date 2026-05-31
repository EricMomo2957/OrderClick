import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';

interface Order {
  id: string | number;
  customer_name: string;
  total_amount: number;
  status: 'Pending' | 'Completed' | 'Cancelled';
  created_at: string;
}

const RecentOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Unified fetch hook extracting active storage tokens securely
  const fetchRecentOrders = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/admin/recent-orders', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 403 || response.status === 401) {
        console.error("Administrative authentication clearance rejected.");
        return;
      }

      if (!response.ok) throw new Error('Failed to resolve recent orders context');
      
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load recent orders dashboard widget:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentOrders();
  }, [fetchRecentOrders]);

  // Generates clean badges leveraging explicit key mappings safely
  const getStatusBadge = (status: Order['status']) => {
    const styles = {
      Pending: "bg-amber-50 text-amber-600 border-amber-100",
      Completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
      Cancelled: "bg-rose-50 text-rose-600 border-rose-100",
    };
    
    const displayStatus = status || 'Pending';

    return (
      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${styles[displayStatus] || styles.Pending}`}>
        {displayStatus}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Container Layout */}
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#003d3d]/5 flex items-center justify-center text-[#003d3d]">
            <ShoppingBag size={18} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Recent Orders</h3>
            <p className="text-xs text-slate-400 font-medium">Monitor latest incoming shopper processing requests.</p>
          </div>
        </div>
        <button className="flex items-center gap-1 text-xs font-bold text-[#003d3d] hover:gap-2 transition-all bg-slate-50 px-3 py-2 rounded-xl hover:bg-slate-100">
          View All <ArrowRight size={14} />
        </button>
      </div>

      {/* Table Interface Layer */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Placed Date</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              // Clean shimmer skeleton placeholder blocks matching the table structure
              Array.from({ length: 3 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded-md w-16" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded-md w-32" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded-md w-24" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded-md w-20" /></td>
                  <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded-xl w-20" /></td>
                </tr>
              ))
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                  {/* Order ID Tag Row */}
                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400 group-hover:text-[#003d3d] transition-colors">
                    #ORD-{order.id}
                  </td>
                  
                  {/* Customer Information Block */}
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {order.customer_name || 'Guest Shopper'}
                  </td>

                  {/* Placed Execution Date Row */}
                  <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'Recent'}
                  </td>

                  {/* Normalized Local Currency Representation Field */}
                  <td className="px-6 py-4 font-black text-slate-700">
                    ₱{(Number(order.total_amount) || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </td>

                  {/* Status Assignment Column */}
                  <td className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-16 text-xs italic font-medium text-slate-400 bg-slate-50/20">
                  No recent dashboard transactions logged on system registries.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;