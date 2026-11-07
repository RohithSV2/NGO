import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DISTRICT_COORDS } from '../services/api';

// Haversine Great Circle Proximity Distance Calculator
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth's mean radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const DISTRICT_CENTERS = {
  All: { lat: 13.5, lng: 76.1, zoom: 8, name: 'All Karnataka (4 Districts)' },
  Mysuru: { lat: 12.2958, lng: 76.6394, zoom: 12, name: 'Mysuru District' },
  Shivamogga: { lat: 13.9299, lng: 75.5681, zoom: 12, name: 'Shivamogga District' },
  Davanagere: { lat: 14.4644, lng: 75.9218, zoom: 12, name: 'Davanagere District' },
  Chitradurga: { lat: 14.2287, lng: 76.3996, zoom: 12, name: 'Chitradurga District' }
};

export default function LiveReliefMap({
  requests = [],
  ngos = [],
  onNavigateToPostRequest,
  onDirectRequest,
  onNavigateToTracker
}) {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersLayerRef = useRef(null);

  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [activeLayerFilter, setActiveLayerFilter] = useState('all'); // 'all', 'critical', 'high', 'ngos'
  const [userCoords, setUserCoords] = useState({ lat: 12.2958, lng: 76.6394, label: 'Mysuru Center (Default)' });
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Compute representative sample of NGOs across districts with realistic lat/lng
  const mappedNGOs = useMemo(() => {
    // Group NGOs by city and pick top 10 from each real district for snappy map rendering
    const cities = ['Chitradurga', 'Davanagere', 'Shivamogga', 'Mysuru'];
    const list = [];
    cities.forEach(city => {
      const center = DISTRICT_COORDS[city] || { lat: 13.5, lng: 76.1 };
      const cityNgos = ngos.filter(n => (n.city || '').toLowerCase() === city.toLowerCase()).slice(0, 10);
      cityNgos.forEach((ngo, idx) => {
        // Pseudo-random offset around district center
        const angle = (idx / 10) * 2 * Math.PI;
        const radius = 0.02 + ((idx % 3) * 0.015);
        list.push({
          ...ngo,
          isNGO: true,
          lat: Number((center.lat + Math.cos(angle) * radius).toFixed(4)),
          lng: Number((center.lng + Math.sin(angle) * radius).toFixed(4))
        });
      });
    });
    return list;
  }, [ngos]);

  // Normalize requests with coordinates
  const mappedRequests = useMemo(() => {
    return requests.map(req => {
      let lat = req.lat;
      let lng = req.lng;
      if (!lat || !lng) {
        const center = DISTRICT_COORDS[req.city] || { lat: 12.2958, lng: 76.6394 };
        lat = Number((center.lat + (Math.random() - 0.5) * 0.03).toFixed(4));
        lng = Number((center.lng + (Math.random() - 0.5) * 0.03).toFixed(4));
      }
      return {
        ...req,
        isRequest: true,
        lat,
        lng
      };
    });
  }, [requests]);

  // Combined pin dataset filtered by district and active layer
  const visiblePins = useMemo(() => {
    let combined = [];

    if (activeLayerFilter === 'all' || activeLayerFilter === 'critical') {
      const criticalReqs = mappedRequests.filter(r => (r.urgency || '').toLowerCase() === 'critical');
      combined.push(...criticalReqs);
    }
    if (activeLayerFilter === 'all' || activeLayerFilter === 'high') {
      const highReqs = mappedRequests.filter(r => (r.urgency || '').toLowerCase() !== 'critical');
      combined.push(...highReqs);
    }
    if (activeLayerFilter === 'all' || activeLayerFilter === 'ngos') {
      combined.push(...mappedNGOs);
    }

    if (selectedDistrict !== 'All') {
      combined = combined.filter(p => (p.city || '').toLowerCase() === selectedDistrict.toLowerCase());
    }

    return combined;
  }, [mappedRequests, mappedNGOs, activeLayerFilter, selectedDistrict]);

  // Check if Leaflet is available on window
  useEffect(() => {
    const checkLeaflet = () => {
      if (typeof window !== 'undefined' && window.L) {
        setLeafletLoaded(true);
      } else {
        setTimeout(checkLeaflet, 250);
      }
    };
    checkLeaflet();
  }, []);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;
    const L = window.L;

    // Create map instance if not already initialized
    if (!leafletMapRef.current) {
      const initialCenter = DISTRICT_CENTERS.All;
      const map = L.map(mapContainerRef.current, {
        center: [initialCenter.lat, initialCenter.lng],
        zoom: initialCenter.zoom,
        zoomControl: true,
        scrollWheelZoom: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &bull; AidConnect GIS'
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    // Add User Location Pulse Marker
    if (userCoords && userCoords.lat && userCoords.lng) {
      const userHtml = `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background: rgba(37, 99, 235, 0.25); animation: pulse-ring 2s infinite;"></div>
          <div style="width: 16px; height: 16px; border-radius: 50%; background: #2563eb; border: 3px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
        </div>
      `;
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: userHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
        .bindPopup(`<strong>📍 Your Position</strong><br /><small>${userCoords.label}</small>`)
        .addTo(markersLayer);
    }

    // Render Visible Pins
    visiblePins.forEach(item => {
      const distance = userCoords ? calculateDistanceKm(userCoords.lat, userCoords.lng, item.lat, item.lng) : null;
      let iconHtml = '';
      let popupContent = '';

      if (item.isRequest) {
        const isCritical = (item.urgency || '').toLowerCase() === 'critical';
        const color = isCritical ? '#dc2626' : '#f59e0b';
        const symbol = isCritical ? '🚨' : '🟡';

        iconHtml = `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: ${isCritical ? 'rgba(220, 38, 38, 0.3)' : 'rgba(245, 158, 11, 0.3)'}; animation: pulse-ring 1.8s infinite;"></div>
            <div style="width: 26px; height: 26px; border-radius: 50%; background: ${color}; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
              ${symbol}
            </div>
          </div>
        `;

        popupContent = `
          <div style="min-width: 220px; font-family: system-ui, sans-serif;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 11px; font-weight: 800; background: ${isCritical ? '#fee2e2' : '#fef3c7'}; color: ${isCritical ? '#991b1b' : '#92400e'}; padding: 2px 6px; border-radius: 4px;">
                ${item.urgency || 'High'} Urgency
              </span>
              <span style="font-size: 11px; color: #64748b; font-weight: 600;">${item.status || 'Active'}</span>
            </div>
            <h4 style="margin: 4px 0 6px; font-size: 14px; font-weight: 700; color: #0f172a;">${item.title || 'Emergency Need'}</h4>
            <p style="margin: 0 0 6px; font-size: 12px; color: #475569; line-height: 1.4;">${(item.description || '').slice(0, 100)}...</p>
            <div style="font-size: 11px; color: #166534; font-weight: 700; margin-bottom: 6px;">
              📍 ${item.city || 'Karnataka'} &bull; ${distance ? `<strong>${distance} km</strong> away` : ''}
            </div>
            <div style="font-size: 12px; color: #334155; margin-bottom: 6px;">
              👤 Requester: <strong>${item.requesterName || 'Citizen'}</strong> (${item.requesterPhone || ''})
            </div>
          </div>
        `;
      } else {
        // Verified NGO Pin (Green)
        iconHtml = `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="width: 24px; height: 24px; border-radius: 50%; background: #16a34a; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.25);">
              🏢
            </div>
          </div>
        `;

        popupContent = `
          <div style="min-width: 220px; font-family: system-ui, sans-serif;">
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #166534; letter-spacing: 0.5px;">
              Verified Partner NGO Hub
            </div>
            <h4 style="margin: 4px 0 4px; font-size: 14px; font-weight: 700; color: #0f172a;">${item.name}</h4>
            <div style="font-size: 12px; color: #475569; margin-bottom: 4px;">
              Sector: <strong>${item.category || 'Humanitarian Aid'}</strong>
            </div>
            <div style="font-size: 11px; color: #15803d; font-weight: 700; margin-bottom: 6px;">
              📍 ${item.city} &bull; ${distance ? `<strong>${distance} km</strong> away` : ''}
            </div>
            ${item.contact_phone || item.contactPhone ? `
              <div style="font-size: 12px; color: #166534; font-weight: 700;">
                📞 <a href="tel:${item.contact_phone || item.contactPhone}" style="color: inherit; text-decoration: none;">${item.contact_phone || item.contactPhone}</a>
              </div>
            ` : ''}
          </div>
        `;
      }

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: iconHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const marker = L.marker([item.lat, item.lng], { icon: customIcon });
      marker.bindPopup(popupContent);
      marker.on('click', () => setSelectedPin(item));
      marker.addTo(markersLayer);
    });
  }, [leafletLoaded, visiblePins, userCoords]);

  // Handle District Zoom Switch
  const handleDistrictChange = (districtKey) => {
    setSelectedDistrict(districtKey);
    const target = DISTRICT_CENTERS[districtKey];
    if (target && leafletMapRef.current) {
      leafletMapRef.current.setView([target.lat, target.lng], target.zoom, { animate: true });
    }
  };

  // GPS Geolocation Handler
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGPS(false);
        const { latitude, longitude } = pos.coords;
        const coords = {
          lat: Number(latitude.toFixed(4)),
          lng: Number(longitude.toFixed(4)),
          label: `GPS Detected Location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`
        };
        setUserCoords(coords);
        if (leafletMapRef.current) {
          leafletMapRef.current.setView([coords.lat, coords.lng], 13, { animate: true });
        }
      },
      (err) => {
        setIsDetectingGPS(false);
        alert('Could not retrieve GPS coordinates. Defaulting to Mysuru district center.');
        setUserCoords({ lat: 12.2958, lng: 76.6394, label: 'Mysuru Center (Default)' });
      },
      { timeout: 8000 }
    );
  };

  const criticalCount = mappedRequests.filter(r => (r.urgency || '').toLowerCase() === 'critical').length;
  const highCount = mappedRequests.filter(r => (r.urgency || '').toLowerCase() !== 'critical').length;

  return (
    <div className="section-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Header Block */}
      <div className="section-header-block" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '24px' }}>🗺️</span>
              <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: 'var(--text-h)' }}>
                Live Karnataka Geospatial Relief Map
              </h2>
            </div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
              Real-time OpenStreetMap visualization of citizen emergency distress signals and 556 verified NGO operations centers across Chitradurga, Davanagere, Shivamogga, and Mysuru.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-outline-green"
              onClick={handleDetectGPS}
              disabled={isDetectingGPS}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700' }}
            >
              <span>📍</span>
              <span>{isDetectingGPS ? 'Detecting GPS...' : 'Detect My Location'}</span>
            </button>
            {onNavigateToPostRequest && (
              <button
                type="button"
                className="btn-primary-green"
                onClick={onNavigateToPostRequest}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700' }}
              >
                <span>+</span>
                <span>Post Distress Signal</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* District Quick Zoom Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginRight: '4px' }}>
            District Focus:
          </span>
          {Object.keys(DISTRICT_CENTERS).map(d => (
            <button
              key={d}
              type="button"
              className={`sector-tab-pill ${selectedDistrict === d ? 'active' : ''}`}
              onClick={() => handleDistrictChange(d)}
              style={{ fontSize: '12px', padding: '5px 12px' }}
            >
              {d === 'All' ? '🌐 All Karnataka' : d}
            </button>
          ))}
        </div>

        {/* Pin Filter Legend / Layer Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveLayerFilter('all')}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              border: activeLayerFilter === 'all' ? '2px solid #0f172a' : '1px solid #cbd5e1',
              backgroundColor: activeLayerFilter === 'all' ? '#f1f5f9' : '#ffffff',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            All Pins ({visiblePins.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveLayerFilter('critical')}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              border: activeLayerFilter === 'critical' ? '2px solid #dc2626' : '1px solid #fecaca',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>🔴</span>
            <span>Critical Distress ({criticalCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayerFilter('high')}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              border: activeLayerFilter === 'high' ? '2px solid #d97706' : '1px solid #fde68a',
              backgroundColor: '#fef3c7',
              color: '#92400e',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>🟡</span>
            <span>High/Medium ({highCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayerFilter('ngos')}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              border: activeLayerFilter === 'ngos' ? '2px solid #16a34a' : '1px solid #bbf7d0',
              backgroundColor: '#f0fdf4',
              color: '#166534',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>🟢</span>
            <span>NGO Centers ({mappedNGOs.length})</span>
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div style={{ position: 'relative', width: '100%', height: '560px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

        {/* Map Legend Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(4px)',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '12px 16px',
            zIndex: 1000,
            fontSize: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ fontWeight: '800', color: '#0f172a', marginBottom: '8px', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
            Map Legend & Indicators
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#dc2626', display: 'inline-block' }}></span>
              <span>Critical Emergency (Life Threat / Medical)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }}></span>
              <span>High/Medium Need (Food, Ration, Water)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#16a34a', display: 'inline-block' }}></span>
              <span>Verified NGO Relief Hub</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#2563eb', display: 'inline-block' }}></span>
              <span>Your Current Location (GPS)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Pin Details Card */}
      {selectedPin && (
        <div
          style={{
            marginTop: '16px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '18px 22px',
            boxShadow: 'var(--shadow-sm)',
            borderLeft: selectedPin.isNGO ? '6px solid #16a34a' : (selectedPin.urgency === 'Critical' ? '6px solid #dc2626' : '6px solid #f59e0b')
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '18px' }}>{selectedPin.isNGO ? '🏢' : '🚨'}</span>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: selectedPin.isNGO ? '#166534' : '#991b1b', letterSpacing: '0.5px' }}>
                  {selectedPin.isNGO ? 'Verified NGO Center' : `${selectedPin.urgency} Urgency Citizen Distress`}
                </span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>&bull; {selectedPin.city}, Karnataka</span>
              </div>
              <h3 style={{ margin: '2px 0 6px', fontSize: '17px', fontWeight: '800', color: 'var(--text-h)' }}>
                {selectedPin.isNGO ? selectedPin.name : selectedPin.title}
              </h3>
              <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                {selectedPin.description || `Specialized humanitarian operations in ${selectedPin.category}.`}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '12px' }}>
                <span><strong>Sector:</strong> {selectedPin.category}</span>
                {userCoords && (
                  <span style={{ color: '#166534', fontWeight: '700' }}>
                    📏 <strong>{calculateDistanceKm(userCoords.lat, userCoords.lng, selectedPin.lat, selectedPin.lng)} km</strong> away from your GPS position
                  </span>
                )}
                {(selectedPin.contact_phone || selectedPin.contactPhone || selectedPin.requesterPhone) && (
                  <span>
                    📞 <a href={`tel:${selectedPin.contact_phone || selectedPin.contactPhone || selectedPin.requesterPhone}`} style={{ color: '#166534', fontWeight: '700', textDecoration: 'none' }}>
                      {selectedPin.contact_phone || selectedPin.contactPhone || selectedPin.requesterPhone}
                    </a>
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {selectedPin.isNGO && onDirectRequest && (
                <button
                  type="button"
                  className="btn-primary-green"
                  onClick={() => onDirectRequest(selectedPin)}
                  style={{ fontSize: '13px', padding: '6px 14px' }}
                >
                  Direct Aid Request &rarr;
                </button>
              )}
              {selectedPin.isRequest && onNavigateToTracker && (
                <button
                  type="button"
                  className="btn-outline-green"
                  onClick={onNavigateToTracker}
                  style={{ fontSize: '13px', padding: '6px 14px' }}
                >
                  View on Tracker &rarr;
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedPin(null)}
                style={{
                  background: 'none',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  color: '#64748b',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
