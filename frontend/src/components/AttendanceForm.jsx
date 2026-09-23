import React, { useState } from 'react';
import { LogIn, LogOut, CheckCircle2, Lock, Send, FileText, AlertCircle, ShieldAlert, Sparkles, Check, X } from 'lucide-react';

export default function AttendanceForm({
  todayStatus,
  capturedPhoto,
  locationData,
  onSubmit,
  submitting
}) {
  const [type, setType] = useState('masuk');
  const [note, setNote] = useState('');

  const isReady = Boolean(capturedPhoto && locationData && locationData.latitude && locationData.longitude);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isReady || submitting) return;

    onSubmit({
      type,
      note,
      photo: capturedPhoto,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      location_name: locationData.locationName
    });
  };

  return (
    <form onSubmit={handleSubmit} className="attendance-form">
      {/* 1. Tipe Presensi Selector (Segmented Control) */}
      <div className="type-selector">
        <button
          type="button"
          onClick={() => setType('masuk')}
          className={`type-btn type-masuk ${type === 'masuk' ? 'active' : ''}`}
        >
          <LogIn size={18} />
          <span>Presensi Masuk</span>
        </button>

        <button
          type="button"
          onClick={() => setType('pulang')}
          className={`type-btn type-pulang ${type === 'pulang' ? 'active' : ''}`}
        >
          <LogOut size={18} />
          <span>Presensi Pulang</span>
        </button>
      </div>

      {/* 2. Status Kehadiran Hari Ini */}
      <div className="status-today-grid">
        <div className="status-today-item">
          <span className="status-today-label">Status Masuk Hari Ini</span>
          {todayStatus?.has_masuk ? (
            <span className="status-today-val" style={{ color: 'var(--success-light)' }}>
              <CheckCircle2 size={16} />
              <span>Tercatat ({todayStatus.has_masuk.created_at.split(' ')[1]?.slice(0, 5)} WIB)</span>
            </span>
          ) : (
            <span className="status-today-val" style={{ color: 'var(--text-subtle)' }}>
              <span>○ Belum Absen Masuk</span>
            </span>
          )}
        </div>

        <div className="status-today-item">
          <span className="status-today-label">Status Pulang Hari Ini</span>
          {todayStatus?.has_pulang ? (
            <span className="status-today-val" style={{ color: 'var(--warning-light)' }}>
              <CheckCircle2 size={16} />
              <span>Tercatat ({todayStatus.has_pulang.created_at.split(' ')[1]?.slice(0, 5)} WIB)</span>
            </span>
          ) : (
            <span className="status-today-val" style={{ color: 'var(--text-subtle)' }}>
              <span>○ Belum Absen Pulang</span>
            </span>
          )}
        </div>
      </div>

      {/* 3. Catatan / Rencana Kegiatan */}
      <div className="form-group">
        <label className="form-label">
          <FileText size={15} style={{ color: 'var(--kementan-gold)' }} />
          <span>Catatan / Rencana Kegiatan Harian (Opsional)</span>
        </label>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Tuliskan aktivitas atau tugas magang hari ini (misal: pengujian instrumen laboratorium, analisis data)..."
          className="form-textarea"
        />
      </div>

      {/* 4. Verifikasi Kelengkapan Presensi (Checklist) */}
      <div className="validation-checklist">
        <div className="validation-header">
          <ShieldAlert size={16} style={{ color: 'var(--kementan-gold)' }} />
          <span>Kelengkapan Syarat Presensi:</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          <div 
            className="validation-item" 
            style={{ color: capturedPhoto ? 'var(--success-light)' : 'var(--text-subtle)' }}
          >
            {capturedPhoto ? (
              <span className="validation-indicator" style={{ background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={10} color="#fff" />
              </span>
            ) : (
              <span className="validation-indicator" style={{ background: 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={10} color="#94a3b8" />
              </span>
            )}
            <span>Foto Selfie Kamera Langsung: {capturedPhoto ? 'Sudah Diambil' : 'Belum Diambil'}</span>
          </div>

          <div 
            className="validation-item" 
            style={{ color: locationData ? 'var(--success-light)' : 'var(--text-subtle)' }}
          >
            {locationData ? (
              <span className="validation-indicator" style={{ background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={10} color="#fff" />
              </span>
            ) : (
              <span className="validation-indicator" style={{ background: 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={10} color="#94a3b8" />
              </span>
            )}
            <span>Titik Koordinat GPS: {locationData ? 'Lokasi Terverifikasi' : 'Belum Terdeteksi'}</span>
          </div>
        </div>
      </div>

      {/* 5. Tombol Submit Presensi */}
      <button
        type="submit"
        disabled={!isReady || submitting}
        className="btn-primary"
        style={{
          background: isReady 
            ? (type === 'masuk' 
                ? 'linear-gradient(135deg, #16a34a, #15803d)' 
                : 'linear-gradient(135deg, #ea580c, #c2410c)')
            : undefined,
          boxShadow: isReady 
            ? (type === 'masuk' 
                ? '0 4px 18px rgba(34, 197, 94, 0.35)' 
                : '0 4px 18px rgba(234, 88, 12, 0.35)') 
            : undefined
        }}
      >
        {submitting ? (
          <>
            <span className="pulse-dot" />
            <span>Mengirim Data Presensi...</span>
          </>
        ) : !capturedPhoto ? (
          <>
            <Lock size={18} />
            <span>Ambil Foto Selfie Terlebih Dahulu</span>
          </>
        ) : !locationData ? (
          <>
            <Lock size={18} />
            <span>Menunggu Deteksi Titik GPS...</span>
          </>
        ) : (
          <>
            <Send size={18} />
            <span>Kirim Presensi {type === 'masuk' ? 'Masuk' : 'Pulang'} Sekarang</span>
          </>
        )}
      </button>
    </form>
  );
}
