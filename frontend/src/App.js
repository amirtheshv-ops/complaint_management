<<<<<<< HEAD
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
=======
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import './App.css';

import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AddComplaint from './components/AddComplaint';
import AdminDashboard from './components/AdminDashboard';
import ComplaintMap from './components/ComplaintMap';

/* ---------------------------------------------------------------
   Protected Route – redirects to login if not authenticated
--------------------------------------------------------------- */
const ProtectedRoute = ({ currentUser, children, adminOnly = false }) => {
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (adminOnly && !currentUser.is_staff) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/* ---------------------------------------------------------------
   Layout – wraps protected pages with the Navbar
--------------------------------------------------------------- */
const AppLayout = ({ currentUser, onLogout, children }) => (
  <>
    <Navbar currentUser={currentUser} onLogout={onLogout} />
    <div className="page-wrapper">
      <div className="container">
        {children}
      </div>
    </div>
  </>
);

/* ---------------------------------------------------------------
   App Root
--------------------------------------------------------------- */
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // On mount – try to restore session from the server
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/user/', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setCurrentUser(data.user);
          }
        }
      } catch (_) {
        // backend might not be running yet; proceed unauthenticated
      } finally {
        setAuthChecked(true);
      }
    };

    restoreSession();
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Don't flash the login page before session check is done
  if (!authChecked) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: '100vh' }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
          <p className="text-muted small fw-600">Loading GeoTag…</p>
        </div>
>>>>>>> kaaviya
      </div>
    );
  }

  return (
<<<<<<< HEAD
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
=======
    <Router>
      <div className="App">
        <Routes>
          {/* ── Public routes ──────────────────────────────── */}
          <Route
            path="/"
            element={
              currentUser ? (
                <Navigate
                  to={currentUser.is_staff ? '/admin-dashboard' : '/dashboard'}
                  replace
                />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
              )
            }
          />
          <Route
            path="/register"
            element={
              currentUser ? (
                <Navigate
                  to={currentUser.is_staff ? '/admin-dashboard' : '/dashboard'}
                  replace
                />
              ) : (
                <Register />
              )
            }
          />

          {/* ── Citizen routes ─────────────────────────────── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute currentUser={currentUser}>
                <AppLayout currentUser={currentUser} onLogout={handleLogout}>
                  <Dashboard currentUser={currentUser} />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-complaint"
            element={
              <ProtectedRoute currentUser={currentUser}>
                <AppLayout currentUser={currentUser} onLogout={handleLogout}>
                  <AddComplaint />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* ── Admin routes ───────────────────────────────── */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute currentUser={currentUser} adminOnly>
                <AppLayout currentUser={currentUser} onLogout={handleLogout}>
                  <AdminDashboard currentUser={currentUser} />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* ── Shared routes ──────────────────────────────── */}
          <Route
            path="/map"
            element={
              <ProtectedRoute currentUser={currentUser}>
                <AppLayout currentUser={currentUser} onLogout={handleLogout}>
                  <ComplaintMap currentUser={currentUser} />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* ── Catch-all ──────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
>>>>>>> kaaviya
  );
}

export default App;
