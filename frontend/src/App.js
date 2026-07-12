import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddComplaint from './pages/AddComplaint';
import AdminDashboard from './pages/AdminDashboard';
import LeafletMap from './components/LeafletMap';

export const API_BASE = 'http://' + window.location.hostname + ':8000';
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check login status on app load
  useEffect(() => {
    fetch(`${API_BASE}/api/user/`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error checking user status:', err);
        setLoading(false);
      });
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
  };

  const logoutUser = () => {
    fetch(`${API_BASE}/api/logout/`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(() => {
        setUser(null);
      })
      .catch((err) => console.error('Error logging out:', err));
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0a0b10',
        color: '#94a3b8',
        fontSize: '1.2rem',
        fontWeight: '600'
      }}>
        <div className="animated-fade">Loading GeoTag System...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      <Router>
        <div className="app-container">
          <Navbar />
          <Routes>
            <Route
              path="/"
              element={
                user ? (
                  user.is_staff ? (
                    <Navigate to="/admin-dashboard" replace />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/login"
              element={user ? <Navigate to="/" replace /> : <Login />}
            />
            <Route
              path="/register"
              element={user ? <Navigate to="/" replace /> : <Register />}
            />
            <Route
              path="/dashboard"
              element={
                user ? (
                  user.is_staff ? (
                    <Navigate to="/admin-dashboard" replace />
                  ) : (
                    <Dashboard />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/add-complaint"
              element={
                user ? (
                  user.is_staff ? (
                    <Navigate to="/admin-dashboard" replace />
                  ) : (
                    <AddComplaint />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                user ? (
                  user.is_staff ? (
                    <AdminDashboard />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/map"
              element={
                <div className="content-wrap animated-fade">
                  <h2 style={{ marginBottom: '24px' }}>Public Complaints Map</h2>
                  <LeafletMap isPublic={true} />
                </div>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
