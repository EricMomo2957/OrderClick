// frontend/src/pages/admin/AdminSidenav.tsx
import { useState } from 'react';
import { LogOut, Check, X } from 'lucide-react';

interface AdminSidenavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  menuItems: any[]; // Accepts the prop array dynamically from AdminDashboard to ensure perfect HMR stability
}

const AdminSidenav = ({ activeTab, setActiveTab, onLogout, menuItems }: AdminSidenavProps) => {
  // State tracking when the verification overlay modal is open
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <aside className="w-64 bg-[#004a80] text-white fixed h-full flex flex-col p-6 shadow-2xl z-20 select-none">
        
        {/* BRAND LOGO WRAPPER */}
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-blue-900/20">
            <span className="text-[#004a80] font-black text-xl italic">O</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Order<span className="opacity-70">Click</span>
          </h1>
        </div>

        {/* CORE INTERACTIVE CONSOLE NAVIGATION */}
        <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <p className="text-[10px] font-black text-blue-200/40 uppercase tracking-[0.2em] px-4 mb-4">
            Admin Console
          </p>
          
          {menuItems && menuItems.map((item: any) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm ${
                  isActive 
                    ? 'bg-white text-[#004a80] shadow-xl translate-x-2 font-black' 
                    : 'text-blue-50/50 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon 
                  size={20} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={isActive ? 'text-[#004a80]' : 'text-blue-50/40'}
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* SIGN OUT CONTAINER BLOCK */}
        <div className="mt-auto pt-4 border-t border-white/10">
          <button 
            onClick={() => setShowConfirm(true)}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-200 transition-all font-bold text-sm border border-transparent group hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
          >
            <LogOut size={20} className="transition-transform duration-300 group-hover:-translate-x-1" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* 💡 GLOBAL OVERLAY VERIFICATION MODAL DESIGNED AFTER THE SAMPLE PHOTO */}
      <div 
        className={`fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300 ${
          showConfirm ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div 
          className={`bg-[#0d1527] border border-slate-800 text-white w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center transition-all duration-300 transform ${
            showConfirm ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
        >
          {/* Central Branded Graphic Circle Container */}
          <div className="h-16 w-16 bg-[#16223f] rounded-2xl border border-slate-700/50 flex items-center justify-center shadow-inner mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg">
              <LogOut size={20} className="text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Modal Header Typography */}
          <h2 className="text-2xl font-black tracking-tight mb-2 italic">
            End Session?
          </h2>
          <p className="text-sm text-slate-400 max-w-[260px] leading-relaxed mb-8">
            Are you sure you want to log out of the{' '}
            <span className="text-blue-400 font-bold">Admin Suite</span>?
          </p>

          {/* Action Grid Buttons Layout */}
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] text-sm uppercase tracking-wider"
            >
              <Check size={16} strokeWidth={3} />
              Yes, Logout
            </button>
            
            <button
              onClick={() => setShowConfirm(false)}
              className="w-full flex items-center justify-center gap-2 bg-[#1b2641] hover:bg-[#243257] text-slate-300 font-bold py-4 px-6 rounded-2xl transition-all border border-slate-700/50 active:scale-[0.98] text-sm uppercase tracking-wider"
            >
              <X size={16} strokeWidth={2.5} />
              Stay Logged In
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidenav;