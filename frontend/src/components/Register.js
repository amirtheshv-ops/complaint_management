import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password || !email || !phone || !address) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email, phone, address }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setSuccess('Registration successful! Redirecting to sign in…');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Connection to the server failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !!success;

  return (
    <div className="auth-page-container" style={{ overflowY: 'auto' }}>
      <div className="animate-scale" style={{ width: '100%', maxWidth: 440 }}>
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
            Create Citizen Account
          </h2>
          <p className="text-muted small" style={{ maxWidth: 320, margin: '6px auto 0' }}>
            Join GeoTag to start tracking and lodging complaints.
          </p>
        </div>

        <div className="auth-card card">
          <div style={{ padding: '2rem 1.75rem' }}>
              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
                  <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
                  <i className="bi bi-check-circle-fill flex-shrink-0"></i>
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} id="register-form">
                <div className="mb-3">
                  <label className="form-label">USERNAME</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-person"></i></span>
                    <input id="reg-username" type="text" className="form-control" placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isDisabled} autoComplete="username" required />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">PASSWORD</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-lock"></i></span>
                    <input id="reg-password" type={showPassword ? 'text' : 'password'} className="form-control" placeholder="Choose a strong password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isDisabled} autoComplete="new-password" required style={{ borderRight: 'none' }} />
                    <button type="button" className="input-group-text" style={{ cursor: 'pointer', background: '#f5f6fa', border: '1.5px solid #e2e8f0', borderLeft: 'none' }} onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">EMAIL ADDRESS</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                    <input id="reg-email" type="email" className="form-control" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isDisabled} autoComplete="email" required />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">PHONE NUMBER</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-telephone"></i></span>
                    <input id="reg-phone" type="tel" className="form-control" placeholder="Enter mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isDisabled} required />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">RESIDENTIAL ADDRESS</label>
                  <div className="input-group">
                    <span className="input-group-text" style={{ alignItems: 'flex-start', paddingTop: 11 }}><i className="bi bi-house"></i></span>
                    <textarea id="reg-address" className="form-control" rows="2" placeholder="Enter your full address" value={address} onChange={(e) => setAddress(e.target.value)} disabled={isDisabled} required />
                  </div>
                </div>

                <button id="reg-submit" type="submit" className="btn btn-primary w-100 py-2" disabled={isDisabled} style={{ fontSize: 15, fontWeight: 700 }}>
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Registering…</>
                  ) : (
                    <><i className="bi bi-person-plus-fill me-2"></i>Create Account</>
                  )}
                </button>

                <p className="text-center mt-3 mb-0" style={{ fontSize: 14 }}>
                  <span className="text-muted">Already registered? </span>
                  <Link to="/" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>Sign In →</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Register;
