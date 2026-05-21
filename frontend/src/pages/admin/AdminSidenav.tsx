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
  // State tracking when the interactive logout confirmation matrix is open
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <aside className="w-64 bg-[#004a80] text-white fixed h-full flex flex-col p-6 shadow-2xl z-20">
      
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
                  ? 'bg-white text-[#004a80] shadow-xl translate-x-2' 
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
      <div className="relative mt-auto pt-4">
        
        {/* 💡 HOVER MATRIX POPPING OUT FROM THE RIGHT SIDE */}
        <div 
          className={`absolute left-[calc(100%+16px)] top-1/2 -translate-y-1/2 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 transition-all duration-300 flex flex-col gap-3 min-w-[240px] z-50 ${
            showConfirm 
              ? 'opacity-100 translate-x-0 scale-100 visible' 
              : 'opacity-0 -translate-x-4 scale-95 invisible'
          }`}
        >
          {/* Left Arrow pointing directly to the Sign Out button */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-900 rotate-45 border-l border-b border-slate-800 translate-x-1.5"></div>

          <p className="text-xs font-black text-slate-300 uppercase tracking-wider px-1">
            Do you want to logout?
          </p>

          {/* Grid Layout containing Yes and No actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black py-2.5 px-3 rounded-xl transition-all shadow-md active:scale-95"
            >
              <Check size={14} strokeWidth={3} />
              Yes
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black py-2.5 px-3 rounded-xl transition-all border border-slate-700 active:scale-95"
            >
              <X size={14} strokeWidth={3} />
              No
            </button>
          </div>
        </div>

        {/* LOGOUT INTERACTIVE ACTION ELEMENT */}
        <button 
          onClick={() => setShowConfirm(true)}
          onMouseEnter={() => setShowConfirm(true)}
          className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-200 transition-all font-bold text-sm border border-transparent group ${
            showConfirm 
              ? 'bg-red-600/20 text-red-400 border-red-500/30' 
              : 'hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
          }`}
        >
          <LogOut size={20} className={`transition-transform duration-300 ${showConfirm ? 'rotate-12 scale-110 text-red-400' : 'group-hover:rotate-12'}`} />
          Sign Out
        </button>

      </div>
    </aside>
  );
};

export default AdminSidenav;