import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, Bell, Clock, Info } from 'lucide-react';

interface Announcement {
    id: number;
    title: string;
    message: string;
    created_at: string;
}

const CustomerAnnouncement = () => {
    const [latestAnnouncement, setLatestAnnouncement] = useState<Announcement | null>(null);
    const [allAnnouncements, setAllAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    const API_URL = 'http://localhost:5000/api/announcements';

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            // Fetching both the single latest and the full list
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
            {/* 1. Highlighted Latest Announcement (Hero Card) */}
            {latestAnnouncement && (
                <div className="relative overflow-hidden bg-gradient-to-br from-[#004a80] to-[#00355c] text-white p-6 rounded-[2rem] shadow-lg border border-white/10">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-yellow-400 text-[#004a80] text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">
                                New Update
                            </span>
                        </div>
                        <h2 className="text-2xl font-black mb-2">{latestAnnouncement.title}</h2>
                        <p className="text-blue-100 leading-relaxed mb-4">
                            {latestAnnouncement.message}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-medium text-blue-200/60 uppercase tracking-widest">
                            <Clock size={12} />
                            Published {new Date(latestAnnouncement.created_at).toLocaleDateString()}
                        </div>
                    </div>
                    {/* Decorative Icon Background */}
                    <Megaphone className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 -rotate-12" />
                </div>
            )}

            {/* 2. Previous Announcements List */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-slate-800 flex items-center gap-2">
                        <Bell className="text-[#004a80]" size={20} /> Notice Board
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {allAnnouncements.length} Messages
                    </span>
                </div>

                <div className="space-y-4">
                    {allAnnouncements.length === 0 ? (
                        <div className="text-center py-12">
                            <Info className="mx-auto text-slate-200 mb-2" size={32} />
                            <p className="text-slate-400 italic text-sm">No recent notices from the admin.</p>
                        </div>
                    ) : (
                        allAnnouncements.map((ann) => (
                            <div 
                                key={ann.id} 
                                className="group p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-blue-100 hover:bg-white transition-all duration-300"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-slate-700 group-hover:text-[#004a80]">
                                        {ann.title}
                                    </h4>
                                    <span className="text-[9px] font-bold text-slate-400">
                                        {new Date(ann.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                                    {ann.message}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerAnnouncement;