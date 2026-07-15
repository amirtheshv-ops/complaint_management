import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = ({ currentUser }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/complaints/', {
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setComplaints(data.complaints);
      } else {
        setError(data.error || 'Failed to fetch complaints.');
      }
    } catch {
      setError('Connection to the server failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="badge-status badge-pending"><i className="bi bi-hourglass-split"></i>Pending</span>;
      case 'In Progress':
        return <span className="badge-status badge-progress"><i className="bi bi-gear-wide-connected"></i>In Progress</span>;
      case 'Resolved':
        return <span className="badge-status badge-resolved"><i className="bi bi-check-circle-fill"></i>Resolved</span>;
      default:
        return <span className="badge-status" style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>{status}</span>;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Garbage':       return 'bi-trash-fill text-danger';
      case 'Road Damage':   return 'bi-cone-striped text-warning';
      case 'Water Leakage': return 'bi-droplet-fill text-primary';
      case 'Street Light':  return 'bi-lightbulb-fill text-warning';
      case 'Drainage':      return 'bi-water text-info';
      default:              return 'bi-patch-question-fill text-secondary';
    }
  };

  const filters = ['All', 'Pending', 'In Progress', 'Resolved'];
  const filteredComplaints = filter === 'All' ? complaints : complaints.filter((c) => c.status === filter);

  const total      = complaints.length;
  const pending    = complaints.filter((c) => c.status === 'Pending').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved   = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <>
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 page-header animate-fade-up">
        <div>
          <h1 className="mb-1">
            Welcome back, <span style={{ color: '#6366f1' }}>{currentUser?.username}</span> 👋
          </h1>
          <p>Track and manage your submitted complaints below.</p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <Link to="/add-complaint" className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2" id="btn-lodge">
            <i className="bi bi-plus-circle-fill"></i>Lodge Complaint
          </Link>
          <Link to="/map" className="btn btn-outline-primary d-flex align-items-center gap-2 px-4 py-2">
            <i className="bi bi-map-fill"></i>Map
          </Link>
        </div>
      </div>

      {/* ── Metric Cards ─────────────────────────────────────── */}
      <div className="row g-3 mb-4">
        {[
          { label: 'TOTAL LODGED',  value: total,      icon: 'bi-collection-fill',       cls: 'blue'   },
          { label: 'PENDING',        value: pending,    icon: 'bi-hourglass-split',        cls: 'yellow' },
          { label: 'IN PROGRESS',    value: inProgress, icon: 'bi-gear-wide-connected',    cls: 'cyan'   },
          { label: 'RESOLVED',       value: resolved,   icon: 'bi-check-circle-fill',      cls: 'green'  },
        ].map((m, i) => (
          <div key={i} className={`col-6 col-md-3 animate-fade-up animate-delay-${i + 1}`}>
            <div className="metric-card d-flex align-items-center gap-3">
              <div className={`metric-icon ${m.cls}`}>
                <i className={`bi ${m.icon}`}></i>
              </div>
              <div>
                <div className="metric-label">{m.label}</div>
                <div className="metric-value">{m.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Complaints Section ───────────────────────────────── */}
      <div className="section-panel animate-fade-up animate-delay-4">
        <div className="section-panel-header">
          <h5 style={{ fontWeight: 700, margin: 0, color: '#1e1b4b' }}>My Complaints</h5>
          <div className="filter-pill-group">
            {filters.map((f) => (
              <button
                key={f}
                className={`filter-pill ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
                id={`filter-${f.replace(' ', '-').toLowerCase()}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="section-panel-body">
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
              <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading…</span>
              </div>
              <p className="text-muted small mb-0">Loading your complaints…</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <i className="bi bi-file-earmark-text"></i>
              </div>
              <h5 style={{ fontWeight: 700 }}>No Complaints Found</h5>
              <p className="text-muted small" style={{ maxWidth: 320 }}>
                {filter === 'All'
                  ? "You haven't lodged any complaints yet. Use the Lodge Complaint button above."
                  : `No complaints with '${filter}' status found.`}
              </p>
              {filter === 'All' && (
                <Link to="/add-complaint" className="btn btn-primary mt-2">
                  <i className="bi bi-plus-circle-fill me-2"></i>Lodge your first complaint
                </Link>
              )}
            </div>
          ) : (
            <div className="row g-3">
              {filteredComplaints.map((complaint) => (
                <div className="col-lg-6 animate-fade-up" key={complaint.id}>
                  <div className="complaint-card">
                    <div className="row g-3 h-100">
                      {complaint.image && (
                        <div className="col-sm-4">
                          <img
                            src={complaint.image}
                            alt={complaint.title}
                            className="complaint-card-img"
                          />
                        </div>
                      )}
                      <div className={`${complaint.image ? 'col-sm-8' : 'col-12'} d-flex flex-column justify-content-between`}>
                        <div>
                          <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
                            <span className="category-chip">
                              <i className={`bi ${getCategoryIcon(complaint.category)}`}></i>
                              {complaint.category}
                            </span>
                            {getStatusBadge(complaint.status)}
                          </div>
                          <h6 style={{ fontWeight: 700, marginBottom: 4, color: '#1e1b4b' }}>{complaint.title}</h6>
                          <p className="text-muted mb-0" style={{ fontSize: 13, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {complaint.description}
                          </p>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-3 pt-2" style={{ borderTop: '1px solid #f1f5f9', fontSize: 12, color: '#94a3b8' }}>
                          <span>
                            <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                            {complaint.latitude.toFixed(4)}, {complaint.longitude.toFixed(4)}
                          </span>
                          <span>
                            <i className="bi bi-calendar3 me-1"></i>
                            {new Date(complaint.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
