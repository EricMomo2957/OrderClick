import { useState, useEffect } from 'react';
import { Search, Plus, X, ArrowLeft, Loader2 } from 'lucide-react';

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

const OrderNow = ({ setView }: OrderNowProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
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

  const removeItem = (id: number) => {
    setSelectedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) return alert("Please add items to your request.");

    try {
      const response = await fetch('http://localhost:5000/api/orders/external-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, items: selectedItems }),
      });

      if (response.ok) {
        alert("Order request sent successfully!");
        setView('landing');
      } else {
        alert("Order failed. Please try again.");
      }
    } catch (err) {
      alert("Could not connect to server.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-['Inter']">
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

          {/* Search Bar - Matching Sample */}
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

          {/* Category Chips - Matching Sample */}
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
        
        {/* Product Grid - Vertical Cards like image_e62d5b.png */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 text-slate-400">
              <Loader2 className="animate-spin mb-2" />
              <p>Loading catalog...</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-10 xl:grid-cols-3 gap-6">
              {filteredProducts.map((p) => (
                <div key={p.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
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
                  <div className="p-5">
                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">{p.category}</p>
                    <h3 className="font-bold text-slate-800 text-lg mb-1">{p.name}</h3>
                    <p className="text-xl font-black text-slate-900 mb-4">₱{Number(p.price).toLocaleString()}</p>
                    
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
        <div className="lg:col-span-4">
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
                    <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm mt-1" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                    <input type="email" required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm mt-1" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address</label>
                  <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm mt-1" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
              </div>

              {/* Order Summary */}
              <div className="mt-8 border-t border-dashed border-slate-200 pt-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Request Summary</p>
                {selectedItems.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                    <p className="text-xs text-slate-400 italic">No items added yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                          <span className="h-6 w-6 bg-teal-50 text-teal-700 rounded-lg flex items-center justify-center text-[10px] font-black">{item.qty}x</span>
                          <span className="text-sm font-bold text-slate-700">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-slate-900">₱{(item.price * item.qty).toLocaleString()}</span>
                          <button type="button" onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={16} /></button>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <span className="font-black text-slate-400 text-xs uppercase">Grand Total</span>
                      <span className="text-2xl font-black text-[#003d3d]">₱{selectedItems.reduce((acc, i) => acc + (i.price * i.qty), 0).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="submit"
                disabled={selectedItems.length === 0}
                className="w-full bg-[#003d3d] text-white font-black py-5 rounded-[2rem] shadow-xl shadow-teal-900/20 hover:bg-slate-800 transition-all mt-6 disabled:opacity-50 active:scale-95"
              >
                Send Order Request
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderNow;