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
    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('stock', formData.stock);
    data.append('category', formData.category);
    data.append('description', formData.description);
    if (imageFile) data.append('image', imageFile);

    try {
      const url = editingId ? `http://localhost:5000/api/products/${editingId}` : 'http://localhost:5000/api/products/add';
      const res = await fetch(url, { method: editingId ? 'PUT' : 'POST', body: data });
      if (res.ok) {
        setShowFormModal(false);
        setEditingId(null);
        setFormData({ name: '', price: '', stock: '', category: VALID_CATEGORIES[0], description: '' });
        setImageFile(null);
        fetchProducts();
      }
    } catch (err) { console.error("Connection Error:", err); }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Delete this product?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
        if (res.ok) fetchProducts();
      } catch (err) { console.error("Delete error:", err); }
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
      <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-6 gap-4">
        {filteredProducts.map(p => (
          <div key={p.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all" onClick={() => { setSelectedProduct(p); setShowViewModal(true); }}>
            <img src={`http://localhost:5000${p.image_url}`} className="w-full aspect-square object-cover" alt={p.name} />
            <div className="p-2">
              <span className="text-[9px] text-teal-600 font-bold uppercase">{p.category}</span>
              <h3 className="text-xs font-bold truncate">{p.name}</h3>
              <p className="text-blue-900 font-bold">₱{Number(p.price).toLocaleString()}</p>
              <div className="flex gap-1 mt-2" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => {
                  setEditingId(p.id);
                  setFormData({ name: p.name, price: p.price.toString(), stock: p.stock.toString(), category: p.category, description: p.description || '' });
                  setShowFormModal(true);
                }} className="flex-1 py-1 bg-gray-100 rounded text-[10px] font-bold">Edit</button>
                <button onClick={() => handleDelete(p.id)} className="px-2 py-1 bg-red-50 text-red-500 rounded text-[10px] font-bold">Del</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- THE MISSING MODALS START HERE --- */}
      
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
            <img src={`http://localhost:5000${selectedProduct.image_url}`} className="w-full h-64 object-cover" alt="" />
            <div className="p-6">
              <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
              <p className="text-teal-600 font-bold">{selectedProduct.category}</p>
              <p className="mt-2 text-gray-600">{selectedProduct.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xl font-bold text-blue-900">₱{selectedProduct.price}</span>
                <span className="text-gray-400">{selectedProduct.stock} in stock</span>
              </div>
              <button onClick={() => setShowViewModal(false)} className="w-full mt-6 py-2 bg-gray-800 text-white rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProduct;