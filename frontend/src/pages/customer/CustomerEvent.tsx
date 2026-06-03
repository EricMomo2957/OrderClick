// frontend/src/pages/customer/CustomerEvent.tsx
import { useState, useEffect } from 'react';
import { Plus, Edit2, Calendar as CalendarIcon, MapPin, X, Loader2, AlertCircle, LayoutGrid, CalendarDays, Eye } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../admin/calendar-custom.css'; // Reusing the same styles

interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;
  location: string;
}

const API_BASE_URL = 'http://localhost:5000/api/events/customer';

const CustomerEvent = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: ''
  });

  const fetchEvents = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("No session found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/my-events`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setEvents(data);
        setError(null);
      } else {
        setError(data.error || "Failed to load your events.");
      }
    } catch (err) {
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const getTileClassName = ({ date, view }: { date: Date, view: string }) => {
    if (view === 'month') {
      const dateString = date.toISOString().split('T')[0];
      const hasEvent = events.some(event => event.event_date.split('T')[0] === dateString);
      return hasEvent ? 'has-event-dot bg-[#003d3d]/10 text-[#003d3d] font-black border border-[#003d3d]/20 rounded-xl' : null;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const url = editingEvent 
      ? `${API_BASE_URL}/${editingEvent.id}` 
      : API_BASE_URL;
    
    try {
      const response = await fetch(url, {
        method: editingEvent ? 'PUT' : 'POST',
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
      alert("Could not connect to server.");
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

  const openDetailModal = (event: Event) => {
    setViewingEvent(event);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setViewingEvent(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-['Inter'] text-slate-800 animate-in fade-in duration-500 select-none">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">My Events</h1>
          <p className="text-slate-400 font-medium text-sm mt-0.5">Manage your personal scheduled activities.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100/60">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 px-4 rounded-xl flex items-center gap-2 text-xs font-black transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#003d3d] border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutGrid size={16} /> GRID
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            className={`p-2 px-4 rounded-xl flex items-center gap-2 text-xs font-black transition-all ${viewMode === 'calendar' ? 'bg-white shadow-sm text-[#003d3d] border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <CalendarDays size={16} /> CALENDAR
          </button>
        </div>

        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[#003d3d] text-white px-6 py-4 rounded-[1.3rem] font-black text-xs uppercase tracking-wider hover:bg-[#002d2d] transition-all shadow-sm hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={18} strokeWidth={3} /> Create Event
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
          <Loader2 className="animate-spin mb-4 text-[#003d3d]" size={40} />
          <p className="font-mono tracking-widest text-[10px] uppercase font-black">Syncing your data...</p>
        </div>
      ) : viewMode === 'calendar' ? (
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 animate-in zoom-in-98 duration-300">
          <div className="w-full text-slate-800">
            <Calendar 
              tileClassName={getTileClassName}
              className="w-full border-none font-['Inter'] bg-white !text-slate-800"
            />
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-[#003d3d] animate-pulse"></span>
            Personal Schedule Monitor Token
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-[2.5rem]">
          <CalendarIcon className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-700">No events discovered</h3>
          <p className="text-slate-400 text-sm mt-1">Get started by creating your very first activity parameter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {events.map((event) => (
             <div key={event.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-7 shadow-sm relative flex flex-col justify-between group hover:shadow-md transition-shadow">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="h-12 w-12 bg-emerald-50/60 border border-emerald-100/40 rounded-2xl flex items-center justify-center">
                    <CalendarIcon className="text-[#003d3d]" size={22} />
                  </div>
                  <div className="flex gap-1.5">
                     <button 
                      onClick={() => openDetailModal(event)} 
                      className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title="View details"
                     >
                        <Eye size={14} />
                     </button>
                     <button 
                      onClick={() => openModal(event)} 
                      className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-[#003d3d]/10 hover:text-[#003d3d] transition-colors"
                      title="Edit event"
                     >
                        <Edit2 size={14} />
                     </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 uppercase tracking-wide truncate">{event.title}</h3>
                <p className="text-slate-500 text-xs line-clamp-2 mb-6 font-medium leading-relaxed">{event.description || 'No description asset attached.'}</p>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-50 font-mono">
                <div className="flex items-center gap-2 text-[10px] font-black text-[#003d3d] uppercase tracking-wider truncate">
                  <MapPin size={14} className="shrink-0" /> {event.location}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {formatDate(event.event_date)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Creating/Editing */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="bg-[#003d3d] p-8 px-10 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black tracking-tight uppercase font-mono">{editingEvent ? 'Edit Your Event' : 'Create New Event'}</h2>
                <p className="text-emerald-200 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Customer Dashboard Panel</p>
              </div>
              <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"><X size={22} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-6 font-mono">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Activity Label</label>
                <input 
                  type="text"
                  required
                  placeholder="Event Title"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#003d3d] text-xs font-bold text-slate-800 uppercase placeholder:text-slate-300 transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Target Matrix Date</label>
                  <input 
                    type="date"
                    required
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#003d3d] text-xs font-bold text-slate-800 transition-all"
                    value={formData.event_date}
                    onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Execution Site</label>
                  <input 
                    type="text"
                    required
                    placeholder="Location"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#003d3d] text-xs font-bold text-slate-800 uppercase placeholder:text-slate-300 transition-all"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Context Parameters</label>
                <textarea 
                  rows={4}
                  placeholder="Description"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#003d3d] text-xs font-bold text-slate-800 placeholder:text-slate-300 resize-none transition-all font-['Inter']"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-[#003d3d] text-white font-black py-4 rounded-[1.5rem] hover:bg-[#002d2d] transition-all text-xs uppercase tracking-[0.25em] hover:-translate-y-0.5"
              >
                {editingEvent ? 'Update Event' : 'Create Event'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal for viewing raw details */}
      {isDetailModalOpen && viewingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="bg-[#003d3d] p-8 px-10 text-white flex justify-between items-center">
              <div className="max-w-[85%]">
                <h2 className="text-xl font-black tracking-tight uppercase font-mono truncate">{viewingEvent.title}</h2>
                <p className="text-emerald-200 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Activity Specific Detail View</p>
              </div>
              <button onClick={closeDetailModal} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"><X size={22} /></button>
            </div>
            
            <div className="p-10 space-y-6 font-mono text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Execution Site</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 break-all uppercase">
                    <MapPin size={14} className="text-[#003d3d]" /> {viewingEvent.location}
                  </div>
                </div>
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Target Matrix Date</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <CalendarIcon size={14} className="text-[#003d3d]" /> {formatDate(viewingEvent.event_date)}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Context Parameters</label>
                <div className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-medium font-['Inter'] leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap break-words">
                  {viewingEvent.description || 'No descriptive configuration mapped to this asset.'}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => {
                    closeDetailModal();
                    openModal(viewingEvent);
                  }}
                  className="w-full bg-slate-100 text-slate-700 font-black py-4 rounded-[1.5rem] hover:bg-slate-200 transition-all text-xs uppercase tracking-[0.25em]"
                >
                  Modify Node
                </button>
                <button 
                  onClick={closeDetailModal}
                  className="w-full bg-[#003d3d] text-white font-black py-4 rounded-[1.5rem] hover:bg-[#002d2d] transition-all text-xs uppercase tracking-[0.25em]"
                >
                  Close View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerEvent;