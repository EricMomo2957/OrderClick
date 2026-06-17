import React, { useEffect, useState } from 'react';
// 🔌 Import your existing socket client instance here. 
// Adjust the import path below according to your project's directory tree setup:
import { io } from 'socket.io-client';

// If you already have a global socket setup, replace this with your shared instance import
const socket = io('http://localhost:5000'); 

interface SaleItem {
    id: number;
    product_id: number;
    product_name: string;
    category: string;
    quantity: number;
    unit_price: number;
}

interface Sale {
    id: number;
    total_amount: number;
    payment_method: string;
    reference_number: string | null;
    status: 'pending' | 'verified' | 'rejected';
    created_at: string;
    // Updated properties matching the dynamic backend formatting fields
    customer_name: string | null;
    customer_email: string | null;
    items: SaleItem[];
}

const ManageSale: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [expandedSaleId, setExpandedSaleId] = useState<number | null>(null);

    // Fetch transactions from the sales base endpoint on component mount
    const fetchSales = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/sales', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setSales(data);
            }
        } catch (error) {
            console.error("Error communicating with sales API:", error);
        } finally {
            setLoading(false);
        }
    };

    // 1. Initial Data Load Fetching Hook
    useEffect(() => {
        fetchSales();
    }, []);

    // 2. Real-Time Socket Connection WS Listener Pipeline Hook
    useEffect(() => {
        // Listen for real-time status updates from the backend
        socket.on('sales_status_updated', (data: { id: number; status: 'pending' | 'verified' | 'rejected' }) => {
            setSales((prevSales) =>
                prevSales.map((sale) =>
                    sale.id === data.id ? { ...sale, status: data.status } : sale
                )
            );
        });

        // Cleanup listener stream mappings when unmounting allocation context structures
        return () => {
            socket.off('sales_status_updated');
        };
    }, []);

    // Handle mutating transaction approval parameters
    const handleStatusUpdate = async (id: number, newStatus: 'pending' | 'verified' | 'rejected') => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/sales/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                setSales(prev => prev.map(sale => sale.id === id ? { ...sale, status: newStatus } : sale));
            }
        } catch (error) {
            console.error("Fulfillment operational patch update failed:", error);
        }
    };

    const toggleExpand = (id: number) => {
        setExpandedSaleId(expandedSaleId === id ? null : id);
    };

    if (loading) {
        return <div className="p-6 text-center text-slate-500 animate-pulse">Loading Transaction Records...</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto bg-slate-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Sales Management</h1>
                <p className="text-sm text-slate-500">Monitor multi-item checkout invoices and manage verification states.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-100 text-slate-600 uppercase text-xs font-semibold tracking-wider border-b border-slate-200">
                            <th className="p-4">Invoice ID</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Total Value</th>
                            <th className="p-4">Method</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Date & Time</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                        {sales.map((sale) => (
                            <React.Fragment key={sale.id}>
                                <tr className="hover:bg-slate-50/70 transition-colors cursor-pointer" onClick={() => toggleExpand(sale.id)}>
                                    <td className="p-4 font-mono font-medium text-indigo-600">#INV-{sale.id}</td>
                                    <td className="p-4">
                                        {/* Render the dynamically resolved customer metadata fields */}
                                        <div className="font-medium text-slate-900">{sale.customer_name || 'Anonymous Buyer'}</div>
                                        <div className="text-xs text-slate-400">{sale.customer_email || 'No Email Registered'}</div>
                                    </td>
                                    <td className="p-4 font-semibold text-slate-900">₱{Number(sale.total_amount).toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium uppercase">
                                            {sale.payment_method || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium tracking-wide border uppercase ${
                                            sale.status === 'verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            sale.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                            'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}>
                                            {sale.status}
                                        </span>
                                    </td>
                                    
                                    <td className="p-4">
                                        <div className="font-medium text-slate-800">
                                            {new Date(sale.created_at).toLocaleDateString(undefined, { 
                                                month: 'short', 
                                                day: 'numeric', 
                                                year: 'numeric' 
                                            })}
                                        </div>
                                        <div className="text-xs text-slate-400 font-mono">
                                            {new Date(sale.created_at).toLocaleTimeString(undefined, { 
                                                hour: '2-digit', 
                                                minute: '2-digit',
                                                hour12: true 
                                            })}
                                        </div>
                                    </td>

                                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                        {sale.status === 'pending' ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => handleStatusUpdate(sale.id, 'verified')}
                                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    onClick={() => handleStatusUpdate(sale.id, 'rejected')}
                                                    className="px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-3">
                                                <span className={`text-xs font-medium italic ${
                                                    sale.status === 'verified' ? 'text-slate-400' : 'text-rose-400'
                                                }`}>
                                                    {sale.status === 'verified' ? 'Settled & Verified' : 'Order Rejected'}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        if(confirm(`Unlock Invoice #INV-${sale.id} and revert back to pending state?`)) {
                                                            handleStatusUpdate(sale.id, 'pending');
                                                        }
                                                    }}
                                                    className="text-[11px] text-indigo-500 hover:text-indigo-700 font-medium hover:underline cursor-pointer transition"
                                                >
                                                    Change
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>

                                {/* Expandable Line-Items Breakdown Section */}
                                {expandedSaleId === sale.id && (
                                    <tr className="bg-slate-50/50">
                                        <td colSpan={7} className="p-4 bg-slate-50 border-t border-b border-slate-200">
                                            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                                                    Manifest Breakdown for Invoice #INV-{sale.id}
                                                </h3>
                                                <div className="divide-y divide-slate-100">
                                                    {sale.items && sale.items.length > 0 ? (
                                                        sale.items.map((item) => (
                                                            <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                                                                <div>
                                                                    <span className="font-semibold text-slate-800 text-sm">{item.product_name}</span>
                                                                    <span className="ml-2 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-medium">{item.category}</span>
                                                                </div>
                                                                <div className="text-slate-600 font-mono">
                                                                    {item.quantity} x ₱{Number(item.unit_price || 0).toFixed(2)} = 
                                                                    <span className="ml-2 font-bold text-slate-900">₱{(item.quantity * (item.unit_price || 0)).toFixed(2)}</span>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="py-2 text-slate-400 italic text-xs">No product items linked to this transaction record.</div>
                                                    )}
                                                </div>
                                                {sale.reference_number && (
                                                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                                                        <span className="font-bold text-slate-700">Reference Number/MOP Tracers:</span> {sale.reference_number}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageSale;