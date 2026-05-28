import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend 
} from 'recharts';
import { AlertTriangle, ArrowRight } from 'lucide-react'; // Added icons for cleaner alerting layout UI
import RevenueSummary from './RevenueSummary';
import RecentOrders from './RecentOrders';
import TopProducts from './TopProducts';

interface AdminOverviewProps {
    setActiveTab: Dispatch<SetStateAction<string>>;
}

const AdminOverview = ({ setActiveTab }: AdminOverviewProps) => {
    const [stats, setStats] = useState({
        revenue: 0,
        receipts: 0,
        products: 0,
        lowStock: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch('http://localhost:5000/api/admin/stats', {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (res.ok) {
                    const data = await res.json();
                    setStats({
                        revenue: data.revenue,
                        receipts: data.receipts,
                        products: data.products,
                        lowStock: data.lowStock
                    });
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Data for Bar Chart: Volume Comparison
    const volumeData = [
        { name: 'Total Receipts', value: stats.receipts, fill: '#fb923c' },
        { name: 'Total Products', value: stats.products, fill: '#2563eb' },
        { name: 'Low Stock Items', value: stats.lowStock, fill: '#ef4444' },
    ];

    // Data for Pie Chart: Inventory Health
    const inventoryData = [
        { name: 'Healthy Stock', value: Math.max(0, stats.products - stats.lowStock) },
        { name: 'Low Stock (≤ 5)', value: stats.lowStock },
    ];
    const COLORS = ['#10b981', '#ef4444'];

    if (loading) {
        return <div className="p-10 text-slate-400 font-bold animate-pulse">Loading Statistics...</div>;
    }

    return (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Title Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">System Dashboard Overview</h2>
                    <p className="text-slate-500 text-sm">Real-time business analytics and live summary data.</p>
                </div>
            </div>

            {/* CRITICAL LOW INVENTORY WARNING SYSTEM BANNER DISPLAY PANEL */}
            {stats.lowStock > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-[1.25rem] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                            <AlertTriangle size={20} className="animate-bounce" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-amber-900">Critical Stock Warning Detected</h4>
                            <p className="text-amber-700 text-xs mt-0.5">
                                There are currently <span className="font-bold">{stats.lowStock}</span> item(s) running with stock quantities at or below 5 units.
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setActiveTab('products')}
                        className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-500/20 hover:bg-amber-500/30 px-4 py-2 rounded-xl transition-all self-stretch sm:self-auto justify-center"
                    >
                        Restock Inventory <ArrowRight size={14} />
                    </button>
                </div>
            )}

            {/* Top Stat Interactive Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col justify-between min-h-[110px]">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gross Revenue</p>
                    <p className="text-2xl font-black text-[#004a80] truncate">
                        ₱{Number(stats.revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </div>

                <div onClick={() => setActiveTab('receipts')} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 cursor-pointer hover:border-orange-500 transition-colors flex flex-col justify-between min-h-[110px]">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Receipts</p>
                    <p className="text-2xl font-black text-orange-500">{stats.receipts}</p>
                </div>

                <div onClick={() => setActiveTab('products')} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 cursor-pointer hover:border-blue-500 transition-colors flex flex-col justify-between min-h-[110px]">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inventory</p>
                    <p className="text-2xl font-black text-blue-600">{stats.products}</p>
                </div>

                {/* HIGHLIGHTED TARGET BLOCK FOR REALTIME ATTENTION MUTATIONS */}
                <div 
                    onClick={() => setActiveTab('products')} 
                    className={`p-6 rounded-[1.5rem] shadow-sm border cursor-pointer transition-all flex flex-col justify-between min-h-[110px] ${
                        stats.lowStock > 0 
                        ? 'bg-rose-50/50 border-rose-200 hover:border-rose-500 animate-pulse' 
                        : 'bg-white border-gray-100 hover:border-red-500'
                    }`}
                >
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${stats.lowStock > 0 ? 'text-rose-500' : 'text-gray-400'}`}>
                        Low Stock Alert
                    </p>
                    <div>
                        <p className={`text-2xl font-black ${stats.lowStock > 0 ? 'text-rose-600' : 'text-red-500'}`}>
                            {stats.lowStock}
                        </p>
                        {stats.lowStock > 0 && (
                            <span className="text-[10px] font-bold text-rose-500 block mt-0.5">Requires Action</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Visual Analytics Graphs Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Graph: Activity Overview */}
                <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 mb-6 uppercase tracking-wider">Activity Volume</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={volumeData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart: Inventory Health */}
                <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 mb-6 uppercase tracking-wider">Inventory Health Breakdown</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={inventoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {inventoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Full-Width Revenue Totals Sub-Row */}
            <RevenueSummary />

            {/* Side-by-Side Data Table & Item Conversion Rankings Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    <RecentOrders />
                </div>
                <div className="h-full">
                    <TopProducts />
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;