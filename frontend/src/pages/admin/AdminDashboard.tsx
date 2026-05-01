import { useState } from 'react';
import AdminSidenav, { ADMIN_MENU } from './AdminSidenav';

/**
 * AdminDashboard Shell
 * 
 * This is the layout wrapper for the entire Admin portal. 
 * It handles the 'activeTab' state and dynamically renders the 
 * component defined in AdminSidenav's ADMIN_MENU.
 */
const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  // 'dashboard' matches the ID in ADMIN_MENU for AdminOverview
  const [activeTab, setActiveTab] = useState('dashboard');

  /**
   * DYNAMIC COMPONENT RESOLUTION
   * We look up the active tab in our Source of Truth (ADMIN_MENU).
   * If not found, we default to the first menu item (Overview).
   */
  const menuConfig = ADMIN_MENU.find(item => item.id === activeTab);
  const ActiveComponent = menuConfig?.component || ADMIN_MENU[0].component;

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-['Inter']">
      {/* 
          Fixed Sidebar 
          Passes state down to control navigation 
      */}
      <AdminSidenav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
      />

      {/* 
          Main Content Area 
          The margin-left (ml-64) accounts for the fixed sidebar width.
      */}
      <main className="ml-64 flex-1 p-10">
        <ActiveComponent setActiveTab={setActiveTab} />
      </main>
    </div>
  );
};

export default AdminDashboard;