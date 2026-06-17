import React, { useEffect, useState } from 'react';
// 🔌 Import your existing socket client instance here. 
import { io } from 'socket.io-client';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    customer_name: string | null;
    customer_email: string | null;
    items: SaleItem[];
}

const ManageSale: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [expandedSaleId, setExpandedSaleId] = useState<number | null>(null);
    
    // 🔍 Search and Filtering States
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

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
        socket.on('sales_status_updated', (data: { id: number; status: 'pending' | 'verified' | 'rejected' }) => {
            setSales((prevSales) =>
                prevSales.map((sale) =>
                    sale.id === data.id ? { ...sale, status: data.status } : sale
                )
            );
        });

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

    // 🔬 Evaluated Reactive Derived Filter Chain (Includes Date Filters)
    const filteredSales = sales.filter(sale => {
        // 1. Text Search query filter
        const matchQuery = searchQuery.toLowerCase().trim();
        if (matchQuery) {
            const invoiceMatch = `#inv-${sale.id}`.includes(matchQuery) || sale.id.toString().includes(matchQuery);
            const nameMatch = sale.customer_name?.toLowerCase().includes(matchQuery) || false;
            const emailMatch = sale.customer_email?.toLowerCase().includes(matchQuery) || false;
            const methodMatch = sale.payment_method?.toLowerCase().includes(matchQuery) || false;
            
            if (!(invoiceMatch || nameMatch || emailMatch || methodMatch)) return false;
        }

        // 2. Date Ranges filter tracking
        if (sale.created_at) {
            const saleTimestamp = new Date(sale.created_at).getTime();
            
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0); // Include start date full day boundary
                if (saleTimestamp < start.getTime()) return false;
            }
            
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999); // Include end date up to midnight
                if (saleTimestamp > end.getTime()) return false;
            }
        }

        return true;
    });

    // 1. INDIVIDUAL INVOICE GENERATION LOGIC
    const generateInvoicePDF = (sale: Sale) => {
        const doc = new jsPDF();
        const date = sale.created_at ? new Date(sale.created_at).toLocaleString() : new Date().toLocaleString();
        
        doc.setFontSize(22);
        doc.setTextColor(0, 74, 128); 
        doc.text("ORDERCLICK INVOICE LEGER", 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`System Generated Invoice Extract: ${new Date().toLocaleString()}`, 105, 27, { align: 'center' });

        doc.setFontSize(11);
        doc.setTextColor(50);
        doc.text(`Invoice Reference ID:`, 20, 42);
        doc.setFont("Helvetica", "bold");
        doc.text(`#INV-${sale.id}`, 75, 42);

        doc.setFont("Helvetica", "normal");
        doc.text(`Customer Assignment:`, 20, 50);
        doc.setFont("Helvetica", "bold");
        doc.text(`${sale.customer_name || 'Anonymous Buyer'} (${sale.customer_email || 'No Email Registered'})`, 75, 50);
        
        doc.setFont("Helvetica", "normal");
        doc.text(`Timestamp of Purchase:`, 20, 58);
        doc.text(`${date}`, 75, 58);

        doc.text(`Payment Method Gateway:`, 20, 66);
        doc.text(`${(sale.payment_method || 'N/A').toUpperCase()}`, 75, 66);
        
        doc.text(`Verification Pipeline Status:`, 20, 74);
        doc.setFont("Helvetica", "bold");
        doc.text(`${(sale.status || 'PENDING').toUpperCase()}`, 75, 74);

        const tableBody = sale.items && sale.items.length > 0 
            ? sale.items.map((item) => [
                item.product_name, 
                `x${item.quantity}`, 
                `PHP ${Number(item.unit_price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
              ])
            : [
                ['Checkout Total Consolidated Value Summary', '1 Batch', `PHP ${Number(sale.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`]
              ];

        autoTable(doc, {
            startY: 84,
            head: [['Purchased Product Allocation / Desc', 'Quantity Base', 'Line Total']],
            body: tableBody,
            headStyles: { fillColor: [0, 74, 128], fontSize: 10, fontStyle: 'bold' }, 
            alternateRowStyles: { fillColor: [245, 248, 250] },
            theme: 'striped',
            margin: { left: 20, right: 20 }
        });

        doc.save(`Invoice_INV-${sale.id}.pdf`);
    };

    // 2. MASTER REGISTRY LEDGER SUMMARY EXPORT
    const exportSalesSummaryPDF = () => {
        if (!filteredSales || filteredSales.length === 0) return;

        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.setTextColor(0, 74, 128); 
        doc.text("ORDERCLICK: SALES REGISTRY REPORT", 105, 15, { align: 'center' });
        
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(`Exported Registry Records: ${filteredSales.length} Entries | Generated on: ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });

        const tableRows = filteredSales.map((sale) => {
            const saleDate = sale.created_at ? new Date(sale.created_at).toLocaleString() : 'N/A';
            return [
                `#INV-${sale.id}`,
                `${sale.customer_name || 'Anonymous Buyer'}`,
                `${sale.customer_email || 'N/A'}`,
                `${(sale.payment_method || 'N/A').toUpperCase()}`,
                `PHP ${Number(sale.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                saleDate,
                `${(sale.status || 'PENDING').toUpperCase()}`
            ];
        });

        autoTable(doc, {
            startY: 30,
            head: [['Invoice ID', 'Customer Entity', 'Email Address', 'Method', 'Total Value', 'Date & Time', 'Status']],
            body: tableRows,
            headStyles: { fillColor: [0, 74, 128], textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            theme: 'striped',
            styles: { fontSize: 8.5, cellPadding: 3 },
            columnStyles: {
                0: { fontStyle: 'bold' },
                4: { fontStyle: 'bold', halign: 'right' },
                6: { fontStyle: 'bold' }
            },
            margin: { top: 30 },
        });

        doc.save("OrderClick_Sales_Master_Ledger.pdf");
    };

    const toggleExpand = (id: number) => {
        setExpandedSaleId(expandedSaleId === id ? null : id);
    };

    // 📊 Operational Metrics Computations based on reactive filtering variables
    const totalSalesRevenue = filteredSales.reduce((acc, sale) => acc + Number(sale.total_amount), 0);
    const totalOrdersCount = filteredSales.length;
    const averageOrderValue = totalOrdersCount > 0 ? totalSalesRevenue / totalOrdersCount : 0;

    // Helper to reset date ranges quickly
    const clearDateFilters = () => {
        setStartDate('');
        setEndDate('');
    };

    if (loading) {
        return <div className="p-6 text-center text-slate-500 animate-pulse">Loading Transaction Records...</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto bg-slate-50 min-h-screen">
            {/* Top Branding Section */}
            <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Sales Management</h1>
                    <p className="text-sm text-slate-500">Monitor multi-item checkout invoices, view aggregated analytics, and manage verification states.</p>
                </div>
                
                {/* Master Report Export Hook Button & Search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    <button
                        onClick={exportSalesSummaryPDF}
                        disabled={filteredSales.length === 0}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
                        </svg>
                        Export Summary PDF
                    </button>

                    <div className="relative w-full sm:w-72">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search Invoice ID, name, email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-700"
                        />
                    </div>
                </div>
            </div>

            {/* 🗓️ Controls Strip: Advanced Date Selectors */}
            <div className="mb-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-end sm:items-center gap-4">
                <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                    <div className="flex flex-col gap-1 w-full sm:w-auto">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">From Date</label>
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="text-sm border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 bg-slate-50/50"
                        />
                    </div>
                    <div className="flex flex-col gap-1 w-full sm:w-auto">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">To Date</label>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="text-sm border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 bg-slate-50/50"
                        />
                    </div>
                </div>
                {(startDate || endDate) && (
                    <button 
                        onClick={clearDateFilters}
                        className="text-xs font-medium text-rose-600 hover:text-rose-700 underline underline-offset-4 transition-colors cursor-pointer h-9 flex items-center"
                    >
                        Clear Date Ranges
                    </button>
                )}
            </div>

            {/* 📊 Metrics Dashboard Grid Box Layout */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-800 relative overflow-hidden group">
                    <div className="absolute right-3 bottom-1 text-slate-100 group-hover:scale-110 transition-transform duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125H3M16.5 9h.008v.008H16.5V9Zm.008 3h.008v.008H16.516V12Zm0 3h.008v.008H16.516V15Z" />
                        </svg>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-100">Total Sales Revenue</p>
                    <h3 className="text-3xl font-bold mt-1 tracking-tight">₱{totalSalesRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                    <p className="text-[11px] text-indigo-100/80 mt-2">Aggregated metrics matching criteria</p>
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-800 relative overflow-hidden group">
                    <div className="absolute right-3 bottom-1 text-slate-100 group-hover:scale-110 transition-transform duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Volumes Issued</p>
                    <h3 className="text-3xl font-bold mt-1 text-slate-800 tracking-tight">{totalOrdersCount} Invoices</h3>
                    <p className="text-[11px] text-slate-400 mt-2">Active record counters count</p>
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-800 relative overflow-hidden group">
                    <div className="absolute right-3 bottom-1 text-slate-100 group-hover:scale-110 transition-transform duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
                        </svg>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Average Order Size</p>
                    <h3 className="text-3xl font-bold mt-1 text-slate-800 tracking-tight">₱{averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                    <p className="text-[11px] text-slate-400 mt-2">Calculated mean order worth</p>
                </div>
            </div>

            {/* Core Table Container */}
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
                            <th className="p-4 text-right pr-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                        {filteredSales.length > 0 ? (
                            filteredSales.map((sale) => (
                                <React.Fragment key={sale.id}>
                                    <tr 
                                        className="hover:bg-slate-50/70 transition-colors cursor-pointer" 
                                        onClick={() => toggleExpand(sale.id)}
                                    >
                                        <td className="p-4 font-mono font-medium text-indigo-600">#INV-{sale.id}</td>
                                        <td className="p-4">
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

                                        <td className="p-4 pr-6" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => generateInvoicePDF(sale)}
                                                    title="Export Invoice to PDF Document"
                                                    className="p-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg transition-all border border-transparent hover:border-indigo-100 cursor-pointer"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                                    </svg>
                                                </button>

                                                {sale.status === 'pending' ? (
                                                    <>
                                                        <button 
                                                            onClick={() => handleStatusUpdate(sale.id, 'verified')}
                                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => handleStatusUpdate(sale.id, 'rejected')}
                                                            className="px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs font-medium px-2 py-1 rounded bg-slate-100 ${
                                                            sale.status === 'verified' ? 'text-slate-500' : 'text-rose-500'
                                                        }`}>
                                                            {sale.status === 'verified' ? 'Locked' : 'Archived'}
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                if(window.confirm(`Unlock Invoice #INV-${sale.id} and revert back to pending state?`)) {
                                                                    handleStatusUpdate(sale.id, 'pending');
                                                                }
                                                            }}
                                                            className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 rounded-lg shadow-sm hover:bg-indigo-50/30 transition-all cursor-pointer"
                                                            title="Revert to Pending"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
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
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                                    No records found matching your filtering parameters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageSale;