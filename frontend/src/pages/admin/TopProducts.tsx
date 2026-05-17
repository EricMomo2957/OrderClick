import { useState, useEffect, useCallback } from 'react';
import { Star, Package } from 'lucide-react';

interface Product {
  id: number;
  product_name: string;
  sales_count: number;
  price: number;
}

const TopProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopProducts = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/admin/top-products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Failed to load top products", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopProducts();
  }, [fetchTopProducts]);

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 flex flex-col h-full">
      <div className="mb-6 px-2">
        <h3 className="text-xl font-black text-slate-800">Top Selling Products</h3>
        <p className="text-xs text-slate-400 font-medium">Inventory items with highest sales conversion velocity.</p>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-10 text-xs italic text-slate-400">Analyzing metrics...</div>
        ) : products.length > 0 ? (
          products.map((product, index) => (
            <div key={product.id} className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-4">
                {/* Ranking Number Badge */}
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                  index === 0 ? 'bg-amber-50 text-amber-600' :
                  index === 1 ? 'bg-slate-100 text-slate-600' : 'bg-slate-50 text-slate-400'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800 group-hover:text-[#003d3d] transition-colors">
                    {product.product_name}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">₱{product.price.toLocaleString()}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="flex items-center gap-1 text-xs font-black text-[#003d3d] bg-emerald-50/50 px-3 py-1 rounded-xl">
                  <Package size={12} /> {product.sales_count} Sold
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-xs italic text-slate-400">No data compiled yet.</div>
        )}
      </div>
    </div>
  );
};

export default TopProducts;