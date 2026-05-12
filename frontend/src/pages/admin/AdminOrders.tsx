import { useState, useEffect } from 'react';

interface OrderRecord {
  id: number;
  product_name: string;
  display_name: string; 
  guest_name: string | null;
  registered_name: string | null;
  customer_email: string | null;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Updated fetch function to include the JWT Token
  const fetchOrders = async () => {
    const token = localStorage.getItem('token'); // Retrieve token
    
    try {
      const res = await fetch('http://localhost:5000/api/orders/all', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Mandatory for Admin access
        }
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else if (res.status === 401) {
        console.error("Unauthorized: Token missing or expired");
      }
    } catch (err) {
      console.error("Error fetching admin orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    const token = localStorage.getItem('token'); // Retrieve token
    
    try {
      const res = await fetch(`http://localhost:5000/api/orders/status/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Added protection for status updates
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        fetchOrders(); 
      } else {
        alert("Action unauthorized or server error.");
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="p-6 bg-white rounded-[2rem] shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Order <span className="text-[#003d3d]">Management</span></h2>
          <p className="text-gray-400 text-sm">Monitor both Registered and Guest customer orders.</p>
        </div>
        <button onClick={fetchOrders} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="py-4 px-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
              <th className="py-4 px-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Product</th>
              <th className="py-4 px-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Qty</th>
              <th className="py-4 px-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Total</th>
              <th className="py-4 px-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
              <th className="py-4 px-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-2">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-700 text-sm">
                      {order.display_name}
                    </span>
                    {order.guest_name && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full w-fit font-bold mt-1">
                        OUTSIDE ORDER
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-2 text-sm text-slate-600 font-medium">{order.product_name}</td>
                <td className="py-4 px-2 text-sm text-slate-600">{order.quantity}</td>
                <td className="py-4 px-2 text-sm font-black text-[#003d3d]">₱{Number(order.total_price).toLocaleString()}</td>
                <td className="py-4 px-2">
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${
                    order.status === 'pending' ? 'bg-orange-100 text-orange-600' : 
                    order.status === 'verified' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-4 px-2 text-right">
                    <div className="flex justify-end gap-2">
                        <button 
                            onClick={() => handleStatusUpdate(order.id, 'verified')}
                            className="bg-[#003d3d] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#002d2d]"
                        >
                            Verify
                        </button>
                        <button 
                            onClick={() => handleStatusUpdate(order.id, 'rejected')}
                            className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-500"
                        >
                            Reject
                        </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;