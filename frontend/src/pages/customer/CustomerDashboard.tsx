import { useState } from 'react';
import CustomerSidenav, { CUSTOMER_MENU } from './CustomerSidenav';

const CustomerDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState('shop');

  // Retrieve current user safely
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  /**
   * DYNAMIC COMPONENT RESOLUTION
   * We find the component mapped in CUSTOMER_MENU (from CustomerSidenav.tsx).
   * This removes the need for a 'switch' statement here.
   */
  const menuConfig = CUSTOMER_MENU.find(item => item.id === activeTab);
  const ActiveComponent = menuConfig?.component || CUSTOMER_MENU[0].component;

  /**
   * TAB LABEL RESOLUTION
   * Dynamically sets the header title based on the selected tab label
   */
  const activeLabel = menuConfig?.label || 'Marketplace';

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-['Inter']">
      {/* SIDENAV: Controls the activeTab state */}
      <CustomerSidenav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
      />
      
      <main className="ml-64 flex-1 p-10">
        {/* SHARED HEADER */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
               {activeLabel} <span className="text-[#003d3d]">Portal</span>
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              Customer Dashboard v2
            </p>
          </div>

          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-[#003d3d] font-bold text-xs">
               {currentUser?.name?.charAt(0) || 'U'}
             </div>
             <span className="text-sm font-bold text-slate-600">
               Welcome, {currentUser?.name || 'User'}! 👋
             </span>
          </div>
        </header>

        {/* DYNAMIC CONTENT AREA */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 
               We pass user and onLogout as props to all sub-components.
               Sub-components like CustomerShop and CustomerOrders will handle 
               their own fetch logic and internal state.
            */}
            <ActiveComponent user={currentUser} onLogout={onLogout} />
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;