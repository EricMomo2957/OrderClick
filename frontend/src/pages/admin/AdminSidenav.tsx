// frontend/src/pages/admin/AdminSidenav.tsx
import { LogOut } from 'lucide-react';
import { ADMIN_MENU } from './AdminMenuConfig';

interface AdminSidenavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const AdminSidenav = ({ activeTab, setActiveTab, onLogout }: AdminSidenavProps) => {
  return (
    <aside className="w-64 bg-[#004a80] text-white fixed h-full flex flex-col p-6 shadow-2xl z-20">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-blue-900/20">
          <span className="text-[#004a80] font-black text-xl italic">O</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight">
          Order<span className="opacity-70">Click</span>
        </h1>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <p className="text-[10px] font-black text-blue-200/40 uppercase tracking-[0.2em] px-4 mb-4">
          Admin Console
        </p>
        
        {/* 💡 FIXED: Explicitly typed item as 'any' to resolve compiler type error */}
        {ADMIN_MENU.map((item: any) => {
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

      <button 
        onClick={onLogout}
        className="mt-auto flex items-center gap-4 px-4 py-4 rounded-2xl text-red-200 hover:bg-red-500/10 hover:text-red-400 transition-all font-bold text-sm border border-transparent hover:border-red-500/20 group"
      >
        <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
        Sign Out
      </button>
    </aside>
  );
};

export default AdminSidenav;