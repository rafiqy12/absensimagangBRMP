import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Crosshair, Check, X, Compass, Layers, AlertCircle } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet Default Icon in Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapLocationPicker({
  initialLat = -6.9842,
  initialLng = 110.4091,
  initialRadius = 150,
  initialName = 'Gedung Kantor',
  initialAddress = '',
  onSelectLocation,
  onClose
}) {
  const [lat, setLat] = useState(parseFloat(initialLat) || -6.9842);
  const [lng, setLng] = useState(parseFloat(initialLng) || 110.4091);
  const [radius, setRadius] = useState(parseInt(initialRadius) || 150);
  const [address, setAddress] = useState(initialAddress || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  // 1. Inisialisasi Peta Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current).setView([lat, lng], 16);
    mapInstanceRef.current = map;

    // Tile Layer OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Marker Pin Draggable
    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    markerRef.current = marker;

    // Circle Visual Geofencing Radius
    const circle = L.circle([lat, lng], {
      color: '#0F5A47',
      fillColor: '#10B981',
      fillOpacity: 0.22,
      radius: radius,
      weight: 2
    }).addTo(map);
    circleRef.current = circle;

    // Event Klik di Peta untuk Pindahkan Pin
    map.on('click', (e) => {
      const newLat = e.latlng.lat;
      const newLng = e.latlng.lng;
      updatePosition(newLat, newLng);
    });

    // Event Geser Pin Marker
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      updatePosition(position.lat, position.lng);
    });

    // Cleanup saat modal ditutup
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Posisi Pin & Circle di Peta
  const updatePosition = (newLat, newLng) => {
    setLat(newLat);
    setLng(newLng);

    if (markerRef.current) {
      markerRef.current.setLatLng([newLat, newLng]);
    }
    if (circleRef.current) {
      circleRef.current.setLatLng([newLat, newLng]);
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo([newLat, newLng]);
    }

    // Ambil Nama Jalan Otomatis (Reverse Geocode)
    fetchReverseGeocode(newLat, newLng);
  };

  // Update Radius Circle di Peta saat slider diubah
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radius);
    }
  }, [radius]);

  // Reverse Geocode: Dapatkan alamat dari Latitude & Longitude
  const fetchReverseGeocode = async (latitude, longitude) => {
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'id' } }
      );
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      }
    } catch (e) {
      console.warn('Reverse geocode error:', e);
    } finally {
      setGeocoding(false);
    }
  };

  // Cari Lokasi berdasarkan Teks
  const handleSearchPlace = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        { headers: { 'Accept-Language': 'id' } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const newLat = parseFloat(item.lat);
        const newLng = parseFloat(item.lon);
        updatePosition(newLat, newLng);
        setAddress(item.display_name);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([newLat, newLng], 17);
        }
      } else {
        alert('Lokasi tidak ditemukan. Coba gunakan nama kota atau jalan yang lebih spesifik.');
      }
    } catch (err) {
      alert('Gagal mencari lokasi. Periksa koneksi internet.');
    } finally {
      setSearching(false);
    }
  };

  // Ambil Lokasi GPS Saat Ini
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser tidak mendukung pendeteksian GPS');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;
        updatePosition(newLat, newLng);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([newLat, newLng], 17);
        }
      },
      (err) => {
        alert('Gagal mendeteksi lokasi GPS. Pastikan izin lokasi telah diaktifkan di browser Anda.');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleApply = () => {
    onSelectLocation({
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lng.toFixed(6)),
      radius_meters: radius,
      address: address.trim()
    });
    onClose();
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal-card map-picker-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="admin-modal-header">
          <div>
            <h3>Pilih Lokasi Kantor dari Peta Interaktif</h3>
            <p className="admin-page-subheading" style={{ fontSize: '0.8rem' }}>
              Klik pada peta atau geser pin merah tepat ke gedung kantor.
            </p>
          </div>
          <button type="button" className="btn-close-sheet" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Search Bar & GPS Button */}
        <div className="map-picker-topbar">
          <form onSubmit={handleSearchPlace} className="map-search-form">
            <Search size={18} className="map-search-icon" />
            <input
              type="text"
              className="map-search-input"
              placeholder="Cari jalan, gedung, atau nama tempat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="map-search-btn"
              disabled={searching}
            >
              {searching ? 'Mencari...' : 'Cari'}
            </button>
          </form>

          <button
            type="button"
            className="map-gps-btn"
            onClick={handleGetCurrentLocation}
            title="Pusatkan ke Lokasi Saya Sekarang (GPS)"
          >
            <Crosshair size={18} />
            <span>Lokasi Saya</span>
          </button>
        </div>

        {/* Leaflet Map Canvas */}
        <div className="map-viewport-wrapper">
          <div ref={mapContainerRef} className="map-leaflet-container" />
          <div className="map-badge-overlay">
            <span>🟢 Lingkaran Hijau = Area Radius Valid Presensi ({radius}m)</span>
          </div>
        </div>

        {/* Selected Data Form & Radius Slider */}
        <div className="map-picker-details">
          <div className="intern-form-row">
            <div className="intern-form-group flex-1">
              <label className="intern-label">Latitude</label>
              <input
                type="text"
                className="intern-input"
                value={lat.toFixed(6)}
                readOnly
              />
            </div>
            <div className="intern-form-group flex-1">
              <label className="intern-label">Longitude</label>
              <input
                type="text"
                className="intern-input"
                value={lng.toFixed(6)}
                readOnly
              />
            </div>
            <div className="intern-form-group flex-1">
              <label className="intern-label">Radius Presensi: {radius} meter</label>
              <input
                type="range"
                min="50"
                max="500"
                step="25"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                style={{ width: '100%', marginTop: '8px' }}
              />
            </div>
          </div>

          <div className="intern-form-group" style={{ marginBottom: 0 }}>
            <label className="intern-label">
              Perkiraan Alamat Terpilih {geocoding && <span style={{ color: 'var(--primary)' }}>(Memperbarui...)</span>}
            </label>
            <input
              type="text"
              className="intern-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Alamat akan otomatis terisi saat pin digeser..."
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="admin-modal-footer">
          <button type="button" className="admin-btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button type="button" className="admin-btn-primary" onClick={handleApply}>
            <Check size={18} />
            <span>Gunakan Titik Lokasi Ini</span>
          </button>
        </div>
      </div>
    </div>
  );
}
