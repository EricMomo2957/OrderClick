import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard'; 
// Verify this file exists in src/pages/customer/
import CustomerDashboard from './pages/customer/CustomerDashboard'; 

function App() {
  const [view, setView] = useState('login');
  
  // Initialize state directly to avoid "cascading renders" error
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setView('login');
    window.location.reload(); 
  };

  // Role-based routing using your DB 'role' column
  if (user) {
    return user.role === 'admin' 
      ? <AdminDashboard onLogout={handleLogout} /> 
      : <CustomerDashboard onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen">
      {view === 'login' ? (
        <Login setView={setView} setUser={setUser} />
      ) : (
        <Register setView={setView} />
      )}
    </div>
  );
}

export default App;