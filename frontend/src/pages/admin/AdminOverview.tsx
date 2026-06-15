import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend 
} from 'recharts';
import { AlertTriangle, ArrowRight, PackageX } from 'lucide-react';
import RevenueSummary from './RevenueSummary';
import RecentOrders from './RecentOrders';
import TopProducts from './TopProducts';

interface AdminOverviewProps {
    setActiveTab: Dispatch<SetStateAction<string>>;
}

interface Product {
    id: number;
    stock: number;
}

const AdminOverview = ({ setActiveTab }: AdminOverviewProps) => {
    const [stats, setStats] = useState({
        revenue: 0,
        receipts: 0,
        products: 0,
        lowStock: 0 // True low stock count (1 to 5) directly from backend
    });
    const [outOfStockCount, setOutOfStockCount] = useState(0); // True out of stock count (exactly 0)
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('token');
            try {
                // 1. Fetch Summary Stats (which now includes the proper database query for true low stock)
                const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                // 2. Fetch raw products to isolate exact 0 stock counts
                const productsRes = await fetch('http://localhost:5000/api/products');
                
                if (statsRes.ok && productsRes.ok) {
                    const statsData = await statsRes.json();
                    const productsData: Product[] = await productsRes.json();
                    
                    // Count products whose stock is exactly 0
                    const emptyStock = productsData.filter(p => p.stock === 0).length;
                    
                    setStats({
                        revenue: statsData.revenue,
                        receipts: statsData.receipts,
                        products: statsData.products,
                        lowStock: statsData.lowStock // Mapping directly to the updated backend value
                    });
                    setOutOfStockCount(emptyStock);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    // Total items requiring attention (either empty or low)
    const totalAlertsCount = stats.lowStock + outOfStockCount;

    // Data for Bar Chart: Volume Comparison
    const volumeData = [
        { name: 'Total Receipts', value: stats.receipts, fill: '#fb923c' },
        { name: 'Total Products', value: stats.products, fill: '#2563eb' },
        { name: 'Low Stock (1-5)', value: stats.lowStock, fill: '#f59e0b' },
        { name: 'Out of Stock (0)', value: outOfStockCount, fill: '#ef4444' },
    ];

    // Data for Pie Chart: Inventory Health Breakdown
    const inventoryData = [
        { name: 'Healthy Stock', value: Math.max(0, stats.products - (stats.lowStock + outOfStockCount)) },
        { name: 'Low Stock (1-5)', value: stats.lowStock },
        { name: 'Out of Stock (0)', value: outOfStockCount },
    ];
    const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

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

            {/* SYSTEM NOTIFICATION BANNER DISPLAY PANEL */}
            {totalAlertsCount > 0 && (
                <div className={`border rounded-[1.25rem] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300 ${
                    outOfStockCount > 0 ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            outOfStockCount > 0 ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'
                        }`}>
                            {outOfStockCount > 0 ? <PackageX size={20} className="animate-pulse" /> : <AlertTriangle size={20} className="animate-bounce" />}
                        </div>
                        <div>
                            <h4 className={`text-sm font-black ${outOfStockCount > 0 ? 'text-rose-900' : 'text-amber-900'}`}>
                                {outOfStockCount > 0 ? 'Critical Inventory Shortage' : 'Low Stock Warning Detected'}
                            </h4>
                            <p className={`text-xs mt-0.5 ${outOfStockCount > 0 ? 'text-rose-700' : 'text-amber-700'}`}>
                                There are <span className="font-bold text-rose-600">{outOfStockCount}</span> items completely <span className="font-bold">Out of Stock (0)</span> and <span className="font-bold">{stats.lowStock}</span> items running low (≤ 5).
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setActiveTab('products')}
                        className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all self-stretch sm:self-auto justify-center ${
                            outOfStockCount > 0 
                            ? 'bg-rose-600 text-white hover:bg-rose-700' 
                            : 'bg-amber-500/20 text-amber-900 hover:bg-amber-500/30'
                        }`}
                    >
                        Restock Inventory <ArrowRight size={14} />
                    </button>
                </div>
            )}

            {/* Top Stat Interactive Cards */}
            <div className="grid grid-cols-4 sm:grid-cols-10 lg:grid-cols-4 gap-6">
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

                {/* COMBINED LOW/EMPTY INVENTORY STAT CARD */}
                <div 
                    onClick={() => setActiveTab('products')} 
                    className={`p-6 rounded-[1.5rem] shadow-sm border cursor-pointer transition-all flex flex-col justify-between min-h-[110px] ${
                        outOfStockCount > 0 
                        ? 'bg-rose-50/60 border-rose-200 hover:border-rose-500 animate-pulse' 
                        : stats.lowStock > 0 
                        ? 'bg-amber-50/50 border-amber-200 hover:border-amber-500'
                        : 'bg-white border-gray-100 hover:border-red-500'
                    }`}
                >
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${
                        outOfStockCount > 0 ? 'text-rose-600' : stats.lowStock > 0 ? 'text-amber-600' : 'text-gray-400'
                    }`}>
                        Stock Alerts
                    </p>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-rose-600" title="Out of Stock Count">{outOfStockCount}</span>
                            <span className="text-xs text-rose-500 font-medium">Empty</span>
                            <span className="text-gray-300">|</span>
                            <span className="text-xl font-black text-amber-500" title="Low Stock Count">{stats.lowStock}</span>
                            <span className="text-xs text-amber-500 font-medium">Low</span>
                        </div>
                        {totalAlertsCount > 0 && (
                            <span className={`text-[10px] font-bold block mt-0.5 ${outOfStockCount > 0 ? 'text-rose-500' : 'text-amber-600'}`}>
                                Action Required
                            </span>
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
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40} />
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