import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, Trash2, Send, Loader2, Download, Edit3, X, Save, Image as ImageIcon } from 'lucide-react';

interface Announcement {
    id: number;
    title: string;
    message: string;
    image_url: string | null;
    created_at: string;
}

const AdminAnnouncement = () => {
    // Post State
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    
    // Feed State
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    
    // Edit States
    const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editMessage, setEditMessage] = useState('');
    const [editFile, setEditFile] = useState<File | null>(null);

    const API_URL = 'http://localhost:5000/api/announcements';
    const BASE_URL = 'http://localhost:5000'; 

    const fetchAnnouncements = async () => {
        try {
            const res = await axios.get(API_URL);
            setAnnouncements(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Fetch failed:", err);
        }
    };

    // Helper to get Auth Header
    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return { Authorization: `Bearer ${token}` };
    };

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('message', message);
        if (file) formData.append('image', file); 

        try {
            await axios.post(API_URL, formData, {
                headers: { 
                    ...getAuthHeader(),
                    'Content-Type': 'multipart/form-data' 
                }
            });
            setTitle('');
            setMessage('');
            setFile(null); 
            fetchAnnouncements();
        } catch (err: any) {
            alert(`Error: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (ann: Announcement) => {
        setEditingAnn(ann);
        setEditTitle(ann.title);
        setEditMessage(ann.message);
        setEditFile(null); // Reset file selection for new edit session
    };

    // INTEGRATED UPDATED UPDATE LOGIC
    const handleUpdate = async () => {
        if (!editingAnn) return;
        setLoading(true);

        // We use FormData because the backend route uses Multer (upload.single)
        const formData = new FormData();
        formData.append('title', editTitle);
        formData.append('message', editMessage);
        formData.append('is_active', '1'); // Ensures the column is not null
        
        // Only append a new image if the user selected one
        if (editFile) {
            formData.append('image', editFile);
        }

        try {
            await axios.put(`${API_URL}/${editingAnn.id}`, formData, {
                headers: { 
                    ...getAuthHeader(),
                    'Content-Type': 'multipart/form-data' 
                }
            });
            
            // Success: clear states and refresh list
            setEditingAnn(null);
            setEditFile(null);
            fetchAnnouncements();
            alert("Broadcast updated successfully!");
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message;
            alert(`Update failed: ${errorMsg}`);
            console.error("Update error details:", err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this announcement?")) return;
        try {
            await axios.delete(`${API_URL}/${id}`, {
                headers: getAuthHeader()
            });
            fetchAnnouncements();
        } catch (err: any) {
            alert(`Delete failed: ${err.response?.data?.message || err.message}`);
        }
    };

    useEffect(() => { fetchAnnouncements(); }, []);

    return (
        <div className="p-8 bg-white rounded-[2rem] shadow-sm border border-gray-100">
            {/* EDIT MODAL */}
            {editingAnn && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-slate-800">Edit Post</h3>
                            <button onClick={() => setEditingAnn(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <input 
                                value={editTitle} 
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full p-4 rounded-xl border border-slate-200 font-bold text-lg"
                                placeholder="Edit Topic"
                            />
                            <textarea 
                                value={editMessage} 
                                onChange={(e) => setEditMessage(e.target.value)}
                                className="w-full p-4 rounded-xl border border-slate-200 min-h-[150px]"
                                placeholder="Edit Message"
                            />
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Replace Photo (Optional)</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                                />
                            </div>
                            <button 
                                onClick={handleUpdate}
                                disabled={loading}
                                className="w-full bg-[#004a80] text-white py-4 rounded-xl font-black flex items-center justify-center gap-3 hover:bg-[#00355c] transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                Update Broadcast
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black flex items-center gap-2 text-slate-800">
                    <Megaphone className="text-[#004a80]" /> Broadcast Panel
                </h2>
                <span className="text-[10px] font-bold bg-blue-50 text-[#004a80] px-3 py-1 rounded-full uppercase">
                    System / Broadcast
                </span>
            </div>
            
            {/* CREATE FORM */}
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

                <div className="space-y-1 mb-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Attachment (Optional)</label>
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="w-full p-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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

            {/* LIVE FEED */}
            <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> 
                    Live Feed
                </h3>

                <div className="grid gap-4">
                    {announcements.length === 0 ? (
                        <p className="text-center py-10 text-slate-400 font-medium italic bg-slate-50 rounded-2xl border border-dashed">
                            No active broadcasts found.
                        </p>
                    ) : (
                        announcements.map((ann) => (
                            <div key={ann.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative group hover:border-blue-200 transition-all">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800 text-lg mb-1">{ann.title}</h4>
                                        <p className="text-slate-500 text-sm leading-relaxed mb-4">{ann.message}</p>
                                        
                                        {ann.image_url && (
                                            <div className="mb-4">
                                                <img 
                                                    src={`${BASE_URL}${ann.image_url}`} 
                                                    className="w-32 h-32 object-cover rounded-xl mb-2 border border-slate-100" 
                                                    alt="preview" 
                                                />
                                                <a 
                                                    href={`${BASE_URL}${ann.image_url}`} 
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download 
                                                    className="inline-flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors uppercase"
                                                >
                                                    <Download size={12} /> Download Photo
                                                </a>
                                            </div>
                                        )}

                                        <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                            Posted: {new Date(ann.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 ml-4">
                                        <button 
                                            onClick={() => startEdit(ann)} 
                                            className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            title="Edit"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(ann.id)} 
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminAnnouncement;