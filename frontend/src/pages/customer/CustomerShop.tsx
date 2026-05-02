import { useState, useEffect } from 'react';

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

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    // 1. Get existing cart from local storage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');

    // 2. Check if product already exists in cart
    const existingItemIndex = existingCart.findIndex((item: any) => item.id === selectedProduct.id);

    if (existingItemIndex > -1) {
      // Update quantity if it exists
      existingCart[existingItemIndex].qty += quantity;
    } else {
      // Add new item if it doesn't
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

    // 3. Save back to localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart));

    // 4. UI Feedback
    alert(`${quantity}x ${selectedProduct.name} added to cart!`);
    setSelectedProduct(null);
    setQuantity(1);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${
              activeCategory === cat 
                ? 'bg-[#003d3d] text-white border-[#003d3d]' 
                : 'bg-white text-slate-500 border-slate-200 hover:border-[#003d3d]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-10 lg:grid-cols-3 xl:grid-cols-10 gap-6">
        {products
          .filter(p => activeCategory === 'All' || p.category === activeCategory)
          .map(p => (
            <div key={p.id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="relative aspect-square overflow-hidden">
                <img 
                  src={`http://localhost:5000${p.image_url}`} 
                  alt={p.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
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
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Add to Cart Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-black text-slate-900">Add to Cart</h2>
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
              <label className="block text-sm font-bold text-slate-600">Quantity:</label>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center font-bold text-xl hover:bg-slate-50"
                >-</button>
                <span className="text-2xl font-black w-8 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))} 
                  className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center font-bold text-xl hover:bg-slate-50"
                >+</button>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Available Stock: {selectedProduct.stock}</p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Subtotal</p>
                <p className="text-2xl font-black text-[#003d3d]">₱{(selectedProduct.price * quantity).toLocaleString()}</p>
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={selectedProduct.stock === 0}
                className="bg-[#003d3d] text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:-translate-y-1 transition-all disabled:bg-slate-300 disabled:transform-none"
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