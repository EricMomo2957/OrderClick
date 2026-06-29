import React from 'react';
import { User, Mail, Shield, Calendar, Phone, MapPin, Smile, Fingerprint, AlertCircle } from 'lucide-react';

interface CustomerProfileProps {
  user: any;
}

const CustomerProfile = ({ user }: CustomerProfileProps) => {
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
                {user.fullname || user.name || 'No Name Set'}
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
                  <p className="text-[10px] opacity-70">2026</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Meta Section inside Sidebar */}
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">System Identifier</h4>
            <div className="flex items-center gap-3 p-4 rounded-3xl bg-slate-50 border border-transparent text-slate-700">
              <Fingerprint size={18} className="text-[#003d3d]" />
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Customer ID</p>
                <p className="text-xs font-bold font-mono tracking-tight">{user.customer_id || 'Not Specified'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details View */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-10">
              <h4 className="text-xl font-black text-slate-800">General Settings</h4>
              <p className="text-xs text-slate-400 font-bold">Your public identity and structural profile parameters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Full Name */}
              <div className="group md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Full Name</label>
                <div className="flex items-center gap-4 p-4 rounded-[1.8rem] bg-slate-50 border border-transparent transition-all">
                  <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                    <User size={18} className="text-teal-600" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">{user.fullname || user.name || 'Not Set'}</p>
                </div>
              </div>

              {/* Email Address */}
              <div className="group md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Email Address</label>
                <div className="flex items-center gap-4 p-4 rounded-[1.8rem] bg-slate-50 border border-transparent transition-all">
                  <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                    <Mail size={18} className="text-teal-600" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">{user.email}</p>
                </div>
              </div>

              {/* Contact Number */}
              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Contact Number</label>
                <div className="flex items-center gap-4 p-4 rounded-[1.8rem] bg-slate-50 border border-transparent transition-all">
                  <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                    <Phone size={18} className="text-teal-600" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">{user.contact_number || 'Not Provided'}</p>
                </div>
              </div>

              {/* Gender Identification */}
              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Gender Identification</label>
                <div className="flex items-center gap-4 p-4 rounded-[1.8rem] bg-slate-50 border border-transparent transition-all">
                  <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                    <Smile size={18} className="text-teal-600" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 capitalize">{user.gender || 'Not Specified'}</p>
                </div>
              </div>

              {/* Location / Physical Address */}
              <div className="group md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Location / Physical Address</label>
                <div className="flex items-center gap-4 p-4 rounded-[1.8rem] bg-slate-50 border border-transparent transition-all">
                  <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                    <MapPin size={18} className="text-teal-600" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 capitalize">{user.location || 'No Location Set'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* NEW: Information Access Notification Footer */}
          <div className="mt-10 flex items-start gap-3 p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-amber-800">
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-wider">Profile Modification Restriction</p>
              <p className="text-[11px] leading-relaxed text-amber-700/90 font-medium">
                To maintain database integrity and system security, structural profile fields are read-only. 
                If you need to update your identity details, contact information, or access permissions, 
                please submit a request to the system administrator.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;