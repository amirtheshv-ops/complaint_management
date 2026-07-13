import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  Pending:     '#f59e0b',
  'In Progress': '#06b6d4',
  Resolved:    '#10b981',
};

const ComplaintMap = ({ currentUser }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    fetchComplaintsAndRenderMap();
    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  const fetchComplaintsAndRenderMap = async () => {
    if (!window.L) {
      setError('Leaflet map library failed to load. Please refresh the page.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/api/complaints/', {
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setComplaints(data.complaints);
        initializeMap(data.complaints);
      } else {
        setError(data.error || 'Failed to fetch complaints.');
      }
    } catch {
      setError('Connection to the server failed.');
    } finally {
      setLoading(false);
    }
  };

  const getMarkerIcon = (status) => {
    const color = STATUS_COLORS[status] || '#94a3b8';
    const html = `
      <div style="
        width: 18px; height: 18px; border-radius: 50%;
        background: ${color};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>`;
    return window.L.divIcon({ html, className: '', iconSize: [18, 18], iconAnchor: [9, 9] });
  };

  const initializeMap = (items) => {
    let defaultLat = 12.9716;
    let defaultLng = 77.5946;

    const valid = items.filter((i) => i.latitude && i.longitude);
    if (valid.length > 0) {
      defaultLat = valid.reduce((a, c) => a + c.latitude, 0) / valid.length;
      defaultLng = valid.reduce((a, c) => a + c.longitude, 0) / valid.length;
    }

    const map = window.L.map('global-complaint-map').setView([defaultLat, defaultLng], 12);
    mapRef.current = map;

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    markersRef.current = [];
    items.forEach((item) => {
      if (!item.latitude || !item.longitude) return;

      const statusColor = STATUS_COLORS[item.status] || '#94a3b8';
      const popup = `
        <div style="width:230px; font-family:'Inter',sans-serif;">
          ${item.image ? `<img src="${item.image}" style="width:100%;height:110px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />` : ''}
          <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#94a3b8;margin-bottom:4px;">
            ${item.category} &bull;
            <span style="color:${statusColor}">${item.status}</span>
          </div>
          <div style="font-size:14px;font-weight:800;color:#1e1b4b;margin-bottom:4px;">${item.title}</div>
          <div style="font-size:12px;color:#64748b;line-height:1.5;margin-bottom:8px;">${item.description.slice(0, 90)}${item.description.length > 90 ? '…' : ''}</div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;border-top:1px solid #f1f5f9;padding-top:6px;">
            <span>By: <b>${item.citizen_username}</b></span>
            <span>${new Date(item.created_at).toLocaleDateString()}</span>
          </div>
        </div>`;

      const marker = window.L.marker([item.latitude, item.longitude], { icon: getMarkerIcon(item.status) })
        .bindPopup(popup, { maxWidth: 260 })
        .addTo(map);

      markersRef.current.push(marker);
    });

    if (items.length > 1) {
      try {
        const group = new window.L.featureGroup(markersRef.current);
        map.fitBounds(group.getBounds().pad(0.15));
      } catch (_) {}
    }
  };

  const total      = complaints.length;
  const pending    = complaints.filter((c) => c.status === 'Pending').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved   = complaints.filter((c) => c.status === 'Resolved').length;

  const isAdmin = currentUser && currentUser.is_staff;
  const backLink = isAdmin ? '/admin-dashboard' : '/dashboard';

  return (
    <>
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="page-header animate-fade-up">
        <Link to={backLink} className="d-inline-flex align-items-center gap-1 text-decoration-none mb-3" style={{ color: '#94a3b8', fontWeight: 600, fontSize: 14 }}>
          <i className="bi bi-arrow-left"></i>Back to Dashboard
        </Link>
        <h1>Geotagged Complaint Map</h1>
        <p>Visual distribution of reported public complaints across the municipal area.</p>
      </div>

      {/* ── Legend & Summary ──────────────────────────────────── */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 animate-fade-up animate-delay-1">
        <div className="d-flex gap-3 flex-wrap">
          {[
            { label: 'Pending',     color: '#f59e0b', count: pending    },
            { label: 'In Progress', color: '#06b6d4', count: inProgress },
            { label: 'Resolved',    color: '#10b981', count: resolved   },
          ].map((s) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: s.color, boxShadow: `0 0 0 3px ${s.color}30` }}></div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>
                {s.label} <span style={{ color: '#1e1b4b', fontWeight: 800 }}>({s.count})</span>
              </span>
            </div>
          ))}
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>
          <i className="bi bi-pin-map-fill me-1 text-danger"></i>
          {total} complaint{total !== 1 ? 's' : ''} plotted
        </span>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4 animate-fade-up" role="alert">
          <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
          <span>{error}</span>
        </div>
      )}

      {/* ── Map Card ─────────────────────────────────────────── */}
      <div className="section-panel animate-fade-up animate-delay-2" style={{ overflow: 'hidden' }}>
        {loading && (
          <div
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(255,255,255,0.85)',
              zIndex: 10,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 12,
            }}
          >
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading…</span>
            </div>
            <p className="text-muted small mb-0">Plotting complaint coordinates…</p>
          </div>
        )}
        <div
          id="global-complaint-map"
          style={{ height: 520, width: '100%', borderRadius: 0 }}
        ></div>
      </div>

      {/* ── Summary row ─────────────────────────────────────── */}
      {!loading && complaints.length === 0 && (
        <div className="empty-state mt-4">
          <div className="empty-state-icon">
            <i className="bi bi-map"></i>
          </div>
          <h5 style={{ fontWeight: 700 }}>No Complaints on Map</h5>
          <p className="text-muted small">No geotagged complaints exist yet.</p>
        </div>
      )}
    </>
  );
};

export default ComplaintMap;
