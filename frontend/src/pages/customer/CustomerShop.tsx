import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

// Interfaces
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
  description: string;
}

interface CustomerShopProps {
  user: any;
  onLogout: () => void;
}

const CATEGORIES = ['All', 'Fragrance', 'Makeup', 'Face Care', 'Home Nutrition', 'Bath and Body', 'Men\'s Store'];

const CustomerShop = ({ user, onLogout }: CustomerShopProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(''); // Search query state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

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

  /**
   * Helper function to dynamically count how many items exist per category
   */
  const getCategoryCount = (categoryName: string) => {
    if (categoryName === 'All') return products.length;
    return products.filter(p => p.category === categoryName).length;
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = existingCart.findIndex((item: any) => item.id === selectedProduct.id);

    if (existingItemIndex > -1) {
      existingCart[existingItemIndex].qty += quantity;
    } else {
      const cartItem = {
        id: selectedProduct.id,
        name: selectedProduct.name,
        description: selectedProduct.description,
        price: selectedProduct.price,
        qty: quantity,
        category: selectedProduct.category,
        image_url: selectedProduct.image_url,
        stock: selectedProduct.stock
      };
      existingCart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(existingCart));

    toast.success(`${quantity}x ${selectedProduct.name} added to cart!`, {
      style: {
        borderRadius: '1rem',
        background: '#003d3d',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '14px'
      }
    });

    setSelectedProduct(null);
    setQuantity(1);
  };

  // Combines active category selection and current text filters smoothly
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="bottom-right" reverseOrder={false} />

      {/* Control Bar: Contains Search Input and Category Filter Buttons */}
      <div className="space-y-4 mb-8">
        {/* Search Bar Input Block */}
        <div className="relative max-w-md w-full">
          <input
            type="text"
            placeholder="Search products by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 text-slate-800 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#003d3d] focus:ring-2 focus:ring-teal-900/5 shadow-xs transition-all placeholder-slate-400"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointers-events-none">
            {/* SVG Search Lens Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Elements */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => {
            const itemCount = getCategoryCount(cat);
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border flex items-center gap-2 ${
                  activeCategory === cat 
                    ? 'bg-[#003d3d] text-white border-[#003d3d] shadow-md shadow-teal-900/10' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-[#003d3d] hover:text-[#003d3d]'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  activeCategory === cat 
                    ? 'bg-teal-900/40 text-teal-100' 
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {itemCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State: Triggers when filtering returns no results */}
      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-100 p-8 shadow-xs">
          <div className="text-slate-300 mb-3 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-700">No matching products found</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">We couldn't find items matching "{searchQuery}" under this category criteria.</p>
        </div>
      )}

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-4 sm:grid-cols-10 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map(p => (
          <div key={p.id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full">
            <div className="relative aspect-square overflow-hidden bg-slate-50">
              <img 
                src={`http://localhost:5000${p.image_url}`} 
                alt={p.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              />
              {p.stock === 0 && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                  <span className="bg-rose-500 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full">Out of Stock</span>
                </div>
              )}
            </div>
            <div className="p-6 flex flex-col flex-1 justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.category}</span>
                <h3 className="text-base font-bold text-slate-800 mt-0.5 mb-1 truncate">{p.name}</h3>
                <p className="text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed">{p.description}</p>
              </div>
              <div className="flex items-center justify-between mt-auto pt-2">
                <p className="text-xl font-black text-[#003d3d]">₱{Number(p.price).toLocaleString()}</p>
                <button 
                  onClick={() => { setSelectedProduct(p); setQuantity(1); }}
                  disabled={p.stock === 0}
                  className="bg-[#003d3d] text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-[#002d2d] transition-all disabled:bg-slate-100 disabled:text-slate-400"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add to Cart Modal View */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Add to Cart</h2>
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center font-bold text-lg"
              >
                ×
              </button>
            </div>
            
            <div className="flex gap-4 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <img src={`http://localhost:5000${selectedProduct.image_url}`} className="w-20 h-20 rounded-xl object-cover bg-white" alt="Selected" />
              <div className="flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedProduct.category}</span>
                <p className="font-bold text-slate-800 text-base">{selectedProduct.name}</p>
                <p className="text-[#003d3d] font-black text-lg mt-0.5">₱{selectedProduct.price.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Select Quantity:</label>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center font-bold text-xl bg-white hover:bg-slate-50 active:scale-95 transition-all select-none"
                >-</button>
                <span className="text-2xl font-black w-8 text-center tabular-nums text-slate-800">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))} 
                  disabled={selectedProduct.stock <= quantity}
                  className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center font-bold text-xl bg-white hover:bg-slate-50 active:scale-95 transition-all select-none disabled:opacity-50"
                >+</button>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1">
                Available Stock: <span className={selectedProduct.stock < 5 ? 'text-rose-500 font-black' : 'text-slate-600'}>{selectedProduct.stock} items</span>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subtotal</p>
                <p className="text-2xl font-black text-[#003d3d] tabular-nums">₱{(selectedProduct.price * quantity).toLocaleString()}</p>
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={selectedProduct.stock === 0}
                className="bg-[#003d3d] text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-teal-900/20 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerShop;