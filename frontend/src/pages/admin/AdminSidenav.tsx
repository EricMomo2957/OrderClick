import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Users, 
  Settings, 
  LogOut, 
  Calendar 
} from 'lucide-react';

// Import your feature modules
import AdminOverview from './AdminOverview';
import ManageProduct from './ManageProduct';
import ManageReceipt from './ManageReceipt';
import ManageUser from './ManageUser';
import AdminEvent from './AdminEvent';

interface AdminSidenavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

/**
 * SOURCE OF TRUTH
 * Central configuration for the Admin Portal.
 * Adding an object here automatically updates the Sidenav UI 
 * and the Dashboard's rendering logic.
 */
export const ADMIN_MENU = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, component: AdminOverview },
  { id: 'products', label: 'Inventory', icon: Package, component: ManageProduct },
  { id: 'receipts', label: 'Orders & Receipts', icon: Receipt, component: ManageReceipt },
  { id: 'events', label: 'Event Manager', icon: Calendar, component: AdminEvent },
  { id: 'customers', label: 'User Directory', icon: Users, component: ManageUser },
  // { id: 'settings', label: 'Portal Settings', icon: Settings, component: AdminSettings },
];

const AdminSidenav = ({ activeTab, setActiveTab, onLogout }: AdminSidenavProps) => {
  return (
    <aside className="w-64 bg-[#004a80] text-white fixed h-full flex flex-col p-6 shadow-2xl z-20">
      {/* Branding Section */}
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-blue-900/20">
          <span className="text-[#004a80] font-black text-xl italic">O</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight">
          Order<span className="opacity-70">Click</span>
        </h1>
      </div>

      {/* Navigation Focus Area */}
      <nav className="flex-1 space-y-2">
        <p className="text-[10px] font-black text-blue-200/40 uppercase tracking-[0.2em] px-4 mb-4">
          Admin Console
        </p>
        
        {ADMIN_MENU.map((item) => {
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