import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const CATEGORIES = [
  { value: 'Garbage',       label: 'Garbage Disposal',       icon: 'bi-trash-fill',        color: '#ef4444' },
  { value: 'Road Damage',   label: 'Road Damage / Potholes', icon: 'bi-cone-striped',       color: '#f59e0b' },
  { value: 'Water Leakage', label: 'Water Leakage',          icon: 'bi-droplet-fill',       color: '#6366f1' },
  { value: 'Street Light',  label: 'Street Light Faulty',    icon: 'bi-lightbulb-fill',     color: '#f59e0b' },
  { value: 'Drainage',      label: 'Drainage Overflow',      icon: 'bi-water',              color: '#06b6d4' },
  { value: 'Other',         label: 'Other / Miscellaneous',  icon: 'bi-patch-question-fill', color: '#94a3b8' },
];

const AddComplaint = () => {
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // step 1 = details, step 2 = location (mobile wizard)

  const navigate = useNavigate();
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!window.L) {
      setError('Failed to load Leaflet mapping library. Please check your network.');
      return;
    }

    const defaultLat = 12.9716;
    const defaultLng = 77.5946;

    const map = window.L.map('complaint-map').setView([defaultLat, defaultLng], 12);
    mapRef.current = map;

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const { latitude: lat, longitude: lng } = coords;
          map.setView([lat, lng], 15);
          setLatitude(lat.toFixed(6));
          setLongitude(lng.toFixed(6));
          const marker = window.L.marker([lat, lng]).addTo(map);
          markerRef.current = marker;
        },
        () => {
          setLatitude(defaultLat.toFixed(6));
          setLongitude(defaultLng.toFixed(6));
          markerRef.current = window.L.marker([defaultLat, defaultLng]).addTo(map);
        }
      );
    } else {
      setLatitude(defaultLat.toFixed(6));
      setLongitude(defaultLng.toFixed(6));
      markerRef.current = window.L.marker([defaultLat, defaultLng]).addTo(map);
    }

    map.on('click', ({ latlng }) => {
      const { lat, lng } = latlng;
      setLatitude(lat.toFixed(6));
      setLongitude(lng.toFixed(6));
      if (markerRef.current) {
        markerRef.current.setLatLng(latlng);
      } else {
        markerRef.current = window.L.marker(latlng).addTo(map);
      }
    });

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !title || !description || !latitude || !longitude) {
      setError('Please fill in all fields and pin the location on the map.');
      return;
    }

    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('category', category);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    if (image) formData.append('image', image);

    try {
      const response = await fetch('http://localhost:8000/api/add-complaint/', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        navigate('/dashboard');
      } else {
        setError(data.error || 'Failed to lodge complaint. Please try again.');
      }
    } catch {
      setError('Connection to the server failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="page-header animate-fade-up">
        <Link to="/dashboard" className="d-inline-flex align-items-center gap-1 text-decoration-none mb-3" style={{ color: '#94a3b8', fontWeight: 600, fontSize: 14 }}>
          <i className="bi bi-arrow-left"></i>Back to Dashboard
        </Link>
        <h1>Lodge a New Complaint</h1>
        <p>Fill in the details and pinpoint the issue location on the map below.</p>
      </div>

      <div className="row g-4">
        {/* ── Details Column ──────────────────────────────────── */}
        <div className="col-lg-6 animate-fade-up animate-delay-1">
          <div className="section-panel h-100">
            <div className="section-panel-header">
              <h5 style={{ fontWeight: 700, margin: 0, color: '#1e1b4b' }}>
                <i className="bi bi-card-text me-2 text-primary-brand"></i>Complaint Details
              </h5>
            </div>
            <div className="section-panel-body">
              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
                  <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} id="add-complaint-form">
                {/* Category */}
                <div className="mb-3">
                  <label className="form-label">CATEGORY</label>
                  <div className="row g-2">
                    {CATEGORIES.map((c) => (
                      <div key={c.value} className="col-6">
                        <button
                          type="button"
                          onClick={() => setCategory(c.value)}
                          disabled={loading}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 10,
                            border: `2px solid ${category === c.value ? c.color : '#e2e8f0'}`,
                            background: category === c.value ? `${c.color}12` : '#f5f6fa',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 13,
                            fontWeight: category === c.value ? 700 : 500,
                            color: category === c.value ? c.color : '#64748b',
                            transition: 'all 0.15s ease',
                          }}
                          id={`cat-${c.value.replace(' ', '-').toLowerCase()}`}
                        >
                          <i className={`bi ${c.icon}`}></i>
                          {c.label}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="mb-3">
                  <label className="form-label" htmlFor="complaint-title">TITLE</label>
                  <input
                    id="complaint-title"
                    type="text"
                    className="form-control"
                    placeholder="Short description of the issue"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label className="form-label" htmlFor="complaint-description">DETAILED DESCRIPTION</label>
                  <textarea
                    id="complaint-description"
                    className="form-control"
                    rows="4"
                    placeholder="Describe the issue in detail…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                {/* Image upload */}
                <div className="mb-4">
                  <label className="form-label" htmlFor="complaint-image">PHOTO EVIDENCE</label>
                  <input
                    id="complaint-image"
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                  />
                  <p className="text-sm text-muted mt-1 mb-0">
                    <i className="bi bi-info-circle me-1"></i>
                    Upload a clear photo of the reported site.
                  </p>
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 10, border: '2px solid #e2e8f0' }}
                      />
                    </div>
                  )}
                </div>

                <button
                  id="submit-complaint"
                  type="submit"
                  className="btn btn-primary w-100 py-2"
                  disabled={loading}
                  style={{ fontSize: 15 }}
                >
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Lodging Complaint…</>
                  ) : (
                    <><i className="bi bi-send-fill me-2"></i>Lodge Complaint</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ── Map Column ─────────────────────────────────────── */}
        <div className="col-lg-6 animate-fade-up animate-delay-2">
          <div className="section-panel h-100" style={{ minHeight: 520 }}>
            <div className="section-panel-header">
              <h5 style={{ fontWeight: 700, margin: 0, color: '#1e1b4b' }}>
                <i className="bi bi-pin-map-fill me-2 text-danger"></i>Select Location
              </h5>
            </div>
            <div className="section-panel-body d-flex flex-column" style={{ flex: 1 }}>
              <p className="text-muted mb-3" style={{ fontSize: 13 }}>
                Click anywhere on the map to drop a pin at the complaint location.
              </p>

              <div
                id="complaint-map"
                className="map-container flex-grow-1 mb-3"
                style={{ minHeight: 340, borderRadius: 14, overflow: 'hidden' }}
              ></div>

              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label">LATITUDE</label>
                  <input
                    type="text"
                    className="form-control text-center fw-700"
                    value={latitude}
                    readOnly
                    placeholder="Latitude"
                    id="lat-display"
                    style={{ background: '#f0fdf4', color: '#065f46', borderColor: '#6ee7b7', fontWeight: 700 }}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">LONGITUDE</label>
                  <input
                    type="text"
                    className="form-control text-center fw-700"
                    value={longitude}
                    readOnly
                    placeholder="Longitude"
                    id="lng-display"
                    style={{ background: '#f0fdf4', color: '#065f46', borderColor: '#6ee7b7', fontWeight: 700 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddComplaint;
