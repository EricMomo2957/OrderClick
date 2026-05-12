import { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone } from 'lucide-react';
import CustomerSidenav from './CustomerSidenav';
import { CUSTOMER_MENU } from './constants'; 

/**
 * ANNOUNCEMENT BANNER COMPONENT
 * Fetches the latest active broadcast from the backend.
 */
const AnnouncementBanner = () => {
    const [latest, setLatest] = useState<any>(null);

    useEffect(() => {
        axios.get('http://localhost:5000/api/announcements/latest')
            .then(res => setLatest(res.data))
            .catch(err => console.error("Could not fetch announcements:", err));
    }, []);

    if (!latest) return null;

    return (
        <div className="mb-8 p-6 bg-gradient-to-r from-[#003d3d] to-[#005a5a] rounded-[2rem] text-white shadow-xl relative overflow-hidden animate-in fade-in zoom-in duration-700">
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-teal-400 text-[#003d3d] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        Broadcast
                    </span>
                    <h4 className="font-black text-lg">{latest.title}</h4>
                </div>
                <p className="text-teal-50/80 text-sm leading-relaxed max-w-2xl">{latest.message}</p>
            </div>
            {/* Decorative Icon */}
            <Megaphone className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32 rotate-12" />
        </div>
    );
};

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
               {currentUser?.name?.charAt(0) || 'U'}
             </div>
             <span className="text-sm font-bold text-slate-600">
               Welcome, {currentUser?.name || 'User'}! 👋
             </span>
          </div>
        </header>

        {/* ANNOUNCEMENT AREA */}
        <AnnouncementBanner />

        {/* DYNAMIC CONTENT AREA */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ActiveComponent user={currentUser} onLogout={onLogout} />
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;