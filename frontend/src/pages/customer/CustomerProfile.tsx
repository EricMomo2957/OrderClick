import React from 'react';
import { User, Mail, Shield, Calendar, Edit2 } from 'lucide-react';

interface CustomerProfileProps {
  user: {
    id: number;
    fullname: string;
    email: string;
    role: string;
    created_at: string;
  } | null;
}

const CustomerProfile = ({ user }: CustomerProfileProps) => {
  if (!user) return <div className="p-8 text-teal-900/50">Loading profile...</div>;

  return (
    <div className="p-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-[#003d3d] tracking-tight">Account Settings</h2>
        <p className="text-teal-900/60">Manage your personal information and security preferences.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1 bg-white rounded-[2rem] p-8 shadow-xl shadow-teal-900/5 border border-teal-50 flex flex-col items-center text-center">
          <div className="h-24 w-24 rounded-3xl bg-teal-50 flex items-center justify-center mb-4 border-2 border-teal-100/50">
            <User size={40} className="text-[#003d3d]" />
          </div>
          <h3 className="text-xl font-bold text-[#003d3d] capitalize">{user.fullname}</h3>
          <span className="px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-[10px] font-black uppercase tracking-widest mt-2">
            {user.role}
          </span>
        </div>

        {/* Details Form/View */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-teal-900/5 border border-teal-50">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-lg font-bold text-[#003d3d]">Personal Information</h4>
              <button className="flex items-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors">
                <Edit2 size={16} /> Edit
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-teal-50/30 border border-teal-50/50">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <Mail size={18} className="text-teal-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-teal-900/30 uppercase tracking-widest">Email Address</p>
                  <p className="text-sm font-bold text-[#003d3d]">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-teal-50/30 border border-teal-50/50">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <Calendar size={18} className="text-teal-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-teal-900/30 uppercase tracking-widest">Joined Date</p>
                  <p className="text-sm font-bold text-[#003d3d]">
                    {new Date(user.created_at).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-teal-50/30 border border-teal-50/50">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <Shield size={18} className="text-teal-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-teal-900/30 uppercase tracking-widest">Account Security</p>
                  <p className="text-sm font-bold text-[#003d3d]">Password Protected</p>
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