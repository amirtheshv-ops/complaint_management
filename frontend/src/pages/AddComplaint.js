import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../App';
import LeafletMap from '../components/LeafletMap';
import { Clipboard, Image as ImageIcon, MapPin, Compass, AlertCircle, ArrowLeft, Send } from 'lucide-react';

function AddComplaint() {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Garbage',
    description: '',
    latitude: '',
    longitude: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleLocationSelect = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        }));
      },
      (err) => {
        setError('Unable to fetch your location automatically. Please select it on the map.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { title, category, description, latitude, longitude } = formData;
    if (!title || !category || !latitude || !longitude) {
      setError('Please fill in all required fields and select a location on the map.');
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append('title', title);
    data.append('category', category);
    data.append('description', description);
    data.append('latitude', latitude);
    data.append('longitude', longitude);
    if (image) {
      data.append('image', image);
    }

    try {
      const res = await fetch(`${API_BASE}/api/complaints/`, {
        method: 'POST',
        body: data,
        credentials: 'include',
      });

      const result = await res.json();
      if (res.ok && result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Failed to file complaint');
      }
    } catch (err) {
      setError('Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-wrap animated-fade">
      {/* Back button */}
      <button 
        onClick={() => navigate('/dashboard')} 
        className="btn btn-secondary" 
        style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '0.9rem' }}
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '8px' }}>File a Complaint</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Fill in details, upload evidence, and pin the issue on the map.</p>

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'start' }}>
        {/* Form panel */}
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '32px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">Title / Short Summary *</label>
            <div style={{ position: 'relative' }}>
              <Clipboard size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="title"
                type="text"
                className="form-input"
                style={{ width: '100%', paddingLeft: '48px' }}
                placeholder="e.g. Large pothole on Main Street"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="category">Category *</label>
            <select
              id="category"
              className="form-select"
              style={{ width: '100%' }}
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="Garbage">Garbage</option>
              <option value="Road Damage">Road Damage</option>
              <option value="Water Leakage">Water Leakage</option>
              <option value="Street Light">Street Light</option>
              <option value="Drainage">Drainage</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Detailed Description</label>
            <textarea
              id="description"
              className="form-textarea"
              placeholder="Describe the issue in detail (exact location milestones, severity, etc.)"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Location details */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Latitude *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Select on Map"
                value={formData.latitude}
                readOnly
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Longitude *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Select on Map"
                value={formData.longitude}
                readOnly
                required
              />
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%', gap: '8px', marginBottom: '24px' }}
            onClick={handleGeolocate}
          >
            <Compass size={18} />
            Auto-Detect My Location
          </button>

          {/* Image evidence */}
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label">Upload Image Evidence</label>
            <div style={{
              border: '2px dashed var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              textAlign: 'center',
              cursor: 'pointer',
              position: 'relative',
              background: 'rgba(255, 255, 255, 0.01)',
              transition: 'var(--transition-smooth)'
            }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
              {imagePreview ? (
                <div>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    style={{ maxHeight: '160px', borderRadius: '4px', display: 'block', margin: '0 auto 12px auto' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Change selected image</span>
                </div>
              ) : (
                <div style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <ImageIcon size={32} style={{ color: 'var(--text-muted)' }} />
                  <span>Click or drag image file here</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', gap: '8px' }}
            disabled={loading}
          >
            <Send size={18} />
            {loading ? 'Filing Complaint...' : 'Submit Report'}
          </button>
        </form>

        {/* Map picker panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} color="var(--accent-primary)" />
              Pin Location on Map
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
              Click anywhere on the map to set the exact coordinates of the issue.
            </p>
            <div style={{ height: '450px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <LeafletMap isPublic={false} onLocationSelect={handleLocationSelect} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddComplaint;
