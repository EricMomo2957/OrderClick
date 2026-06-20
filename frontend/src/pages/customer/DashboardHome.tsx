import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Data Structures
interface Announcement {
  id: number;
  title: string;
  message: string;
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
      // Ensure the ID is present and converted to a number
      const numericUserId = Number(userId);
      if (!numericUserId) {
        console.warn("DashboardHome: userId is missing or invalid", userId);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Fetch all data in parallel
        const [annRes, topRes, histRes] = await Promise.all([
          axios.get('http://localhost:5000/api/announcements/all'),
          axios.get('http://localhost:5000/api/orders/products/top-selling', config),
          axios.get(`http://localhost:5000/api/orders/user/${numericUserId}`, config)
        ]);

        console.log("History data received:", histRes.data);
        
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

  if (loading) return <div className="p-10 text-center text-slate-500">Loading your portal...</div>;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Welcome to your Dashboard</h1>
      
      {/* Announcements Section */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-4 text-slate-700 uppercase tracking-wider">Latest Announcements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {announcements.slice(0, 3).map((a) => (
            <div key={a.id} className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800">{a.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{a.message}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Products Section */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-4 text-slate-700 uppercase tracking-wider">Top Selling Products</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {topProducts.map((p) => (
            <div key={p.id} className="min-w-[160px] p-4 bg-blue-900 text-white rounded-2xl shadow-md">
              <p className="font-bold">{p.name}</p>
              <p className="text-xs text-blue-200 mt-1">Sold: {p.total_sold}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Order History Section */}
      <section>
        <h2 className="text-lg font-bold mb-4 text-slate-700 uppercase tracking-wider">Recent Order History</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500">PRODUCT</th>
                <th className="p-4 text-xs font-bold text-slate-500">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length > 0 ? (
                history.map((order) => (
                  <tr key={order.id}>
                    <td className="p-4 text-sm font-medium">{order.product_name}</td>
                    <td className="p-4 text-sm font-bold">₱{Number(order.total_price).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="p-4 text-sm text-center text-slate-400">
                    No recent orders found.
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