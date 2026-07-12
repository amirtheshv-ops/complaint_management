import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../App';
import { Plus, CheckCircle, Clock, AlertTriangle, AlertCircle, RefreshCw, FileText } from 'lucide-react';

function Dashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComplaints = () => {
    setLoading(true);
    setError('');
    fetch(`${API_BASE}/api/complaints/`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load complaints');
        return res.json();
      })
      .then((data) => {
        if (data.complaints) {
          setComplaints(data.complaints);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Error loading complaints. Please try again.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="badge badge-pending">Pending</span>;
      case 'In Progress':
        return <span className="badge badge-progress">In Progress</span>;
      case 'Resolved':
        return <span className="badge badge-resolved">Resolved</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="content-wrap animated-fade">
      {/* Welcome & Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '6px' }}>Citizen Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track and manage your filed civic complaints.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={fetchComplaints} className="btn btn-secondary" style={{ padding: '12px' }} title="Refresh">
            <RefreshCw size={18} />
          </button>
          <Link to="/add-complaint" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} />
            Report New Issue
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)' }}>
            <FileText size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Filed</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '2px' }}>{total}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-warning)' }}>
            <Clock size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '2px' }}>{pending}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: 'var(--radius-sm)', color: '#818cf8' }}>
            <Clock size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>In Progress</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '2px' }}>{inProgress}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-success)' }}>
            <CheckCircle size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resolved</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '2px' }}>{resolved}</div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px',
          color: 'var(--accent-error)',
          marginBottom: '32px'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content Area */}
      <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '20px' }}>My Complaints List</h3>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <div className="animated-fade">Loading complaints...</div>
        </div>
      ) : complaints.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 40px', borderStyle: 'dashed', borderWidth: '2px' }}>
          <AlertTriangle size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h4 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>No complaints filed yet</h4>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 24px auto', fontSize: '0.95rem' }}>
            If you notice any garbage issues, road damage, or street light problems, please report them to let authorities know.
          </p>
          <Link to="/add-complaint" className="btn btn-primary">
            <Plus size={18} />
            File Your First Complaint
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {complaints.map((c) => (
            <div key={c.id} className="glass-panel animated-fade" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {c.image ? (
                <img 
                  src={c.image} 
                  alt={c.title} 
                  style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ height: '120px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
                  <FileText size={40} />
                </div>
              )}

              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#f8fafc' }}>{c.title}</h4>
                  {getStatusBadge(c.status)}
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '20px', flex: 1 }}>
                  {c.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Category:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{c.category}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Filed On:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{new Date(c.created_at).toLocaleDateString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Coordinates:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
