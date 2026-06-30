import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Package, AlertCircle, Medal, DollarSign, ArrowUpRight } from 'lucide-react';

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
        
        // Sort locally to guarantee top order regardless of API return order
        const sortedProducts = (topRes.data || []).sort((a: Product, b: Product) => b.total_sold - a.total_sold);
        setTopProducts(sortedProducts);
        
        setHistory(histRes.data || []);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  // COMPUTED METRICS: Sum total revenue dynamically from history array safely
  const totalNetRevenue = history.reduce((sum, order) => {
    return sum + (Number(order.total_price) || 0);
  }, 0);

  if (loading) return (
    <div className="flex items-center gap-2 text-slate-400 animate-pulse p-8 font-mono text-xs font-black uppercase tracking-widest justify-center min-h-screen w-full">
        <Clock size={16} className="animate-spin text-[#003d3d]" /> <span>Syncing portal...</span>
    </div>
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen w-full font-['Inter']">
      
      {/* HEADER SYSTEM TITLE */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Your Dashboard</h1>
        <p className="text-slate-400 text-xs font-medium">Real-time terminal workspace, identity telemetry, and activity matrix tracking.</p>
      </div>

      {/* NEW: TOP SYSTEM KPI METRIC GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* TOTAL REVENUE GRID METRIC */}
        <div className="bg-[#003d3d] rounded-[2rem] p-6 text-white shadow-lg shadow-[#003d3d]/10 flex items-center justify-between relative overflow-hidden group">
          <div className="absolute right-[-5%] bottom-[-10%] opacity-10 text-white group-hover:scale-110 transition-transform duration-300">
            <DollarSign size={140} />
          </div>
          <div className="space-y-2 relative z-10">
            <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase font-mono bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
              Financial Metric
            </span>
            <h2 className="text-slate-300/80 text-xs font-bold uppercase tracking-wider pt-1">Total Net Price</h2>
            <p className="text-3xl font-black tracking-tight font-mono text-white">
              ₱{totalNetRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 self-start shadow-sm">
            <ArrowUpRight className="text-emerald-400" size={20} />
          </div>
        </div>

        {/* LOGGED TRANSACTIONS METRIC */}
        <div className="bg-white rounded-[2rem] p-6 text-slate-800 shadow-sm border border-slate-200/60 flex items-center justify-between relative overflow-hidden group">
          <div className="space-y-2">
            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase font-mono bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/40">
              System Telemetry
            </span>
            <h2 className="text-slate-400 text-xs font-bold uppercase tracking-wider pt-1">Processed Transactions</h2>
            <p className="text-3xl font-black tracking-tight font-mono text-slate-800">
              {history.length} <span className="text-xs font-bold text-slate-400 font-sans tracking-normal">Receipts Logs</span>
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-[#003d3d]/5 flex items-center justify-center border border-slate-100 self-start shadow-sm">
            <Package className="text-[#003d3d]" size={20} />
          </div>
        </div>

      </div>

      {/* MASTER RESPONSIVE LAYOUT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Main Transaction History Workspace */}
        <div className="xl:col-span-8 space-y-8 order-2 xl:order-1">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Transaction History</h2>
              <span className="text-[10px] bg-slate-200/60 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">{history.length} Entries</span>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100">
                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Description</th>
                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Net Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.length > 0 ? (
                    history.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-5 font-semibold text-slate-700 text-sm group-hover:text-[#003d3d] transition-colors">{order.product_name}</td>
                        <td className="p-5 text-sm font-mono font-black text-right text-slate-800">₱{Number(order.total_price).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="p-16 text-center text-slate-400 font-mono text-xs">
                        <AlertCircle className="mx-auto mb-2 opacity-40 text-slate-400" size={20} />
                        No system logs or processed orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* RIGHT SIDEBAR: Restructured Top Performing Inventory Panel */}
        <aside className="xl:col-span-4 space-y-4 order-1 xl:order-2">
          <div className="mb-4">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Top Performing Inventory</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
            {topProducts.slice(0, 6).map((p, index) => (
              <div 
                key={p.id} 
                className={`p-4 rounded-2xl transition-all duration-200 hover:translate-y-[-2px] ${
                  index === 0 
                    ? 'bg-[#003d3d] shadow-lg shadow-[#003d3d]/10 text-white border border-[#003d3d]' 
                    : 'bg-white border border-slate-200/80 shadow-sm text-slate-800'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className={`p-1.5 rounded-lg ${index === 0 ? 'bg-white/10' : 'bg-slate-100'}`}>
                    <Package className={index === 0 ? "text-emerald-400" : "text-slate-400"} size={16} />
                  </div>
                  {index < 3 && (
                    <Medal className={index === 0 ? "text-yellow-400" : "text-slate-400/70"} size={14} />
                  )}
                </div>
                
                <h3 className="font-bold text-sm tracking-tight line-clamp-2 min-h-[40px] flex items-center">
                  {p.name}
                </h3>
                
                <div className="mt-3 pt-2.5 border-t border-dashed flex justify-between items-center text-[10px] font-mono font-bold uppercase tracking-wider">
                  <span className={index === 0 ? 'text-teal-200/60' : 'text-slate-400'}>Velocity Metric:</span>
                  
                  <span className={`px-2.5 py-1 rounded-xl text-[11px] font-black tracking-wide ${
                    index === 0 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : index === 1
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : index === 2
                      ? 'bg-slate-100 text-slate-700 border border-slate-200'
                      : 'bg-slate-50 text-slate-500 border border-slate-100'
                  }`}>
                    SOLD: {p.total_sold}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>

      </div>
    </div>
  );
}