import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Calendar, Phone, MapPin, Smile, Fingerprint, Edit3, Check, X } from 'lucide-react';
import axios from 'axios';

interface CustomerProfileProps {
  user: any;
  onProfileUpdate?: (updatedUser: any) => void; // Optional callback to refresh parent application state
}

const CustomerProfile = ({ user, onProfileUpdate }: CustomerProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State tracking state structures mapping back fields cleanly
  const [formData, setFormData] = useState({
    fullname: '',
    contact_number: '',
    gender: '',
    location: ''
  });

  // Keep form synchronized whenever user context loads or updates
  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.name || user.fullname || '',
        contact_number: user.contact_number || '',
        gender: user.gender || '',
        location: user.location || ''
      });
    }
  }, [user]);

  if (!user) return <div className="p-10 text-slate-400">Loading profile...</div>;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.fullname.trim()) {
      setMessage({ type: 'error', text: 'Full Name cannot be left blank.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      // Direct call targeting the unified update route parameters set up in your express backend router mapping
      const response = await axios.put(`/api/admin/customers/${user.id}`, {
        fullname: formData.fullname,
        email: user.email, // Keeping the required baseline parameter intact
        contact_number: formData.contact_number,
        gender: formData.gender,
        location: formData.location
      });

      setMessage({ type: 'success', text: 'Profile metrics saved and verified successfully!' });
      setIsEditing(false);

      if (onProfileUpdate) {
        // Bubble up structural changes back to update state frames instantly
        onProfileUpdate({
          ...user,
          fullname: formData.fullname,
          contact_number: formData.contact_number,
          gender: formData.gender,
          location: formData.location
        });
      }
    } catch (error: any) {
      console.error("Error committing profile changes:", error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update database profile context.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Dynamic Status Banner Alerts */}
      {message && (
        <div className={`mb-6 p-4 rounded-2xl border text-sm font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2 ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="opacity-50 hover:opacity-100 text-xs">✕</button>
        </div>
      )}

      {/* Profile Header */}
      <div className="relative mb-10 overflow-hidden bg-[#003d3d] rounded-[3rem] p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="h-32 w-32 rounded-[2.5rem] bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl">
              <User size={60} className="text-white" />
            </div>

            <div className="text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <h2 className="text-4xl font-black text-white tracking-tight capitalize">
                  {isEditing ? formData.fullname || 'New User Profile' : user.name || user.fullname}
                </h2>
                <span className="px-3 py-1 bg-teal-400/20 text-teal-300 border border-teal-400/30 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  {user.role || 'Customer'}
                </span>
              </div>
              <p className="text-teal-100/70 font-medium flex items-center justify-center md:justify-start gap-2 text-sm">
                <Mail size={14} /> {user.email}
              </p>
            </div>
          </div>

          {/* Action Header Button Controls */}
          <div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-3.5 bg-white text-[#003d3d] font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl hover:bg-teal-50 transition-all active:scale-95"
              >
                <Edit3 size={14} /> Edit Profile Matrix
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all disabled:opacity-50"
                >
                  <X size={14} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3.5 bg-teal-400 hover:bg-teal-300 text-[#003d3d] font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  <Check size={14} /> {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info Sidebar */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm h-fit space-y-6">
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Security & Status</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-3xl bg-green-50 border border-green-100 text-green-700">
                <Shield size={20} />
                <div>
                  <p className="text-xs font-black">Verified Account</p>
                  <p className="text-[10px] opacity-70">Your data is encrypted</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100 text-slate-600">
                <Calendar size={20} />
                <div>
                  <p className="text-xs font-black">Member Since</p>
                  <p className="text-[10px] opacity-70">
                    {user.created_at ? new Date(user.created_at).getFullYear() : '2026'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Meta Section inside Sidebar */}
          {(user.customer_id || user.id) && (
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">System Identifier</h4>
              <div className="flex items-center gap-3 p-4 rounded-3xl bg-slate-50 border border-transparent text-slate-700">
                <Fingerprint size={18} className="text-[#003d3d]" />
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Customer ID</p>
                  <p className="text-xs font-bold font-mono tracking-tight">{user.customer_id || `USR-${user.id}`}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Details View */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm">
          <div className="mb-10">
            <h4 className="textxl font-black text-slate-800">General Settings</h4>
            <p className="text-xs text-slate-400 font-bold">Your public identity and structural profile fields</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Full Name */}
            <div className="group md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Full Name</label>
              <div className="flex items-center gap-4 p-4 rounded-[1.8rem] bg-slate-50 border border-transparent focus-within:bg-white focus-within:border-teal-500/30 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm flex-shrink-0">
                  <User size={18} className="text-teal-600" />
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-none text-sm font-bold text-slate-700 focus:outline-none focus:ring-0 p-0"
                    placeholder="Enter your complete name"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-700">{user.name || user.fullname}</p>
                )}
              </div>
            </div>

            {/* Email Address (Always Disabled / Read Only for Identity Integrity) */}
            <div className="group md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Email Address (Immutable)</label>
              <div className="flex items-center gap-4 p-4 rounded-[1.8rem] bg-slate-100/70 border border-transparent transition-all opacity-80">
                <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm flex-shrink-0">
                  <Mail size={18} className="text-slate-400" />
                </div>
                <p className="text-sm font-bold text-slate-500 cursor-not-allowed">{user.email}</p>
              </div>
            </div>

            {/* Contact Number */}
            <div className="group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Contact Number</label>
              <div className="flex items-center gap-4 p-4 rounded-[1.8rem] bg-slate-50 border border-transparent focus-within:bg-white focus-within:border-teal-500/30 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm flex-shrink-0">
                  <Phone size={18} className="text-teal-600" />
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-none text-sm font-bold text-slate-700 focus:outline-none focus:ring-0 p-0"
                    placeholder="Provide contact number"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-700">{user.contact_number || 'Not Provided'}</p>
                )}
              </div>
            </div>

            {/* Gender Selection Dropdown */}
            <div className="group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Gender Identification</label>
              <div className="flex items-center gap-4 p-4 rounded-[1.8rem] bg-slate-50 border border-transparent focus-within:bg-white focus-within:border-teal-500/30 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm flex-shrink-0">
                  <Smile size={18} className="text-teal-600" />
                </div>
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-none text-sm font-bold text-slate-700 focus:outline-none focus:ring-0 p-0 cursor-pointer appearance-none"
                  >
                    <option value="">Not Specified</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-sm font-bold text-slate-700">{user.gender || 'Not Specified'}</p>
                )}
              </div>
            </div>

            {/* Location / Address */}
            <div className="group md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Location / Physical Address</label>
              <div className="flex items-center gap-4 p-4 rounded-[1.8rem] bg-slate-50 border border-transparent focus-within:bg-white focus-within:border-teal-500/30 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm flex-shrink-0">
                  <MapPin size={18} className="text-teal-600" />
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-none text-sm font-bold text-slate-700 focus:outline-none focus:ring-0 p-0"
                    placeholder="Enter city or dynamic address info"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-700">{user.location || 'No Location Set'}</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;