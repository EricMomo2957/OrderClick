import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import CustomerSidenav from './CustomerSidenav';
import { CUSTOMER_MENU } from './constants'; 

const socket = io('http://localhost:5000');

const CustomerDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState('shop');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Define the shape of the data we expect from the server
    interface AnnouncementData {
        title: string;
        message: string;
    }

    socket.on('new_announcement', (data: AnnouncementData) => {
      // Fix for the error in image_85d9b7.png: added types to 't'
      toast.custom((t: { visible: boolean; id: string }) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  📢 New Announcement
                </p>
                <p className="mt-1 text-sm font-bold text-[#003d3d]">
                  {data.title}
                </p>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                  {data.message}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => {
                setActiveTab('announcements'); 
                toast.dismiss(t.id);
              }}
              className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-xs font-black text-teal-600 hover:text-teal-500 focus:outline-none"
            >
              VIEW
            </button>
          </div>
        </div>
      ), { duration: 6000 });
    });

    return () => {
      socket.off('new_announcement');
    };
  }, []);

  const menuConfig = CUSTOMER_MENU.find(item => item.id === activeTab);
  const ActiveComponent = menuConfig?.component || CUSTOMER_MENU[0].component;
  const activeLabel = menuConfig?.label || 'Marketplace';

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-['Inter']">
      <Toaster position="top-right" />
      <CustomerSidenav activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />
      
      <main className="ml-64 flex-1 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
               {activeLabel} <span className="text-[#003d3d]">Portal</span>
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              OrderClick Customer Dashboard v2
            </p>
          </div>

          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-[#003d3d] font-bold text-xs">
               {currentUser?.fullname?.charAt(0) || 'U'}
             </div>
             <span className="text-sm font-bold text-slate-600">
               Welcome, {currentUser?.fullname || 'User'}! 👋
             </span>
          </div>
        </header>
        
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ActiveComponent user={currentUser} onLogout={onLogout} />
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;