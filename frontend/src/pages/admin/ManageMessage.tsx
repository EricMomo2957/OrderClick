import { useState, useEffect, useCallback } from 'react';
import { Mail, User, Clock, CheckCircle, Archive, Trash2, RefreshCw, MessageSquare } from 'lucide-react';

interface VisitorMessage {
  id: number;
  fullname: string;
  email: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  created_at: string;
}

const ManageMessage = () => {
  const [messages, setMessages] = useState<VisitorMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'archived'>('all');

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/admin/messages/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Could not collect customer inquiries.');
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error("Error gathering message tracking lists:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleUpdateStatus = async (id: number, newStatus: 'read' | 'archived') => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/admin/messages/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Could not modify state details.');
      
      setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, status: newStatus } : msg));
    } catch (err) {
      alert("Failed to adjust status lifecycle configuration.");
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this visitor inquiry?")) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/admin/messages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Could not drop row from database.');
      
      setMessages(prev => prev.filter(msg => msg.id !== id));
    } catch (err) {
      alert("Failed to delete message.");
    }
  };

  const filteredMessages = messages.filter(msg => filter === 'all' ? true : msg.status === filter);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Upper Brand Headers */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Visitor Approaches</h2>
          <p className="text-slate-500 text-sm">Review, track, and audit incoming feedback from the OrderClick landing page.</p>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          {/* Filter Bar Controls */}
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-2.5 rounded-xl outline-none"
          >
            <option value="all">All Inquiries</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="archived">Archived</option>
          </select>

          <button 
            onClick={fetchMessages}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-bold text-[#003d3d] bg-emerald-50 px-4 py-2.5 rounded-xl hover:bg-emerald-100 transition-all disabled:opacity-50 shrink-0"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Sync
          </button>
        </div>
      </div>

      {/* Main Content Ledger Stream */}
      <div className="space-y-4">
        {filteredMessages.length > 0 ? (
          filteredMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={`p-6 rounded-[2rem] border transition-all duration-300 ${
                msg.status === 'unread' 
                  ? 'bg-slate-900 text-white border-slate-800 shadow-lg shadow-slate-900/10' 
                  : 'bg-white border-slate-100 shadow-sm text-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                {/* Meta Customer Contexts */}
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    msg.status === 'unread' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <User size={18} />
                  </div>
                  <div>
                    <h4 className="font-black text-base tracking-tight">{msg.fullname}</h4>
                    <p className={`text-xs flex items-center gap-1 mt-0.5 ${msg.status === 'unread' ? 'text-slate-400' : 'text-slate-500'}`}>
                      <Mail size={12} /> {msg.email}
                    </p>
                  </div>
                </div>

                {/* Right Side Status Indicators & System Dates */}
                <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
                  <div className={`flex items-center gap-1 font-mono ${msg.status === 'unread' ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Clock size={12} />
                    {new Date(msg.created_at).toLocaleDateString()}
                  </div>
                  <span className={`px-2.5 py-0.5 font-bold uppercase text-[10px] tracking-wider rounded-md ${
                    msg.status === 'unread' ? 'bg-emerald-500/20 text-emerald-400' :
                    msg.status === 'archived' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {msg.status}
                  </span>
                </div>
              </div>

              {/* Message Payload Body Block */}
              <div className={`my-4 p-4 rounded-xl text-sm leading-relaxed ${
                msg.status === 'unread' ? 'bg-slate-800/50 text-slate-200' : 'bg-slate-50 text-slate-600'
              }`}>
                <div className="flex gap-2">
                  <MessageSquare size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                </div>
              </div>

              {/* Interactive Tool Actions */}
              <div className="flex justify-end gap-2 border-t pt-4 border-slate-100/10">
                {msg.status === 'unread' && (
                  <button
                    onClick={() => handleUpdateStatus(msg.id, 'read')}
                    className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    <CheckCircle size={14} /> Mark Read
                  </button>
                )}
                {msg.status !== 'archived' && (
                  <button
                    onClick={() => handleUpdateStatus(msg.id, 'archived')}
                    className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-colors ${
                      msg.status === 'unread' 
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Archive size={14} /> Archive
                  </button>
                )}
                <button
                  onClick={() => handleDeleteMessage(msg.id)}
                  className="flex items-center gap-1.5 text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 px-4 py-2 rounded-xl transition-colors ml-auto sm:ml-0"
                >
                  <Trash2 size={14} /> Purge
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm py-20 text-center text-slate-400 italic">
            {loading ? 'Reading message database records...' : 'No current approaches found matching your filters.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageMessage;