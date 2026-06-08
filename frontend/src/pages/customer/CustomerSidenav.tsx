// frontend/src/pages/customer/CustomerSidenav.tsx
import React, { useEffect, useState } from 'react';
import { LogOut, Sparkles, ShieldCheck, Check, X, Bell, ShoppingBag } from 'lucide-react';
import { CUSTOMER_MENU } from './constants'; // Import the menu data from your constants file

// Interface to include essential props
interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

interface SystemNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  created_at: string;
}

const CustomerSidenav = ({ activeTab, setActiveTab, onLogout }: SidebarProps) => {
  // State tracking when the verification modal overlay layout is visible
  const [showConfirm, setShowConfirm] = useState(false);
  
  // State management tracking real-time streams
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // 1. Fetch historical record entries from the database first
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/notifications/history', {
          credentials: 'include'
        });
        if (response.ok) {
          const historyData = await response.json();
          // Ensure historyData is an array before setting state
          if (Array.isArray(historyData)) {
            setNotifications(historyData);
          }
        }
      } catch (err) {
        console.error("Could not load historical alerts context:", err);
      }
    };

    fetchHistory();

    // 2. Open the real-time pipeline for subsequent incoming updates
    const eventSource = new EventSource('http://localhost:5000/api/notifications/stream', {
      withCredentials: true
    });

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        if (parsedData.status === 'connected') return;

        // Formats data payload fields to safely adhere to the SystemNotification interface structures
        const normalizedNotification: SystemNotification = {
          id: parsedData.id || Date.now(),
          title: parsedData.title || 'System Notification',
          message: parsedData.message || '',
          type: parsedData.type || 'info',
          created_at: parsedData.created_at || new Date().toISOString()
        };

        setNotifications((prev) => [normalizedNotification, ...prev]);
        setUnreadCount((count) => count + 1);
      } catch (err) {
        console.error("Failed parsing live notification payload frame:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Connection dropped. Reconnecting...", err);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleToggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      setUnreadCount(0); // Clear badge counter on read approach
    }
  };

  return (
    <>
      <aside className="w-64 bg-[#003d3d] text-white fixed h-full flex flex-col p-6 shadow-2xl z-20 select-none font-['Inter']">
        {/* Brand Section */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-teal-900/20">
            <span className="text-[#003d3d] font-black text-xl italic">O</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Order<span className="opacity-70">Click</span>
          </h1>
        </div>

        {/* --- LIVE NOTIFICATION INTERACTION SYSTEM CONTROLS --- */}
        <div className="relative mb-6 px-1">
          <button 
            onClick={handleToggleDropdown}
            className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 rounded-2xl transition-all text-slate-200 cursor-pointer focus:outline-none"
          >
            <div className="flex items-center gap-2.5 text-xs font-bold">
              <Bell size={16} className={unreadCount > 0 ? "text-emerald-400 animate-bounce" : "text-teal-300/70"} />
              <span>Live Alerts</span>
            </div>
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white font-mono text-[10px] font-black h-5 px-1.5 rounded-full flex items-center justify-center min-w-5 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* NOTIFICATION LAYER OVERLAY FLOATING BOX */}
          {showDropdown && (
            <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-700 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Updates</span>
                <button onClick={() => setShowDropdown(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={14} />
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-5 text-center text-xs text-slate-400 italic">
                    No notifications yet. New catalog updates or alerts will appear here.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div key={item.id} className="p-3.5 hover:bg-slate-50/70 transition-colors">
                      <div className="flex gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <ShoppingBag size={12} />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 leading-tight truncate">{item.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed break-words">{item.message}</p>
                          <span className="text-[9px] text-slate-400 font-semibold mt-1">
                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Primary Navigation Container */}
        <nav 
          className="flex-1 space-y-2 overflow-y-auto pr-1"
          style={{
            scrollbarWidth: 'none',          /* Firefox */
            msOverflowStyle: 'none',         /* IE and Edge */
          }}
        >
          {/* Style injection hook snippet targeting WebKit layout contexts */}
          <style>{`
            nav::-webkit-scrollbar {
              display: none !important;      /* Chrome, Safari, and Opera */
            }
          `}</style>

          <p className="text-[10px] font-black text-teal-400/50 uppercase tracking-[0.2em] px-4 mb-4">
            Main Menu
          </p>
          
          {/* Mapping through the imported CUSTOMER_MENU */}
          {CUSTOMER_MENU.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm cursor-pointer ${
                  isActive 
                    ? 'bg-white text-[#003d3d] shadow-xl translate-x-2 font-black' 
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

        {/* Feature Badge/Card */}
        <div className="mb-6 p-4 bg-white/5 rounded-[1.5rem] border border-white/10 mt-4">
          <div className="flex items-center gap-2 mb-2 text-teal-300">
            <Sparkles size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Premium Member</span>
          </div>
          <p className="text-[11px] text-teal-50/60 leading-relaxed">
            Enjoy exclusive discounts and faster delivery on every order.
          </p>
        </div>

        {/* Logout Footer Anchor Block */}
        <div className="pt-2 border-t border-white/10">
          <button 
            onClick={() => setShowConfirm(true)}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-200 transition-all font-bold text-sm border border-transparent group hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 cursor-pointer"
          >
            <LogOut size={20} className="transition-transform duration-300 group-hover:-translate-x-1" />
            Sign Out
          </button>
        </div>
        
        <div className="mt-4 px-4 flex items-center gap-2 text-teal-50/20">
          <ShieldCheck size={12} />
          <span className="text-[9px] font-bold tracking-tighter uppercase">Secure Portal v2.0</span>
        </div>
      </aside>

      {/* 💡 OVERLAY VERIFICATION MODAL */}
      <div 
        className={`fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300 ${
          showConfirm ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div 
          className={`bg-[#0d1527] border border-slate-800 text-white w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center transition-all duration-300 transform ${
            showConfirm ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
        >
          {/* Central Branded Graphic Circle */}
          <div className="h-16 w-16 bg-[#16223f] rounded-2xl border border-slate-700/50 flex items-center justify-center shadow-inner mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
              <LogOut size={20} className="text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Heading Text Elements */}
          <h2 className="text-2xl font-black tracking-tight mb-2 italic">
            End Session?
          </h2>
          <p className="text-sm text-slate-400 max-w-[260px] leading-relaxed mb-8">
            Are you sure you want to log out of the{' '}
            <span className="text-teal-400 font-bold">OrderClick Portal</span>?
          </p>

          {/* Action Layout Buttons Container */}
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] text-sm uppercase tracking-wider cursor-pointer"
            >
              <Check size={16} strokeWidth={3} />
              Yes, Logout
            </button>
            
            <button
              onClick={() => setShowConfirm(false)}
              className="w-full flex items-center justify-center gap-2 bg-[#1b2641] hover:bg-[#243257] text-slate-300 font-bold py-4 px-6 rounded-2xl transition-all border border-slate-700/50 active:scale-[0.98] text-sm uppercase tracking-wider cursor-pointer"
            >
              <X size={16} strokeWidth={2.5} />
              Stay Logged In
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerSidenav;