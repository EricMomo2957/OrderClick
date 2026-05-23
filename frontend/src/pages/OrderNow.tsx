import { useState, useEffect } from 'react';
import { Search, Plus, Minus, X, ArrowLeft, Loader2, Check, Download } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
  description: string;
}

interface SelectedItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

interface OrderNowProps {
  setView: (view: string) => void;
}

interface ConfirmationData {
  orderId: string;
  referenceNumber: string | null;
  paymentMethod: 'Cash' | 'GCash';
  totalPaid: number;
}

const OrderNow = ({ setView }: OrderNowProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'GCash'>('Cash');
  // State to hold the live, dynamically generated GCash reference number
  const [generatedRefNo, setGeneratedRefNo] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [confirmationDetails, setConfirmationDetails] = useState<ConfirmationData | null>(null);

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: ''
  });

  const categories = ['All', 'Fragrance', 'Makeup', 'Face Care', 'Home Nutrition', 'Bath and Body', "Men's Store"];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Effect hook to automatically manage reference number generation upon selecting GCash
  useEffect(() => {
    if (paymentMethod === 'GCash') {
      if (!generatedRefNo) {
        // Generates an 8-9 digit random integer matching your checkout flow layout (e.g., REF-942820096)
        const randomDigits = Math.floor(100000000 + Math.random() * 900000000);
        setGeneratedRefNo(`REF-${randomDigits}`);
      }
    } else {
      // Reverts to null if Cash is chosen, following your database table schema defaults
      setGeneratedRefNo(null);
    }
  }, [paymentMethod, generatedRefNo]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addItem = (product: Product) => {
    setSelectedItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setSelectedItems(prev => 
      prev.map(item => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : item;
        }
        return item;
      })
    );
  };

  const removeItem = (id: number) => {
    setSelectedItems(prev => prev.filter(item => item.id !== id));
  };

  const grandTotal = selectedItems.reduce((acc, i) => acc + (i.price * i.qty), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) return alert("Please add items to your request.");
    
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/orders/external-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          guest_name: formData.customerName,
          guest_phone: formData.phone,
          guest_email: formData.email,
          guest_address: formData.address,
          payment_method: paymentMethod,
          // Sends the auto-generated reference code seamlessly to your back-end route
          reference_number: generatedRefNo, 
          total_price: grandTotal,
          items: selectedItems 
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setConfirmationDetails({
          orderId: result.orderId || `ORD-${Math.floor(100000000 + Math.random() * 900000000)}`,
          referenceNumber: generatedRefNo,
          paymentMethod: paymentMethod,
          totalPaid: grandTotal
        });
        setShowModal(true);
      } else {
        alert("Order failed. Please try again.");
      }
    } catch (err) {
      alert("Could not connect to server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-['Inter'] relative">
      {/* Header Area */}
      <div className="bg-white border-b border-slate-200 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={() => setView('landing')}
            className="flex items-center gap-2 text-slate-400 hover:text-[#003d3d] mb-6 transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Back to Marketplace</span>
          </button>

          {/* Search Bar */}
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products by name..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#003d3d]/10 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all border ${
                  selectedCategory === cat 
                  ? 'bg-[#003d3d] text-white border-[#003d3d]' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 lg:p-10">
        
        {/* Product Grid */}
        <div className="lg:col-span-7 xl:col-span-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 text-slate-400">
              <Loader2 className="animate-spin mb-2 text-[#003d3d]" />
              <p>Loading catalog...</p>
            </div>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-10 xl:grid-cols-3 gap-6">
              {filteredProducts.map((p) => (
                <div key={p.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm group hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col justify-between">
                  <div>
                    <div className="h-56 overflow-hidden relative">
                      <img 
                        src={`http://localhost:5000${p.image_url}`} 
                        alt={p.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {p.stock <= 0 && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="bg-red-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase">Sold Out</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 pb-0">
                      <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">{p.category}</p>
                      <h3 className="font-bold text-slate-800 text-base mb-1 line-clamp-1">{p.name}</h3>
                      <p className="text-xl font-black text-slate-900">₱{Number(p.price).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <button 
                      onClick={() => addItem(p)}
                      disabled={p.stock <= 0}
                      className="w-full py-3 bg-slate-50 hover:bg-[#003d3d] hover:text-white text-slate-600 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Plus size={16} /> Add to Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Sidebar */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="sticky top-10 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200 border border-slate-100 p-8">
            <h2 className="text-2xl font-black text-slate-800 mb-6">Order <span className="text-teal-600">Request</span></h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm mt-1 focus:ring-2 focus:ring-teal-500/10 outline-none" value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                    <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm mt-1 focus:ring-2 focus:ring-teal-500/10 outline-none" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                    <input type="email" required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm mt-1 focus:ring-2 focus:ring-teal-500/10 outline-none" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address</label>
                  <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm mt-1 focus:ring-2 focus:ring-teal-500/10 outline-none" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
              </div>

              {/* Payment Selector Layout */}
              <div className="mt-6">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2">Select Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      paymentMethod === 'Cash' 
                        ? 'border-[#003d3d] bg-[#003d3d]/5 shadow-sm ring-1 ring-[#003d3d]' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <p className="font-bold text-slate-800 text-sm">Cash</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Pay at Coop office</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('GCash')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      paymentMethod === 'GCash' 
                        ? 'border-[#003d3d] bg-[#003d3d]/5 shadow-sm ring-1 ring-[#003d3d]' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <p className="font-bold text-slate-800 text-sm">GCash</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Pay via GCash</p>
                  </button>
                </div>
              </div>

              {/* Real-time Reference ID UI Display Container */}
              {paymentMethod === 'GCash' && generatedRefNo && (
                <div className="mt-3 bg-teal-50/50 border border-teal-100/70 p-4 rounded-2xl flex items-center justify-between text-left animate-in fade-in slide-in-from-top-2 duration-200">
                  <div>
                    <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest">Generated Reference Token</p>
                    <p className="font-mono font-bold text-slate-700 text-sm tracking-wide mt-0.5">{generatedRefNo}</p>
                  </div>
                  <span className="text-[10px] bg-teal-600 text-white font-black px-2.5 py-1 rounded-full uppercase">Linked</span>
                </div>
              )}

              {/* Order Summary */}
              <div className="mt-8 border-t border-dashed border-slate-200 pt-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Request Summary</p>
                {selectedItems.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                    <p className="text-xs text-slate-400 italic">No items added yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                            <button 
                              type="button" 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1.5 hover:bg-slate-200 text-slate-500 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-2 text-xs font-black text-slate-700 min-w-[20px] text-center">{item.qty}</span>
                            <button 
                              type="button" 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1.5 hover:bg-slate-200 text-slate-500 transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-slate-700 line-clamp-1">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2 pl-2">
                          <span className="text-sm font-black text-slate-900 whitespace-nowrap">₱{(item.price * item.qty).toLocaleString()}</span>
                          <button type="button" onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1"><X size={14} /></button>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <span className="font-black text-slate-400 text-xs uppercase">Grand Total</span>
                      <span className="text-2xl font-black text-[#003d3d]">₱{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="submit"
                disabled={selectedItems.length === 0 || isSubmitting}
                className="w-full bg-[#003d3d] text-white font-black py-5 rounded-[2rem] shadow-xl shadow-teal-900/20 hover:bg-slate-800 transition-all mt-6 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Processing...
                  </>
                ) : (
                  'Send Order Request'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && confirmationDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center border border-slate-100 text-center animate-in zoom-in-95 duration-300">
            
            <div className="w-16 h-16 bg-[#e6f4ea] text-[#137333] rounded-full flex items-center justify-center mb-6">
              <Check size={32} strokeWidth={3} />
            </div>

            <h3 className="text-2xl font-black text-slate-800 mb-1">Order Confirmed!</h3>
            <p className="text-slate-400 text-xs font-medium tracking-wide mb-6">Order ID: {confirmationDetails.orderId}</p>

            <div className="w-full bg-slate-50/60 border border-slate-100 rounded-3xl p-6 mb-8 text-left space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-widest">Method</span>
                <span className="font-black text-slate-800 text-sm">{confirmationDetails.paymentMethod}</span>
              </div>
              
              {confirmationDetails.paymentMethod === 'GCash' && confirmationDetails.referenceNumber && (
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-widest">Ref No.</span>
                  <span className="font-black text-teal-600 text-sm tracking-wide">{confirmationDetails.referenceNumber}</span>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200/60 border-dashed flex justify-between items-center">
                <span className="font-bold text-slate-800 text-sm">Total Paid</span>
                <span className="text-xl font-black text-slate-900">₱{confirmationDetails.totalPaid.toLocaleString()}</span>
              </div>
            </div>

            <div className="w-full space-y-3">
              <button 
                type="button"
                onClick={() => alert("Downloading digital copy of PDF receipt summary.")}
                className="w-full bg-[#003d3d] hover:bg-[#002b2b] text-white text-xs font-black uppercase tracking-wider py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
              >
                <Download size={16} /> Download PDF Receipt
              </button>
              
              <button 
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setView('landing');
                }}
                className="w-full text-slate-500 hover:text-slate-800 text-sm font-bold py-2 transition-colors block"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default OrderNow;