import { 
  ShoppingBag, 
  Receipt, 
  User, 
  LogOut, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface CustomerSidenavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const CustomerSidenav = ({ activeTab, setActiveTab, onLogout }: CustomerSidenavProps) => {
  
  const menuItems = [
    { id: 'shop', label: 'Marketplace', icon: ShoppingBag },
    { id: 'receipts', label: 'My Orders', icon: Receipt },
    { id: 'settings', label: 'Account Profile', icon: User }, // Match 'settings' ID in Dashboard
  ];

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
        
        {menuItems.map((item) => {
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

      {/* Feature Badge/Card (The "More Core" addition) */}
      <div className="mb-6 p-4 bg-white/5 rounded-[1.5rem] border border-white/10">
        <div className="flex items-center gap-2 mb-2 text-teal-300">
          <Sparkles size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Premium Member</span>
        </div>
        <p className="text-[11px] text-teal-50/60 leading-relaxed">
          Enjoy exclusive discounts and faster delivery on every order.
        </p>
      </div>

      {/* Logout Footer */}
      <button 
        onClick={onLogout}
        className="flex items-center gap-4 px-4 py-4 rounded-2xl text-red-200 hover:bg-red-500/10 hover:text-red-400 transition-all font-bold text-sm border border-transparent hover:border-red-500/20 group"
      >
        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
        Sign Out
      </button>
      
      <div className="mt-6 px-4 flex items-center gap-2 text-teal-50/20">
        <ShieldCheck size={12} />
        <span className="text-[9px] font-bold tracking-tighter uppercase">Secure Portal v2.0</span>
      </div>
    </aside>
  );
};

export default CustomerSidenav;