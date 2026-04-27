import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Receipt {
    id: number;
    customer_name: string;
    product_name: string;
    quantity: number;
    total_price: number;
    status: 'pending' | 'verified' | 'rejected';
}

const ManageReceipt = () => {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [loading, setLoading] = useState(true);

    // Updated to match your combined productRoutes.js endpoints
    const API_BASE = 'http://localhost:5000/api/products/admin/receipts';

    const fetchAllReceipts = async () => {
        try {
            setLoading(true);
            const res = await axios.get(API_BASE);
            setReceipts(res.data);
        } catch (error) {
            console.error("Failed to fetch receipts:", error);
            alert("Error loading receipts. Check if backend is running.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllReceipts();
    }, []);

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await axios.patch(`${API_BASE}/${id}/status`, { status });
            alert(`Order marked as ${status}`);
            fetchAllReceipts(); // Refresh list
        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to update status.");
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to permanently delete this receipt?")) {
            try {
                await axios.delete(`${API_BASE}/${id}`);
                alert("Receipt deleted successfully");
                fetchAllReceipts();
            } catch (error) {
                console.error("Delete failed:", error);
                alert("Failed to delete record.");
            }
        }
    };

    if (loading) return <div className="p-6 text-center">Loading receipts...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Customer Receipts</h2>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Customer</th>
                                <th className="py-3 px-6 text-left">Product</th>
                                <th className="py-3 px-6 text-center">Total</th>
                                <th className="py-3 px-6 text-center">Status</th>
                                <th className="py-3 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm">
                            {receipts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center text-gray-400">No receipts found.</td>
                                </tr>
                            ) : (
                                receipts.map((r) => (
                                    <tr key={r.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-3 px-6 text-left whitespace-nowrap font-medium">
                                            {r.customer_name}
                                        </td>
                                        <td className="py-3 px-6 text-left">
                                            {r.product_name} <span className="text-gray-400">x{r.quantity}</span>
                                        </td>
                                        <td className="py-3 px-6 text-center font-bold">
                                            ₱{Number(r.total_price).toLocaleString()}
                                        </td>
                                        <td className="py-3 px-6 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                                                r.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {r.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6 text-center">
                                            <div className="flex item-center justify-center gap-2">
                                                {r.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleUpdateStatus(r.id, 'verified')} 
                                                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition duration-200"
                                                    >
                                                        Verify
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleDelete(r.id)} 
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition duration-200"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageReceipt;