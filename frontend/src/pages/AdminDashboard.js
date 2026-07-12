import React, { useEffect, useState } from 'react';
import { API_BASE } from '../App';
import { AlertTriangle, AlertCircle, RefreshCw, Eye } from 'lucide-react';

function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeImage, setActiveImage] = useState(null);

  const fetchComplaints = () => {
    setLoading(true);
    setError('');
    fetch(`${API_BASE}/api/complaints/`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized or network error');
        return res.json();
      })
      .then((data) => {
        if (data.complaints) {
          setComplaints(data.complaints);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Error fetching administrative data.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/complaints/${id}/status/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setComplaints((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
        );
      } else {
        setError(data.error || 'Failed to update status');
      }
    } catch (err) {
      setError('Connection error while updating status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'Pending').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;

  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter === 'All') return true;
    return c.status === statusFilter;
  });

  return (
    <div className="content-wrap animated-fade">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '6px' }}>Admin Panel</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Review civic complaints, inspect evidence coordinates, and manage status logs.</p>
        </div>
        <button onClick={fetchComplaints} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={18} />
          Reload Data
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Submissions</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '4px', color: 'var(--accent-primary)' }}>{total}</div>
        </div>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unresolved / Pending</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '4px', color: 'var(--accent-warning)' }}>{pending}</div>
        </div>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active / In Progress</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '4px', color: '#818cf8' }}>{inProgress}</div>
        </div>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Closed / Resolved</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '4px', color: 'var(--accent-success)' }}>{resolved}</div>
        </div>
      </div>

      {/* Error alert */}
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

      {/* Filters row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Manage Claims ({filteredComplaints.length})</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Filter Status:</span>
          <select 
            className="form-select" 
            style={{ padding: '6px 12px', background: 'var(--bg-secondary)', fontSize: '0.875rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Main Table view */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <div>Loading table rows...</div>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <AlertTriangle size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <div>No complaints matching this filter are currently registered.</div>
        </div>
      ) : (
        <div className="glass-panel" style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '16px 24px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>ID</th>
                <th style={{ padding: '16px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Reporter</th>
                <th style={{ padding: '16px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Issue Title</th>
                <th style={{ padding: '16px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Category</th>
                <th style={{ padding: '16px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>GPS Coordinates</th>
                <th style={{ padding: '16px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Image Evidence</th>
                <th style={{ padding: '16px 24px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', textAlign: 'right' }}>Status Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition-smooth)' }} className="table-row-hover">
                  <td style={{ padding: '20px 24px', fontWeight: '700', color: 'var(--accent-primary)' }}>#{c.id}</td>
                  <td style={{ padding: '20px 16px' }}>{c.user}</td>
                  <td style={{ padding: '20px 16px' }}>
                    <div style={{ fontWeight: '600', color: '#f8fafc' }}>{c.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.description}
                    </div>
                  </td>
                  <td style={{ padding: '20px 16px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#f8fafc', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                      {c.category}
                    </span>
                  </td>
                  <td style={{ padding: '20px 16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}
                  </td>
                  <td style={{ padding: '20px 16px' }}>
                    {c.image ? (
                      <button 
                        onClick={() => setActiveImage(c.image)}
                        className="btn btn-secondary" 
                        style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Eye size={12} />
                        View Evidence
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No Attachment</span>
                    )}
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <select
                      className={`form-select ${c.status === 'Pending' ? 'badge-pending' : c.status === 'In Progress' ? 'badge-progress' : 'badge-resolved'}`}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        display: 'inline-block',
                        width: '140px',
                        textAlign: 'center',
                        color: 'inherit'
                      }}
                      disabled={updatingId === c.id}
                      value={c.status}
                      onChange={(e) => handleStatusChange(c.id, e.target.value)}
                    >
                      <option value="Pending" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Pending</option>
                      <option value="In Progress" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>In Progress</option>
                      <option value="Resolved" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Resolved</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Image Modal Lightbox */}
      {activeImage && (
        <div 
          onClick={() => setActiveImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(5, 5, 8, 0.95)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '24px',
            cursor: 'zoom-out',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <img 
            src={activeImage} 
            alt="Evidence Detail" 
            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 10px 50px rgba(0,0,0,0.8)' }}
          />
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
