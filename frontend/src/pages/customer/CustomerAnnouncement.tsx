import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, Bell, Clock, Info, Trash2, Download } from 'lucide-react';

interface Announcement {
    id: number;
    title: string;
    message: string;
    image_url: string | null; // Added image_url to interface
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

    // --- DELETE FUNCTION ---
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
            <div className="flex items-center gap-2 text-slate-400 animate-pulse p-4">
                <Clock size={18} /> <span>Syncing broadcasts...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 1. Hero Card (Latest) */}
            {latestAnnouncement && (
                <div className="relative overflow-hidden bg-gradient-to-br from-[#004a80] to-[#00355c] text-white p-8 rounded-[2rem] shadow-lg border border-white/10">
                    <div className="relative z-10 flex flex-col md:flex-row gap-6">
                        
                        {/* Display Image in Hero if exists */}
                        {latestAnnouncement.image_url && (
                            <div className="w-full md:w-1/3">
                                <img 
                                    src={`${BASE_URL}${latestAnnouncement.image_url}`} 
                                    alt="Announcement" 
                                    className="w-full h-48 object-cover rounded-2xl shadow-2xl border border-white/20"
                                />
                                <a 
                                    href={`${BASE_URL}${latestAnnouncement.image_url}`} 
                                    download 
                                    className="mt-3 flex items-center justify-center gap-2 text-[10px] bg-white/10 hover:bg-white/20 py-2 rounded-lg transition-colors"
                                >
                                    <Download size={12} /> Download Image
                                </a>
                            </div>
                        )}

                        <div className="flex-1">
                            <span className="bg-yellow-400 text-[#004a80] text-[10px] font-black px-2 py-1 rounded-md uppercase mb-3 inline-block">
                                New Update
                            </span>
                            <h2 className="text-3xl font-black mb-3">{latestAnnouncement.title}</h2>
                            <p className="text-blue-100 leading-relaxed mb-6 text-lg">
                                {latestAnnouncement.message}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] font-medium text-blue-200/60 uppercase tracking-widest">
                                <Clock size={12} />
                                Published {new Date(latestAnnouncement.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                    <Megaphone className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 -rotate-12" />
                </div>
            )}

            {/* 2. Notice Board List */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-800 flex items-center gap-2 mb-6 text-xl">
                    <Bell className="text-[#004a80]" size={24} /> Notice Board
                </h3>

                <div className="grid gap-4">
                    {allAnnouncements.map((ann) => (
                        <div key={ann.id} className="group p-5 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-blue-50 transition-all">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    {/* Thumbnail for list items */}
                                    {ann.image_url && (
                                        <img 
                                            src={`${BASE_URL}${ann.image_url}`} 
                                            className="w-16 h-16 rounded-xl object-cover" 
                                            alt="thumb"
                                        />
                                    )}
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-lg">{ann.title}</h4>
                                        <p className="text-slate-500 text-sm mb-2">{ann.message}</p>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                            {new Date(ann.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* ADMIN ACTIONS: Delete Button */}
                                <button 
                                    onClick={() => deleteAnnouncement(ann.id)}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                    title="Delete Announcement"
                                >
                                    <Trash2 size={20} />
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