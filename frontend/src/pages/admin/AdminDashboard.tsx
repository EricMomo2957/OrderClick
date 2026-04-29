import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import AdminSidenav from './AdminSidenav';
import ManageProduct from './ManageProduct';
import ManageReceipt from './ManageReceipt';
import ManageUser from './ManageUser';
import AdminEvent from './AdminEvent'; //

interface AdminDashboardProps {
  onLogout: () => void;
}

interface DashboardStats {
  totalSales: number;
  pendingReceipts: number;
  totalProducts: number;
  lowStockItems: number;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    pendingReceipts: 0,
    totalProducts: 0,
    lowStockItems: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/stats');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        
        setStats({
          totalSales: data.revenue || 0,
          pendingReceipts: data.receipts || 0,
          totalProducts: data.products || 0,
          lowStockItems: data.lowStock || 0
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    if (activeTab === 'dashboard') {
      fetchStats();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-['Inter']">
      <AdminSidenav activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

      <main className="ml-64 flex-1 p-10">
        {activeTab === 'dashboard' && (
          <AdminOverview stats={stats} setActiveTab={setActiveTab} />
        )}
        {activeTab === 'products' && <ManageProduct />}
        {activeTab === 'receipts' && <ManageReceipt />}
        {activeTab === 'customers' && <ManageUser />}
        {/* Added AdminEvent Tab */}
        {activeTab === 'events' && <AdminEvent />} 
      </main>
    </div>
  );
};

const AdminOverview = ({ stats, setActiveTab }: { stats: DashboardStats, setActiveTab: (t: string) => void }) => {
  
  const barData = [
    { name: 'Current Revenue', value: stats.totalSales },
    { name: 'Revenue Goal', value: 5000 },
  ];

  const pieData = [
    { name: 'Total Products', value: stats.totalProducts, color: '#6366f1' },
    { name: 'Pending Receipts', value: stats.pendingReceipts, color: '#f59e0b' },
    { name: 'Low Stock', value: stats.lowStockItems, color: '#ef4444' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-[#1e293b] tracking-tight">System Overview</h2>
          <p className="text-slate-500 font-medium text-sm">Welcome back, Admin. Everything is running smoothly.</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
          <p className="text-xs font-bold text-teal-600 flex items-center gap-1 justify-end">
            <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></span>
            System Live
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Revenue" value={`₱${(stats?.totalSales || 0).toLocaleString()}`} icon="💰" color="text-blue-600" />
        <StatCard label="Total Receipts" value={stats?.pendingReceipts || 0} icon="📄" color="text-amber-500" />
        <StatCard label="Inventory" value={stats?.totalProducts || 0} icon="📦" color="text-indigo-600" />
        <StatCard label="Low Stock" value={stats?.lowStockItems || 0} icon="⚠️" color="text-red-500" isAlert={(stats?.lowStockItems || 0) > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">Revenue Analysis</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="value" fill="#004a80" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
          <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider text-left">Stock & Orders</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '12px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="text-md font-bold mb-4 text-slate-800">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button onClick={() => setActiveTab('products')} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#004a80] hover:bg-blue-50/50 transition-all text-left group">
              <p className="text-xl mb-1 group-hover:scale-110 transition-transform">🛍️</p>
              <p className="font-bold text-slate-800 text-sm">Add Product</p>
              <p className="text-[10px] text-slate-500">Update inventory</p>
            </button>
            <button onClick={() => setActiveTab('receipts')} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#004a80] hover:bg-blue-50/50 transition-all text-left group">
              <p className="text-xl mb-1 group-hover:scale-110 transition-transform">📑</p>
              <p className="font-bold text-slate-800 text-sm">Verify Receipts</p>
              <p className="text-[10px] text-slate-500">Check payments</p>
            </button>
            {/* Added Event Quick Action */}
            <button onClick={() => setActiveTab('events')} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#004a80] hover:bg-blue-50/50 transition-all text-left group">
              <p className="text-xl mb-1 group-hover:scale-110 transition-transform">📅</p>
              <p className="font-bold text-slate-800 text-sm">Post Event</p>
              <p className="text-[10px] text-slate-500">Manage schedules</p>
            </button>
          </div>
        </div>

        <div className="bg-[#0f172a] p-6 rounded-[2rem] text-white shadow-xl">
          <h3 className="text-md font-bold mb-4">Notifications</h3>
          <div className="space-y-3">
            {(stats?.lowStockItems || 0) > 0 ? (
              <div className="flex gap-3 items-start p-3 bg-white/10 rounded-xl border border-white/10">
                <span className="text-lg">🚨</span>
                <div>
                  <p className="text-xs font-bold text-red-300">Stock Warning</p>
                  <p className="text-[10px] text-slate-300">{stats.lowStockItems} items are running low.</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-4">No urgent notifications.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color, isAlert }: { label: string, value: string | number, icon: string, color: string, isAlert?: boolean }) => (
  <div className={`bg-white p-5 rounded-[1.8rem] shadow-sm border ${isAlert ? 'border-red-200 bg-red-50/30' : 'border-slate-100'} transition-all hover:-translate-y-1 hover:shadow-md`}>
    <div className="flex justify-between items-center mb-3">
      <div className="text-xl p-2 rounded-lg bg-slate-50">{icon}</div>
      {isAlert && <span className="flex h-2 w-2 rounded-full bg-red-500"></span>}
    </div>
    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{label}</p>
    <p className={`text-xl font-black ${color} truncate`}>{value}</p>
  </div>
);

export default AdminDashboard;