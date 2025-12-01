import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import BuyerDashboard from './components/BuyerDashboard';
import SellerDashboard from './components/SellerDashboard';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role: string }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  
  if (!user) return <Navigate to="/login" />;
  
  if (user.role !== role) {
    // Redirect to their correct dashboard if they try to access wrong one
    if (user.role === 'ADMIN') return <Navigate to="/admin" />;
    if (user.role === 'SELLER') return <Navigate to="/seller" />;
    return <Navigate to="/buyer" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/buyer" element={
            <ProtectedRoute role="BUYER">
              <BuyerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/seller" element={
            <ProtectedRoute role="SELLER">
              <SellerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

