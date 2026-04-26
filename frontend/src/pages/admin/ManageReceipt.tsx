import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Trash2, CheckCircle, RefreshCw } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Receipt {
    id: number;
    customer_name: string;
    product_name: string;
    category: string; 
    quantity: number;
    total_price: number;
    status: 'pending' | 'verified' | 'rejected';
    created_at: string;
}

const ManageReceipt = () => {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [loading, setLoading] = useState(true);

    const API_BASE = 'http://localhost:5000/api/products/admin/receipts';

    const fetchAllReceipts = async () => {
        try {
            setLoading(true);
            const res = await axios.get(API_BASE);
            setReceipts(res.data);
        } catch (error) {
            console.error("Failed to fetch receipts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllReceipts();
    }, []);

    const generatePDF = (r: Receipt) => {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.text('ORDERCLICK RECEIPT', 105, 20, { align: 'center' });
        
        doc.setFontSize(10);
        doc.text(`Receipt ID: #REC-${r.id}`, 20, 40);
        doc.text(`Customer: ${r.customer_name}`, 20, 45);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);
        doc.text(`Status: ${r.status.toUpperCase()}`, 20, 55);

        // Table with joined Category data
        autoTable(doc, {
            startY: 65,
            head: [['Product', 'Category', 'Quantity', 'Total']],
            body: [[
                r.product_name, 
                r.category || 'General', 
                `x${r.quantity}`, 
                `P${Number(r.total_price).toLocaleString()}`
            ]],
            theme: 'striped',
            headStyles: { fillColor: [0, 61, 61] }
        });

        doc.text('Thank you for using OrderClick!', 105, doc.internal.pageSize.height - 20, { align: 'center' });
        doc.save(`Receipt_${r.customer_name}_${r.id}.pdf`);
    };

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await axios.patch(`${API_BASE}/${id}/status`, { status });
            fetchAllReceipts();
        } catch (error) {
            alert("Failed to update status.");
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Permanently delete this record?")) {
            try {
                await axios.delete(`${API_BASE}/${id}`);
                fetchAllReceipts();
            } catch (error) {
                alert("Failed to delete record.");
            }
        }
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">Manage Customer Receipts</h2>
                    <p className="text-slate-500 text-sm">Review, verify, and generate official PDF receipts.</p>
                </div>
                <button 
                    onClick={fetchAllReceipts}
                    className="flex items-center gap-2 text-xs font-bold text-[#003d3d] bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-all"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Details</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Total</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {receipts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center text-slate-400 italic">No receipts found.</td>
                            </tr>
                        ) : (
                            receipts.map((r) => (
                                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-5 font-bold text-slate-800">{r.customer_name}</td>
                                    <td className="px-6 py-5">
                                        <div className="text-slate-800 font-medium">{r.product_name}</div>
                                        {/* Row Category Display */}
                                        <div className="text-[10px] text-slate-400 uppercase font-bold">
                                            {r.category || 'General'} • x{r.quantity}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center font-black text-[#003d3d]">
                                        ₱{Number(r.total_price).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${
                                            r.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                                            r.status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                        }`}>
                                            {r.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-center gap-2">
                                            {r.status === 'pending' && (
                                                <button 
                                                    onClick={() => handleUpdateStatus(r.id, 'verified')} 
                                                    className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                                                    title="Verify Order"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => generatePDF(r)} 
                                                className="p-2 bg-slate-800 text-white rounded-lg hover:bg-black transition-colors"
                                                title="Download PDF"
                                            >
                                                <FileText size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(r.id)} 
                                                className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                                                title="Delete Record"
                                            >
                                                <Trash2 size={16} />
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
    );
};

export default ManageReceipt;