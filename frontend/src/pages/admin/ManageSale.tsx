import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 1. TYPING DEFINITIONS MATCHING YOUR BACKEND SQL COALESCE SCHEMAS
interface SaleTransaction {
  id: number | string; // Accommodates both integer auto-increments and mapped sync prefixes
  invoice_number: string;
  customer_name: string; // From COALESCE(u.fullname, s.guest_name)
  customer_email: string; // From COALESCE(u.email, s.guest_email)
  guest_phone: string | null;
  location: string | null;
  total_amount: number | string;
  payment_method: string;
  status: string; // Dynamic case verification checks handling
  reference_number: string | null;
  created_at: string;
}

export default function ManageSale() {
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Interactive View States
  const [expandedSaleId, setExpandedSaleId] = useState<number | string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<SaleTransaction | null>(null);

  // 2. FETCH UNIFIED DATA FROM YOUR NEW ENDPOINT
  const fetchSalesRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ Correctly pointing to your active port 5000 server instance
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

  // Format Helper for Currency values
  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(Number(amount));
  };

  // Format Helper for clean Calendar Timestamps
  const formatDateTime = (isoString: string) => {
    const dateObj = new Date(isoString);
    return {
      date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500 font-medium">
        Syncing live data registers...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-medium my-4">
        ⚠️ Error: {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      
      {/* Metrics Header Summary Card */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-800 relative overflow-hidden">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Average Order Size</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-1">
            {formatCurrency(sales.reduce((acc, curr) => acc + Number(curr.total_amount), 0) / (sales.length || 1))}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Calculated mean order worth</p>
        </div>
      </div>

      {/* FIXED FOCUS LAYER SEQUENCE DISPLAY */}
      {selectedTransaction && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex justify-between items-center text-sm text-blue-800 animate-fade-in">
          <div>
            Currently reviewing active invoice focus sequence: <span className="font-mono font-bold">{selectedTransaction.invoice_number}</span>
          </div>
          <button 
            onClick={() => {
              setExpandedSaleId(null);
              setSelectedTransaction(null);
            }} 
            className="px-3 py-1 bg-white border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors font-medium text-xs text-blue-700"
          >
            Clear Focus Window
          </button>
        </div>
      )}

      {/* Main Table Registry Layer */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="p-4">Invoice ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total Value</th>
                <th className="p-4">Method</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                    No sales recorded yet. Process a checkout sequence to seed registries!
                  </td>
                </tr>
              ) : (
                sales.map((sale) => {
                  const timestamp = formatDateTime(sale.created_at);
                  const parsedStatus = (sale.status || 'PENDING').toUpperCase();
                  
                  return (
                    <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-mono text-blue-600 font-semibold">
                        {sale.invoice_number || `INV-${sale.id}`}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-800">{sale.customer_name || 'Walk-In Guest'}</div>
                        <div className="text-xs text-slate-400 font-normal">{sale.customer_email || 'No email attached'}</div>
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        {formatCurrency(sale.total_amount)}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-semibold tracking-wider text-slate-600 border border-slate-200">
                          {sale.payment_method ? sale.payment_method.toUpperCase() : 'CASH'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold tracking-wide ${
                          parsedStatus === 'VERIFIED' ? 'bg-green-50 text-green-700 border border-green-200' :
                          parsedStatus === 'REJECTED' ? 'bg-red-50 text-red-700 border border-red-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {parsedStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-800 font-medium">{timestamp.date}</div>
                        <div className="text-xs text-slate-400">{timestamp.time}</div>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            setExpandedSaleId(sale.id);
                            setSelectedTransaction(sale);
                          }}
                          className="px-2 py-1 text-xs bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 rounded transition-colors"
                          title="Review Entry Context"
                        >
                          👁️ View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Meta Reference Trace Panel Box Display */}
      {expandedSaleId && selectedTransaction && (
        <div className="mt-6 p-4 bg-white border border-slate-200 rounded-xl shadow-sm animate-fade-in">
          <h4 className="font-bold text-slate-800 mb-2">Meta Reference Trace Panel</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono bg-slate-50 p-3 rounded-lg border border-slate-150">
            <div><span className="text-slate-400">Location Area:</span> {selectedTransaction.location || 'N/A'}</div>
            <div><span className="text-slate-400">Gateway Ref:</span> {selectedTransaction.reference_number || 'None'}</div>
            <div><span className="text-slate-400">Contact Line:</span> {selectedTransaction.guest_phone || 'None'}</div>
            <div><span className="text-slate-400">System Row ID:</span> {selectedTransaction.id}</div>
          </div>
        </div>
      )}

    </div>
  );
}