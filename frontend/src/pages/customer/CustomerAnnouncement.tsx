// frontend/src/pages/customer/CustomerAnnouncement.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, Bell, Clock, Trash2, Download } from 'lucide-react';

interface Announcement {
    id: number;
    title: string;
    message: string;
    image_url: string | null;
    created_at: string;
}

const CustomerAnnouncement = () => {
    const [latestAnnouncement, setLatestAnnouncement] = useState<Announcement | null>(null);
    const [allAnnouncements, setAllAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    const API_URL = 'http://localhost:5000/api/announcements';
    const BASE_URL = 'http://localhost:5000'; // For images

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const [latestRes, listRes] = await Promise.all([
                axios.get(`${API_URL}/latest`),
                axios.get(API_URL)
            ]);
            setLatestAnnouncement(latestRes.data);
            setAllAnnouncements(listRes.data);
        } catch (err) {
            console.error("Failed to load announcements:", err);
        } finally {
            setLoading(false);
        }
    };

    const deleteAnnouncement = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        
        const token = localStorage.getItem('token'); 
        try {
            await axios.delete(`${API_URL}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAnnouncements(); // Refresh the list
        } catch (err) {
            alert("Failed to delete: Admin permissions required.");
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-slate-400 animate-pulse p-8 font-mono text-xs font-black uppercase tracking-widest">
                <Clock size={16} className="animate-spin text-[#003d3d]" /> <span>Syncing broadcasts...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto font-['Inter'] animate-in fade-in duration-500">
            {/* 1. Hero Card (Latest) */}
            {latestAnnouncement && (
                <div className="relative overflow-hidden bg-gradient-to-br from-[#003d3d] to-[#002424] text-white p-8 rounded-[2.5rem] shadow-sm border border-white/5">
                    <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center">
                        
                        {/* Display Entire Image in Hero Container */}
                        {latestAnnouncement.image_url && (
                            <div className="w-full lg:w-2/5 bg-black/10 backdrop-blur-sm p-4 rounded-3xl border border-white/10 flex flex-col justify-between">
                                <div className="w-full h-64 flex items-center justify-center overflow-hidden rounded-2xl bg-slate-900/40">
                                    <img 
                                        src={`${BASE_URL}${latestAnnouncement.image_url}`} 
                                        alt="Latest Announcement Asset" 
                                        className="max-w-full max-h-full object-contain transform hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <a 
                                    href={`${BASE_URL}${latestAnnouncement.image_url}`} 
                                    download 
                                    className="mt-4 flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-widest font-black bg-white/10 hover:bg-white/20 py-3 rounded-xl transition-all"
                                >
                                    <Download size={14} /> Download Full Image
                                </a>
                            </div>
                        )}

                        <div className="flex-1 w-full">
                            <span className="bg-emerald-400 text-[#003d3d] text-[10px] font-black font-mono px-2.5 py-1 rounded-md uppercase mb-4 inline-block tracking-wider">
                                Latest Broadcast
                            </span>
                            <h2 className="text-3xl font-black mb-3 tracking-tight leading-none uppercase font-mono">{latestAnnouncement.title}</h2>
                            <p className="text-emerald-100/80 leading-relaxed mb-6 text-sm font-medium">
                                {latestAnnouncement.message}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] font-black font-mono text-emerald-300/60 uppercase tracking-widest pt-4 border-t border-white/10">
                                <Clock size={12} />
                                Published {new Date(latestAnnouncement.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                        </div>
                    </div>
                    <Megaphone className="absolute -right-6 -bottom-6 w-36 h-36 text-white/5 -rotate-12 pointer-events-none" />
                </div>
            )}

            {/* 2. Notice Board List */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-800 flex items-center gap-2 mb-8 text-xl font-mono uppercase tracking-tight">
                    <Bell className="text-[#003d3d]" size={24} /> Notice Board Directory
                </h3>

                <div className="grid gap-6">
                    {allAnnouncements.map((ann) => (
                        <div key={ann.id} className="group p-6 rounded-[2rem] bg-slate-50/50 hover:bg-white hover:shadow-xl border border-transparent hover:border-slate-100 transition-all duration-300">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                                <div className="flex flex-col md:flex-row gap-6 items-start w-full">
                                    
                                    {/* Notice Board Image Container - Containing Aspect View */}
                                    {ann.image_url && (
                                        <div className="w-full md:w-48 h-36 bg-slate-100 border border-slate-200/60 rounded-2xl flex items-center justify-center p-2 overflow-hidden flex-shrink-0">
                                            <img 
                                                src={`${BASE_URL}${ann.image_url}`} 
                                                className="max-w-full max-h-full object-contain" 
                                                alt="Notice Asset"
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="flex-1 space-y-2">
                                        <h4 className="font-bold text-slate-800 text-lg uppercase tracking-wide">{ann.title}</h4>
                                        <p className="text-slate-500 text-sm leading-relaxed font-medium">{ann.message}</p>
                                        <div className="pt-2">
                                            <span className="text-[10px] text-slate-400 font-black font-mono uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">
                                                {new Date(ann.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* ADMIN ACTIONS: Delete Button */}
                                <button 
                                    onClick={() => deleteAnnouncement(ann.id)}
                                    className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition-all self-end sm:self-start flex-shrink-0"
                                    title="Delete Announcement"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CustomerAnnouncement;