import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, Trash2, Send, Loader2 } from 'lucide-react';

// 1. Added Interface to fix the 'never[]' error
interface Announcement {
    id: number;
    title: string;
    message: string;
    created_at: string;
}

const AdminAnnouncement = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    // 2. Applied the interface to useState
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(false);

    const API_URL = 'http://localhost:5000/api/announcements';

    const fetchAnnouncements = async () => {
        try {
            const res = await axios.get(API_URL);
            // TypeScript now knows res.data should fit the Announcement structure
            setAnnouncements(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Fetch failed:", err);
        }
    };

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(API_URL, { title, message });
            setTitle('');
            setMessage('');
            fetchAnnouncements();
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message;
            alert(`Error: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this announcement?")) return;
        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchAnnouncements();
        } catch (err) {
            alert("Delete failed");
        }
    };

    useEffect(() => { fetchAnnouncements(); }, []);

    return (
        <div className="p-8 bg-white rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black flex items-center gap-2 text-slate-800">
                    <Megaphone className="text-[#004a80]" /> Broadcast Panel
                </h2>
                <span className="text-[10px] font-bold bg-blue-50 text-[#004a80] px-3 py-1 rounded-full uppercase">
                    System / Broadcast
                </span>
            </div>
            
            <form onSubmit={handlePost} className="space-y-4 mb-10 bg-slate-50/50 p-6 rounded-[1.5rem] border border-slate-100">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Topic</label>
                    <input 
                        className="w-full p-4 rounded-xl bg-white border border-slate-200 outline-none focus:ring-2 ring-blue-100 font-bold text-slate-700 transition-all"
                        placeholder="e.g., Holiday Notice"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Message Details</label>
                    <textarea 
                        className="w-full p-4 rounded-xl bg-white border border-slate-200 outline-none focus:ring-2 ring-blue-100 min-h-[120px] text-slate-600 transition-all"
                        placeholder="What would you like to tell your customers?"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-[#004a80] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-[#00355c] transition-all disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    {loading ? "Posting..." : "Post Announcement"}
                </button>
            </form>

            <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> 
                    Live Feed
                </h3>
                {announcements.length === 0 ? (
                    <p className="text-center py-10 text-slate-400 font-medium italic bg-slate-50 rounded-2xl border border-dashed">
                        No active broadcasts found.
                    </p>
                ) : (
                    announcements.map((ann) => (
                        <div key={ann.id} className="group flex justify-between items-start p-5 bg-white rounded-2xl border border-slate-100">
                            <div className="space-y-1">
                                <p className="font-black text-slate-800">{ann.title}</p>
                                <p className="text-sm text-slate-500">{ann.message}</p>
                                <p className="text-[10px] text-slate-300 font-bold uppercase mt-2">
                                    Posted: {new Date(ann.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <button 
                                onClick={() => handleDelete(ann.id)} 
                                className="text-slate-300 hover:text-red-500 p-2"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminAnnouncement;