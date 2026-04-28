import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Calendar, Edit2, Check, X, Loader2 } from 'lucide-react';

interface CustomerProfileProps {
  user: any;
  onUpdate: (updatedUser: any) => void;
}

const CustomerProfile = ({ user, onUpdate }: CustomerProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullname: user?.name || user?.fullname || '',
    email: user?.email || ''
  });

  // Keep form in sync if user prop changes externally
  useEffect(() => {
    setFormData({
      fullname: user?.name || user?.fullname || '',
      email: user?.email || ''
    });
  }, [user]);

  const handleSave = async () => {
    if (!formData.fullname || !formData.email) {
      alert("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          id: user.id,
          fullname: formData.fullname,
          email: formData.email
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Sync with Dashboard and LocalStorage
        onUpdate(data.user); 
        
        if (data.token) localStorage.setItem('token', data.token);
        
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert(data.error || "Update failed");
      }
    } catch (error) {
      console.error("Update Error:", error);
      alert("Could not connect to the server. Please check if your backend is running on port 5000.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return <div className="p-10 text-slate-400">Loading profile...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Profile Header */}
      <div className="relative mb-10 overflow-hidden bg-[#003d3d] rounded-[3rem] p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="h-32 w-32 rounded-[2.5rem] bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl">
            <User size={60} className="text-white" />
          </div>

          <div className="text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <h2 className="text-4xl font-black text-white tracking-tight capitalize">
                {isEditing ? formData.fullname : (user.name || user.fullname)}
              </h2>
              <span className="px-3 py-1 bg-teal-400/20 text-teal-300 border border-teal-400/30 rounded-lg text-[10px] font-black uppercase tracking-widest">
                {user.role || 'Customer'}
              </span>
            </div>
            <p className="text-teal-100/70 font-medium flex items-center justify-center md:justify-start gap-2 text-sm">
              <Mail size={14} /> {isEditing ? formData.email : user.email}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info Sidebar */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm h-fit">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Security & Status</h4>
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
                <p className="text-[10px] opacity-70">2026</p>
              </div>
            </div>
          </div>
        </div>

        {/* Update Form */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h4 className="text-xl font-black text-slate-800">{isEditing ? "Edit Profile" : "General Settings"}</h4>
              <p className="text-xs text-slate-400 font-bold">Update your public identity and account email</p>
            </div>
            
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-[#003d3d] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-teal-800 transition-all shadow-lg flex items-center gap-2"
              >
                <Edit2 size={14} /> Update Info
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  disabled={isLoading}
                  onClick={() => setIsEditing(false)}
                  className="bg-slate-100 text-slate-500 p-3 rounded-2xl hover:bg-slate-200"
                >
                  <X size={18} />
                </button>
                <button 
                  disabled={isLoading}
                  onClick={handleSave}
                  className="bg-teal-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-teal-600 shadow-lg flex items-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                  Save Changes
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Full Name</label>
              <div className={`flex items-center gap-4 p-2 rounded-[1.8rem] transition-all border ${isEditing ? 'bg-white border-teal-200 ring-4 ring-teal-50' : 'bg-slate-50 border-transparent'}`}>
                <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                  <User size={18} className="text-teal-600" />
                </div>
                {isEditing ? (
                  <input 
                    type="text"
                    className="bg-transparent border-none focus:ring-0 w-full font-bold text-sm text-[#003d3d]"
                    value={formData.fullname}
                    onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-700">{user.name || user.fullname}</p>
                )}
              </div>
            </div>

            <div className="group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Email Address</label>
              <div className={`flex items-center gap-4 p-2 rounded-[1.8rem] transition-all border ${isEditing ? 'bg-white border-teal-200 ring-4 ring-teal-50' : 'bg-slate-50 border-transparent'}`}>
                <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                  <Mail size={18} className="text-teal-600" />
                </div>
                {isEditing ? (
                  <input 
                    type="email"
                    className="bg-transparent border-none focus:ring-0 w-full font-bold text-sm text-[#003d3d]"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-700">{user.email}</p>
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