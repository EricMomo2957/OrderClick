import { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';

interface TopProductItem {
    id: number;
    name: string;
    price: number | string;
    image_url: string | null;
    sales_count: number;
}

const TopProducts = () => {
    const [products, setProducts] = useState<TopProductItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchTopProducts = async () => {
        try {
            // Updated route to point directly to the /api/products pipeline
            const response = await fetch('http://localhost:5000/api/products/top-products');
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error("Error fetching top ranking products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTopProducts();

        // Keep the ranking order updated dynamically alongside live orders
        const interval = setInterval(() => {
            fetchTopProducts();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 min-h-[400px] flex items-center justify-center">
                <div className="text-slate-400 font-bold animate-pulse text-sm">Calculating Sales Ranks...</div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 w-full animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ShoppingBag size={16} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Top Selling Products</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Items with the highest sales conversion volume.</p>
                </div>
            </div>

            {products.length === 0 ? (
                <div className="h-[250px] flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl">
                    <p className="text-xs font-medium text-slate-400">No product sales metrics logged yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {products.map((product, index) => {
                        const rankColors = [
                            { bg: 'bg-amber-50 text-amber-600 border-amber-200', text: '🥇' },
                            { bg: 'bg-slate-50 text-slate-600 border-slate-200', text: '🥈' },
                            { bg: 'bg-orange-50 text-orange-600 border-orange-200', text: '🥉' },
                            { bg: 'bg-gray-50 text-gray-500 border-gray-100', text: '' },
                            { bg: 'bg-gray-50 text-gray-500 border-gray-100', text: '' }
                        ];

                        return (
                            <div 
                                key={product.id || index}
                                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-50 bg-slate-50/30 hover:bg-slate-50/80 transition-all duration-200 group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    {/* Rank Number Circle Badge */}
                                    <div className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center border shrink-0 ${rankColors[index]?.bg || 'bg-gray-50 text-gray-500'}`}>
                                        {rankColors[index]?.text ? rankColors[index].text : index + 1}
                                    </div>

                                    {/* Product Thumbnail Display Image */}
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/60 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                                        {product.image_url ? (
                                            <img 
                                                src={`http://localhost:5000${product.image_url}`} 
                                                alt={product.name} 
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <span className="text-xs font-bold text-slate-400 uppercase">
                                                {product.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Product Meta Text */}
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-bold text-slate-700 truncate pr-2 group-hover:text-blue-600 transition-colors">
                                            {product.name}
                                        </h4>
                                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                                            ₱{Number(product.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>

                                {/* Dynamic Order Volume Tag Counter */}
                                <div className="shrink-0 flex items-center bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-[10px] font-black border border-emerald-100 shadow-sm transition-transform group-hover:scale-105">
                                    {product.sales_count} sold
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TopProducts;