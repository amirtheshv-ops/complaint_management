import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { API_BASE } from '../App';
import { Calendar, Tag, AlertCircle } from 'lucide-react';

// Fix for default marker icon in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Map events hook for location picking
function LocationMarker({ onLocationSelect, initialPosition }) {
  const [position, setPosition] = useState(initialPosition || null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      if (onLocationSelect) {
        onLocationSelect(lat, lng);
      }
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Selected Location: {position[0].toFixed(5)}, {position[1].toFixed(5)}</Popup>
    </Marker>
  );
}

function LeafletMap({ isPublic = true, onLocationSelect, initialPosition }) {
  const [complaints, setComplaints] = useState([]);
  const defaultCenter = [20.5937, 78.9629]; // Center of India

  useEffect(() => {
    if (isPublic) {
      fetch(`${API_BASE}/api/complaints/map/`)
        .then((res) => res.json())
        .then((data) => {
          if (data.complaints) {
            setComplaints(data.complaints);
          }
        })
        .catch((err) => console.error('Error fetching map complaints:', err));
    }
  }, [isPublic]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'badge badge-pending';
      case 'In Progress': return 'badge badge-progress';
      case 'Resolved': return 'badge badge-resolved';
      default: return 'badge';
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapContainer 
        center={initialPosition || defaultCenter} 
        zoom={initialPosition ? 14 : 5} 
        scrollWheelZoom={true}
        style={{ width: '100%', height: '450px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {isPublic ? (
          complaints.map((c) => (
            <Marker key={c.id} position={[c.latitude, c.longitude]}>
              <Popup className="custom-popup">
                <div style={{ maxWidth: '240px', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {c.image && (
                    <img 
                      src={c.image} 
                      alt={c.title} 
                      style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px', marginBottom: '4px' }}
                    />
                  )}
                  <h4 style={{ margin: 0, fontWeight: '700', color: '#f8fafc', fontSize: '1rem' }}>{c.title}</h4>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    <span className={getStatusBadgeClass(c.status)}>{c.status}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: '#94a3b8' }}>
                      <Tag size={12} /> {c.category}
                    </span>
                  </div>
                  
                  <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.4' }}>
                    {c.description}
                  </p>
                  
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px', fontSize: '0.75rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> {new Date(c.created_at).toLocaleDateString()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={12} /> Lat: {c.latitude.toFixed(4)}, Lng: {c.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))
        ) : (
          <LocationMarker onLocationSelect={onLocationSelect} initialPosition={initialPosition} />
        )}
      </MapContainer>
    </div>
  );
}

export default LeafletMap;
