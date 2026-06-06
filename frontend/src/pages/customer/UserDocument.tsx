import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FileText, UploadCloud, AlertCircle, RefreshCw, CheckCircle2, Clock, XCircle, FileSpreadsheet, Edit2, Trash2, X } from 'lucide-react';

interface LoggedDocument {
  id: number;
  document_title: string;
  file_name: string;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

const UserDocument = () => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [history, setHistory] = useState<LoggedDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Track state for updates
  const [editingId, setEditingId] = useState<number | null>(null);

  const API_URL = 'http://localhost:5000/api/documents'; 

  const getHeaders = (isMultipart = true) => ({
    headers: { 
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      ...(isMultipart && { 'Content-Type': 'multipart/form-data' })
    }
  });

  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlert({ text, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchUserDocumentLogs = useCallback(async () => {
    try {
      setFetching(true);
      const res = await axios.get(`${API_URL}/my-logs`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed fetching ledger logs:", err);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchUserDocumentLogs();
  }, [fetchUserDocumentLogs]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setTitle('');
    setFile(null);
    setEditingId(null);
    const fileInput = document.getElementById('document-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleFormSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showAlert("Please enter a valid document title.", "error");
      return;
    }

    // File is completely required for new submissions, but optional during updates
    if (!editingId && !file) {
      showAlert("Please pick a valid target file to upload.", "error");
      return;
    }

    const formData = new FormData();
    formData.append('document_title', title);
    if (file) {
      formData.append('document', file);
    }

    try {
      setLoading(true);
      if (editingId) {
        // Edit Action Pathway
        await axios.put(`${API_URL}/update/${editingId}`, formData, getHeaders(true));
        showAlert("Your document tracking matrix record was successfully modified.");
      } else {
        // Create Action Pathway
        await axios.post(`${API_URL}/submit`, formData, getHeaders(true));
        showAlert("Your verification document has been securely routed to the admin team.");
      }
      resetForm();
      fetchUserDocumentLogs();
    } catch (error: any) {
      showAlert(error.response?.data?.message || "Transmission operational failure encountered.", "error");
    } finally {
      setLoading(false);
    }
  };

  const startEditMode = (doc: LoggedDocument) => {
    if (doc.status !== 'pending') {
      showAlert("Action Denied: Verified or rejected logs are locked.", "error");
      return;
    }
    setEditingId(doc.id);
    setTitle(doc.document_title);
    setFile(null); // Optional re-upload assignment
  };

  const handleDeleteDocument = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this documentation log?")) return;

    try {
      setLoading(true);
      await axios.delete(`${API_URL}/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      showAlert("Document record destroyed safely from current active index registries.");
      if (editingId === id) resetForm();
      fetchUserDocumentLogs();
    } catch (error: any) {
      showAlert(error.response?.data?.message || "Failed removing selected ledger entity.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen animate-in fade-in duration-500">
      
      {/* Dynamic Status Notifications banner components */}
      {alert && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border context-notification ${
          alert.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'
        }`}>
          <AlertCircle size={18} className={alert.type === 'success' ? 'text-emerald-600' : 'text-rose-600'} />
          <span className="text-xs font-black tracking-wide">{alert.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Panel Card Form elements */}
        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm h-fit relative overflow-hidden">
          {editingId && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400 animate-pulse" />
          )}
          
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-black text-slate-800 tracking-tight">
              {editingId ? 'Modify Document' : 'Submit Document'}
            </h3>
            {editingId && (
              <button 
                onClick={resetForm}
                className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-slate-50 transition-colors"
                title="Cancel Edit Mode"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 font-medium mb-6">
            {editingId ? 'Updating active payload information strings.' : 'Upload credentials, image data matrix, or PDFs for verification review.'}
          </p>

          <form onSubmit={handleFormSubmission} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Document Title</label>
              <input 
                type="text"
                placeholder="e.g., Proof of Payment, National ID Card"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-200 focus:bg-white text-slate-700 transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Attached Source Media {editingId && <span className="lowercase text-amber-500 font-bold">(Optional)</span>}
              </label>
              <div className="relative border-2 border-dashed border-slate-200 hover:border-blue-300 rounded-2xl bg-slate-50/50 p-6 text-center transition-all group">
                <input 
                  type="file"
                  id="document-file-input"
                  accept=".jpg,.jpeg,.png,.pdf,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                  <div className="p-3 bg-white rounded-full text-slate-400 group-hover:text-blue-500 shadow-sm transition-colors">
                    <UploadCloud size={20} />
                  </div>
                  <span className="text-xs font-bold text-slate-600 truncate max-w-[180px]">
                    {file ? file.name : editingId ? "Keep existing or drop new file" : "Choose an option or drag file here"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">JPEG, PNG, PDF or DOCX format frameworks (Max 5MB)</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !title.trim() || (!editingId && !file)}
              className={`w-full flex items-center justify-center gap-2 text-white text-xs font-black py-3 px-4 rounded-xl transition-all shadow-sm ${
                editingId 
                  ? 'bg-amber-500 hover:bg-amber-600 disabled:opacity-40' 
                  : 'bg-[#004a80] hover:bg-[#003861] disabled:opacity-40'
              }`}
            >
              {loading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : editingId ? (
                <>Update Verification Package</>
              ) : (
                <>Transmit Verification Package</>
              )}
            </button>
          </form>
        </div>

        {/* Real-time Tracking Pipeline Grid View */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight mb-1">Documentation Registries Log</h3>
              <p className="text-xs text-slate-400 font-medium">Track operational moderation cycles for your submitted files.</p>
            </div>
            <button 
              onClick={fetchUserDocumentLogs}
              disabled={fetching}
              className="p-1.5 bg-slate-50 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <RefreshCw size={14} className={fetching ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="space-y-3">
            {fetching ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={`doc-skel-${i}`} className="h-16 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse w-full" />
              ))
            ) : history.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-100 rounded-2xl bg-slate-50/20">
                <FileSpreadsheet size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-xs font-bold">No tracking logs found on your current instance profile key.</p>
              </div>
            ) : (
              history.map((doc) => (
                <div key={doc.id} className={`flex items-center justify-between p-4 bg-white border border-slate-50 hover:bg-slate-50/50 rounded-2xl transition-all group ${
                  editingId === doc.id ? 'ring-2 ring-amber-400/70 bg-amber-50/10' : ''
                }`}>
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2.5 bg-blue-50 text-[#004a80] rounded-xl flex-shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-black text-slate-800 truncate">{doc.document_title}</span>
                      <span className="text-[10px] text-slate-400 font-mono tracking-tight font-medium truncate">{doc.file_name}</span>
                      <span className="text-[9px] text-slate-400 mt-0.5">{new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border ${
                      doc.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      doc.status === 'verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {doc.status === 'pending' && <Clock size={10} />}
                      {doc.status === 'verified' && <CheckCircle2 size={10} />}
                      {doc.status === 'rejected' && <XCircle size={10} />}
                      {doc.status}
                    </span>

                    {/* Inline Action Triggers (Only interactive when status is pending) */}
                    <div className="flex items-center gap-1 border-l border-slate-100 pl-3">
                      <button
                        onClick={() => startEditMode(doc)}
                        disabled={doc.status !== 'pending' || loading}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-50 transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                        title={doc.status === 'pending' ? "Edit Document Parameters" : "Locked for modification evaluation"}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        disabled={doc.status !== 'pending' || loading}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                        title={doc.status === 'pending' ? "Permanently Purge Record" : "Locked for compliance archive retention"}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserDocument;