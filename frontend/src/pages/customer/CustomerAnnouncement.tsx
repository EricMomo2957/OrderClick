import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, Bell, Clock, Info, Trash2, Download, Edit3, X, Save } from 'lucide-react';

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
    
    // --- EDIT STATE ---
    const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editMessage, setEditMessage] = useState('');

    const API_URL = 'http://localhost:5000/api/announcements';
    const BASE_URL = 'http://localhost:5000';

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
            fetchAnnouncements();
        } catch (err) {
            alert("Delete failed: Admin permissions required.");
        }
    };

    // --- EDIT HANDLERS ---
    const startEdit = (ann: Announcement) => {
        setEditingAnn(ann);
        setEditTitle(ann.title);
        setEditMessage(ann.message);
    };

    const handleUpdate = async () => {
        if (!editingAnn) return;
        const token = localStorage.getItem('token');
        try {
            await axios.put(`${API_URL}/${editingAnn.id}`, 
                { title: editTitle, message: editMessage },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            setEditingAnn(null);
            fetchAnnouncements();
        } catch (err) {
            alert("Update failed.");
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    if (loading) return <div className="p-4 text-slate-400 animate-pulse">Syncing...</div>;

    return (
        <div className="space-y-6">
            {/* 1. EDIT MODAL (Conditional) */}
            {editingAnn && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-black text-slate-800">Edit Announcement</h3>
                            <button onClick={() => setEditingAnn(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        <input 
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 mb-3 font-bold"
                            placeholder="Title"
                        />
                        <textarea 
                            value={editMessage}
                            onChange={(e) => setEditMessage(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 mb-4 min-h-[120px]"
                            placeholder="Message"
                        />
                        <button 
                            onClick={handleUpdate}
                            className="w-full bg-[#004a80] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#00355c] transition-colors"
                        >
                            <Save size={18} /> Save Changes
                        </button>
                    </div>
                </div>
            )}

            {/* 2. Hero Card (Latest) */}
            {latestAnnouncement && (
                <div className="relative overflow-hidden bg-gradient-to-br from-[#004a80] to-[#00355c] text-white p-8 rounded-[2rem] shadow-lg">
                    <div className="relative z-10 flex flex-col md:flex-row gap-6">
                        {latestAnnouncement.image_url && (
                            <div className="w-full md:w-1/3 group relative">
                                <img 
                                    src={`${BASE_URL}${latestAnnouncement.image_url}`} 
                                    alt="Announcement" 
                                    className="w-full h-48 object-cover rounded-2xl shadow-2xl border border-white/20"
                                />
                                <a 
                                    href={`${BASE_URL}${latestAnnouncement.image_url}`} 
                                    download 
                                    className="mt-3 flex items-center justify-center gap-2 text-[10px] bg-white/10 hover:bg-white/20 py-2 rounded-lg transition-colors border border-white/10"
                                >
                                    <Download size={12} /> Download Image
                                </a>
                            </div>
                        )}
                        <div className="flex-1">
                            <h2 className="text-3xl font-black mb-3">{latestAnnouncement.title}</h2>
                            <p className="text-blue-100 leading-relaxed mb-6">{latestAnnouncement.message}</p>
                            <div className="flex gap-2">
                                <button onClick={() => startEdit(latestAnnouncement)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                                    <Edit3 size={16} />
                                </button>
                                <button onClick={() => deleteAnnouncement(latestAnnouncement.id)} className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/40 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Notice Board List */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-800 flex items-center gap-2 mb-6 text-xl">
                    <Bell className="text-[#004a80]" size={24} /> Notice Board
                </h3>

                <div className="grid gap-4">
                    {allAnnouncements.map((ann) => (
                        <div key={ann.id} className="group p-5 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-blue-50 transition-all flex justify-between items-center">
                            <div className="flex gap-4 items-center">
                                {ann.image_url && (
                                    <img src={`${BASE_URL}${ann.image_url}`} className="w-16 h-16 rounded-xl object-cover" alt="thumb" />
                                )}
                                <div>
                                    <h4 className="font-bold text-slate-800">{ann.title}</h4>
                                    <p className="text-slate-500 text-sm line-clamp-1">{ann.message}</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEdit(ann)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                    <Edit3 size={18} />
                                </button>
                                <button onClick={() => deleteAnnouncement(ann.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
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