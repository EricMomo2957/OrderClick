import { useState } from 'react';
import Landing from './pages/Landing'; 
import Login from './pages/Login';
import Register from './pages/Register';
import OrderNow from './pages/OrderNow'; // Import the new OrderNow page
import AdminDashboard from './pages/admin/AdminDashboard'; 
import CustomerDashboard from './pages/customer/CustomerDashboard'; 

function App() {
  // 1. Set initial view to 'landing'
  const [view, setView] = useState('landing');
  
  // Initialize user state from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setView('landing'); // Redirect back to landing on logout
    window.location.reload(); 
  };

  // 2. Authenticated Routing
  // If user is logged in, show their respective dashboard
  if (user) {
    return user.role === 'admin' 
      ? <AdminDashboard onLogout={handleLogout} /> 
      : <CustomerDashboard onLogout={handleLogout} />;
  }

  // 3. Unauthenticated Routing (Landing, Login, Register, or OrderNow)
  return (
    <div className="w-full min-h-screen bg-white">
      {view === 'landing' && (
        <Landing setView={setView} />
      )}
      
      {view === 'login' && (
        <Login setView={setView} setUser={setUser} />
      )}
      
      {view === 'register' && (
        <Register setView={setView} />
      )}

      {/* Added OrderNow view logic here */}
      {view === 'orderNow' && (
        <OrderNow setView={setView} />
      )}
    </div>
  );
}

export default App;