import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SaleTransaction {
  id: number | string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  guest_phone: string | null;
  location: string | null;
  total_amount: number | string;
  payment_method: string;
  status: string;
  reference_number: string | null;
  created_at: string;
}

export default function ManageSale() {
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Interactive View States
  const [expandedSaleId, setExpandedSaleId] = useState<number | string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<SaleTransaction | null>(null);

  // 1. SEARCH FILTERING LOGIC
  const filteredSales = sales.filter((sale) => 
    sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. FETCH DATA
  const fetchSalesRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/api/sales/all', {
        withCredentials: true
      });
      setSales(response.data);
    } catch (err: any) {
      console.error("Error retrieving sales data:", err);
      setError(err.response?.data?.message || "Failed to sync transaction layers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesRecords();
  }, []);

  // 3. PDF EXPORT FUNCTION
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Sales Registry Report", 14, 10);
    autoTable(doc, {
      head: [['Invoice', 'Customer', 'Total', 'Method', 'Status', 'Date']],
      body: filteredSales.map(s => [
        s.invoice_number, 
        s.customer_name || 'Walk-In Guest', 
        formatCurrency(s.total_amount), 
        s.payment_method?.toUpperCase() || 'CASH', 
        s.status?.toUpperCase(), 
        new Date(s.created_at).toLocaleDateString()
      ]),
    });
    doc.save(`Sales_Registry_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(Number(amount));
  };

  const formatDateTime = (isoString: string) => {
    const dateObj = new Date(isoString);
    return {
      date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-slate-500 font-medium">Syncing live data registers...</div>;
  if (error) return <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-medium my-4">⚠️ Error: {error}</div>;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      
      {/* Metrics Header */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Average Order Size</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-1">
            {formatCurrency(sales.reduce((acc, curr) => acc + Number(curr.total_amount), 0) / (sales.length || 1))}
          </h3>
        </div>
      </div>

      {/* Search and Export */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <input 
          type="text"
          placeholder="Search by Invoice or Customer..."
          className="p-3 border border-slate-200 rounded-xl w-full md:w-1/3 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button 
          onClick={exportToPDF}
          className="px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-colors font-medium shadow-sm"
        >
          📄 Export PDF
        </button>
      </div>

      {selectedTransaction && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex justify-between items-center text-sm text-blue-800">
          <div>Currently reviewing invoice: <span className="font-bold">{selectedTransaction.invoice_number}</span></div>
          <button onClick={() => { setExpandedSaleId(null); setSelectedTransaction(null); }} className="px-3 py-1 bg-white border border-blue-300 rounded-lg text-xs">Clear Focus</button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
              <th className="p-4">Invoice ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total Value</th>
              <th className="p-4">Method</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredSales.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-slate-400">No records found.</td></tr>
            ) : (
              filteredSales.map((sale) => {
                const timestamp = formatDateTime(sale.created_at);
                const parsedStatus = (sale.status || 'PENDING').toUpperCase();
                return (
                  <tr key={sale.id} className="hover:bg-slate-50/70">
                    <td className="p-4 font-mono font-semibold text-blue-600">{sale.invoice_number}</td>
                    <td className="p-4">{sale.customer_name || 'Walk-In'}</td>
                    <td className="p-4 font-bold">{formatCurrency(sale.total_amount)}</td>
                    <td className="p-4 uppercase text-xs font-semibold text-slate-600">{sale.payment_method || 'CASH'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${parsedStatus === 'VERIFIED' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                        {parsedStatus}
                      </span>
                    </td>
                    <td className="p-4">{timestamp.date}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => { setExpandedSaleId(sale.id); setSelectedTransaction(sale); }} className="px-2 py-1 text-xs bg-slate-100 rounded">👁️ View</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}