import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, MapPin, X, Loader2, AlertCircle } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;
  location: string;
}

const AdminEvent = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: ''
  });

  // Fetch events from the newly fixed backend route
  const fetchEvents = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("No session found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/events/my-events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        setEvents(data);
        setError(null);
      } else {
        setError(data.error || "Failed to load events.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Server connection failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = editingEvent 
      ? `http://localhost:5000/api/events/${editingEvent.id}` 
      : 'http://localhost:5000/api/events';
    const method = editingEvent ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchEvents();
        closeModal();
      } else {
        const errData = await response.json();
        alert(errData.error || "Operation failed.");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Could not connect to server.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this event from the portal?")) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchEvents();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const openModal = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        event_date: event.event_date.split('T')[0],
        location: event.location
      });
    } else {
      setEditingEvent(null);
      setFormData({ title: '', description: '', event_date: '', location: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-['Inter'] animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Event Manager</h1>
          <p className="text-slate-500 font-medium">Create and manage upcoming campus activities.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[#004a80] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#003d66] transition-all shadow-xl shadow-blue-900/10 active:scale-95"
        >
          <Plus size={20} />
          Create Event
        </button>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="font-bold">Syncing Portal Events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
          <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-bold">No events posted yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-7 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group relative">
              <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openModal(event)} className="p-2.5 bg-blue-50 text-[#004a80] rounded-xl hover:bg-blue-100 transition-colors"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(event.id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"><Trash2 size={16} /></button>
              </div>
              
              <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <Calendar className="text-[#004a80]" size={24} />
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">{event.title}</h3>
              <p className="text-slate-500 text-sm line-clamp-3 mb-8 font-medium leading-relaxed">{event.description}</p>
              
              <div className="pt-6 border-t border-slate-50 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                    <Calendar size={14} className="text-[#004a80]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                    {new Date(event.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                    <MapPin size={14} className="text-[#004a80]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{event.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-[#004a80] p-10 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black">{editingEvent ? 'Edit Event' : 'Publish New Event'}</h2>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.2em] mt-1">OrderClick Administrator</p>
              </div>
              <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Title</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. IT Career Fair 2026"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#004a80] focus:bg-white transition-all text-sm font-bold placeholder:text-slate-300"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Date</label>
                  <input 
                    type="date"
                    required
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#004a80] text-sm font-bold"
                    value={formData.event_date}
                    onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                  <input 
                    type="text"
                    required
                    placeholder="Room/Building"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#004a80] text-sm font-bold placeholder:text-slate-300"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  rows={4}
                  placeholder="Tell students what this event is about..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#004a80] text-sm font-bold resize-none placeholder:text-slate-300"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-[#004a80] text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-blue-900/20 hover:bg-[#003d66] hover:-translate-y-0.5 transition-all text-xs uppercase tracking-[0.25em] mt-2"
              >
                {editingEvent ? 'Update Event Details' : 'Publish to Portal'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvent;