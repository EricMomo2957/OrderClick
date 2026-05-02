import { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, CreditCard, PackageOpen, Loader2 } from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  description: string;
  price: number;
  qty: number;
  stock: number;
  image_url: string;
  category: string;
}

// Added user prop to get the ID for the database
const CustomerCart = ({ user }: { user: any }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(savedCart);
  }, []);

  const removeFromCart = (id: number) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const handleCheckout = async () => {
    if (!user?.id) return alert("Please log in to checkout.");
    setIsCheckingOut(true);

    try {
      // Loop through all items and send to database
      const promises = cartItems.map(item => 
        fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            productId: item.id,
            quantity: item.qty,
            totalPrice: Number(item.price) * item.qty
          }),
        })
      );

      const results = await Promise.all(promises);
      const allSuccessful = results.every(res => res.ok);

      if (allSuccessful) {
        alert("Payment Successful! Your orders are now pending verification.");
        // Clear cart
        setCartItems([]);
        localStorage.removeItem('cart');
        // Optional: Redirect user to Orders tab if you have a navigation function
      } else {
        alert("Some items could not be processed. Please check your connection.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Server error during checkout.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const total = cartItems.reduce((acc, item) => acc + (Number(item.price) * item.qty), 0);

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <PackageOpen size={64} strokeWidth={1} className="mb-4 opacity-20" />
        <p className="font-bold text-lg text-slate-600">Your cart is currently empty.</p>
        <p className="text-sm">Visit the Marketplace to add some items!</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
        <ShoppingCart className="text-teal-600" /> My Shopping Cart
      </h2>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Details</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Price</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Total</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {cartItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-slate-100 overflow-hidden border border-slate-100">
                      <img 
                        src={item.image_url ? `http://localhost:5000${item.image_url}` : 'https://via.placeholder.com/150'} 
                        alt={item.name}
                        className="h-full w-full object-cover" 
                      />
                    </div>
                    <div>
                      <p className="font-black text-slate-800">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{item.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-center font-bold text-slate-600">₱{Number(item.price).toLocaleString()}</td>
                <td className="px-8 py-5 text-center font-bold text-slate-600">{item.qty}</td>
                <td className="px-8 py-5 text-center font-black text-teal-700">₱{(Number(item.price) * item.qty).toLocaleString()}</td>
                <td className="px-8 py-5 text-right">
                  <button onClick={() => removeFromCart(item.id)} className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-10 bg-slate-50/80 backdrop-blur-sm flex justify-between items-center border-t border-slate-100">
          <div className="flex gap-10">
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Items Count</p>
              <p className="text-xl font-black text-slate-800">{cartItems.length} Products</p>
            </div>
            <div className="w-[1px] bg-slate-200 h-10 my-auto"></div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Grand Total</p>
              <p className="text-3xl font-black text-[#003d3d]">₱{total.toLocaleString()}</p>
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="bg-[#003d3d] text-white px-10 py-5 rounded-[1.5rem] font-black flex items-center gap-4 hover:bg-slate-800 transition-all shadow-xl shadow-teal-900/20 active:scale-95 group disabled:opacity-70"
          >
            {isCheckingOut ? <Loader2 className="animate-spin" /> : <CreditCard size={20} className="group-hover:rotate-12 transition-transform" />} 
            {isCheckingOut ? 'Processing...' : 'Checkout & Pay'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerCart;