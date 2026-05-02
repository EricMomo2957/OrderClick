import { useState } from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';

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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f0f4f4] p-4 md:p-6 font-['Inter'] relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-100/50 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#003d3d]/10 rounded-full blur-[120px]"></div>

      <div className="relative w-full max-w-[1000px] grid md:grid-cols-2 bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,61,61,0.15)] overflow-hidden border border-white">
        
        {/* Left Side: Branding/Visual */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-[#003d3d] text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="h-12 w-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
              <ShoppingBag className="text-teal-300" size={24} />
            </div>
            <h2 className="text-4xl font-black leading-tight">
              Premium <br />Shopping <br />Experience.
            </h2>
            <p className="text-teal-100/60 mt-4 text-sm font-medium max-w-[250px]">
              Access your digital receipts, manage orders, and explore the marketplace.
            </p>
          </div>
          
          <div className="relative z-10 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-teal-300/80">
            <ShieldCheck size={16} />
            Secure Enterprise Portal v2.0
          </div>

          {/* Abstract Pattern Overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 border-[40px] border-white rounded-full translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 border-[20px] border-white rounded-full -translate-x-16 translate-y-16"></div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-10 md:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
              Welcome back<span className="text-teal-600">.</span>
            </h1>
            <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-2">
              Please enter your details to sign in
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#003d3d] transition-colors" size={18} />
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#003d3d] focus:bg-white focus:ring-4 focus:ring-[#003d3d]/5 transition-all font-medium text-slate-700"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Password</label>
                <button type="button" className="text-[10px] font-black text-[#003d3d] uppercase tracking-tighter hover:opacity-70">Forgot Password?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#003d3d] transition-colors" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#003d3d] focus:bg-white focus:ring-4 focus:ring-[#003d3d]/5 transition-all font-medium text-slate-700"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#003d3d] text-white font-black py-4 rounded-2xl shadow-xl shadow-teal-900/20 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {isLoading ? "Authenticating..." : (
                <>
                  Sign In to Dashboard
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-slate-50 text-center">
            <p className="text-slate-400 text-sm font-bold">
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => setView('register')} 
                className="text-[#003d3d] hover:underline underline-offset-4"
              >
                Create one for free
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;