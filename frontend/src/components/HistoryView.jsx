import React, { useState, useEffect } from 'react';
import { Clock, Calendar, MapPin, ExternalLink, RefreshCw, Eye, X, User, CheckCircle2 } from 'lucide-react';

export default function HistoryView({ currentNim, showToast }) {
  const [viewMode, setViewMode] = useState('mine'); // 'mine' or 'all'
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const url = viewMode === 'all' 
        ? 'api.php?action=get_history&all=true' 
        : `api.php?action=get_history&nim=${encodeURIComponent(currentNim)}`;
      
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setHistory(data.history || []);
      } else {
        showToast(data.message || 'Gagal memuat riwayat.', 'error');
      }
    } catch (err) {
      setLoading(false);
      showToast('Gagal terhubung ke server untuk memuat data.', 'error');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [viewMode, currentNim]);

  return (
    <div className="card">
      {/* Header History */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
            Riwayat & Rekap Presensi
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Log absensi lengkap dengan verifikasi foto selfie dan lokasi GPS
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: 'var(--bg-body)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border)',
            display: 'flex'
          }}>
            <button
              type="button"
              onClick={() => setViewMode('mine')}
              className={`nav-pill ${viewMode === 'mine' ? 'active' : ''}`}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
            >
              Presensi Saya
            </button>
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`nav-pill ${viewMode === 'all' ? 'active' : ''}`}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
            >
              Semua Magang
            </button>
          </div>

          <button
            type="button"
            onClick={fetchHistory}
            disabled={loading}
            className="btn-secondary"
            style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem' }}
            title="Muat Ulang"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Table History */}
      {loading ? (
        <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="spin" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
          <span>Memuat data presensi...</span>
        </div>
      ) : history.length === 0 ? (
        <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Calendar size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5, display: 'block' }} />
          <h4 style={{ color: '#fff', marginBottom: '0.25rem' }}>Belum Ada Data Presensi</h4>
          <p style={{ fontSize: '0.85rem' }}>
            {viewMode === 'mine' 
              ? 'Anda belum memiliki riwayat presensi. Silakan lakukan presensi masuk terlebih dahulu.' 
              : 'Belum ada data presensi yang tercatat dari seluruh anak magang.'}
          </p>
        </div>
      ) : (
        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Foto Selfie</th>
                <th>Waktu & Tanggal</th>
                {viewMode === 'all' && <th>Nama & NIM</th>}
                <th>Status</th>
                <th>Titik Lokasi GPS</th>
                <th>Catatan / Kegiatan</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  {/* Foto Thumbnail */}
                  <td>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img
                        src={item.photo_path}
                        alt="Foto Selfie"
                        className="thumb-preview"
                        onClick={() => setSelectedPhoto(item)}
                        title="Klik untuk melihat foto selfie ukuran besar"
                      />
                    </div>
                  </td>

                  {/* Waktu */}
                  <td>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                      {item.formatted_date.split(' - ')[1] || item.time_only}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {item.formatted_date.split(' - ')[0]}
                    </div>
                  </td>

                  {/* Nama jika view all */}
                  {viewMode === 'all' && (
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>
                        {item.student_name || item.student_nim}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        NIM: {item.student_nim} • {item.division || 'Umum'}
                      </div>
                    </td>
                  )}

                  {/* Tipe Masuk / Pulang */}
                  <td>
                    {item.type === 'masuk' ? (
                      <span className="badge-masuk">
                        <CheckCircle2 size={13} />
                        Masuk
                      </span>
                    ) : (
                      <span className="badge-pulang">
                        <CheckCircle2 size={13} />
                        Pulang
                      </span>
                    )}
                  </td>

                  {/* Lokasi Maps Link */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                      </span>
                      <a
                        href={item.maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-map-link"
                        title="Buka titik koordinat di Google Maps"
                      >
                        <MapPin size={13} />
                        <span>Buka di Maps</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </td>

                  {/* Catatan */}
                  <td>
                    <div style={{ fontSize: '0.82rem', color: item.note ? '#e2e8f0' : 'var(--text-faint)', maxWidth: '240px' }}>
                      {item.note || '-'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Zoom Foto Selfie */}
      {selectedPhoto && (
        <div className="modal-backdrop" onClick={() => setSelectedPhoto(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 700 }}>
                  Detail Foto Selfie Presensi
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {selectedPhoto.student_name || selectedPhoto.student_nim} • Presensi {selectedPhoto.type.toUpperCase()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              marginBottom: '1rem',
              background: '#000',
              border: '1px solid var(--border)'
            }}>
              <img
                src={selectedPhoto.photo_path}
                alt="Selfie Zoom"
                style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', display: 'block' }}
              />
            </div>

            <div style={{ background: 'var(--bg-body)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
              <div style={{ marginBottom: '0.35rem' }}>
                <strong style={{ color: '#fff' }}>Waktu Presensi:</strong>{' '}
                <span style={{ color: 'var(--text-muted)' }}>{selectedPhoto.formatted_date}</span>
              </div>
              <div style={{ marginBottom: '0.35rem' }}>
                <strong style={{ color: '#fff' }}>Koordinat:</strong>{' '}
                <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {selectedPhoto.latitude}, {selectedPhoto.longitude}
                </span>
              </div>
              {selectedPhoto.note && (
                <div>
                  <strong style={{ color: '#fff' }}>Catatan:</strong>{' '}
                  <span style={{ color: '#e2e8f0' }}>{selectedPhoto.note}</span>
                </div>
              )}
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <a
                href={selectedPhoto.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ width: 'auto', padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
              >
                <MapPin size={16} />
                Lihat di Google Maps
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
