import React from 'react';
import { Check, CheckCircle2, MapPin } from 'lucide-react';

export default function InternSuccessModal({ 
  result, 
  onBackToHome, 
  onViewHistory 
}) {
  const isPulang = result?.type === 'pulang';
  const jenisStr = isPulang ? 'Presensi Pulang' : 'Presensi Masuk';
  const waktuStr = result?.time || '17.03 WIB';
  const durasiStr = result?.work_duration || (isPulang ? '9 jam 1 menit' : 'Dimulai');

  return (
    <div className="intern-fullscreen-modal success-screen">
      <div className="intern-success-container">
        {/* Big Success Icon */}
        <div className="intern-success-icon-wrap">
          <div className="intern-success-circle">
            <Check size={48} strokeWidth={3} />
          </div>
        </div>

        {/* Success Headings */}
        <h2 className="intern-success-title">Presensi berhasil!</h2>
        <p className="intern-success-sub">
          {isPulang 
            ? 'Kehadiran pulangmu sudah tercatat. Terima kasih atas kerja keras hari ini.' 
            : 'Kehadiran masukmu sudah tercatat. Selamat beraktivitas dan semangat magang!'}
        </p>

        {/* Summary Card (Page 4 PDF) */}
        <div className="intern-summary-card">
          <div className="intern-summary-row">
            <span className="intern-summary-label">Jenis</span>
            <span className="intern-summary-val bold">{jenisStr}</span>
          </div>

          <div className="intern-summary-row">
            <span className="intern-summary-label">Waktu</span>
            <span className="intern-summary-val">{waktuStr}</span>
          </div>

          {isPulang && (
            <div className="intern-summary-row">
              <span className="intern-summary-label">Durasi kerja</span>
              <span className="intern-summary-val">{durasiStr}</span>
            </div>
          )}

          {/* Location Area Badge */}
          <div className="intern-area-status-box">
            <MapPin size={18} className="text-emerald" />
            <span>
              {result?.in_radius !== false ? 'Lokasi sesuai area kantor' : 'Di luar radius kantor (Perlu tinjauan)'}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="intern-success-actions">
          <button
            type="button"
            className="intern-primary-btn btn-large"
            onClick={onBackToHome}
          >
            Kembali ke Beranda
          </button>

          <button
            type="button"
            className="intern-secondary-text-btn"
            onClick={onViewHistory}
          >
            Lihat riwayat presensi
          </button>
        </div>
      </div>
    </div>
  );
}
