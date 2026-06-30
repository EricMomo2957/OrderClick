import { useState } from 'react';

interface ForgotPasswordProps {
  setView: (view: string) => void;
}

const ForgotPassword = ({ setView }: ForgotPasswordProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        alert("Password reset instructions have been sent to your email.");
      } else {
        alert(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Connection error:", err);
      alert("Could not connect to the server.");
    }
  };

  return (
    /* Main layout container split explicitly with pure background separations */
    <div className="min-h-screen w-full grid grid-cols-12 bg-white font-['Inter']">
      
      {/* LEFT SIDE: PHOTO BRANDING AREA PANELS */}
      <div className="col-span-5 bg-[#003d3d] p-12 flex flex-col justify-between relative overflow-hidden">
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

          {/* Integrated Image Frame */}
          <div className="overflow-hidden rounded-[2rem]">
            <img 
              src="/images/login-bg.png" 
              alt="OrderClick Portal Illustration" 
              className="w-full h-auto min-h-[240px] object-cover block"
            />
          </div>
        </div>

        {/* Footer Info Marker */}
        <p className="text-teal-200/40 text-[11px] font-bold uppercase tracking-widest relative z-10">
          &copy; 2026 ORDERCLICK ENGINE &bull; SECURE WORKSPACE
        </p>
      </div>

      {/* RIGHT SIDE: AUTH FORM ACTION PANELS */}
      <div className="col-span-7 flex flex-col justify-center p-6 md:p-12 relative bg-white">
        
        {/* BACK TO HOME LINK */}
        <button 
          onClick={() => setView('login')}
          className="absolute top-12 left-6 md:left-24 flex items-center gap-2 text-slate-400 hover:text-[#003d3d] transition-colors font-bold text-[11px] uppercase tracking-wider group z-10"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to home
        </button>

        {/* Form Content Wrapper */}
        <div className="w-full max-w-[380px] mx-auto text-center">
          
          <div className="mb-8">
            <h1 className="text-4xl font-black tracking-tight text-slate-800 mb-2">
              Welcome <span className="text-[#003d3d]">Back</span>
            </h1>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              Please enter your security reset credentials
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleResetSubmit} className="space-y-5 text-left">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 ml-1">
                  Email Address
                </label>
                <input 
                  type="email" 
                  placeholder="name@company.com" 
                  value={email}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200/60 rounded-2xl outline-none focus:border-[#003d3d] focus:bg-white transition-all text-slate-700 font-medium text-sm shadow-sm"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-[#003d3d] text-white font-black py-4 rounded-2xl shadow-sm hover:bg-[#002d2d] transition-all mt-2 text-sm tracking-wide"
              >
                Continue to Dashboard
              </button>
            </form>
          ) : (
            <div className="space-y-6 text-center py-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm font-medium">
                Check your email inbox for a link to change your security credentials.
              </p>
              <button 
                type="button"
                onClick={() => setView('login')}
                className="w-full bg-[#003d3d] text-white font-black py-4 rounded-2xl shadow-sm hover:bg-[#002d2d] transition-all text-sm tracking-wide"
              >
                Return to Sign In
              </button>
            </div>
          )}

          {/* Bottom Separation Divider line matches design parameters */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <span className="bg-white px-4">or</span>
            </div>
          </div>

          <div className="text-center text-xs">
            <p className="text-slate-400 font-medium">
              New to our network?{' '}
              <button 
                type="button"
                onClick={() => setView('register')} 
                className="text-[#003d3d] font-black hover:underline transition-all"
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

export default ForgotPassword;