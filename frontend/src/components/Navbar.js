<<<<<<< HEAD
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { MapPin, LogOut, PlusCircle, LayoutDashboard, Map as MapIcon, LogIn, UserPlus } from 'lucide-react';

function Navbar() {
  const { user, logoutUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
=======
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('http://localhost:8000/api/logout/', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (_) {
      // ignore network errors
    }
    onLogout();
    navigate('/');
    setLoggingOut(false);
>>>>>>> kaaviya
  };

  const isActive = (path) => location.pathname === path;

<<<<<<< HEAD
  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        <MapPin size={28} color="#6366f1" style={{ fill: 'rgba(99, 102, 241, 0.2)' }} />
        <span className="gradient-text">GeoTag</span>
      </Link>

      <div className="nav-links">
        {user ? (
          <>
            {user.is_staff ? (
              <Link 
                to="/admin-dashboard" 
                className={`nav-link ${isActive('/admin-dashboard') ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <LayoutDashboard size={18} />
                Admin Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <LayoutDashboard size={18} />
                  My Dashboard
                </Link>
                <Link 
                  to="/add-complaint" 
                  className={`nav-link ${isActive('/add-complaint') ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <PlusCircle size={18} />
                  Report Issue
                </Link>
              </>
            )}
            <Link 
              to="/map" 
              className={`nav-link ${isActive('/map') ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <MapIcon size={18} />
              Public Map
            </Link>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className={`nav-link ${isActive('/login') ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogIn size={18} />
              Login
            </Link>
            <Link 
              to="/register" 
              className={`nav-link ${isActive('/register') ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <UserPlus size={18} />
              Register
            </Link>
            <Link 
              to="/map" 
              className={`nav-link ${isActive('/map') ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <MapIcon size={18} />
              Map
            </Link>
          </>
        )}
      </div>

      {user && (
        <div className="nav-user">
          <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
            Logged in as <strong style={{ color: '#f8fafc' }}>{user.username}</strong>
            {user.is_staff && <span style={{ marginLeft: '6px', fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(168, 85, 247, 0.2)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#c084fc', borderRadius: '4px', fontWeight: 'bold' }}>Admin</span>}
          </span>
          <button 
            onClick={handleLogout} 
            className="btn btn-secondary" 
            style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
=======
  const isAdmin = currentUser && currentUser.is_staff;

  if (!currentUser) return null;

  return (
    <nav className="geotag-navbar navbar navbar-expand-lg">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand" to={isAdmin ? '/admin-dashboard' : '/dashboard'}>
          <span className="brand-icon">
            <i className="bi bi-geo-alt-fill"></i>
          </span>
          GeoTag
        </Link>

        {/* Mobile toggle */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          <i className={`bi ${menuOpen ? 'bi-x-lg' : 'bi-list'} fs-5 text-secondary`}></i>
        </button>

        {/* Nav Links */}
        <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav ms-auto align-items-lg-center gap-1 mt-3 mt-lg-0">
            {isAdmin ? (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive('/admin-dashboard') ? 'active' : ''}`}
                    to="/admin-dashboard"
                    onClick={() => setMenuOpen(false)}
                  >
                    <i className="bi bi-speedometer2 me-1"></i>Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive('/map') ? 'active' : ''}`}
                    to="/map"
                    onClick={() => setMenuOpen(false)}
                  >
                    <i className="bi bi-map-fill me-1"></i>Complaint Map
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                  >
                    <i className="bi bi-house-fill me-1"></i>Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive('/add-complaint') ? 'active' : ''}`}
                    to="/add-complaint"
                    onClick={() => setMenuOpen(false)}
                  >
                    <i className="bi bi-plus-circle-fill me-1"></i>Lodge Complaint
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive('/map') ? 'active' : ''}`}
                    to="/map"
                    onClick={() => setMenuOpen(false)}
                  >
                    <i className="bi bi-map-fill me-1"></i>Map
                  </Link>
                </li>
              </>
            )}

            {/* Divider */}
            <li className="nav-item d-none d-lg-block">
              <span className="text-secondary" style={{ fontSize: 18, opacity: 0.2 }}>|</span>
            </li>

            {/* User Badge */}
            <li className="nav-item">
              <span className="nav-user-badge">
                <i className={`bi ${isAdmin ? 'bi-shield-fill-check' : 'bi-person-fill'}`}></i>
                {currentUser.username}
                {isAdmin && (
                  <span
                    style={{
                      fontSize: 10,
                      background: '#4f46e5',
                      color: '#fff',
                      borderRadius: 4,
                      padding: '1px 5px',
                      fontWeight: 700,
                      letterSpacing: 0.3,
                      marginLeft: 2,
                    }}
                  >
                    ADMIN
                  </span>
                )}
              </span>
            </li>

            {/* Logout */}
            <li className="nav-item ms-1">
              <button
                className="btn-logout"
                onClick={handleLogout}
                disabled={loggingOut}
                id="logout-btn"
              >
                {loggingOut ? (
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-right me-1"></i>Sign Out
                  </>
                )}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
>>>>>>> kaaviya

export default Navbar;
