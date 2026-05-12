import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidenav, { ADMIN_MENU } from './AdminSidenav';

interface AdminDashboardProps {
    onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            onLogout();
            navigate('/login');
        }
    }, [onLogout, navigate]);

    const menuConfig = ADMIN_MENU.find(item => item.id === activeTab);
    const ActiveComponent = menuConfig?.component || ADMIN_MENU[0].component;

    return (
        <div className="min-h-screen bg-[#f1f5f9] flex font-['Inter']">
            <AdminSidenav 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                onLogout={onLogout} 
            />

            <main className="ml-64 flex-1 p-10 transition-all duration-300">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">
                            System / {menuConfig?.label || 'Overview'}
                        </h1>
                        <p className="text-2xl font-black text-slate-800">
                            {menuConfig?.label} Panel
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-black text-slate-600 uppercase">Administrator Secure</span>
                    </div>
                </header>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ActiveComponent setActiveTab={setActiveTab} />
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;