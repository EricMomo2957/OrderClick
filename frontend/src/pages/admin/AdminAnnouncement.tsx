// FRONTEND/src/components/AdminAnnouncement.tsx
import React, { useState, useEffect, useRef } from 'react';
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
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    // Feed State
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    
    // Edit States
    const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editMessage, setEditMessage] = useState('');
    const [editFile, setEditFile] = useState<File | null>(null);
    const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);

    // File Input Refs for cleaner reset triggers
    const fileInputRef = useRef<HTMLInputElement>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);

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

    // Handle Image Selection and Real-time Object URL Previews
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, mode: 'create' | 'edit') => {
        const selectedFile = e.target.files?.[0] || null;
        if (selectedFile) {
            const objectUrl = URL.createObjectURL(selectedFile);
            if (mode === 'create') {
                setFile(selectedFile);
                setPreviewUrl(objectUrl);
            } else {
                setEditFile(selectedFile);
                setEditPreviewUrl(objectUrl);
            }
        } else {
            if (mode === 'create') {
                setFile(null);
                setPreviewUrl(null);
            } else {
                setEditFile(null);
                setEditPreviewUrl(null);
            }
        }
    };

    // Clean up temporary Object URLs to avoid memory leaks
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl);
        };
    }, [previewUrl, editPreviewUrl]);

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
            setPreviewUrl(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
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
        setEditFile(null); 
        setEditPreviewUrl(null);
    };

    const closeEditModal = () => {
        setEditingAnn(null);
        setEditFile(null);
        setEditPreviewUrl(null);
        if (editFileInputRef.current) editFileInputRef.current.value = '';
    };

    const handleUpdate = async () => {
        if (!editingAnn) return;
        setLoading(true);

        const formData = new FormData();
        formData.append('title', editTitle);
        formData.append('message', editMessage);
        formData.append('is_active', '1'); 
        
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
            
            closeEditModal();
            fetchAnnouncements();
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
        <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* EDIT MODAL */}
            {editingAnn && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl border border-slate-100 transform transition-all animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-slate-800">Edit Broadcast Context</h3>
                            <button onClick={closeEditModal} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-2">Topic Header</label>
                                <input 
                                    value={editTitle} 
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full p-4 rounded-xl border border-slate-200 font-bold text-base text-slate-800 outline-none focus:ring-2 ring-emerald-50 focus:border-[#003d3d] transition-all"
                                    placeholder="Edit Topic"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-2">Message Body Matrix</label>
                                <textarea 
                                    value={editMessage} 
                                    onChange={(e) => setEditMessage(e.target.value)}
                                    className="w-full p-4 rounded-xl border border-slate-200 min-h-[120px] text-sm text-slate-600 outline-none focus:ring-2 ring-emerald-50 focus:border-[#003d3d] transition-all"
                                    placeholder="Edit Message"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-2">Replace Attachment Image (Optional)</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    ref={editFileInputRef}
                                    onChange={(e) => handleFileChange(e, 'edit')}
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[#003d3d]/10 file:text-[#003d3d] hover:file:bg-[#003d3d]/20 transition-all cursor-pointer"
                                />
                                
                                {/* Live Selection Preview in Modal */}
                                {editPreviewUrl ? (
                                    <div className="relative mt-2 border border-slate-100 rounded-xl overflow-hidden bg-slate-50 p-2 flex justify-center">
                                        <img src={editPreviewUrl} alt="New selection preview" className="h-28 object-contain rounded-lg" />
                                        <div className="absolute top-3 right-3 bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-md uppercase shadow-sm tracking-wider">New Selection</div>
                                    </div>
                                ) : editingAnn.image_url && (
                                    <div className="relative mt-2 border border-slate-100 rounded-xl overflow-hidden bg-slate-50 p-2 flex justify-center">
                                        <img src={`${BASE_URL}${editingAnn.image_url}`} alt="Current live server preview" className="h-28 object-contain rounded-lg opacity-60" />
                                        <div className="absolute top-3 right-3 bg-slate-400 text-white font-black text-[9px] px-2 py-0.5 rounded-md uppercase shadow-sm tracking-wider">Current Live</div>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={handleUpdate}
                                disabled={loading}
                                className="w-full bg-[#003d3d] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#002d2d] active:scale-[0.99] transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                Synchronize Updates
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-black flex items-center gap-3 text-slate-800">
                        <Megaphone className="text-[#003d3d]" size={26} /> Broadcast Panel
                    </h2>
                    <p className="text-slate-500 text-sm mt-0.5">Publish and manage live notification announcements across client dashboards.</p>
                </div>
                <span className="text-[10px] font-black bg-emerald-50 border border-emerald-100/50 text-[#003d3d] px-4 py-1.5 rounded-xl uppercase tracking-wider">
                    System / Broadcast
                </span>
            </div>
            
            {/* CREATE FORM */}
            <form onSubmit={handlePost} className="space-y-4 mb-12 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 shadow-sm/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-2">Topic Signature</label>
                        <input 
                            className="w-full p-4 rounded-xl bg-white border border-slate-200 outline-none focus:ring-2 ring-emerald-50 focus:border-[#003d3d] font-bold text-slate-800 transition-all text-sm"
                            placeholder="e.g., Scheduled Maintenance Window"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-2">Media Attachment (Optional)</label>
                        <input 
                            type="file" 
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={(e) => handleFileChange(e, 'create')}
                            className="w-full p-[11px] rounded-xl bg-white border border-slate-200 text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[#003d3d]/10 file:text-[#003d3d] hover:file:bg-[#003d3d]/20 transition-all cursor-pointer"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-2">Detailed Announcement Payload</label>
                    <textarea 
                        className="w-full p-4 rounded-xl bg-white border border-slate-200 outline-none focus:ring-2 ring-emerald-50 focus:border-[#003d3d] min-h-[100px] text-sm text-slate-600 transition-all"
                        placeholder="Compile notification details here for standard broadcasting schemas..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                    />
                </div>

                {/* Inline Preview for Form Selection */}
                {previewUrl && (
                    <div className="p-3 bg-white border border-slate-100 rounded-xl inline-flex items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="relative w-16 h-16 bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                            <img src={previewUrl} className="w-full h-full object-cover" alt="Upload preview" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-700 max-w-[200px] truncate">{file?.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Ready for transit upload</p>
                        </div>
                        <button 
                            type="button" 
                            onClick={() => { setFile(null); setPreviewUrl(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-md transition-colors ml-2"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}

                <div className="flex justify-end pt-2">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-[#003d3d] text-white px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[#002d2d] active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm"
                    >
                        {loading ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                        {loading ? "Transmitting..." : "Post Announcement"}
                    </button>
                </div>
            </form>

            {/* LIVE FEED */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 
                    Live Broadcasting Feeds matrix
                </h3>

                <div className="grid gap-4">
                    {announcements.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 font-medium italic bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                            No active broadcasts found inside the network grid schema.
                        </div>
                    ) : (
                        announcements.map((ann) => (
                            <div key={ann.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative group hover:border-emerald-200 hover:shadow-md/20 transition-all duration-300">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg">{ann.title}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                                Frame Index ID: #BRC-{ann.id} • {new Date(ann.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed max-w-4xl">{ann.message}</p>
                                        
                                        {ann.image_url && (
                                            <div className="pt-2 flex flex-col items-start gap-2">
                                                <div className="w-48 h-48 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden p-2 flex items-center justify-center">
                                                    <img 
                                                        src={`${BASE_URL}${ann.image_url}`} 
                                                        className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.02]" 
                                                        alt="Broadcast Attachment Content" 
                                                    />
                                                </div>
                                                <a 
                                                    href={`${BASE_URL}${ann.image_url}`} 
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download 
                                                    className="inline-flex items-center gap-2 text-[10px] font-black text-[#003d3d] bg-emerald-50 border border-emerald-100/50 px-3 py-2 rounded-xl hover:bg-[#003d3d] hover:text-white transition-all uppercase tracking-wider shadow-sm/50"
                                                >
                                                    <Download size={12} /> Download Photo Context
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1 ml-4 opacity-40 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => startEdit(ann)} 
                                            className="p-2 text-slate-400 hover:text-[#003d3d] hover:bg-emerald-50 rounded-xl transition-all"
                                            title="Modify Parameter"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(ann.id)} 
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            title="Purge Frame"
                                        >
                                            <Trash2 size={16} />
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