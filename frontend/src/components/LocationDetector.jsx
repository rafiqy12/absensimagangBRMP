import React, { useState, useEffect } from 'react';
import { MapPin, RefreshCw, CheckCircle2, AlertTriangle, Crosshair, Navigation } from 'lucide-react';

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
          msg = 'Izin akses lokasi ditolak. Silakan berikan izin lokasi pada ikon gembok browser.';
        } else if (err.code === 2) {
          msg = 'Sinyal lokasi tidak tersedia.';
        } else if (err.code === 3) {
          msg = 'Waktu permintaan lokasi habis (timeout). Silakan klik perbarui.';
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
        <div 
          className="location-icon" 
          style={{ 
            background: locationData 
              ? 'var(--success-subtle)' 
              : error 
                ? 'var(--danger-subtle)' 
                : 'var(--info-subtle)',
            color: locationData 
              ? 'var(--success-light)' 
              : error 
                ? 'var(--danger-light)' 
                : 'var(--info-light)'
          }}
        >
          <MapPin size={20} />
        </div>

        <div>
          <div className="location-title">
            <span>Titik Lokasi GPS</span>
            {locationData ? (
              <span className="badge badge-masuk">
                <CheckCircle2 size={12} />
                Terverifikasi
              </span>
            ) : error ? (
              <span className="badge" style={{ background: 'var(--danger-subtle)', color: 'var(--danger-light)', border: '1px solid var(--danger-border)' }}>
                Perlu Izin
              </span>
            ) : (
              <span className="badge badge-gold">
                Mencari GPS
              </span>
            )}
          </div>

          <div className="location-coords">
            {loading ? (
              <span style={{ color: 'var(--kementan-gold)' }}>Menghubungkan ke satelit GPS...</span>
            ) : locationData ? (
              <span>
                {locationData.latitude}, {locationData.longitude} (Akurasi: ±{locationData.accuracy}m)
              </span>
            ) : error ? (
              <span style={{ color: 'var(--danger-light)' }}>{error}</span>
            ) : (
              <span>Menunggu respons lokasi dari browser...</span>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={requestLocation}
        disabled={loading}
        className="btn-secondary"
        style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', flexShrink: 0 }}
        title="Perbarui Koordinat GPS"
      >
        <RefreshCw size={14} className={loading ? 'spin' : ''} />
        <span>{loading ? 'Mendeteksi...' : 'Perbarui'}</span>
      </button>
    </div>
  );
}
