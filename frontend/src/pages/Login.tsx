import { useState } from 'react';

interface LoginProps {
  setView: (view: string) => void;
  setUser: (user: any) => void;
}

const Login = ({ setView, setUser }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-white font-['Inter']">
      
      {/* LEFT SIDE: PHOTO BRANDING AREA PANELS */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#003d3d] p-12 flex-col justify-between relative overflow-hidden">
        {/* Background ambient accents inside left photo panel */}
        <div className="absolute top-[-20%] right-[-20%] w-96 h-96 bg-teal-800/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-emerald-900/40 rounded-full blur-3xl"></div>
        
        {/* Dynamic Logo Marker */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <span className="text-white font-black text-xl italic">O</span>
          </div>
          <span className="text-white font-black text-xl tracking-tight">
            Order<span className="text-emerald-400">Click</span>
          </span>
        </div>

        {/* Core Media Feature Frame */}
        <div className="my-auto space-y-8 relative z-10 max-w-sm">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white leading-tight tracking-tight">
              Say goodbye to <br />
              <span className="text-emerald-400">Paper Receipts.</span>
            </h2>
            <p className="text-teal-100/80 text-sm leading-relaxed font-medium">
              Organize your shopping life with digital receipts. Track spending, manage asset data, and simplify your ecosystem—all in one secure platform.
            </p>
          </div>

          {/* Integrated Image Frame pointing to public/images/ */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl group">
            <img 
              src="/images/login-bg.png" 
              alt="OrderClick Portal Illustration" 
              className="w-full h-48 object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        </div>

        {/* Footer Info Marker */}
        <p className="text-teal-200/40 text-[11px] font-bold uppercase tracking-widest relative z-10">
          &copy; 2026 ORDERCLICK ENGINE &bull; SECURE WORKSPACE
        </p>
      </div>

      {/* RIGHT SIDE: AUTH FORM ACTION CREDENTIAL PANELS */}
      <div className="col-span-1 lg:col-span-7 flex items-center justify-center bg-slate-50/60 p-6 md:p-12 relative">
        
        {/* BACK TO LANDING ARROW TRIGGER */}
        <button 
          onClick={() => setView('landing')}
          className="absolute top-8 left-6 md:left-12 flex items-center gap-2 text-slate-400 hover:text-[#003d3d] transition-colors font-bold text-xs uppercase tracking-widest group z-10"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 group-hover:-translate-x-1 transition-transform" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to home
        </button>

        {/* Mobile View Title Card Header (Hidden on large panels) */}
        <div className="absolute top-8 right-6 md:right-12 lg:hidden flex items-center gap-2">
          <span className="text-slate-800 font-black text-lg">Order<span className="text-[#003d3d]">Click</span></span>
        </div>

        {/* Central Authorization Container Layout */}
        <div className="w-full max-w-[440px] bg-white rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,61,61,0.04)] border border-slate-100 p-8 md:p-10 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight text-slate-800 mb-1">
              Welcome Back
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              Please enter your dashboard credentials to sign in.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[12px] font-black uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
              <input 
                type="email" 
                placeholder="name@company.com" 
                value={email}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#003d3d] focus:bg-white focus:ring-4 focus:ring-[#003d3d]/5 transition-all text-slate-700 font-medium text-sm"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[12px] font-black uppercase tracking-wider text-slate-500">Password</label>
                <button type="button" className="text-[11px] font-bold text-[#003d3d] uppercase tracking-wider hover:underline">Forgot?</button>
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#003d3d] focus:bg-white focus:ring-4 focus:ring-[#003d3d]/5 transition-all text-slate-700 font-medium text-sm"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-[#003d3d] text-white font-black py-4 rounded-2xl shadow-lg shadow-[#003d3d]/10 hover:bg-[#002d2d] active:scale-[0.99] transition-all mt-6 text-sm tracking-wide"
            >
              Continue to Dashboard
            </button>
          </form>

          {/* Structural separation line decoration block */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"><span className="bg-white px-4">OR</span></div>
          </div>

          <div className="text-center">
            <p className="text-slate-400 text-sm font-medium">
              New to our network?{' '}
              <button 
                type="button"
                onClick={() => setView('register')} 
                className="text-[#003d3d] font-black border-b-2 border-[#003d3d]/10 hover:border-[#003d3d] transition-all"
              >
                Create new account
              </button>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;