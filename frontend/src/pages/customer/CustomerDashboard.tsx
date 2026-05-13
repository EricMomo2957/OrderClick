import { useState, useEffect } from 'react';
import axios from 'axios';
import CustomerSidenav from './CustomerSidenav';
import { CUSTOMER_MENU } from './constants'; 
// 1. Import the new component
import CustomerAnnouncement from './CustomerAnnouncement';

const CustomerDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState('shop');

  // Retrieve current user safely from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  /**
   * DYNAMIC COMPONENT RESOLUTION
   */
  const menuConfig = CUSTOMER_MENU.find(item => item.id === activeTab);
  const ActiveComponent = menuConfig?.component || CUSTOMER_MENU[0].component;
  const activeLabel = menuConfig?.label || 'Marketplace';

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-['Inter']">
      {/* SIDENAV */}
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
              OrderClick Customer Dashboard v2
            </p>
          </div>

          {/* USER PROFILE CHIP */}
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-[#003d3d] font-bold text-xs">
               {currentUser?.fullname?.charAt(0) || 'U'}
             </div>
             <span className="text-sm font-bold text-slate-600">
               Welcome, {currentUser?.fullname || 'User'}! 👋
             </span>
          </div>
        </header>

        {/* ANNOUNCEMENT AREA - Now using your new standalone component */}
        <div className="mb-8">
            <CustomerAnnouncement />
        </div>

        {/* DYNAMIC CONTENT AREA */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ActiveComponent user={currentUser} onLogout={onLogout} />
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;