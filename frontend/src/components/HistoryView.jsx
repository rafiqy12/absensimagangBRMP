import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, ExternalLink, RefreshCw, X, CheckCircle2 } from 'lucide-react';

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
        showToast(data.message || 'Gagal memuat data riwayat.', 'error');
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
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <Calendar size={22} style={{ color: 'var(--kementan-gold)' }} />
            <span>Riwayat & Rekap Presensi</span>
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', marginTop: '0.2rem' }}>
            Log absensi terverifikasi dengan foto selfie kamera dan titik koordinat GPS
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div style={{
            background: 'rgba(5, 15, 10, 0.8)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border)',
            display: 'flex',
            gap: '0.25rem'
          }}>
            <button
              type="button"
              onClick={() => setViewMode('mine')}
              className={`nav-pill ${viewMode === 'mine' ? 'active' : ''}`}
              style={{ padding: '0.4rem 0.95rem', fontSize: '0.8rem' }}
            >
              Presensi Saya
            </button>
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`nav-pill ${viewMode === 'all' ? 'active' : ''}`}
              style={{ padding: '0.4rem 0.95rem', fontSize: '0.8rem' }}
            >
              Semua Magang
            </button>
          </div>

          <button
            type="button"
            onClick={fetchHistory}
            disabled={loading}
            className="btn-secondary"
            style={{ padding: '0.55rem 0.9rem', fontSize: '0.82rem' }}
            title="Muat Ulang Data"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Perbarui</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-subtle)' }}>
          <RefreshCw size={30} className="spin" style={{ margin: '0 auto 0.85rem', color: 'var(--primary-light)', display: 'block' }} />
          <span style={{ fontWeight: 600 }}>Memuat riwayat presensi...</span>
        </div>
      ) : history.length === 0 ? (
        <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--text-subtle)' }}>
          <div style={{ 
            width: 64, 
            height: 64, 
            borderRadius: '50%', 
            background: 'rgba(255, 255, 255, 0.03)', 
            border: '1px solid var(--border)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1rem',
            color: 'var(--text-faint)'
          }}>
            <Calendar size={28} />
          </div>
          <h4 style={{ color: '#fff', marginBottom: '0.35rem', fontWeight: 800 }}>Belum Ada Data Presensi</h4>
          <p style={{ fontSize: '0.85rem', maxWidth: '380px', margin: '0 auto', lineHeight: 1.5 }}>
            {viewMode === 'mine' 
              ? 'Anda belum memiliki catatan presensi. Silakan lakukan presensi masuk terlebih dahulu pada tab Presensi.' 
              : 'Belum ada data presensi yang tercatat dari seluruh peserta magang.'}
          </p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE VIEW */}
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Foto Selfie</th>
                  <th>Waktu & Tanggal</th>
                  {viewMode === 'all' && <th>Mahasiswa / NIM</th>}
                  <th>Status</th>
                  <th>Titik Koordinat GPS</th>
                  <th>Catatan Kegiatan</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    {/* Foto Selfie Thumbnail */}
                    <td>
                      <img
                        src={item.photo_path}
                        alt="Foto Selfie"
                        className="thumb-preview"
                        onClick={() => setSelectedPhoto(item)}
                        title="Klik untuk memperbesar foto selfie verifikasi"
                      />
                    </td>

                    {/* Waktu & Tanggal */}
                    <td>
                      <div style={{ fontWeight: 700, color: '#fff' }}>
                        {item.formatted_date.split(' - ')[1] || item.time_only}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', marginTop: '0.15rem' }}>
                        {item.formatted_date.split(' - ')[0]}
                      </div>
                    </td>

                    {/* Nama Mahasiswa (Jika Tampilan Rekap Semua) */}
                    {viewMode === 'all' && (
                      <td>
                        <div style={{ fontWeight: 700, color: '#fff' }}>
                          {item.student_name || item.student_nim}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.15rem' }}>
                          NIM: {item.student_nim} • {item.division || 'Umum'}
                        </div>
                      </td>
                    )}

                    {/* Status Masuk / Pulang */}
                    <td>
                      {item.type === 'masuk' ? (
                        <span className="badge badge-masuk">
                          <CheckCircle2 size={13} />
                          Masuk
                        </span>
                      ) : (
                        <span className="badge badge-pulang">
                          <CheckCircle2 size={13} />
                          Pulang
                        </span>
                      )}
                    </td>

                    {/* Titik Lokasi GPS */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'ui-monospace, monospace' }}>
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
                          <span>Buka Maps</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </td>

                    {/* Catatan / Rencana Kegiatan */}
                    <td>
                      <div style={{ 
                        fontSize: '0.84rem', 
                        color: item.note ? 'var(--text-main)' : 'var(--text-faint)', 
                        maxWidth: '260px',
                        lineHeight: 1.45
                      }}>
                        {item.note || '—'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARD LIST VIEW (Responsif Smartphone) */}
          <div className="history-mobile-list">
            {history.map((item) => (
              <div key={item.id} className="history-mobile-card">
                <img
                  src={item.photo_path}
                  alt="Selfie"
                  className="thumb-preview"
                  onClick={() => setSelectedPhoto(item)}
                  style={{ width: '64px', height: '64px' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
                      {item.formatted_date.split(' - ')[1] || item.time_only}
                    </span>
                    {item.type === 'masuk' ? (
                      <span className="badge badge-masuk">
                        <CheckCircle2 size={12} />
                        Masuk
                      </span>
                    ) : (
                      <span className="badge badge-pulang">
                        <CheckCircle2 size={12} />
                        Pulang
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', marginBottom: '0.35rem' }}>
                    {item.formatted_date.split(' - ')[0]}
                  </div>

                  {viewMode === 'all' && (
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--kementan-gold)', marginBottom: '0.35rem' }}>
                      {item.student_name} ({item.student_nim})
                    </div>
                  )}

                  {item.note && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', background: 'rgba(0,0,0,0.25)', padding: '0.35rem 0.55rem', borderRadius: 'var(--radius-xs)' }}>
                      "{item.note}"
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontFamily: 'monospace' }}>
                      {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                    </span>
                    <a
                      href={item.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-map-link"
                      style={{ padding: '0.25rem 0.55rem', fontSize: '0.74rem' }}
                    >
                      <MapPin size={11} />
                      <span>Maps</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal Zoom Foto Selfie */}
      {selectedPhoto && (
        <div className="modal-backdrop" onClick={() => setSelectedPhoto(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>
                  Verifikasi Foto Selfie Presensi
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '0.2rem' }}>
                  {selectedPhoto.student_name || selectedPhoto.student_nim} • Presensi {selectedPhoto.type.toUpperCase()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="modal-close"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              marginBottom: '1.15rem',
              background: '#020503',
              border: '1px solid var(--border)',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
            }}>
              <img
                src={selectedPhoto.photo_path}
                alt="Selfie Zoom"
                style={{ width: '100%', maxHeight: '440px', objectFit: 'contain', display: 'block' }}
              />
            </div>

            <div style={{ 
              background: 'var(--bg-card-subtle)', 
              padding: '1rem 1.15rem', 
              borderRadius: 'var(--radius-sm)', 
              fontSize: '0.84rem',
              border: '1px solid var(--border)'
            }}>
              <div style={{ marginBottom: '0.45rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-subtle)' }}>Waktu Presensi:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{selectedPhoto.formatted_date}</span>
              </div>
              <div style={{ marginBottom: '0.45rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-subtle)' }}>Koordinat GPS:</span>
                <span style={{ color: 'var(--kementan-gold)', fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>
                  {selectedPhoto.latitude}, {selectedPhoto.longitude}
                </span>
              </div>
              {selectedPhoto.note && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.45rem', marginTop: '0.45rem' }}>
                  <span style={{ color: 'var(--text-subtle)', display: 'block', marginBottom: '0.2rem' }}>Catatan Kegiatan:</span>
                  <span style={{ color: 'var(--text-main)', fontStyle: 'italic' }}>"{selectedPhoto.note}"</span>
                </div>
              )}
            </div>

            <div style={{ marginTop: '1.35rem', display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="btn-secondary"
                style={{ padding: '0.65rem 1.15rem' }}
              >
                Tutup
              </button>
              <a
                href={selectedPhoto.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ width: 'auto', padding: '0.65rem 1.35rem', fontSize: '0.86rem' }}
              >
                <MapPin size={16} />
                <span>Buka di Google Maps</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
