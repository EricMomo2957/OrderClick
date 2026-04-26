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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] p-6 font-['Inter'] relative overflow-hidden">
      {/* Design blurs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>

      <div className="relative w-full max-w-[450px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,61,61,0.05)] border border-gray-100 p-10 md:p-12">
        
        <div className="text-center mb-10">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-[#003d3d] items-center justify-center shadow-lg mb-4">
            <span className="text-white font-black text-2xl italic">O</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Join <span className="text-[#003d3d]">Us</span>
          </h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">
            Create your portal account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-700 ml-1">Full Name</label>
            <input 
              type="text" 
              placeholder="John Doe" 
              value={formData.fullname}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#003d3d] focus:bg-white focus:ring-4 focus:ring-[#003d3d]/5 transition-all text-gray-700"
              onChange={(e) => setFormData({...formData, fullname: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-700 ml-1">Email Address</label>
            <input 
              type="email" 
              placeholder="name@company.com" 
              value={formData.email}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#003d3d] focus:bg-white focus:ring-4 focus:ring-[#003d3d]/5 transition-all text-gray-700"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-700 ml-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={formData.password}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#003d3d] focus:bg-white focus:ring-4 focus:ring-[#003d3d]/5 transition-all text-gray-700"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-700 ml-1">Register As</label>
            <div className="relative">
              <select 
                value={formData.role}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#003d3d] focus:bg-white focus:ring-4 focus:ring-[#003d3d]/5 transition-all text-gray-700 appearance-none cursor-pointer"
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
              <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#003d3d] text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-[#002d2d] active:scale-95 transition-all mt-4"
          >
            Create Account
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm font-medium">
            Already have an account?{' '}
            <button 
              type="button"
              onClick={() => setView('login')} 
              className="text-[#003d3d] font-bold border-b-2 border-[#003d3d]/10 hover:text-gray-800 transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;