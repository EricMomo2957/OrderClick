import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Receipt {
    id: number;
    customer_name: string;
    product_name: string;
    quantity: number;
    total_price: number;
    status: 'pending' | 'verified' | 'rejected';
    created_at?: string; // Added for the PDF date field
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

    useEffect(() => { fetchAllReceipts(); }, []);

    // PDF Generation Logic
    const generatePDF = (receipt: Receipt) => {
        const doc = new jsPDF();
        const date = receipt.created_at ? new Date(receipt.created_at).toLocaleDateString() : new Date().toLocaleDateString();

        // Header
        doc.setFontSize(22);
        doc.text("ORDERCLICK RECEIPT", 105, 20, { align: 'center' });

        // Information Section
        doc.setFontSize(12);
        doc.text(`Receipt ID: #REC-${receipt.id}`, 20, 40);
        doc.text(`Customer: ${receipt.customer_name}`, 20, 50);
        doc.text(`Date: ${date}`, 20, 60);
        doc.text(`Status: ${receipt.status.toUpperCase()}`, 20, 70);

        // Table
        autoTable(doc, {
            startY: 80,
            head: [['Product', 'Quantity', 'Total']],
            body: [
                [receipt.product_name, `x${receipt.quantity}`, `P${Number(receipt.total_price).toLocaleString()}`]
            ],
            headStyles: { fillColor: [0, 64, 64] }, // Matching your dark teal theme
            theme: 'striped'
        });

        doc.save(`Receipt_REC-${receipt.id}.pdf`);
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
        if (window.confirm("Delete this receipt?")) {
            try {
                await axios.delete(`${API_BASE}/${id}`);
                fetchAllReceipts();
            } catch (error) {
                alert("Delete failed.");
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
                            <tr className="bg-gray-100 text-gray-700 uppercase text-sm">
                                <th className="py-3 px-6 text-left">Customer</th>
                                <th className="py-3 px-6 text-left">Product</th>
                                <th className="py-3 px-6 text-center">Total</th>
                                <th className="py-3 px-6 text-center">Status</th>
                                <th className="py-3 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm">
                            {receipts.map((r) => (
                                <tr key={r.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-6 font-medium">{r.customer_name}</td>
                                    <td className="py-3 px-6">{r.product_name} <span className="text-gray-400">x{r.quantity}</span></td>
                                    <td className="py-3 px-6 text-center font-bold">₱{Number(r.total_price).toLocaleString()}</td>
                                    <td className="py-3 px-6 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                            {r.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="py-3 px-6 text-center">
                                        <div className="flex item-center justify-center gap-2">
                                            {r.status === 'pending' ? (
                                                <button onClick={() => handleUpdateStatus(r.id, 'verified')} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs">Verify</button>
                                            ) : (
                                                <button onClick={() => generatePDF(r)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs">PDF</button>
                                            )}
                                            <button onClick={() => handleDelete(r.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs">Delete</button>
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