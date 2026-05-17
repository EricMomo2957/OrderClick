import { useState, useEffect, useCallback } from 'react';
import { DollarSign, TrendingUp, Calendar, Clock } from 'lucide-react';

interface RevenueData {
  daily: number;
  weekly: number;
  monthly: number;
}

const RevenueSummary = () => {
  const [revenue, setRevenue] = useState<RevenueData>({ daily: 0, weekly: 0, monthly: 0 });
  const [loading, setLoading] = useState(true);

  const fetchRevenue = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/admin/revenue-summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRevenue(data);
      }
    } catch (err) {
      console.error("Failed to load revenue summary", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  const cards = [
    { title: "Daily Revenue", value: revenue.daily, icon: <Clock size={20} />, period: "Today" },
    { title: "Weekly Revenue", value: revenue.weekly, icon: <Calendar size={20} />, period: "Last 7 days" },
    { title: "Monthly Revenue", value: revenue.monthly, icon: <DollarSign size={20} />, period: "This Month" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{card.title}</p>
              <h3 className="text-3xl font-black text-slate-800 mt-1">
                {loading ? "..." : `₱${card.value.toLocaleString()}`}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#003d3d]/10 flex items-center justify-center text-[#003d3d] group-hover:scale-110 transition-transform">
              {card.icon}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-max">
            <TrendingUp size={12} />
            <span>{card.period}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RevenueSummary;