// FRONTEND/src/pages/ManageProduct.tsx
import { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
  description: string;
}

const VALID_CATEGORIES = ['Fragrance', 'Makeup', 'Face Care', 'Home Nutrition', 'Bath and Body', 'Men\'s Store'];
// Central configuration threshold for safety low stock alerts
const LOW_STOCK_THRESHOLD = 5;

const ManageProduct = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: VALID_CATEGORIES[0],
    description: ''
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token'); // Retrieve the secure operational token
    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('stock', formData.stock);
    data.append('category', formData.category);
    data.append('description', formData.description);
    if (imageFile) data.append('image', imageFile);

    try {
      // 🔥 UPDATED HERE: Appended /update/ into the string literal for PUT requests to perfectly sync with productRoutes.js
      const url = editingId 
        ? `http://localhost:5000/api/products/update/${editingId}` 
        : 'http://localhost:5000/api/products/add';
        
      const res = await fetch(url, { 
        method: editingId ? 'PUT' : 'POST', 
        headers: {
          'Authorization': `Bearer ${token}` // Bind identity authorization payload context
        },
        body: data 
      });
      
      if (res.ok) {
        setShowFormModal(false);
        setEditingId(null);
        setFormData({ name: '', price: '', stock: '', category: VALID_CATEGORIES[0], description: '' });
        setImageFile(null);
        fetchProducts();
      } else {
        const errorData = await res.json();
        alert(errorData.error || errorData.message || "Failed to finalize inventory operation record.");
      }
    } catch (err) { 
      console.error("Connection Error:", err); 
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Delete this product? This action will generate a permanent security audit record.")) {
      const token = localStorage.getItem('token'); // Retrieve the secure operational token
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`, { 
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`, // Bind identity authorization payload context
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          fetchProducts();
        } else {
          const errorData = await res.json();
          alert(errorData.error || errorData.message || "Unauthorized context executing administrative deletion sequence.");
        }
      } catch (err) { 
        console.error("Delete error:", err); 
      }
    }
  };

  return (
    <div className="p-8 font-['Inter'] bg-gray-50 min-h-screen relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#1a365d]">Product Management</h2>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', price: '', stock: '', category: VALID_CATEGORIES[0], description: '' });
            setImageFile(null);
            setShowFormModal(true);
          }}
          className="bg-[#003d3d] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#002d2d] transition-all shadow-md text-sm"
        >
          + Add Product
        </button>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search products by name..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="absolute left-3 top-3">🔍</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveCategory('All')} className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${activeCategory === 'All' ? 'bg-[#003d3d] text-white' : 'bg-white text-gray-500 border-gray-200'}`}>All</button>
          {VALID_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${activeCategory === cat ? 'bg-teal-600 text-white' : 'bg-white text-gray-500 border-gray-200'}`}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-10 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredProducts.map(p => (
          <div 
            key={p.id} 
            className="bg-white rounded-lg border border-gray-100 overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between" 
            onClick={() => { setSelectedProduct(p); setShowViewModal(true); }}
          >
            <div>
              <div className="relative w-full aspect-square bg-gray-50">
                <img src={`http://localhost:5000${p.image_url}`} className="w-full h-full object-cover" alt={p.name} />
                
                {/* FLOATING ACTIONABLE STOCK ALERT CORNER BADGES */}
                {p.stock === 0 ? (
                  <span className="absolute top-2 right-2 bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow">
                    OUT OF STOCK
                  </span>
                ) : p.stock <= LOW_STOCK_THRESHOLD ? (
                  <span className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded shadow animate-pulse">
                    ONLY {p.stock} LEFT
                  </span>
                ) : null}
              </div>

              <div className="p-2">
                <span className="text-[9px] text-teal-600 font-bold uppercase block mb-0.5">{p.category}</span>
                <h3 className="text-xs font-bold truncate text-slate-800">{p.name}</h3>
                <p className="text-blue-900 font-bold text-sm mt-0.5">₱{Number(p.price).toLocaleString()}</p>
                
                {/* SUBTITLE STATUS METRICS SUMMARY TEXT */}
                <p className={`text-[10px] font-medium mt-1 ${
                  p.stock === 0 ? 'text-rose-600 font-bold' : 
                  p.stock <= LOW_STOCK_THRESHOLD ? 'text-amber-600 font-bold' : 'text-slate-400'
                }`}>
                  Stock: {p.stock}
                </p>
              </div>
            </div>

            <div className="p-2 pt-0" onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-1 mt-1">
                <button onClick={() => {
                  setEditingId(p.id);
                  setFormData({ name: p.name, price: p.price.toString(), stock: p.stock.toString(), category: p.category, description: p.description || '' });
                  setShowFormModal(true);
                }} className="flex-1 py-1 bg-gray-100 text-slate-700 hover:bg-gray-200 rounded text-[10px] font-bold transition-colors">
                  Edit
                </button>
                <button onClick={() => handleDelete(p.id)} className="px-2 py-1 bg-red-50 text-red-500 hover:bg-red-100 rounded text-[10px] font-bold transition-colors">
                  Del
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FORM MODAL (Add/Edit) */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Product Name" className="w-full p-2 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <div className="flex gap-2">
                <input type="number" placeholder="Price" className="w-full p-2 border rounded" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                <input type="number" placeholder="Stock" className="w-full p-2 border rounded" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required />
              </div>
              <select className="w-full p-2 border rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                {VALID_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <textarea placeholder="Description" className="w-full p-2 border rounded" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              <input type="file" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} className="text-xs" />
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setShowFormModal(false)} className="flex-1 py-2 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-[#003d3d] text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL (Display Info) */}
      {showViewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={() => setShowViewModal(false)}>
          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="relative w-full h-64 bg-gray-50">
              <img src={`http://localhost:5000${selectedProduct.image_url}`} className="w-full h-full object-cover" alt="" />
              {/* MODAL HERO BLOCK ALERT COVERS */}
              {selectedProduct.stock === 0 ? (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-rose-600 text-white text-xs font-black tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                    OUT OF STOCK
                  </span>
                </div>
              ) : selectedProduct.stock <= LOW_STOCK_THRESHOLD ? (
                <span className="absolute bottom-3 right-3 bg-amber-500 text-white text-[11px] font-bold px-3 py-1 rounded-md shadow">
                  Low Stock Warning
                </span>
              ) : null}
            </div>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold text-slate-800">{selectedProduct.name}</h2>
              <p className="text-teal-600 font-bold text-xs uppercase tracking-wider mt-0.5">{selectedProduct.category}</p>
              <p className="mt-3 text-gray-600 text-sm leading-relaxed">{selectedProduct.description || 'No descriptive information provided.'}</p>
              <div className="mt-5 flex justify-between items-center border-t border-slate-100 pt-4">
                <span className="text-xl font-bold text-blue-900">₱{Number(selectedProduct.price).toLocaleString()}</span>
                
                {/* DYNAMIC METRIC DISPLAYS FOR DETAILED AUDITS */}
                <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${
                  selectedProduct.stock === 0 ? 'text-rose-700 bg-rose-50 border border-rose-100' :
                  selectedProduct.stock <= LOW_STOCK_THRESHOLD ? 'text-amber-700 bg-amber-50 border border-amber-100' :
                  'text-slate-500 bg-slate-50'
                }`}>
                  {selectedProduct.stock === 0 ? 'Unavailable' : `${selectedProduct.stock} units remaining`}
                </span>
              </div>
              <button onClick={() => setShowViewModal(false)} className="w-full mt-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition-colors text-sm shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProduct;