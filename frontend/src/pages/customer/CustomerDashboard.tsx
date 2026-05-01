import { useState } from 'react';
import CustomerSidenav from './CustomerSidenav';
import { CUSTOMER_MENU } from './constants'; // Data is now imported from the clean constants file

const CustomerDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState('shop');

  // Retrieve current user safely from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  /**
   * DYNAMIC COMPONENT RESOLUTION
   * We find the configuration object in CUSTOMER_MENU that matches the activeTab ID.
   * This allows the dashboard to scale automatically when you add new items to constants.ts.
   */
  const menuConfig = CUSTOMER_MENU.find(item => item.id === activeTab);
  
  // Fallback to the first menu item (usually 'shop') if for some reason activeTab isn't found
  const ActiveComponent = menuConfig?.component || CUSTOMER_MENU[0].component;

  /**
   * TAB LABEL RESOLUTION
   * Sets the header title based on the selected tab label (e.g., "Marketplace", "Shopping Cart")
   */
  const activeLabel = menuConfig?.label || 'Marketplace';

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-['Inter']">
      {/* SIDENAV: Pass state and setter to control navigation */}
      <CustomerSidenav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
      />
      
      <main className="ml-64 flex-1 p-10">
        {/* SHARED HEADER: Shared across all customer pages */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
               {activeLabel} <span className="text-[#003d3d]">Portal</span>
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              OrderClick Customer Dashboard v2
            </p>
          </div>

          {/* USER PROFILE CHIP */}
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
                We pass currentUser and onLogout as props. 
                Any component rendered here (Shop, Cart, Orders) has access 
                to user data and the ability to trigger a logout.
            */}
            <ActiveComponent user={currentUser} onLogout={onLogout} />
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;