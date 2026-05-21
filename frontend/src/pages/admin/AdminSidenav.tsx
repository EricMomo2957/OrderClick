// frontend/src/pages/admin/AdminSidenav.tsx
import { useState } from 'react';
import { LogOut } from 'lucide-react';

interface AdminSidenavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  menuItems: any[]; // Accepts the prop array dynamically from AdminDashboard to ensure perfect HMR stability
}

const AdminSidenav = ({ activeTab, setActiveTab, onLogout, menuItems }: AdminSidenavProps) => {
  // State tracking when the user is hovering over the sign-out trigger
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <aside className="w-64 bg-[#004a80] text-white fixed h-full flex flex-col p-6 shadow-2xl z-20">
      
      {/* BRAND BRAND LOGO WRAPPER */}
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
        
        {/* 💡 HOVER TOOLTIP ELEMENT TRIGGER */}
        <div 
          className={`absolute left-1/2 -translate-x-1/2 -top-8 bg-red-600 text-white text-xs font-black px-4 py-2 rounded-xl shadow-lg border border-red-500 whitespace-nowrap transition-all duration-300 pointer-events-none flex items-center gap-1.5 ${
            showTooltip 
              ? 'opacity-100 -translate-y-2 scale-100 visible' 
              : 'opacity-0 translate-y-0 scale-95 invisible'
          }`}
        >
          Do you want to logout?
          {/* Small Tooltip Pointer Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-red-600 rotate-45 border-r border-b border-red-500"></div>
        </div>

        {/* LOGOUT INTERACTIVE ACTION ELEMENT */}
        <button 
          onClick={onLogout}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-200 hover:bg-red-500/10 hover:text-red-400 transition-all font-bold text-sm border border-transparent hover:border-red-500/20 group"
        >
          <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
          Sign Out
        </button>

      </div>
    </aside>
  );
};

export default AdminSidenav;