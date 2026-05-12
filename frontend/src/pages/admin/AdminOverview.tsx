import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend 
} from 'recharts';

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

    if (loading) return <div className="p-10 text-slate-400 font-bold animate-pulse">Loading Statistics...</div>;

    return (
        <div className="space-y-8">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Revenue</p>
                    <p className="text-2xl font-black text-[#004a80]">
                        ₱{Number(stats.revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </div>

                <div onClick={() => setActiveTab('orders')} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 cursor-pointer hover:border-orange-500 transition-colors">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Receipts</p>
                    <p className="text-2xl font-black text-orange-500">{stats.receipts}</p>
                </div>

                <div onClick={() => setActiveTab('inventory')} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 cursor-pointer hover:border-blue-500 transition-colors">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inventory</p>
                    <p className="text-2xl font-black text-blue-600">{stats.products}</p>
                </div>

                <div onClick={() => setActiveTab('low-stock')} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 cursor-pointer hover:border-red-500 transition-colors">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Low Stock</p>
                    <p className="text-2xl font-black text-red-500">{stats.lowStock}</p>
                </div>
            </div>

            {/* Visual Data Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Bar Graph: Activity Overview */}
                <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 mb-6 uppercase tracking-wider">Activity Overview</h3>
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
                    <h3 className="text-sm font-bold text-gray-700 mb-6 uppercase tracking-wider">Inventory Health</h3>
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
        </div>
    );
};

export default AdminOverview;