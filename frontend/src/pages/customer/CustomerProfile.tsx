import React, { useState } from 'react';
import { User, Mail, Shield, Calendar, Edit2, Package, Star, CreditCard, Check, X } from 'lucide-react';

interface CustomerProfileProps {
  user: {
    id: number;
    name?: string;
    fullname?: string;
    email: string;
    role: string;
    created_at?: string;
  } | null;
}

const CustomerProfile = ({ user }: CustomerProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullname: user?.fullname || user?.name || '',
    email: user?.email || ''
  });

  if (!user) return (
    <div className="p-8 text-teal-900/50 animate-pulse font-bold flex items-center gap-3">
      <div className="h-4 w-4 bg-teal-500 rounded-full animate-bounce" />
      Syncing profile data...
    </div>
  );

  const handleSave = () => {
    // Logic to call your backend API goes here
    console.log("Saving data:", formData);
    setIsEditing(false);
  };

  const displayName = user.fullname || user.name || 'Valued Customer';

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Hero Section */}
      <div className="relative mb-10 overflow-hidden bg-[#003d3d] rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-teal-900/20">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group cursor-pointer" onClick={() => setIsEditing(true)}>
            <div className="h-32 w-32 rounded-[2.5rem] bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl transition-transform duration-500 group-hover:scale-105">
              <User size={60} className="text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-teal-400 p-2.5 rounded-2xl border-4 border-[#003d3d] shadow-lg">
              <Edit2 size={16} className="text-[#003d3d]" />
            </div>
          </div>

          <div className="text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <h2 className="text-4xl font-black text-white tracking-tight capitalize">
                {isEditing ? formData.fullname : displayName}
              </h2>
              <span className="px-3 py-1 bg-teal-400/20 backdrop-blur-md text-teal-300 border border-teal-400/30 rounded-lg text-[10px] font-black uppercase tracking-[0.2em]">
                {user.role}
              </span>
            </div>
            <p className="text-teal-100/70 font-medium flex items-center justify-center md:justify-start gap-2 text-sm">
              <Mail size={14} /> {isEditing ? formData.email : user.email}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-[#003d3d]">
        {/* Left Column: Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Status</h4>
            <div className="flex items-center gap-4 p-4 rounded-3xl bg-teal-50/50 border border-teal-100">
               <Shield className="text-teal-600" size={24} />
               <div>
                  <p className="text-xs font-black">Account Verified</p>
                  <p className="text-[10px] text-teal-600/70 font-bold uppercase">Secured via SSL</p>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Form/View */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 min-h-[400px]">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h4 className="text-xl font-black">{isEditing ? "Edit Profile" : "General Settings"}</h4>
                <p className="text-xs text-slate-400 font-bold">
                  {isEditing ? "Update your personal details below" : "Information associated with your account"}
                </p>
              </div>
              
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-[#003d3d] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-800 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                >
                  <Edit2 size={14} /> Update Info
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="bg-slate-100 text-slate-500 p-3 rounded-2xl hover:bg-slate-200 transition-all"
                  >
                    <X size={18} />
                  </button>
                  <button 
                    onClick={handleSave}
                    className="bg-teal-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-600 transition-all shadow-lg flex items-center gap-2"
                  >
                    <Check size={14} /> Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-5">
              {/* Full Name Field */}
              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Full Name</label>
                <div className={`flex items-center gap-4 p-2 rounded-[1.8rem] transition-all border ${isEditing ? 'bg-white border-teal-200 ring-4 ring-teal-50' : 'bg-slate-50 border-transparent'}`}>
                  <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                    <User size={18} className="text-teal-600" />
                  </div>
                  {isEditing ? (
                    <input 
                      type="text"
                      className="bg-transparent border-none focus:ring-0 w-full font-bold text-sm"
                      value={formData.fullname}
                      onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm font-bold">{displayName}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Email Address</label>
                <div className={`flex items-center gap-4 p-2 rounded-[1.8rem] transition-all border ${isEditing ? 'bg-white border-teal-200 ring-4 ring-teal-50' : 'bg-slate-50 border-transparent'}`}>
                  <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                    <Mail size={18} className="text-teal-600" />
                  </div>
                  {isEditing ? (
                    <input 
                      type="email"
                      className="bg-transparent border-none focus:ring-0 w-full font-bold text-sm"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm font-bold">{user.email}</p>
                  )}
                </div>
              </div>

              {/* Static Info: Member Since */}
              {!isEditing && (
                <div className="flex items-center gap-4 p-2 rounded-[1.8rem] bg-slate-50 border border-transparent">
                  <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                    <Calendar size={18} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Since</p>
                    <p className="text-sm font-bold">2026</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;