import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Layout } from './components/Layout';
import { Budgets } from './pages/Budgets';
import { Goals } from './pages/Goals';
import { Settings } from './pages/Settings';
import './App.css';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginForm />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterForm />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><Layout><Transactions /></Layout></ProtectedRoute>} />
      <Route path="/budgets" element={<ProtectedRoute><Layout><Budgets /></Layout></ProtectedRoute>} />
      <Route path="/goals" element={<ProtectedRoute><Layout><Goals /></Layout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <Router>
          <div className="App">
            <AppRoutes />
            <Toaster position="top-right" />
          </div>
        </Router>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;