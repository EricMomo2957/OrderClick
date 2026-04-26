import { useState } from 'react';

// 1. Interface for type-safe props
interface LoginProps {
  setView: (view: string) => void;
  setUser: (user: any) => void;
}

const Login = ({ setView, setUser }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 2. Form handler with React.FormEvent typing
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
        // Store session data for persistence
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setUser(data.user); // Update global App state

        // Role-based routing logic
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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] p-6 font-['Inter'] relative overflow-hidden">
      {/* Visual background elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-teal-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>

      <div className="relative w-full max-w-[450px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,61,61,0.05)] border border-gray-100 p-10 md:p-12">
        <div className="text-center mb-10">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-[#003d3d] items-center justify-center shadow-lg shadow-teal-900/20 mb-4">
            <span className="text-white font-black text-2xl italic">O</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Order<span className="text-[#003d3d]">Click</span>
          </h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">
            Digital Receipt Portal
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-700 ml-1">Email Address</label>
            <input 
              type="email" 
              placeholder="name@company.com" 
              value={email}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#003d3d] focus:bg-white focus:ring-4 focus:ring-[#003d3d]/5 transition-all text-gray-700"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[13px] font-bold text-gray-700">Password</label>
              <button type="button" className="text-[11px] font-bold text-[#003d3d] uppercase tracking-wider hover:underline">Forgot?</button>
            </div>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#003d3d] focus:bg-white focus:ring-4 focus:ring-[#003d3d]/5 transition-all text-gray-700"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-[#003d3d] text-white font-bold py-4 rounded-2xl shadow-xl shadow-[#003d3d]/10 hover:bg-[#002d2d] active:scale-95 transition-all mt-4"
          >
            Sign In
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]"><span className="bg-white px-4 text-gray-400">Security Verified</span></div>
        </div>

        <div className="text-center">
          <p className="text-gray-500 text-sm font-medium">
            New here?{' '}
            <button 
              type="button"
              onClick={() => setView('register')} 
              className="text-[#003d3d] font-bold border-b-2 border-[#003d3d]/10 hover:text-gray-800 transition-colors"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;