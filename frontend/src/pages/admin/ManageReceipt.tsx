import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Receipt {
    id: number;
    display_name: string; 
    guest_name: string | null;
    registered_name: string | null;
    product_name: string;
    quantity: number;
    total_price: number;
    status: 'pending' | 'verified' | 'rejected';
    created_at?: string; 
    // Added new fields for GCash verification
    reference_number: string | null;
    payment_method: string;
}

const ManageReceipt = () => {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [loading, setLoading] = useState(true);
    
    const API_BASE = 'http://localhost:5000/api/orders'; 

    const getAuthHeader = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const fetchAllReceipts = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/all`, getAuthHeader());
            setReceipts(res.data);
        } catch (error: any) {
            console.error("Failed to fetch receipts:", error.response?.status === 401 ? "Unauthorized" : error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllReceipts(); }, []);

    const generatePDF = (receipt: Receipt) => {
        const doc = new jsPDF();
        const date = receipt.created_at ? new Date(receipt.created_at).toLocaleDateString() : new Date().toLocaleDateString();

        doc.setFontSize(22);
        doc.text("ORDERCLICK RECEIPT", 105, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.text(`Receipt ID: #REC-${receipt.id}`, 20, 40);
        doc.text(`Customer: ${receipt.display_name}`, 20, 50);
        doc.text(`Date: ${date}`, 20, 60);
        doc.text(`Payment: ${receipt.payment_method} (${receipt.reference_number || 'N/A'})`, 20, 70);
        doc.text(`Status: ${receipt.status.toUpperCase()}`, 20, 80);

        autoTable(doc, {
            startY: 90,
            head: [['Product', 'Quantity', 'Total']],
            body: [
                [receipt.product_name, `x${receipt.quantity}`, `P${Number(receipt.total_price).toLocaleString()}`]
            ],
            headStyles: { fillColor: [0, 74, 128] }, 
            theme: 'striped'
        });

        doc.save(`Receipt_REC-${receipt.id}.pdf`);
    };

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await axios.put(`${API_BASE}/status/${id}`, { status }, getAuthHeader());
            fetchAllReceipts();
        } catch (error) {
            alert("Failed to update status. Check permissions.");
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Delete this receipt?")) {
            try {
                await axios.delete(`${API_BASE}/${id}`, getAuthHeader());
                fetchAllReceipts();
            } catch (error) {
                alert("Delete failed. Check permissions.");
            }
        }
    };

    if (loading) return <div className="p-6 text-center text-[#004a80] font-bold">Loading receipts...</div>;

    return (
        <div className="p-2">
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-800">Orders & <span className="text-[#004a80]">Receipts</span></h2>
                    <p className="text-gray-400 text-sm">Review transactions and verify GCash Reference numbers.</p>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-gray-100 text-gray-400 uppercase text-[11px] font-bold tracking-widest">
                                <th className="py-4 px-6 text-left">Customer</th>
                                <th className="py-4 px-6 text-left">Product</th>
                                <th className="py-4 px-6 text-left">Reference No.</th>
                                <th className="py-4 px-6 text-left">Method</th>
                                <th className="py-4 px-6 text-center">Total</th>
                                <th className="py-4 px-6 text-center">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-600 text-sm">
                            {receipts.map((r) => (
                                <tr key={r.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700">{r.display_name}</span>
                                            {r.guest_name && (
                                                <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full w-fit font-black mt-1">GUEST</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 font-medium">
                                        {r.product_name} <span className="text-gray-400 ml-2 font-normal">x{r.quantity}</span>
                                    </td>
                                    {/* New Reference Columns */}
                                    <td className="py-4 px-6 font-mono text-teal-600 font-bold">
                                        {r.reference_number || 'N/A'}
                                    </td>
                                    <td className="py-4 px-6 text-xs uppercase font-semibold text-slate-400">
                                        {r.payment_method}
                                    </td>
                                    <td className="py-4 px-6 text-center font-black text-[#004a80]">
                                        ₱{Number(r.total_price).toLocaleString()}
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                                            r.status === 'pending' ? 'bg-orange-100 text-orange-600' : 
                                            r.status === 'verified' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {r.status === 'pending' ? (
                                                <button 
                                                    onClick={() => handleUpdateStatus(r.id, 'verified')} 
                                                    className="bg-[#004a80] hover:bg-[#00355c] text-white px-4 py-2 rounded-xl text-[10px] font-bold shadow-md shadow-blue-900/10"
                                                >
                                                    Verify
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => generatePDF(r)} 
                                                    className="bg-white border border-blue-200 text-[#004a80] hover:bg-blue-50 px-4 py-2 rounded-xl text-[10px] font-bold transition-all"
                                                >
                                                    PDF
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleDelete(r.id)} 
                                                className="text-gray-300 hover:text-red-500 p-2 transition-colors"
                                                title="Delete Record"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageReceipt;