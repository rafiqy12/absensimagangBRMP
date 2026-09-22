import React, { useState, useEffect } from 'react';
import { MapPin, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function LocationDetector({ onLocationDetected, locationData }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Browser Anda tidak mendukung fitur Geolocation GPS.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLoading(false);
        setError(null);

        const locPayload = {
          latitude: parseFloat(latitude.toFixed(6)),
          longitude: parseFloat(longitude.toFixed(6)),
          accuracy: Math.round(accuracy),
          locationName: `Koordinat: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        };

        onLocationDetected(locPayload);
      },
      (err) => {
        setLoading(false);
        console.warn('Gagal mendapatkan lokasi GPS:', err);
        let msg = 'Gagal mendeteksi lokasi.';
        if (err.code === 1) {
          msg = 'Izin lokasi ditolak. Harap aktifkan izin lokasi di browser Anda.';
        } else if (err.code === 2) {
          msg = 'Sinyal lokasi tidak tersedia.';
        } else if (err.code === 3) {
          msg = 'Waktu permintaan lokasi habis (timeout).';
        }
        setError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  };

  // Otomatis minta lokasi saat komponen pertama kali dipasang
  useEffect(() => {
    if (!locationData) {
      requestLocation();
    }
  }, []);

  return (
    <div className="location-card">
      <div className="location-info">
        <div className="location-icon" style={{ 
          background: locationData ? 'rgba(16, 185, 129, 0.15)' : error ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)',
          color: locationData ? '#10b981' : error ? '#ef4444' : '#38bdf8'
        }}>
          <MapPin size={20} />
        </div>

        <div>
          <div className="location-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>Lokasi Presensi</span>
            {locationData && (
              <span style={{ 
                fontSize: '0.72rem', 
                color: '#34d399', 
                background: 'rgba(16, 185, 129, 0.15)', 
                padding: '0.15rem 0.5rem', 
                borderRadius: '999px',
                fontWeight: 700 
              }}>
                Terdeteksi
              </span>
            )}
          </div>

          <div className="location-coords">
            {loading ? (
              <span style={{ color: '#fbbf24' }}>Mencari sinyal GPS koordinat...</span>
            ) : locationData ? (
              <span>
                Lat: {locationData.latitude}, Lng: {locationData.longitude} (Akurasi: ±{locationData.accuracy}m)
              </span>
            ) : error ? (
              <span style={{ color: '#f87171' }}>{error}</span>
            ) : (
              <span>Menunggu izin akses lokasi browser...</span>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={requestLocation}
        disabled={loading}
        className="btn-secondary"
        style={{ padding: '0.45rem 0.8rem', fontSize: '0.78rem' }}
        title="Perbarui Koordinat GPS"
      >
        <RefreshCw size={14} className={loading ? 'spin' : ''} />
        {loading ? 'Mendeteksi...' : 'Perbarui'}
      </button>
    </div>
  );
}
