// frontend/src/App.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import Landing from './pages/Landing'; 
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword'; 
import OrderNow from './pages/OrderNow'; 
import AdminDashboard from './pages/admin/AdminDashboard'; 
import CustomerDashboard from './pages/customer/CustomerDashboard'; 

function App() {
  const [view, setView] = useState('landing');
  const [loading, setLoading] = useState(true); // Added loading flag for initial verification profile sync
  
  // Initialize baseline user metadata safely from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  // --- NEW: SYNC ENGINE FOR FETCHING EXTENDED METADATA PROFILE ---
  useEffect(() => {
    const verifyAndFetchProfile = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Automatically inject Bearer Authorization mapping
        const response = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data && response.data.user) {
          // Commit full descriptive dataset into app state and storage
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      } catch (err: any) {
        console.error("Profile synchronization checkpoint failed:", err);
        // If token expires or account is disabled, cleanly flush session state
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    verifyAndFetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setView('landing'); 
    window.location.reload(); 
  };

  // Prevent flash layout jumps before initialization network resolves
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#003d3d] flex items-center justify-center">
        <div className="text-white text-sm font-black uppercase tracking-widest animate-pulse">
          Synchronizing Security Layer...
        </div>
      </div>
    );
  }

  // 2. Authenticated Routing
  if (user) {
    return user.role === 'admin' 
      ? <AdminDashboard onLogout={handleLogout} /> 
      : <CustomerDashboard user={user} onLogout={handleLogout} />; // FIXED: Passed the live user state prop here!
  }

  // 3. Unauthenticated Routing
  return (
    <div className="w-full min-h-screen bg-white">
      {view === 'landing' && <Landing setView={setView} />}
      {view === 'login' && <Login setView={setView} setUser={setUser} />}
      {view === 'register' && <Register setView={setView} />}
      {view === 'forgot-password' && <ForgotPassword setView={setView} />}
      {view === 'orderNow' && <OrderNow setView={setView} />}
    </div>
  );
}

export default App;