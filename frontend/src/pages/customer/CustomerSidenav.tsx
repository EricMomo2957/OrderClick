// frontend/src/pages/customer/customerSidenav.tsx
import { useState } from 'react';
import { LogOut, Sparkles, ShieldCheck, Check, X } from 'lucide-react';
import { CUSTOMER_MENU } from './constants'; // Import the menu data from your constants file

// Updated Interface to include essential props
interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar = ({ activeTab, setActiveTab, onLogout }: SidebarProps) => {
  // State tracking when the confirmation matrix panel popout is visible
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <aside className="w-64 bg-[#003d3d] text-white fixed h-full flex flex-col p-6 shadow-2xl z-20">
      {/* Brand Section */}
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-teal-900/20">
          <span className="text-[#003d3d] font-black text-xl italic">O</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight">
          Order<span className="opacity-70">Click</span>
        </h1>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 space-y-2">
        <p className="text-[10px] font-black text-teal-400/50 uppercase tracking-[0.2em] px-4 mb-4">
          Main Menu
        </p>
        
        {/* Mapping through the imported CUSTOMER_MENU */}
        {CUSTOMER_MENU.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm ${
                isActive 
                  ? 'bg-white text-[#003d3d] shadow-xl translate-x-2' 
                  : 'text-teal-50/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon 
                size={20} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={isActive ? 'text-[#003d3d]' : 'text-teal-50/40'}
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Feature Badge/Card */}
      <div className="mb-6 p-4 bg-white/5 rounded-[1.5rem] border border-white/10">
        <div className="flex items-center gap-2 mb-2 text-teal-300">
          <Sparkles size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Premium Member</span>
        </div>
        <p className="text-[11px] text-teal-50/60 leading-relaxed">
          Enjoy exclusive discounts and faster delivery on every order.
        </p>
      </div>

      {/* Logout Footer Section Block */}
      <div className="relative pt-2">
        
        {/* 💡 SIDE-POPPING HOVER GRID CONTAINER */}
        <div 
          className={`absolute left-[calc(100%+16px)] top-1/2 -translate-y-1/2 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 transition-all duration-300 flex flex-col gap-3 min-w-[240px] z-50 ${
            showConfirm 
              ? 'opacity-100 translate-x-0 scale-100 visible' 
              : 'opacity-0 -translate-x-4 scale-95 invisible'
          }`}
        >
          {/* Arrow pointing directly to the sidebar component button layout trigger */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-900 rotate-45 border-l border-b border-slate-800 translate-x-1.5"></div>

          <p className="text-xs font-black text-slate-300 uppercase tracking-wider px-1">
            Do you want to login?
          </p>

          {/* Action Grid Layout containing Yes and No targets */}
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

        {/* LOGOUT BUTTON ANCHOR */}
        <button 
          onClick={() => setShowConfirm(true)}
          onMouseEnter={() => setShowConfirm(true)}
          className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-200 transition-all font-bold text-sm border border-transparent group ${
            showConfirm 
              ? 'bg-red-600/20 text-red-400 border-red-500/30' 
              : 'hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
          }`}
        >
          <LogOut size={20} className={`transition-transform duration-300 ${showConfirm ? '-translate-x-1 scale-110 text-red-400' : 'group-hover:-translate-x-1'}`} />
          Sign Out
        </button>
      </div>
      
      <div className="mt-6 px-4 flex items-center gap-2 text-teal-50/20">
        <ShieldCheck size={12} />
        <span className="text-[9px] font-bold tracking-tighter uppercase">Secure Portal v2.0</span>
      </div>
    </aside>
  );
};

export default Sidebar;