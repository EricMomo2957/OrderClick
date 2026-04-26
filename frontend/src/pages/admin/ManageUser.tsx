import { useState, useEffect } from 'react';
import { User, Mail, Calendar, RefreshCw } from 'lucide-react';

interface Customer {
  id: number;
  fullname: string; // Updated from 'name' to 'fullname' to match your DB
  email: string;
  created_at: string;
}

const ManageUser = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/customers');
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800">User Directory</h2>
          <p className="text-slate-500 text-sm">Manage and view all registered customer accounts.</p>
        </div>
        <button 
          onClick={fetchCustomers}
          className="flex items-center gap-2 text-xs font-bold text-[#003d3d] bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-all"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh List
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Name</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {customers.length > 0 ? (
              customers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 font-mono text-xs text-slate-400">#USR-{user.id}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#003d3d]/10 flex items-center justify-center text-[#003d3d]">
                        <User size={14} />
                      </div>
                      <span className="font-bold text-slate-800">{user.fullname}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail size={14} className="text-slate-400" />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Calendar size={14} />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-slate-400 italic">
                  {loading ? 'Fetching users...' : 'No customers found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUser;