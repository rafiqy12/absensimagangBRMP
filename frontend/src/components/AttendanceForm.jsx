import React, { useState } from 'react';
import { LogIn, LogOut, CheckCircle2, Lock, Send, FileText, AlertCircle } from 'lucide-react';

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
      {/* 1. Tipe Presensi Selector */}
      <div className="type-selector">
        <button
          type="button"
          onClick={() => setType('masuk')}
          className={`type-btn type-masuk ${type === 'masuk' ? 'active' : ''}`}
        >
          <LogIn size={18} />
          Presensi Masuk
        </button>

        <button
          type="button"
          onClick={() => setType('pulang')}
          className={`type-btn type-pulang ${type === 'pulang' ? 'active' : ''}`}
        >
          <LogOut size={18} />
          Presensi Pulang
        </button>
      </div>

      {/* 2. Status Kehadiran Hari Ini */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1.15rem',
        marginBottom: '1.25rem',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.75rem'
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Status Masuk Hari Ini:</span>
          {todayStatus?.has_masuk ? (
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={15} /> Tercatat ({todayStatus.has_masuk.created_at.split(' ')[1]?.slice(0, 5)} WIB)
            </span>
          ) : (
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>Belum Absen Masuk</span>
          )}
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Status Pulang Hari Ini:</span>
          {todayStatus?.has_pulang ? (
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fb923c', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={15} /> Tercatat ({todayStatus.has_pulang.created_at.split(' ')[1]?.slice(0, 5)} WIB)
            </span>
          ) : (
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>Belum Absen Pulang</span>
          )}
        </div>
      </div>

      {/* 3. Catatan / Rencana Kegiatan */}
      <div className="form-group">
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FileText size={15} style={{ color: 'var(--text-muted)' }} />
          Catatan / Rencana Kegiatan Hari Ini (Opsional)
        </label>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Contoh: Mengerjakan modul laporan frontend dan diskusi bersama mentor..."
          className="form-textarea"
        />
      </div>

      {/* 4. Verifikasi Kelengkapan Presensi */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.75rem 1rem',
        marginBottom: '1.25rem',
        fontSize: '0.82rem'
      }}>
        <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '0.4rem' }}>
          Syarat Validasi Presensi:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: capturedPhoto ? '#34d399' : '#94a3b8' }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', background: capturedPhoto ? '#10b981' : '#475569', display: 'inline-block' }} />
            Foto Selfie Langsung Kamera: {capturedPhoto ? 'Sudah Diambil' : 'Belum Diambil'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: locationData ? '#34d399' : '#94a3b8' }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', background: locationData ? '#10b981' : '#475569', display: 'inline-block' }} />
            Titik Koordinat GPS: {locationData ? 'Lokasi Terdeteksi' : 'Belum Terdeteksi'}
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
                ? 'linear-gradient(135deg, #10b981, #059669)' 
                : 'linear-gradient(135deg, #f97316, #ea580c)')
            : undefined
        }}
      >
        {submitting ? (
          <>
            <span className="pulse-dot" />
            Mengirim Presensi...
          </>
        ) : !capturedPhoto ? (
          <>
            <Lock size={18} />
            Ambil Foto Selfie Terlebih Dahulu
          </>
        ) : !locationData ? (
          <>
            <Lock size={18} />
            Menunggu Deteksi Lokasi GPS...
          </>
        ) : (
          <>
            <Send size={18} />
            Kirim Presensi {type === 'masuk' ? 'Masuk' : 'Pulang'} Sekarang
          </>
        )}
      </button>
    </form>
  );
}
