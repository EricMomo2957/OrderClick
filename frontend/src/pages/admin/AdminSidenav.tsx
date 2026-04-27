import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Users, 
  Settings, 
  LogOut 
} from 'lucide-react';

// Define the interface for props to ensure type safety
interface AdminSidenavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const AdminSidenav = ({ activeTab, setActiveTab, onLogout }: AdminSidenavProps) => {
  
  // Centralized navigation properties
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Inventory', icon: Package },
    { id: 'receipts', label: 'Orders & Receipts', icon: Receipt },
    { id: 'customers', label: 'User Directory', icon: Users },
    { id: 'settings', label: 'Portal Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#003d3d] text-white fixed h-full flex flex-col p-6 shadow-2xl z-20">
      {/* Branding Section */}
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-teal-900/20">
          <span className="text-[#003d3d] font-black text-xl italic">O</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight">
          Order<span className="opacity-70">Click</span>
        </h1>
      </div>

      {/* Navigation Focus Area */}
      <nav className="flex-1 space-y-2">
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

      {/* Logout Footer */}
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