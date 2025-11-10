import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Leagues from './pages/Leagues';
import LeagueDetail from './pages/LeagueDetail';
import Portfolio from './pages/Portfolio';
import Leaderboard from './pages/Leaderboard';
import Navbar from './components/Navbar';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/leagues"
        element={
          <PrivateRoute>
            <Leagues />
          </PrivateRoute>
        }
      />
      <Route
        path="/leagues/:id"
        element={
          <PrivateRoute>
            <LeagueDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/leagues/:id/portfolio"
        element={
          <PrivateRoute>
            <Portfolio />
          </PrivateRoute>
        }
      />
      <Route
        path="/leagues/:id/leaderboard"
        element={
          <PrivateRoute>
            <Leaderboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

