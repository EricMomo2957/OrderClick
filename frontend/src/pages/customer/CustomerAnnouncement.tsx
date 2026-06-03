// frontend/src/pages/customer/CustomerAnnouncement.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, Bell, Clock, Trash2, Download, X } from 'lucide-react';

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
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    const API_URL = 'http://localhost:5000/api/announcements';
    const BASE_URL = 'http://localhost:5000'; // For images

    // Check client role matrix safely on construct to hide/show admin management layers
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const payload = JSON.parse(window.atob(base64));
                setIsAdmin(payload.role === 'admin');
            } catch (e) {
                console.error("Error decoding token context:", e);
            }
        }
    }, []);

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

    const deleteAnnouncement = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation(); // 🚀 Prevent opening the modal when clicking delete!
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        
        const token = localStorage.getItem('token'); 
        try {
            await axios.delete(`${API_URL}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Closures optimization: clean up active modal view trace if the target is wiped out
            if (selectedAnnouncement?.id === id) {
                setSelectedAnnouncement(null);
            }
            fetchAnnouncements(); 
        } catch (err) {
            alert("Failed to delete: Admin permissions required.");
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    // Lock background scrolling if modal context is displayed
    useEffect(() => {
        if (selectedAnnouncement) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedAnnouncement]);

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-slate-400 animate-pulse p-8 font-mono text-xs font-black uppercase tracking-widest">
                <Clock size={16} className="animate-spin text-[#003d3d]" /> <span>Syncing broadcasts...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto font-['Inter'] animate-in fade-in duration-500 p-4 sm:p-6">
            
            {/* 1. Hero Card (Latest) */}
            {latestAnnouncement && (
                <div 
                    onClick={() => setSelectedAnnouncement(latestAnnouncement)}
                    className="relative overflow-hidden bg-gradient-to-br from-[#003d3d] to-[#002424] text-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-white/5 cursor-pointer group transition-all duration-300 hover:shadow-xl hover:border-white/10"
                >
                    <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center">
                        
                        {latestAnnouncement.image_url && (
                            <div 
                                onClick={(e) => e.stopPropagation()} // Stop modal triggers if user hits download wrapper components
                                className="w-full lg:w-2/5 bg-black/10 backdrop-blur-sm p-4 rounded-3xl border border-white/10 flex flex-col justify-between cursor-default"
                            >
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

                        <div className="flex-1 w-full text-left">
                            <span className="bg-emerald-400 text-[#003d3d] text-[10px] font-black font-mono px-2.5 py-1 rounded-md uppercase mb-4 inline-block tracking-wider">
                                Latest Broadcast
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black mb-3 tracking-tight leading-tight uppercase font-mono group-hover:text-emerald-300 transition-colors">
                                {latestAnnouncement.title}
                            </h2>
                            <p className="text-emerald-100/80 leading-relaxed mb-6 text-sm font-medium line-clamp-4">
                                {latestAnnouncement.message}
                            </p>
                            <div className="flex items-center justify-between gap-2 text-[10px] font-black font-mono text-emerald-300/60 uppercase tracking-widest pt-4 border-t border-white/10">
                                <div className="flex items-center gap-2">
                                    <Clock size={12} />
                                    Published {new Date(latestAnnouncement.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </div>
                                <span className="text-emerald-400 font-bold group-hover:translate-x-1 transition-transform">Read full post →</span>
                            </div>
                        </div>
                    </div>
                    <Megaphone className="absolute -right-6 -bottom-6 w-36 h-36 text-white/5 -rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
                </div>
            )}

            {/* 2. Notice Board List */}
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-800 flex items-center gap-2 mb-8 text-xl font-mono uppercase tracking-tight">
                    <Bell className="text-[#003d3d]" size={24} /> Notice Board Directory
                </h3>

                {allAnnouncements.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 font-mono text-xs uppercase tracking-wider">
                        No active announcements cataloged.
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {allAnnouncements.map((ann) => (
                            <div 
                                key={ann.id} 
                                onClick={() => setSelectedAnnouncement(ann)}
                                className="group p-6 rounded-[2rem] bg-slate-50/50 hover:bg-white hover:shadow-xl border border-transparent hover:border-slate-100 transition-all duration-300 cursor-pointer"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                                    <div className="flex flex-col md:flex-row gap-6 items-start w-full">
                                        
                                        {ann.image_url && (
                                            <div className="w-full md:w-48 h-36 bg-slate-100 border border-slate-200/60 rounded-2xl flex items-center justify-center p-2 overflow-hidden flex-shrink-0">
                                                <img 
                                                    src={`${BASE_URL}${ann.image_url}`} 
                                                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" 
                                                    alt="Notice Asset"
                                                />
                                            </div>
                                        )}
                                        
                                        <div className="flex-1 space-y-2 text-left">
                                            <h4 className="font-bold text-slate-800 text-lg uppercase tracking-wide group-hover:text-[#003d3d] transition-colors">
                                                {ann.title}
                                            </h4>
                                            <p className="text-slate-500 text-sm leading-relaxed font-medium line-clamp-2 sm:line-clamp-3">
                                                {ann.message}
                                            </p>
                                            <div className="pt-2">
                                                <span className="text-[10px] text-slate-400 font-black font-mono uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">
                                                    {new Date(ann.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ADMIN ACTIONS: Only show if authenticated payload user is admin */}
                                    {isAdmin && (
                                        <button 
                                            onClick={(e) => deleteAnnouncement(e, ann.id)}
                                            className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition-all self-end sm:self-start flex-shrink-0"
                                            title="Delete Announcement"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ==========================================
                🚨 INTERACTIVE MODAL COMPONENT WINDOW
               ========================================== */}
            {selectedAnnouncement && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200"
                    onClick={() => setSelectedAnnouncement(null)}
                >
                    <div 
                        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 text-left animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()} // Block closure triggers when body workspace is selected
                    >
                        {/* Header Container */}
                        <div className="flex items-start justify-between p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black font-mono text-[#003d3d] bg-[#003d3d]/10 px-2 py-0.5 rounded uppercase tracking-wider">
                                    Notice Details
                                </span>
                                <h3 className="text-xl sm:text-2xl font-black text-slate-800 font-mono uppercase tracking-tight leading-tight">
                                    {selectedAnnouncement.title}
                                </h3>
                            </div>
                            <button 
                                onClick={() => setSelectedAnnouncement(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Document Content */}
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                            {selectedAnnouncement.image_url && (
                                <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center gap-4">
                                    <div className="w-full max-h-96 flex items-center justify-center overflow-hidden rounded-xl bg-slate-900/5">
                                        <img 
                                            src={`${BASE_URL}${selectedAnnouncement.image_url}`} 
                                            alt={selectedAnnouncement.title}
                                            className="max-w-full max-h-96 object-contain"
                                        />
                                    </div>
                                    <a 
                                        href={`${BASE_URL}${selectedAnnouncement.image_url}`} 
                                        download 
                                        className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest font-black bg-[#003d3d] hover:bg-[#002424] text-white px-6 py-3 rounded-xl transition-all shadow-sm"
                                    >
                                        <Download size={14} /> Save Attached Asset
                                    </a>
                                </div>
                            )}

                            <div className="space-y-4">
                                <p className="text-slate-600 text-base leading-relaxed whitespace-pre-wrap font-medium">
                                    {selectedAnnouncement.message}
                                </p>
                            </div>
                        </div>

                        {/* Footer Segment */}
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-2 text-[10px] font-black font-mono text-slate-400 uppercase tracking-widest">
                                <Clock size={14} />
                                Published {new Date(selectedAnnouncement.created_at).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>

                            <div className="flex gap-2 w-full sm:w-auto">
                                {isAdmin && (
                                    <button 
                                        onClick={(e) => {
                                            deleteAnnouncement(e, selectedAnnouncement.id);
                                        }}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold font-mono uppercase text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all border border-red-100 w-full sm:w-auto"
                                    >
                                        <Trash2 size={14} /> Remove Post
                                    </button>
                                )}
                                <button 
                                    onClick={() => setSelectedAnnouncement(null)}
                                    className="px-6 py-2.5 text-xs font-bold font-mono uppercase bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-all w-full sm:w-auto text-center"
                                >
                                    Close Window
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default CustomerAnnouncement;