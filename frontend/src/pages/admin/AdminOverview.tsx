import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend 
} from 'recharts';
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
        { name: 'Healthy Stock', value: stats.products - stats.lowStock },
        { name: 'Low Stock', value: stats.lowStock },
    ];
    const COLORS = ['#10b981', '#ef4444'];

    if (loading) {
        return <div className="p-10 text-slate-400 font-bold animate-pulse">Loading Statistics...</div>;
    }

    return (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Title Header Section */}
            <div>
                <h2 className="text-2xl font-black text-slate-800">System Dashboard Overview</h2>
                <p className="text-slate-500 text-sm">Real-time business analytics and live summary data.</p>
            </div>

            {/* Top Stat Interactive Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gross Revenue</p>
                    <p className="text-2xl font-black text-[#004a80]">
                        ₱{Number(stats.revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </div>

                <div onClick={() => setActiveTab('receipts')} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 cursor-pointer hover:border-orange-500 transition-colors">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Receipts</p>
                    <p className="text-2xl font-black text-orange-500">{stats.receipts}</p>
                </div>

                <div onClick={() => setActiveTab('products')} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 cursor-pointer hover:border-blue-500 transition-colors">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inventory</p>
                    <p className="text-2xl font-black text-blue-600">{stats.products}</p>
                </div>

                <div onClick={() => setActiveTab('products')} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 cursor-pointer hover:border-red-500 transition-colors">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Low Stock</p>
                    <p className="text-2xl font-black text-red-500">{stats.lowStock}</p>
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

            {/* 1. Full-Width Revenue Totals Sub-Row */}
            <RevenueSummary />

            {/* 2. Side-by-Side Data Table & Item Conversion Rankings Layout */}
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