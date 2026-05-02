import { useState } from 'react';
import { Mail, Lock, ArrowRight, ShoppingBag } from 'lucide-react';

interface LoginProps {
  setView: (view: string) => void;
  setUser: (user: any) => void;
}

const Login = ({ setView, setUser }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);

        if (data.user.role === 'admin') {
          setView('admin-dashboard');
        } else {
          setView('customer-dashboard');
        }
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err: any) {
      console.error("Connection error:", err);
      alert("Could not connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f0f4f4] p-4 md:p-10 font-['Inter'] relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-100/50 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#003d3d]/10 rounded-full blur-[120px]"></div>

      {/* Expanded White Grid Box */}
      <div className="relative w-full max-w-[1000px] grid md:grid-cols-2 bg-white rounded-[1.0rem] shadow-[0_32px_64px_-16px_rgba(0,61,61,0.15)] overflow-hidden border border-white">
        
        {/* Left Side: Form Section */}
        <div className="p-10 md:p-20 flex flex-col justify-center">
          <div className="mb-12">
            <div className="h-14 w-14 bg-[#003d3d] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-teal-900/20">
               <ShoppingBag className="text-teal-300" size={28} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-2">
              Welcome back<span className="text-teal-600">.</span>
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.15em] mt-3">
              OrderClick Digital Portal Access
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-7">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#003d3d] transition-colors" size={20} />
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none focus:border-[#003d3d] focus:bg-white focus:ring-8 focus:ring-[#003d3d]/5 transition-all font-medium text-slate-700"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Security Password</label>
                <button type="button" className="text-[10px] font-black text-[#003d3d] uppercase tracking-tighter hover:opacity-70 transition-opacity">Reset Access?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#003d3d] transition-colors" size={20} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none focus:border-[#003d3d] focus:bg-white focus:ring-8 focus:ring-[#003d3d]/5 transition-all font-medium text-slate-700"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#003d3d] text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-teal-900/30 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-70 mt-4 text-lg"
            >
              {isLoading ? "Authenticating..." : (
                <>
                  Sign In to Dashboard
                  <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-10 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-sm font-bold">
              New to the platform?{' '}
              <button 
                type="button"
                onClick={() => setView('register')} 
                className="text-[#003d3d] hover:underline underline-offset-8 decoration-2"
              >
                Create a Free Account
              </button>
            </p>
          </div>
        </div>

        {/* Right Side: Image Section */}
        <div className="hidden md:block relative h-full w-full">
          <img 
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=2070" 
            alt="Shopping Experience"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Subtle Overlay to match branding */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#003d3d]/40 to-transparent"></div>
          
          {/* Float Badge over image */}
          <div className="absolute bottom-10 left-10 right-10 bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2rem]">
             <p className="text-white font-black text-2xl leading-snug">
               "Seamlessly managing your <span className="text-teal-300">digital marketplace</span> and orders in one click."
             </p>
             <div className="mt-4 h-1 w-12 bg-teal-400 rounded-full"></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;