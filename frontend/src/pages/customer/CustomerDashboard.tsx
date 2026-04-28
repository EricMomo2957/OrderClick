import { useState, useEffect } from 'react';
import CustomerSidenav from './CustomerSidenav';
import CustomerProfile from './CustomerProfile'; 
import { Download, RefreshCw } from 'lucide-react'; 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
  description: string;
}

interface Receipt {
  id: number;
  user_id: number;
  product_id: number;
  product_name: string; 
  quantity: number;
  total_price: number;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

interface CustomerDashboardProps {
  onLogout: () => void;
}

const CATEGORIES = ['All', 'Fragrance', 'Makeup', 'Face Care', 'Home Nutrition', 'Bath and Body', 'Men\'s Store'];

const CustomerDashboard = ({ onLogout }: CustomerDashboardProps) => {
  const [activeTab, setActiveTab] = useState('shop');
  const [products, setProducts] = useState<Product[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isOrdering, setIsOrdering] = useState(false);

  const getUserData = () => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (err) {
      return null;
    }
  };

  const currentUser = getUserData();

  useEffect(() => { fetchProducts(); }, []);
  
  useEffect(() => { 
    if (activeTab === 'receipts') fetchReceipts(); 
  }, [activeTab]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const fetchReceipts = async () => {
    const user = getUserData();
    if (!user?.id) return;
    try {
      const res = await fetch(`http://localhost:5000/api/orders/user/${user.id}`);
      const data = await res.json();
      setReceipts(data);
    } catch (err) {
      console.error("Error fetching receipts:", err);
    }
  };

  const generatePDF = (receipt: Receipt) => {
    const doc = new jsPDF();
    const user = getUserData();

    doc.setFontSize(20);
    doc.setTextColor(0, 61, 61); 
    doc.text("OrderClick Official Receipt", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Customer: ${user?.name || 'Valued Shopper'}`, 14, 32);
    doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 14, 38);

    autoTable(doc, {
      startY: 45,
      head: [['Order ID', 'Product', 'Quantity', 'Price', 'Status', 'Date']],
      body: [[
        `#ORD-${receipt.id}`,
        receipt.product_name || `Item #${receipt.product_id}`,
        receipt.quantity.toString(),
        `PHP ${Number(receipt.total_price).toLocaleString()}`,
        receipt.status.toUpperCase(),
        new Date(receipt.created_at).toLocaleDateString()
      ]],
      headStyles: { fillColor: [0, 61, 61] },
      theme: 'grid'
    });

    doc.setFontSize(12);
    doc.text("Thank you for shopping with OrderClick!", 14, (doc as any).lastAutoTable.finalY + 20);
    doc.save(`Receipt_ORD_${receipt.id}.pdf`);
  };

  const handleOrder = async () => {
    if (!selectedProduct || isOrdering) return;
    const user = getUserData();
    if (!user?.id) {
        alert("Session expired. Please log in again.");
        onLogout();
        return;
    }

    setIsOrdering(true);
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          productId: selectedProduct.id,
          quantity: quantity,
          totalPrice: selectedProduct.price * quantity
        }),
      });

      if (response.ok) {
        alert(`Successfully ordered ${quantity}x ${selectedProduct.name}!`);
        setSelectedProduct(null);
        setQuantity(1);
        fetchProducts(); 
        if (activeTab === 'receipts') fetchReceipts();
      } else {
        const errorData = await response.json();
        alert(`Order failed: ${errorData.message || 'Error occurred'}`);
      }
    } catch (err) {
      alert("Could not connect to server.");
    } finally {
      setIsOrdering(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <CustomerProfile user={currentUser} />;
      
      case 'receipts':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800">My Purchase History</h2>
              <button onClick={fetchReceipts} className="flex items-center gap-2 text-xs font-bold text-teal-600 bg-teal-50 px-4 py-2 rounded-xl hover:bg-teal-100 transition-all">
                <RefreshCw size={14} /> Refresh List
              </button>
            </div>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {receipts.length > 0 ? (
                    receipts.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5 font-mono text-xs text-slate-400">#ORD-{r.id}</td>
                        <td className="px-8 py-5 font-bold text-slate-800">
                          {r.product_name || `Product #${r.product_id}`} 
                          <span className="text-[10px] text-slate-400 ml-2">x{r.quantity}</span>
                        </td>
                        <td className="px-8 py-5 font-black text-[#003d3d]">₱{Number(r.total_price).toLocaleString()}</td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                            r.status === 'verified' ? 'bg-green-100 text-green-600' :
                            r.status === 'rejected' ? 'bg-red-100 text-red-600' :
                            'bg-amber-100 text-amber-600'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <button onClick={() => generatePDF(r)} className="flex items-center gap-2 bg-[#003d3d] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#002d2d] transition-all shadow-md active:scale-95">
                            <Download size={14} /> Receipt
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic">No orders found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'shop':
      default:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-wrap gap-2 mb-8">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${
                    activeCategory === cat ? 'bg-[#003d3d] text-white border-[#003d3d]' : 'bg-white text-slate-500 border-slate-200 hover:border-[#003d3d]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-10 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.filter(p => activeCategory === 'All' || p.category === activeCategory).map(p => (
                <div key={p.id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                  <div className="relative aspect-square overflow-hidden">
                    <img src={`http://localhost:5000${p.image_url}`} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{p.name}</h3>
                    <p className="text-slate-500 text-xs mb-4 line-clamp-2 h-8">{p.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-black text-[#003d3d]">₱{Number(p.price).toLocaleString()}</p>
                      <button 
                        onClick={() => { setSelectedProduct(p); setQuantity(1); }}
                        className="bg-[#003d3d] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#002d2d] transition-all"
                      >
                        Order Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-['Inter']">
      <CustomerSidenav activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />
      <main className="ml-64 flex-1 p-10">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight capitalize">
            {activeTab === 'shop' ? 'Marketplace' : activeTab} <span className="text-[#003d3d]">Portal</span>
          </h1>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200">
             <span className="text-sm font-bold text-slate-600">
               Welcome back, {currentUser?.name || 'Shopper'}! 👋
             </span>
          </div>
        </header>

        {renderContent()}

        {selectedProduct && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-200">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-black text-slate-900">Confirm Order</h2>
                <button onClick={() => setSelectedProduct(null)} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
              </div>
              <div className="flex gap-4 mb-6 p-4 bg-slate-50 rounded-2xl">
                <img src={`http://localhost:5000${selectedProduct.image_url}`} className="w-20 h-20 rounded-xl object-cover" alt="Selected" />
                <div>
                  <p className="font-bold text-slate-800">{selectedProduct.name}</p>
                  <p className="text-[#003d3d] font-black text-lg">₱{selectedProduct.price.toLocaleString()}</p>
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-600">Quantity to buy:</label>
                <div className="flex items-center gap-4">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center font-bold text-xl hover:bg-slate-50">-</button>
                  <span className="text-2xl font-black w-8 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))} className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center font-bold text-xl hover:bg-slate-50">+</button>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total Amount</p>
                  <p className="text-2xl font-black text-[#003d3d]">₱{(selectedProduct.price * quantity).toLocaleString()}</p>
                </div>
                <button 
                  onClick={handleOrder}
                  disabled={isOrdering || selectedProduct.stock === 0}
                  className={`${isOrdering ? 'bg-slate-400' : 'bg-[#003d3d]'} text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:-translate-y-1 transition-all`}
                >
                  {isOrdering ? '...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerDashboard;