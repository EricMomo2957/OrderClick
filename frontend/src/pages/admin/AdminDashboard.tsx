import { useState, useEffect } from 'react';
import AdminSidenav from './AdminSidenav';
import ManageProduct from './ManageProduct';
import ManageReceipt from './ManageReceipt';
import ManageUser from './ManageUser';
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
  // State remains here to drive the conditional rendering of the main area
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    pendingReceipts: 0,
    totalProducts: 0,
    lowStockItems: 0
  });

  // Fetch stats when on the dashboard tab
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/stats');
        const data = await res.json();
        setStats(data);
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
      {/* SIDENAV FOCUS: 
        The sidebar acts as the primary controller for the 'activeTab' state.
      */}
      <AdminSidenav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
      />

      {/* MAIN CONTENT AREA: A mirror of the state dictated by the Sidenav */}
      <main className="ml-64 flex-1 p-10">
        {activeTab === 'dashboard' && (
          <AdminOverview stats={stats} setActiveTab={setActiveTab} />
        )}

        {/* Inside your AdminDashboard main content area */}
        {activeTab === 'customers' && <ManageUser />}

        {activeTab === 'products' && <ManageProduct />}

        {activeTab === 'receipts' && <ManageReceipt />}

        {activeTab === 'customers' && (
          <div className="p-10 bg-white rounded-[2rem] shadow-sm animate-in fade-in duration-500">
             <h2 className="text-2xl font-bold text-slate-800">Customer List</h2>
             <p className="text-slate-500 italic mt-4 text-sm">User directory module coming soon.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-10 bg-white rounded-[2rem] shadow-sm animate-in fade-in duration-500">
             <h2 className="text-2xl font-bold text-slate-800">System Settings</h2>
             <p className="text-slate-500 italic mt-4 text-sm">Portal configuration settings coming soon.</p>
          </div>
        )}
        
      </main>
    </div>
  );
};

/**
 * INTERNAL COMPONENT: AdminOverview
 * Keeps the Dashboard home view logic isolated.
 */
const AdminOverview = ({ stats, setActiveTab }: { stats: DashboardStats, setActiveTab: (t: string) => void }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <header className="flex justify-between items-end mb-10">
      <div>
        <h2 className="text-4xl font-black text-[#1e293b] tracking-tight">System Overview</h2>
        <p className="text-slate-500 font-medium">Welcome back, Admin. Everything is running smoothly.</p>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
        <p className="text-sm font-bold text-teal-600 flex items-center gap-1">
          <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
          System Live
        </p>
      </div>
    </header>

    {/* Main Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
      <StatCard label="Revenue" value={`₱${stats.totalSales.toLocaleString()}`} icon="💰" color="text-blue-600" />
      <StatCard label="Orders" value={stats.pendingReceipts} icon="📄" color="text-amber-500" />
      <StatCard label="Inventory" value={stats.totalProducts} icon="📦" color="text-indigo-600" />
      <StatCard 
        label="Low Stock" 
        value={stats.lowStockItems} 
        icon="⚠️" 
        color="text-red-500" 
        isAlert={stats.lowStockItems > 0} 
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold mb-4 text-slate-800">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setActiveTab('products')} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-teal-500 hover:bg-teal-50 transition-all text-left">
            <p className="text-2xl mb-2">🛍️</p>
            <p className="font-bold text-slate-800">Add New Product</p>
            <p className="text-xs text-slate-500">Update your inventory stock</p>
          </button>
          <button onClick={() => setActiveTab('receipts')} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
            <p className="text-2xl mb-2">📑</p>
            <p className="font-bold text-slate-800">Verify Receipts</p>
            <p className="text-xs text-slate-500">Check pending payments</p>
          </button>
        </div>
      </div>

      <div className="bg-[#0f172a] p-8 rounded-[2rem] text-white shadow-xl">
        <h3 className="text-lg font-bold mb-4">Notifications</h3>
        <div className="space-y-4">
          {stats.lowStockItems > 0 ? (
            <div className="flex gap-3 items-start p-3 bg-white/10 rounded-xl border border-white/10">
              <span className="text-xl">🚨</span>
              <div>
                <p className="text-sm font-bold text-red-300">Stock Warning</p>
                <p className="text-xs text-slate-300">{stats.lowStockItems} items are running low.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic text-center py-4">No urgent notifications.</p>
          )}
        </div>
      </div>
    </div>
  </div>
);

/**
 * HELPER COMPONENT: StatCard
 */
const StatCard = ({ label, value, icon, color, isAlert }: { label: string, value: string | number, icon: string, color: string, isAlert?: boolean }) => (
  <div className={`bg-white p-6 rounded-[2rem] shadow-sm border ${isAlert ? 'border-red-200 bg-red-50/30' : 'border-slate-100'} transition-all hover:-translate-y-1 hover:shadow-md`}>
    <div className="flex justify-between items-start mb-4">
      <div className="text-2xl p-2 rounded-xl bg-slate-50">{icon}</div>
      {isAlert && <span className="flex h-2 w-2 rounded-full bg-red-500"></span>}
    </div>
    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{label}</p>
    <p className={`text-2xl font-black ${color} truncate`}>{value}</p>
  </div>
);

export default AdminDashboard;