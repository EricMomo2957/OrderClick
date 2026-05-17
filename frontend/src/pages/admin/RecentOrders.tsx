import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';

interface Order {
  id: string;
  customer_name: string;
  total_amount: number;
  status: 'Pending' | 'Completed' | 'Cancelled';
  created_at: string;
}

const RecentOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentOrders = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/admin/recent-orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to load recent orders", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentOrders();
  }, [fetchRecentOrders]);

  const getStatusBadge = (status: Order['status']) => {
    const styles = {
      Pending: "bg-amber-50 text-amber-600 border-amber-100",
      Completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
      Cancelled: "bg-rose-50 text-rose-600 border-rose-100",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-6">
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <h3 className="text-xl font-black text-slate-800">Recent Orders</h3>
          <p className="text-xs text-slate-400 font-medium">Monitor latest incoming shopper processing requests.</p>
        </div>
        <button className="flex items-center gap-1 text-xs font-bold text-[#003d3d] hover:gap-2 transition-all">
          View All <ArrowRight size={14} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-xs italic text-slate-400">Loading orders...</td>
              </tr>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">#ORD-{order.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{order.customer_name}</td>
                  <td className="px-6 py-4 font-black text-slate-700">₱{order.total_amount.toLocaleString()}</td>
                  <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-10 text-xs italic text-slate-400">No recent transactions.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;