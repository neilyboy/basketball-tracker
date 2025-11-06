import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicView from './components/PublicView';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/check');
      const data = await response.json();
      setIsAdmin(data.isAdmin);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicView />} />
        <Route 
          path="/admin/login" 
          element={isAdmin ? <Navigate to="/admin" /> : <AdminLogin onLogin={() => setIsAdmin(true)} />} 
        />
        <Route 
          path="/admin" 
          element={isAdmin ? <AdminDashboard onLogout={() => setIsAdmin(false)} /> : <Navigate to="/admin/login" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
