import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [portal, setPortal] = useState('citizen'); // 'citizen' | 'admin'
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        const user = data.user;

        if (portal === 'admin' && !user.is_staff) {
          setError('This account does not have administrator privileges.');
          setLoading(false);
          return;
        }

        onLoginSuccess(user);
        navigate(user.is_staff ? '/admin-dashboard' : '/dashboard');
      } else {
        setError(data.error || 'Invalid username or password.');
      }
    } catch {
      setError('Connection to the server failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div
        className="animate-scale"
        style={{ width: '100%', maxWidth: 420 }}
      >
        {/* Brand header */}
        <div className="text-center mb-4">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(99, 102, 241, 0.08)',
              borderRadius: 14,
              padding: '10px 20px',
              border: '1px solid rgba(99, 102, 241, 0.15)',
              color: 'var(--primary)',
            }}
          >
            <i className="bi bi-geo-alt-fill text-primary-brand" style={{ fontSize: 24 }}></i>
            <span style={{ fontWeight: 800, fontSize: 24, letterSpacing: -0.5, color: '#6366f1' }}>GeoTag</span>
          </div>
          <h2 className="mt-3" style={{ fontWeight: 800, fontSize: '1.5rem', color: '#1e1b4b', letterSpacing: -0.5 }}>
            Citizen Portal
          </h2>
          <p className="text-muted small" style={{ maxWidth: 320, margin: '6px auto 0' }}>
            Empowering Citizens. Improving Communities.
          </p>
        </div>

        <div className="auth-card card">
            {/* Portal tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
              <button
                type="button"
                className={`auth-tab-btn ${portal === 'citizen' ? 'active' : ''}`}
                onClick={() => { setPortal('citizen'); setError(''); }}
                id="tab-citizen"
              >
                <i className="bi bi-person-fill me-2"></i>Citizen
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${portal === 'admin' ? 'active' : ''}`}
                onClick={() => { setPortal('admin'); setError(''); }}
                id="tab-admin"
              >
                <i className="bi bi-shield-lock-fill me-2"></i>Administrator
              </button>
            </div>

            <div style={{ padding: '2rem 1.75rem' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '1.5rem', color: '#1e1b4b' }}>
                {portal === 'citizen' ? 'Citizen Sign In' : 'Administrator Sign In'}
              </h3>

              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
                  <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} id="login-form">
                {/* Username */}
                <div className="mb-3">
                  <label className="form-label">USERNAME</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-person"></i>
                    </span>
                    <input
                      id="login-username"
                      type="text"
                      className="form-control"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading}
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label className="form-label">PASSWORD</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      autoComplete="current-password"
                      required
                      style={{ borderRight: 'none' }}
                    />
                    <button
                      type="button"
                      className="input-group-text"
                      style={{ cursor: 'pointer', background: '#f5f6fa', border: '1.5px solid #e2e8f0', borderLeft: 'none' }}
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <button
                  id="login-submit"
                  type="submit"
                  className="btn btn-primary w-100 py-2"
                  disabled={loading}
                  style={{ fontSize: 15, fontWeight: 700 }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Authenticating…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>Sign In
                    </>
                  )}
                </button>

                {portal === 'citizen' && (
                  <p className="text-center mt-4 mb-0" style={{ fontSize: 14 }}>
                    <span className="text-muted">New citizen? </span>
                    <Link to="/register" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>
                      Create an Account →
                    </Link>
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Login;
