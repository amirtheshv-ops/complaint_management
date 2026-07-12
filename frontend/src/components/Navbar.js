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
  };

  const isActive = (path) => location.pathname === path;

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

export default Navbar;
