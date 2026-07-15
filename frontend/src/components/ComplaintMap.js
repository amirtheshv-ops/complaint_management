import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  Pending:       '#f59e0b',
  'In Progress': '#06b6d4',
  Resolved:      '#10b981',
};

const ComplaintMap = ({ currentUser }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null); // ref to the actual DOM div
  const markersRef = useRef([]);

  // ── Effect 1: fetch data only (no DOM work here)
  useEffect(() => {
    fetchComplaints();

    return () => {
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // ── Effect 2: initialise / refresh map whenever complaints or the
  // status filter change. This runs AFTER React has painted the container div.
  useEffect(() => {
    if (loading) return;                  // wait until fetch is done
    if (!mapContainerRef.current) return;  // container not in DOM yet
    if (!window.L) return;                 // Leaflet CDN not loaded

    const items =
      filterStatus === 'All'
        ? complaints
        : complaints.filter((c) => c.status === filterStatus);

    initializeMap(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, complaints, filterStatus]);

  // Fetch only — no map work here so we don't touch the DOM before paint
  const fetchComplaints = async () => {
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

  const isValidCoord = (item) =>
    item.latitude !== null &&
    item.longitude !== null &&
    item.latitude !== undefined &&
    item.longitude !== undefined &&
    !isNaN(item.latitude) &&
    !isNaN(item.longitude);

  const initializeMap = (items) => {
    // ── Guard: destroy any existing map instance before re-init
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // ── Guard: container must be in the DOM (useRef guarantees this when
    //    called from the post-render useEffect above)
    if (!mapContainerRef.current) return;

    let defaultLat = 12.9716;
    let defaultLng = 77.5946;

    const valid = items.filter(isValidCoord);
    if (valid.length > 0) {
      defaultLat = valid.reduce((a, c) => a + c.latitude, 0) / valid.length;
      defaultLng = valid.reduce((a, c) => a + c.longitude, 0) / valid.length;
    }

    // Pass the real DOM node (ref) — NOT a string ID
    const map = window.L.map(mapContainerRef.current).setView([defaultLat, defaultLng], 12);
    mapRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    markersRef.current = [];
    items.forEach((item) => {
      if (!isValidCoord(item)) return;

      const statusColor = STATUS_COLORS[item.status] || '#94a3b8';
      const description = item.description || '';
      const popup = `
        <div style="width:230px; font-family:'Inter',sans-serif;">
          ${item.image ? `<img src="${item.image}" style="width:100%;height:110px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />` : ''}
          <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#94a3b8;margin-bottom:4px;">
            ${item.category} &bull;
            <span style="color:${statusColor}">${item.status}</span>
          </div>
          <div style="font-size:14px;font-weight:800;color:#1e1b4b;margin-bottom:4px;">${item.title}</div>
          <div style="font-size:12px;color:#64748b;line-height:1.5;margin-bottom:8px;">${description.slice(0, 90)}${description.length > 90 ? '&hellip;' : ''}</div>
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

    if (markersRef.current.length > 1) {
      const group = window.L.featureGroup(markersRef.current);
      if (group.getLayers().length > 0) {
        map.fitBounds(group.getBounds().pad(0.15));
      }
    }
  };

  const total      = complaints.length;
  const pending    = complaints.filter((c) => c.status === 'Pending').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved   = complaints.filter((c) => c.status === 'Resolved').length;

  const visibleCount =
    filterStatus === 'All'
      ? total
      : complaints.filter((c) => c.status === filterStatus).length;

  const isAdmin = currentUser && currentUser.is_staff;
  const backLink = isAdmin ? '/admin-dashboard' : '/dashboard';

  const filters = ['All', 'Pending', 'In Progress', 'Resolved'];

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

      {/* ── Legend, Filter & Summary ──────────────────────────── */}
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

        <div className="d-flex align-items-center gap-3 flex-wrap">
          <div className="btn-group btn-group-sm" role="group" aria-label="Filter by status">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilterStatus(f)}
                className={`btn ${filterStatus === f ? 'btn-primary' : 'btn-outline-secondary'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>
            <i className="bi bi-pin-map-fill me-1 text-danger"></i>
            {visibleCount} complaint{visibleCount !== 1 ? 's' : ''} plotted
          </span>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4 animate-fade-up" role="alert">
          <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
          <span>{error}</span>
        </div>
      )}

      {/* ── Map Card ─────────────────────────────────────────── */}
      <div className="section-panel animate-fade-up animate-delay-2" style={{ overflow: 'hidden', position: 'relative' }}>
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
              <span className="visually-hidden">Loading&hellip;</span>
            </div>
            <p className="text-muted small mb-0">Plotting complaint coordinates&hellip;</p>
          </div>
        )}
        <div
          ref={mapContainerRef}
          id="global-complaint-map"
          style={{ height: 520, width: '100%', borderRadius: 0 }}
        ></div>
      </div>

      {/* ── Empty state ────────────────────────────────────────── */}
      {!loading && visibleCount === 0 && (
        <div className="empty-state mt-4">
          <div className="empty-state-icon">
            <i className="bi bi-map"></i>
          </div>
          <h5 style={{ fontWeight: 700 }}>No Complaints on Map</h5>
          <p className="text-muted small">
            {filterStatus === 'All'
              ? 'No geotagged complaints exist yet.'
              : `No geotagged complaints with status "${filterStatus}".`}
          </p>
        </div>
      )}
    </>
  );
};

export default ComplaintMap;
