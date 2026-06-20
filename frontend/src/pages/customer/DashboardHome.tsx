import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Package, AlertCircle } from 'lucide-react';

// Data Structures
interface Announcement {
  id: number;
  title: string;
  message: string;
  image_url?: string;
}

interface Product {
  id: number;
  name: string;
  total_sold: number;
}

interface Order {
  id: number;
  product_name: string;
  total_price: number | string;
}

interface DashboardProps {
  userId: number;
}

export default function DashboardHome({ userId }: DashboardProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const numericUserId = Number(userId);
      if (!numericUserId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [annRes, topRes, histRes] = await Promise.all([
          axios.get('http://localhost:5000/api/announcements/all'),
          axios.get('http://localhost:5000/api/orders/products/top-selling', config),
          axios.get(`http://localhost:5000/api/orders/user/${numericUserId}`, config)
        ]);

        setAnnouncements(annRes.data || []);
        setTopProducts(topRes.data || []);
        setHistory(histRes.data || []);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  if (loading) return (
    <div className="flex items-center gap-2 text-slate-400 animate-pulse p-8 font-mono text-xs font-black uppercase tracking-widest justify-center">
        <Clock size={16} className="animate-spin text-[#003d3d]" /> <span>Syncing portal...</span>
    </div>
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen w-full">
      <h1 className="text-2xl font-black mb-6 text-slate-800 uppercase tracking-tight">Your Dashboard</h1>
      
      {/* Announcements Section */}
      <section className="mb-8">
        <h2 className="text-sm font-black mb-4 text-slate-400 uppercase tracking-widest font-mono">Latest Broadcasts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {announcements.slice(0, 3).map((a) => (
            <div key={a.id} className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
              {a.image_url && (
                <img 
                  src={`http://localhost:5000${a.image_url}`} 
                  alt={a.title} 
                  className="w-full h-32 object-cover rounded-xl mb-4 bg-slate-100" 
                />
              )}
              <h3 className="font-black text-slate-800 mb-1">{a.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2">{a.message}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Products Section */}
      <section className="mb-8">
        <h2 className="text-sm font-black mb-4 text-slate-400 uppercase tracking-widest font-mono">Top Performing Inventory</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {topProducts.map((p) => (
            <div key={p.id} className="min-w-[180px] p-6 bg-[#003d3d] text-white rounded-3xl shadow-lg">
              <Package className="mb-3 text-emerald-400" size={24} />
              <p className="font-black text-lg">{p.name}</p>
              <p className="text-xs text-emerald-100/70 mt-1 uppercase font-mono font-bold">Sold: {p.total_sold}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Order History Section */}
      <section>
        <h2 className="text-sm font-black mb-4 text-slate-400 uppercase tracking-widest font-mono">Transaction History</h2>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {history.length > 0 ? (
                history.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-6 font-bold text-slate-800 text-sm">{order.product_name}</td>
                    <td className="p-6 text-sm font-mono font-black text-right">₱{Number(order.total_price).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="p-12 text-center text-slate-400 font-mono text-xs">
                    <AlertCircle className="mx-auto mb-2 opacity-50" />
                    No orders processed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}