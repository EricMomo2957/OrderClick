import React from 'react';
import { User, Mail, Shield, Calendar, Edit2 } from 'lucide-react';

interface CustomerProfileProps {
  user: {
    id: number;
    name?: string;      // Matches the 'name' sent by your Login Controller
    fullname?: string;  // Fallback for different data sources
    email: string;
    role: string;
    created_at?: string; // Optional as it might not be in the JWT payload
  } | null;
}

const CustomerProfile = ({ user }: CustomerProfileProps) => {
  // Safety check if user session is null
  if (!user) return (
    <div className="p-8 text-teal-900/50 animate-pulse font-bold">
      Loading profile session...
    </div>
  );

  // Determine the display name (prefers name from controller, falls back to fullname)
  const displayName = user.name || user.fullname || 'Valued Customer';

  return (
    <div className="p-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h2 className="text-3xl font-black text-[#003d3d] tracking-tight">
          Account <span className="text-slate-400">Settings</span>
        </h2>
        <p className="text-teal-900/60 font-medium">Manage your personal information and security preferences.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-teal-900/5 border border-slate-100 flex flex-col items-center text-center">
          <div className="h-28 w-28 rounded-[2rem] bg-teal-50 flex items-center justify-center mb-6 border-2 border-teal-100/50 shadow-inner">
            <User size={48} className="text-[#003d3d]" />
          </div>
          <h3 className="text-xl font-black text-[#003d3d] capitalize leading-tight">
            {displayName}
          </h3>
          <span className="px-4 py-1.5 bg-[#003d3d] text-white rounded-full text-[10px] font-black uppercase tracking-widest mt-4 shadow-md">
            {user.role}
          </span>
          <p className="mt-6 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
            User ID: #00{user.id}
          </p>
        </div>

        {/* Details Form/View */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-teal-900/5 border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-lg font-black text-[#003d3d]">Personal Information</h4>
              <button className="flex items-center gap-2 text-xs font-black text-teal-600 hover:bg-teal-50 px-4 py-2 rounded-xl transition-all border border-transparent hover:border-teal-100">
                <Edit2 size={14} /> EDIT PROFILE
              </button>
            </div>

            <div className="space-y-4">
              {/* Email Field */}
              <div className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 hover:border-teal-200 transition-colors group">
                <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Mail size={20} className="text-teal-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                  <p className="text-sm font-bold text-[#003d3d]">{user.email}</p>
                </div>
              </div>

              {/* Joined Date Field */}
              <div className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 hover:border-teal-200 transition-colors group">
                <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Calendar size={20} className="text-teal-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Created</p>
                  <p className="text-sm font-bold text-[#003d3d]">
                    {user.created_at 
                      ? new Date(user.created_at).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })
                      : "Member since 2026" // Fallback if timestamp isn't in session
                    }
                  </p>
                </div>
              </div>

              {/* Security Field */}
              <div className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 hover:border-teal-200 transition-colors group">
                <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Shield size={20} className="text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Security</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-[#003d3d]">Password Protected</p>
                    <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-md">ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;