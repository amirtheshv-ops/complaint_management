import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = ({ currentUser }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState('');
  const [updateError, setUpdateError] = useState('');

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

  const handleUpdateStatus = (id, currentStatus) => {
    setUpdatingId(id);
    setUpdatingStatus(currentStatus);
    setUpdateError('');
  };

  const saveStatusUpdate = async (id) => {
    if (!updatingStatus) return;
    try {
      const response = await fetch(`http://localhost:8000/api/update-status/${id}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: updatingStatus }),
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setComplaints(complaints.map((c) => (c.id === id ? { ...c, status: updatingStatus } : c)));
        setUpdatingId(null);
      } else {
        setUpdateError(data.error || 'Failed to update status.');
      }
    } catch {
      setUpdateError('Connection error. Please try again.');
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

  const filters = ['All', 'Pending', 'In Progress', 'Resolved'];
  const filteredComplaints = filterStatus === 'All' ? complaints : complaints.filter((c) => c.status === filterStatus);

  const total      = complaints.length;
  const pending    = complaints.filter((c) => c.status === 'Pending').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved   = complaints.filter((c) => c.status === 'Resolved').length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <>
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 page-header animate-fade-up">
        <div>
          <h1 className="mb-1">
            Administrator Dashboard
            <span
              style={{
                fontSize: 13,
                background: 'rgba(99,102,241,0.1)',
                color: '#6366f1',
                borderRadius: 6,
                padding: '3px 10px',
                fontWeight: 700,
                marginLeft: 10,
                verticalAlign: 'middle',
              }}
            >
              ADMIN
            </span>
          </h1>
          <p>Manage all citizen complaints and update their resolution status.</p>
        </div>
        <div className="mt-3 mt-md-0">
          <Link to="/map" className="btn btn-outline-primary d-flex align-items-center gap-2 px-4 py-2">
            <i className="bi bi-map-fill"></i>View Map
          </Link>
        </div>
      </div>

      {/* ── Metric Cards ─────────────────────────────────────── */}
      <div className="row g-3 mb-4">
        {[
          { label: 'TOTAL COMPLAINTS', value: total,      icon: 'bi-collection-fill',       cls: 'blue'   },
          { label: 'PENDING',           value: pending,    icon: 'bi-hourglass-split',        cls: 'yellow' },
          { label: 'IN PROGRESS',       value: inProgress, icon: 'bi-gear-wide-connected',    cls: 'cyan'   },
          { label: 'RESOLVED',          value: resolved,   icon: 'bi-check-circle-fill',      cls: 'green'  },
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

      {/* ── Resolution Rate Bar ──────────────────────────────── */}
      {total > 0 && (
        <div className="section-panel mb-4 animate-fade-up animate-delay-4">
          <div className="section-panel-body" style={{ padding: '1.1rem 1.5rem' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Resolution Rate</span>
              <span style={{ fontWeight: 800, color: '#10b981', fontSize: 15 }}>{resolutionRate}%</span>
            </div>
            <div style={{ background: '#f1f5f9', borderRadius: 999, height: 8, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${resolutionRate}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #10b981, #059669)',
                  borderRadius: 999,
                  transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Complaints Table ──────────────────────────────────── */}
      <div className="section-panel animate-fade-up animate-delay-4">
        <div className="section-panel-header">
          <h5 style={{ fontWeight: 700, margin: 0, color: '#1e1b4b' }}>Manage Complaints</h5>
          <div className="filter-pill-group">
            {filters.map((f) => (
              <button
                key={f}
                className={`filter-pill ${filterStatus === f ? 'active' : ''}`}
                onClick={() => setFilterStatus(f)}
                id={`admin-filter-${f.replace(' ', '-').toLowerCase()}`}
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
              <p className="text-muted small mb-0">Fetching all complaints…</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <i className="bi bi-folder-x"></i>
              </div>
              <h5 style={{ fontWeight: 700 }}>No Complaints Found</h5>
              <p className="text-muted small">No complaints match the selected status filter.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover" id="complaints-table">
                <thead>
                  <tr>
                    <th>COMPLAINT / ID</th>
                    <th>CITIZEN</th>
                    <th>CATEGORY</th>
                    <th>LOCATION</th>
                    <th>DATE</th>
                    <th>STATUS</th>
                    <th className="text-end">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((complaint) => (
                    <tr key={complaint.id}>
                      {/* Title + image */}
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          {complaint.image ? (
                            <img
                              src={complaint.image}
                              alt={complaint.title}
                              style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 48, height: 48, borderRadius: 10,
                                background: '#f1f5f9',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <i className="bi bi-image text-muted"></i>
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: '#1e1b4b', marginBottom: 2 }}>{complaint.title}</div>
                            <div style={{ fontSize: 12, color: '#94a3b8', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {complaint.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 14 }}>
                          <i className="bi bi-person-circle text-secondary"></i>
                          {complaint.citizen_username}
                        </span>
                      </td>
                      <td>
                        <span className="category-chip">{complaint.category}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>
                          <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                          {complaint.latitude.toFixed(4)}, {complaint.longitude.toFixed(4)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 13, color: '#94a3b8' }}>
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td>{getStatusBadge(complaint.status)}</td>
                      <td className="text-end">
                        {updatingId === complaint.id ? (
                          <div>
                            <div className="d-flex gap-1 justify-content-end">
                              <select
                                className="form-select form-select-sm"
                                style={{ width: 130, fontSize: 13 }}
                                value={updatingStatus}
                                onChange={(e) => setUpdatingStatus(e.target.value)}
                                id={`status-select-${complaint.id}`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                              </select>
                              <button
                                type="button"
                                className="btn btn-sm"
                                style={{ background: '#10b981', color: '#fff', borderRadius: 8, padding: '4px 10px' }}
                                onClick={() => saveStatusUpdate(complaint.id)}
                                id={`save-status-${complaint.id}`}
                              >
                                <i className="bi bi-check-lg"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm"
                                style={{ background: '#f1f5f9', color: '#64748b', borderRadius: 8, padding: '4px 10px' }}
                                onClick={() => setUpdatingId(null)}
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </div>
                            {updateError && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4, textAlign: 'right' }}>{updateError}</div>}
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            style={{ fontSize: 13, borderRadius: 8 }}
                            onClick={() => handleUpdateStatus(complaint.id, complaint.status)}
                            id={`update-status-${complaint.id}`}
                          >
                            <i className="bi bi-pencil-fill me-1"></i>Update
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
