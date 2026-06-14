// frontend/src/pages/admin/AdminEvent.tsx
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar as CalendarIcon, MapPin, X, Loader2, AlertCircle, LayoutGrid, CalendarDays } from 'lucide-react';
import Calendar from 'react-calendar';
import { io } from 'socket.io-client';
import 'react-calendar/dist/Calendar.css';
import './calendar-custom.css';

// Initialize socket outside component to prevent multiple connections on re-render
const socket = io('http://localhost:5000');

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
  const [viewMode, setViewMode] = useState<'calendar' | 'grid'>('calendar');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: ''
  });

  // 1. Initial REST API Data Pull Engine
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
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  // Run initial state load once on mount
  useEffect(() => { 
    fetchEvents(); 
  }, []);

  // 2. Real-Time Socket Stream Synced to State with Ghost Protection
  useEffect(() => {
    const handleNewEvent = (newEvent: Event) => {
      setEvents((prevEvents) => {
        // Strict guard clause: Check if event already exists inside current UI array matrix
        if (prevEvents.some(event => event.id === newEvent.id)) {
          return prevEvents; 
        }
        return [newEvent, ...prevEvents];
      });
    };

    const handleUpdatedEvent = (updatedEvent: Event) => {
      setEvents((prevEvents) =>
        prevEvents.map(event => event.id === updatedEvent.id ? updatedEvent : event)
      );
    };

    const handleDeletedEvent = ({ id }: { id: number }) => {
      setEvents((prevEvents) => prevEvents.filter(event => event.id !== id));
    };

    // WebSocket Stream Bindings
    socket.on('new_event', handleNewEvent);
    socket.on('update_event', handleUpdatedEvent);
    socket.on('delete_event', handleDeletedEvent);

    // 💡 CRITICAL: Clean up and unbind listeners on unmount to completely kill duplicated ghosts
    return () => {
      socket.off('new_event', handleNewEvent);
      socket.off('update_event', handleUpdatedEvent);
      socket.off('delete_event', handleDeletedEvent);
    };
  }, []);

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
      ? `http://localhost:5000/api/events/${editingEvent.id}` 
      : 'http://localhost:5000/api/events';
      
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
        // Fallback catch-up sync if websockets take milliseconds to arrive
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

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this event entry?")) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchEvents();
      } else {
        alert("Failed to delete event.");
      }
    } catch (err) {
      alert("Server error occurred.");
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
    <div className="p-8 max-w-7xl mx-auto font-['Inter'] animate-in fade-in duration-500 select-none text-slate-800">
      
      {/* CONTAINER TOP HEADER BANNER BAR */}
      <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 shadow-sm">
        <div>
          <p className="text-[10px] font-black tracking-[0.25em] text-slate-400 uppercase mb-1">
            Event Management System
          </p>
          <div className="flex items-baseline gap-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-800 uppercase">
              {new Date().toLocaleString('en-US', { month: 'long' })}{' '}
              <span className="text-[#003d3d]">{new Date().getFullYear()}</span>
            </h1>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          {/* Layout Configuration Grid/Calendar Tab Toggles */}
          <div className="flex items-center bg-slate-50 p-1.5 rounded-xl border border-slate-100">
            <button 
              onClick={() => setViewMode('calendar')}
              className={`p-2.5 px-4 rounded-lg flex items-center gap-2 text-[10px] font-black tracking-wider transition-all ${viewMode === 'calendar' ? 'bg-white text-[#003d3d] shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <CalendarDays size={14} /> CALENDAR
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2.5 px-4 rounded-lg flex items-center gap-2 text-[10px] font-black tracking-wider transition-all ${viewMode === 'grid' ? 'bg-white text-[#003d3d] shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={14} /> GRID LEDGER
            </button>
          </div>

          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-[#003d3d] text-white px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-[#002d2d] transition-all shadow-sm hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus size={16} strokeWidth={3} /> Create Event
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* CORE DISPLAY DECISION ENGINE */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
          <Loader2 className="animate-spin mb-4 text-[#003d3d]" size={36} />
          <p className="font-mono tracking-widest text-[10px] uppercase font-black">Syncing Schedule Matrices...</p>
        </div>
      ) : viewMode === 'calendar' ? (
        
        /* 💡 UPDATED DESIGN: FULL WIDTH EXPANSION WITH WHITE BACKGROUND CANVAS */
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm animate-in zoom-in-98 duration-300 mb-8 w-full">
          <div className="w-full text-slate-800">
            <Calendar 
              tileClassName={getTileClassName}
              className="w-full max-w-full border-none bg-white font-['Inter'] !text-slate-800"
            />
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-[#003d3d] animate-pulse"></span>
            Active System Scheduled Indicator Token
          </div>
        </div>
      ) : (
        
        /* ALTERNATE GRID CARD OVERVIEW DISPLAY MODE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-in fade-in duration-300">
          {events.map((event) => (
            <div key={event.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm relative group">
              <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-[#003d3d]">
                  <CalendarIcon size={18} />
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => openModal(event)} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"><Edit2 size={12} /></button>
                  <button onClick={() => handleDelete(event.id)} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"><Trash2 size={12} /></button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 truncate uppercase tracking-wide">{event.title}</h3>
              <p className="text-slate-500 text-xs line-clamp-3 mb-4 leading-relaxed font-['Inter']">{event.description}</p>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-black font-mono uppercase tracking-wider">
                <span className="text-[#003d3d] flex items-center gap-1"><MapPin size={12} /> {event.location}</span>
                <span className="text-slate-400">{event.event_date.split('T')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPCOMING SCHEDULE LEDGER SECTION */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="p-6 px-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xs font-black tracking-[0.2em] uppercase text-slate-400 font-mono">
            Upcoming Schedule Ledger
          </h2>
          <span className="text-[10px] font-mono font-black text-[#003d3d] bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100 uppercase">
            {events.length} Records Found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 tracking-wider uppercase bg-slate-50/20">
                <th className="p-5 px-8">Event Detail</th>
                <th className="p-5">Schedule</th>
                <th className="p-5">Location</th>
                <th className="p-5 text-right px-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
              {events.length > 0 ? (
                events.map((event) => (
                  // ✅ Fixed Key mapping assignment binds completely onto structural primary database IDs
                  <tr key={event.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-5 px-8 max-w-sm">
                      <p className="font-bold text-slate-800 uppercase tracking-wide truncate">{event.title}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 normal-case font-['Inter']">{event.description || 'No description provided.'}</p>
                    </td>
                    <td className="p-5 text-[#003d3d] font-bold whitespace-nowrap">
                      {event.event_date.split('T')[0]}
                    </td>
                    <td className="p-5 whitespace-nowrap">
                      <span className="text-[10px] font-black text-slate-600 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded">
                        {event.location.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-5 text-right px-8 whitespace-nowrap">
                      <div className="inline-flex gap-4 text-[10px] font-black tracking-wider uppercase">
                        <button 
                          onClick={() => openModal(event)} 
                          className="text-[#003d3d] hover:text-[#002d2d] transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(event.id)} 
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400 italic font-['Inter']">
                    No matching upcoming institutional listings located in active state.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL RESPONSIVE CREATION & MODIFICATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white border border-slate-100 text-slate-800 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-slate-50/50 border-b border-slate-100 p-6 px-8 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black tracking-tight uppercase font-mono text-slate-800">{editingEvent ? 'Modify Entry' : 'Create New Event'}</h2>
                <p className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest mt-0.5">OrderClick Secure Panel</p>
              </div>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-600 transition-all"><X size={16} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5 font-mono">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Event Title</label>
                <input 
                  type="text"
                  required
                  placeholder="E.G. IT CAREER FAIR 2026"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-[#003d3d] text-xs font-bold text-slate-800 uppercase placeholder:text-slate-300 transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Event Date</label>
                  <input 
                    type="date"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-[#003d3d] text-xs font-bold text-slate-800 transition-all"
                    value={formData.event_date}
                    onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Location</label>
                  <input 
                    type="text"
                    required
                    placeholder="BUILDING/ROOM"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-[#003d3d] text-xs font-bold text-slate-800 uppercase placeholder:text-slate-300 transition-all"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Description</label>
                <textarea 
                  rows={4}
                  placeholder="PROVIDE INSTITUTIONAL ACTIVITY DATA CRITERIA SUMMARY..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-[#003d3d] text-xs font-bold text-slate-800 uppercase placeholder:text-slate-300 resize-none transition-all font-['Inter'] normal-case"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-[#003d3d] hover:bg-[#002d2d] text-white font-black py-4 rounded-xl shadow-sm transition-all text-xs uppercase tracking-widest mt-2 hover:-translate-y-0.5"
              >
                {editingEvent ? 'Save Modifications' : 'Commit to Database'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvent;