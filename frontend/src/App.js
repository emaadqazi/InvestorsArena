import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './components/dashboard/Dashboard';
import Leagues from './components/pages/Leagues';
import Stocks from './components/pages/Stocks';
import Market from './components/pages/Market';
import Profile from './components/pages/Profile';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Authentication flow - redirect to login first */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Firebase authentication routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Main application pages */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leagues" element={<Leagues />} />
            <Route path="/stocks" element={<Stocks />} />
            <Route path="/market" element={<Market />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Catch all other routes and redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
