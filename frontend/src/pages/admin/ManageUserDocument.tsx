import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { 
  FileText, 
  Search, 
  X, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  AlertCircle,
  User,
  HelpCircle,
  Clock,
  Eye
} from 'lucide-react';

interface UserDocument {
  id: number;
  user_id: number;
  fullname: string; // From joined table query mapping logic
  email: string;    // From joined table query mapping logic
  document_title: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

const ManageUserDocument = () => {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive global floating notification block
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Tracking element state during update status network mutations
  const [processingId, setProcessingId] = useState<number | null>(null);

  const API_BASE = 'http://localhost:5000/api/documents'; // Standard backend routing configuration context

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMessage({ text, type });
    setTimeout(() => setAlertMessage(null), 4000);
  };

  const fetchAllDocuments = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      // Target an admin routing endpoint that retrieves all documents with joined user tables
      const res = await axios.get(`${API_BASE}/admin/all`, getAuthHeader());
      setDocuments(Array.isArray(res.data) ? res.data : []);
    } catch (error: any) {
      console.error("Failed to fetch user documents list:", error);
      showAlert(
        error.response?.status === 403 
          ? "Unauthorized security clearance level detected." 
          : "Failed loading user document transmission entries.", 
        "error"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { 
    fetchAllDocuments(); 
  }, [fetchAllDocuments]);

  // Handle multi-state moderation pipelines (Clear / Reject)
  const handleUpdateStatus = async (id: number, status: 'pending' | 'verified' | 'rejected') => {
    try {
      setProcessingId(id);
      await axios.put(`${API_BASE}/admin/status/${id}`, { status }, getAuthHeader());
      showAlert(`Document pipeline verification safely updated to "${status}".`);
      await fetchAllDocuments(true);
    } catch (error) {
      showAlert("Authorization validation error: Update criteria parameters rejected.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // Filter evaluation matrix
  const filteredDocuments = documents.filter((doc) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const customerName = (doc.fullname || '').toLowerCase();
    const customerEmail = (doc.email || '').toLowerCase();
    const docTitle = (doc.document_title || '').toLowerCase();
    const fileName = (doc.file_name || '').toLowerCase();
    const statusState = (doc.status || '').toLowerCase();
    const fallbackIdKey = `doc-${doc.id}`;

    return (
      customerName.includes(query) ||
      customerEmail.includes(query) ||
      docTitle.includes(query) ||
      fileName.includes(query) ||
      statusState.includes(query) ||
      fallbackIdKey.includes(query)
    );
  });

  // Helper calculation formatting file metric displays
  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="p-4 relative min-h-screen animate-in fade-in duration-500">
      
      {/* Floating Operational Notification Status Banner */}
      {alertMessage && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl transition-all border animate-in slide-in-from-bottom-5 ${
          alertMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
            : 'bg-rose-50 text-rose-800 border-rose-100'
        }`}>
          <AlertCircle size={18} className={alertMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'} />
          <span className="text-xs font-black tracking-wide">{alertMessage.text}</span>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
        
        {/* Header Controller Interaction Module */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                User Verification <span className="text-[#003d3d]">Documents Ledger</span>
              </h2>
              <button 
                onClick={() => fetchAllDocuments(true)} 
                disabled={refreshing || loading}
                className="p-1.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-[#003d3d] hover:bg-emerald-50 transition-all disabled:opacity-50"
                title="Force Reload Document Registries"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin text-[#003d3d]' : ''} />
              </button>
            </div>
            <p className="text-gray-400 text-sm font-medium">Verify customer credentials, clear identity files, and process incoming data validation uploads.</p>
          </div>
          
          {/* Dynamic Search Parameter Core */}
          <div className="relative w-full lg:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, document parameters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs focus:outline-none focus:border-emerald-200 focus:bg-white text-slate-700 font-bold tracking-wide transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        
        {/* Responsive Content Table Registry Matrix */}
        <div className="overflow-x-auto rounded-3xl border border-slate-50">
          {loading ? (
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                  <th className="py-4 px-6 text-left">Customer Details</th>
                  <th className="py-4 px-6 text-left">Document Title</th>
                  <th className="py-4 px-6 text-left">Asset Parameters</th>
                  <th className="py-4 px-6 text-center">Submitted</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions Workflow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`doc-skeleton-${idx}`} className="animate-pulse">
                    <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded-md w-28 mb-1" /><div className="h-3 bg-slate-100 rounded-md w-20" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded-md w-36" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded-md w-24" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded-md w-16 mx-auto" /></td>
                    <td className="py-4 px-6"><div className="h-5 bg-slate-100 rounded-xl w-16 mx-auto" /></td>
                    <td className="py-4 px-6"><div className="h-8 bg-slate-100 rounded-xl w-24 ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-20 bg-slate-50/30 rounded-3xl border border-dashed border-slate-100">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <HelpCircle size={20} />
              </div>
              <p className="text-slate-400 text-xs font-bold tracking-wide">No user validation documents found matching criteria parameter definitions.</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                  <th className="py-4 px-6 text-left">Customer Details</th>
                  <th className="py-4 px-6 text-left">Document Specification</th>
                  <th className="py-4 px-6 text-left">Asset Parameters</th>
                  <th className="py-4 px-6 text-center">Submitted</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions Workflow</th>
                </tr>
              </thead>
              <tbody className="text-slate-600 text-xs font-medium divide-y divide-slate-50 bg-white">
                {filteredDocuments.map((doc) => {
                  // Normalize windows file paths safely to standard web address urls
                  const cleanStaticPath = doc.file_path ? doc.file_path.replace(/\\/g, '/') : '';
                  const targetResourceUrl = `http://localhost:5000/${cleanStaticPath}`;
                  const isOperating = processingId === doc.id;

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/40 transition-colors group">
                      
                      {/* User Account Details Context Node */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-50 text-[#003d3d]">
                            <User size={13} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-slate-800 tracking-tight">{doc.fullname}</span>
                            <span className="text-[10px] text-slate-400 font-semibold tracking-wide">{doc.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Document Meta Class Assignment Block */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700">{doc.document_title}</span>
                          <span className="text-[9px] text-slate-400 tracking-wider font-semibold">ID: #DOC-{doc.id}</span>
                        </div>
                      </td>
                      
                      {/* File Attachment Parameters Block */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <FileText size={14} className="text-slate-400" />
                          <div className="flex flex-col">
                            <span className="text-slate-600 truncate max-w-xs font-bold" title={doc.file_name}>
                              {doc.file_name}
                            </span>
                            <span className="text-[9px] text-slate-400 font-normal">
                              {formatBytes(doc.file_size)} | {doc.mime_type ? doc.mime_type.split('/')[1].toUpperCase() : 'UNKNOWN'}
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      {/* Date Submission Timestamp Column */}
                      <td className="py-4 px-6 text-center text-slate-500 font-semibold text-[11px]">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>

                      {/* Moderation Clearance Badge */}
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border inline-flex items-center gap-1 ${
                          doc.status === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                          doc.status === 'verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          'bg-rose-50 text-rose-800 border-rose-100'
                        }`}>
                          {doc.status === 'pending' && <Clock size={10} />}
                          {doc.status}
                        </span>
                      </td>

                      {/* Operational Admin Pipeline Options */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* Target file inspector anchor */}
                          <a 
                            href={targetResourceUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 p-1.5 rounded-xl transition-all flex items-center gap-1 text-[10px] font-bold px-2.5"
                            title="Open attached resource asset in a new viewport"
                          >
                            <Eye size={12} /> View File
                          </a>

                          {doc.status === 'pending' ? (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(doc.id, 'verified')} 
                                disabled={isOperating}
                                className="bg-[#003d3d] hover:bg-[#002d2d] text-white p-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1 text-[10px] font-bold px-2.5 disabled:opacity-50"
                                title="Approve verification identity criteria matching rules"
                              >
                                <CheckCircle size={12} /> Approve
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(doc.id, 'rejected')} 
                                disabled={isOperating}
                                className="bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 p-1.5 rounded-xl transition-all flex items-center gap-1 text-[10px] font-bold px-2 disabled:opacity-50"
                                title="Reject submission file parameters"
                              >
                                <XCircle size={12} /> Reject
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => handleUpdateStatus(doc.id, 'pending')}
                              disabled={isOperating}
                              className="text-[10px] text-slate-400 hover:text-slate-600 px-2.5 py-1.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all font-bold border border-slate-100 disabled:opacity-50"
                              title="Revert status mapping workflow back into moderation processing status"
                            >
                              Reset State
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUserDocument;