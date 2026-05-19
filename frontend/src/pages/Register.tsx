import { useState } from 'react';

// 1. Define the props interface for TypeScript
interface RegisterProps {
  setView: (view: string) => void;
}

const Register = ({ setView }: RegisterProps) => {
  // Fixed state to use 'fullname' to match database schema
  const [formData, setFormData] = useState({
    fullname: '', 
    email: '',
    password: '',
    role: 'customer' 
  });

  // 2. Type the event as React.FormEvent for safety
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Using fetch to send data directly to your backend
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), 
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! Please login.");
        // Redirect back to login view
        setView('login');
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      console.error("Connection error:", err);
      alert("Could not connect to the server.");
    }
  };

  return (
    /* Main layout body matches the exact light neutral blue backdrop */
    <div className="min-h-screen w-full grid grid-cols-12 bg-[#f0f4f8] font-['Inter']">
      
      {/* LEFT SIDE: PHOTO BRANDING AREA PANELS */}
      <div className="col-span-5 bg-[#003d3d] p-12 flex flex-col justify-between relative overflow-hidden shadow-[inset_-10px_0_30px_rgba(0,0,0,0.05)]">
        {/* Ambient background blur lighting */}
        <div className="absolute top-[-20%] right-[-20%] w-96 h-96 bg-teal-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-emerald-800/30 rounded-full blur-3xl"></div>
        
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
        <div className="my-auto space-y-8 relative z-10 w-full max-w-sm mx-auto">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white leading-tight tracking-tight">
              Say goodbye to <br />
              <span className="text-emerald-400">Paper Receipts.</span>
            </h2>
            <p className="text-teal-100/80 text-sm leading-relaxed font-medium">
              Organize your shopping life with digital receipts. Track spending, manage asset data, and simplify your ecosystem—all in one secure platform.
            </p>
          </div>

          {/* Integrated Image Frame pointing to public/images/login-bg.png */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl group">
            <img 
              src="/images/login-bg.png" 
              alt="OrderClick Portal Illustration" 
              className="w-full h-auto min-h-[240px] object-cover opacity-95 group-hover:opacity-100 transition-opacity duration-300 block"
            />
          </div>
        </div>

        {/* Footer Info Marker */}
        <p className="text-teal-200/40 text-[11px] font-bold uppercase tracking-widest relative z-10">
          &copy; 2026 ORDERCLICK ENGINE &bull; SECURE WORKSPACE
        </p>
      </div>

      {/* RIGHT SIDE: AUTH FORM ACTION CREDENTIAL PANELS */}
      <div className="col-span-7 flex items-center justify-center p-6 md:p-12 relative">
        
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

        {/* Central Authorization Container Layout */}
        <div className="w-full max-w-[440px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,61,61,0.06)] border border-slate-200/60 p-8 md:p-10">
          
          <div className="text-center mb-6">
            <h1 className="text-3xl font-black tracking-tight text-slate-800 mb-1">
              Join <span className="text-[#003d3d]">Us</span>
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              Create your portal account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-black uppercase tracking-wider text-slate-500 ml-1">Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                value={formData.fullname}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl outline-none focus:border-[#003d3d] focus:bg-white focus:ring-4 focus:ring-[#003d3d]/5 transition-all text-slate-700 font-medium text-sm"
                onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-black uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
              <input 
                type="email" 
                placeholder="name@company.com" 
                value={formData.email}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl outline-none focus:border-[#003d3d] focus:bg-white focus:ring-4 focus:ring-[#003d3d]/5 transition-all text-slate-700 font-medium text-sm"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-black uppercase tracking-wider text-slate-500 ml-1">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={formData.password}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl outline-none focus:border-[#003d3d] focus:bg-white focus:ring-4 focus:ring-[#003d3d]/5 transition-all text-slate-700 font-medium text-sm"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[12px] font-black uppercase tracking-wider text-slate-500">Register As</label>
                {/* Embedded Forgot Password trigger linked directly to the parent setView hook */}
                <button 
                  type="button" 
                  onClick={() => setView('forgot-password')}
                  className="text-[11px] font-bold text-[#003d3d] uppercase tracking-wider hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <select 
                  value={formData.role}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl outline-none focus:border-[#003d3d] focus:bg-white focus:ring-4 focus:ring-[#003d3d]/5 transition-all text-slate-700 font-medium text-sm appearance-none cursor-pointer"
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-[#003d3d] text-white font-black py-4 rounded-2xl shadow-lg shadow-[#003d3d]/20 hover:bg-[#002d2d] active:scale-[0.99] transition-all mt-4 text-sm tracking-wide"
            >
              Create Account
            </button>
          </form>

          {/* Separation Line Break */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"><span className="bg-white px-4">OR</span></div>
          </div>

          <div className="text-center">
            <p className="text-slate-400 text-sm font-medium">
              Already have an account?{' '}
              <button 
                type="button"
                onClick={() => setView('login')} 
                className="text-[#003d3d] font-black border-b-2 border-[#003d3d]/10 hover:border-[#003d3d] transition-all"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Register;