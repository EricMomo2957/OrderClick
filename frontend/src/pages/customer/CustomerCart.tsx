import { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, CreditCard, PackageOpen, Loader2, X, CheckCircle2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

const CustomerCart = ({ user }: { user: any }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'GCash' | null>(null);
  const [refNumber, setRefNumber] = useState('');
  const [receiptTotal, setReceiptTotal] = useState(0);
  const [lastOrderedItems, setLastOrderedItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(savedCart);
  }, []);

  const removeFromCart = (id: number) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const total = cartItems.reduce((acc, item) => acc + (Number(item.price) * item.qty), 0);

  const startCheckout = () => {
    if (!user?.id) return alert("Please log in to checkout.");
    if (cartItems.length === 0) return alert("Your cart is empty");
    setShowPaymentModal(true);
  };

  const handleDownloadReceipt = async () => {
    const element = document.getElementById('receipt-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true 
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`OrderClick_Receipt_${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const processFinalOrder = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert("Session expired. Please log in again.");
      return;
    }

    // Generate Reference Number if GCash is selected
    const generatedRef = paymentMethod === 'GCash' 
      ? `REF-${Math.floor(Math.random() * 1000000000)}` 
      : '';
    
    setRefNumber(generatedRef);
    setIsCheckingOut(true);

    try {
      const orderPromises = cartItems.map(item => {
        return fetch('http://localhost:5000/api/orders/place', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({
            userId: user.id,
            productId: item.id,
            quantity: item.qty,
            totalPrice: Number(item.price) * item.qty,
            paymentMethod: paymentMethod,
            referenceNumber: generatedRef // Now sending the reference to the backend
          })
        });
      });

      const results = await Promise.all(orderPromises);
      const allSuccessful = results.every(res => res.ok);

      if (allSuccessful) {
        setReceiptTotal(total); 
        setLastOrderedItems([...cartItems]);
        
        setShowPaymentModal(false);
        setShowReceiptModal(true);
        
        setCartItems([]);
        localStorage.removeItem('cart');
      } else {
        const errorData = await results[0].json();
        alert(errorData.message || "Processing error. Please check stock availability.");
      }
    } catch (err) {
      alert("Server error. Please try again later.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (cartItems.length === 0 && !showReceiptModal) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <PackageOpen size={64} strokeWidth={1} className="mb-4 opacity-20" />
        <p className="font-bold text-lg text-slate-600">Your cart is currently empty.</p>
        <p className="text-sm">Visit the Marketplace to add some items!</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-4">
      <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
        <ShoppingCart className="text-teal-600" /> My Shopping Cart
      </h2>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-10">
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
                                    <img src={item.image_url ? `http://localhost:5000${item.image_url}` : 'https://via.placeholder.com/150'} alt={item.name} className="h-full w-full object-cover" />
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
        
        <div className="p-10 bg-slate-50/80 flex justify-between items-center">
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Grand Total</p>
            <p className="text-3xl font-black text-[#003d3d]">₱{total.toLocaleString()}</p>
          </div>
          <button onClick={startCheckout} className="bg-[#003d3d] text-white px-10 py-5 rounded-[1.5rem] font-black flex items-center gap-4 hover:bg-slate-800 transition-all shadow-xl active:scale-95">
            <CreditCard size={20} /> Checkout & Pay
          </button>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800">Ready to Checkout?</h3>
              <button onClick={() => setShowPaymentModal(false)} className="hover:rotate-90 transition-transform">
                <X className="text-slate-400" />
              </button>
            </div>

            <div className="bg-blue-50 rounded-2xl p-5 mb-8 border border-blue-100">
                <p className="text-blue-800 text-sm font-medium mb-1">
                  You have <span className="font-bold">{cartItems.length} item(s)</span> in your cart with a total of <span className="font-bold">₱{total.toLocaleString()}</span>.
                </p>
                <p className="text-blue-600 text-xs">Payment will be processed at the Coop Office.</p>
            </div>

            <p className="text-slate-800 font-black mb-4">Select Payment Method</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button 
                onClick={() => setPaymentMethod('Cash')}
                className={`p-5 rounded-2xl border-2 text-left transition-all ${
                    paymentMethod === 'Cash' 
                    ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-100' 
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <p className="font-black text-slate-800">Cash</p>
                <p className="text-[10px] text-slate-500 font-bold">Pay at Coop office</p>
              </button>

              <button 
                onClick={() => setPaymentMethod('GCash')}
                className={`p-5 rounded-2xl border-2 text-left transition-all ${
                    paymentMethod === 'GCash' 
                    ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-100' 
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <p className="font-black text-slate-800">GCash</p>
                <p className="text-[10px] text-slate-500 font-bold">Pay via GCash</p>
              </button>
            </div>

            <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-slate-600">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <span className="text-sm font-bold">Review your items</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <span className="text-sm font-bold">Proceed to payment at the office</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <span className="text-sm font-bold">Collect your items upon payment</span>
                </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowPaymentModal(false)} 
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                disabled={!paymentMethod || isCheckingOut}
                onClick={processFinalOrder}
                className="flex-1 py-4 bg-[#22c55e] text-white rounded-2xl font-black disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-green-600 transition-all shadow-lg shadow-green-100"
              >
                {isCheckingOut ? <Loader2 size={18} className="animate-spin" /> : 'Checkout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReceiptModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
            <div id="receipt-content" className="text-center p-4">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Order Confirmed!</h3>
              <p className="text-slate-500 text-sm mb-8">Order ID: ORD-{Math.floor(Date.now() / 1000)}</p>
              
              <div className="bg-slate-50 rounded-3xl p-6 mb-8 text-left border border-dashed border-slate-200">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400 text-xs uppercase font-bold">Method</span>
                  <span className="text-slate-800 font-bold">{paymentMethod}</span>
                </div>
                {paymentMethod === 'GCash' && (
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-400 text-xs uppercase font-bold">Ref No.</span>
                    <span className="text-teal-600 font-black">{refNumber}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 my-4"></div>
                <div className="flex justify-between">
                  <span className="text-slate-800 font-black">Total Paid</span>
                  <span className="text-xl font-black text-slate-800">₱{receiptTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleDownloadReceipt}
                className="w-full py-4 bg-[#003d3d] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
              >
                <Download size={18} /> Download PDF Receipt
              </button>
              <button onClick={() => setShowReceiptModal(false)} className="w-full py-4 text-slate-400 font-bold hover:text-slate-600">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerCart;