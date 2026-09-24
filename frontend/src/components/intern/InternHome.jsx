import React, { useState } from 'react';
import { Camera, Calendar, FileEdit, MapPin, Bell, Clock, Building2, CheckCircle2, ChevronRight, X, LogOut } from 'lucide-react';
import brmpLogo from '../../assets/logo-brmp.png';

export default function InternHome({ student, todayStatus, onOpenAttendance, onNavigateTab, offices = [], onLogout }) {
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Format current date Indonesian
  const now = new Date();
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const dateStr = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;

  const hasMasuk = todayStatus?.has_masuk;
  const hasPulang = todayStatus?.has_pulang;

  // Status badge label
  let statusBadge = { label: 'Belum presensi', class: 'status-gray' };
  let actionLabel = 'Presensi Masuk';
  let actionType = 'masuk';

  if (hasMasuk && !hasPulang) {
    statusBadge = { label: 'Belum pulang', class: 'status-green-pill' };
    actionLabel = 'Presensi Pulang';
    actionType = 'pulang';
  } else if (hasMasuk && hasPulang) {
    statusBadge = { label: 'Sudah pulang', class: 'status-blue-pill' };
    actionLabel = 'Presensi Selesai';
    actionType = 'done';
  }

  const jamMasukStr = hasMasuk ? hasMasuk.time_str || hasMasuk.created_at.substr(11, 5).replace(':', '.') : '--.--';
  const durasiStr = todayStatus?.current_duration || (hasMasuk && !hasPulang ? '1j 39m' : '-');

  return (
    <div className="intern-page">
      {/* Mobile Top App Bar */}
      <div className="intern-app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={brmpLogo} alt="Logo BRMP DIY" className="intern-topbar-logo" />
          <div>
            <div className="intern-greeting-sub">Selamat pagi,</div>
            <h2 className="intern-greeting-name">{student?.name || 'Peserta Magang'}</h2>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button type="button" className="intern-icon-btn" title="Notifikasi" onClick={() => alert('Tidak ada notifikasi baru hari ini.')}>
            <Bell size={19} />
            <span className="notif-dot" />
          </button>
          <button 
            type="button" 
            className="intern-icon-btn text-danger" 
            title="Keluar / Ganti Akun NIM (Halaman Login)"
            onClick={onLogout}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Main Attendance Card (Page 2 PDF) */}
      <div className="intern-card intern-presence-card">
        <div className="intern-presence-top">
          <span className="intern-presence-date">{dateStr}</span>
          <span className={`intern-pill-badge ${statusBadge.class}`}>{statusBadge.label}</span>
        </div>

        <div className="intern-stat-grid">
          <div className="intern-stat-box">
            <span className="intern-stat-title">Jam masuk</span>
            <span className="intern-stat-val">{jamMasukStr}</span>
          </div>
          <div className="intern-stat-box">
            <span className="intern-stat-title">Durasi</span>
            <span className="intern-stat-val">{durasiStr}</span>
          </div>
        </div>

        <button
          type="button"
          className="intern-primary-btn"
          disabled={actionType === 'done'}
          onClick={() => onOpenAttendance(actionType)}
        >
          <Camera size={20} />
          <span>{actionLabel}</span>
        </button>
      </div>

      {/* Quick Access Section */}
      <div className="intern-section">
        <h3 className="intern-section-title">Akses cepat</h3>
        <div className="intern-quick-grid">
          <button
            type="button"
            className="intern-quick-card"
            onClick={() => onNavigateTab('riwayat')}
          >
            <div className="intern-quick-icon-wrap">
              <Calendar size={22} />
            </div>
            <span className="intern-quick-label">Riwayat</span>
          </button>

          <button
            type="button"
            className="intern-quick-card"
            onClick={() => onNavigateTab('logbook')}
          >
            <div className="intern-quick-icon-wrap">
              <FileEdit size={22} />
            </div>
            <span className="intern-quick-label">Isi Logbook</span>
          </button>

          <button
            type="button"
            className="intern-quick-card"
            onClick={() => setShowLocationModal(true)}
          >
            <div className="intern-quick-icon-wrap">
              <MapPin size={22} />
            </div>
            <span className="intern-quick-label">Lokasi Kantor</span>
          </button>
        </div>
      </div>

      {/* Placement & Supervisor Info Card */}
      <div className="intern-section">
        <div className="intern-placement-card">
          <div className="intern-placement-icon">
            <img src={brmpLogo} alt="BRMP DIY" className="intern-placement-logo-img" />
          </div>
          <div className="intern-placement-info">
            <h4 className="intern-placement-title">
              {student?.institution === 'PT Nusantara Digital' ? 'BRMP DIY' : (student?.institution || 'BRMP DIY')}
            </h4>
            <p className="intern-placement-meta">
              {student?.division || 'Peserta Magang'} · Pembimbing: {student?.supervisor || 'Pembimbing Magang'}
            </p>
          </div>
        </div>
      </div>

      {/* Modal 3 Lokasi Kantor */}
      {showLocationModal && (
        <div className="intern-modal-backdrop" onClick={() => setShowLocationModal(false)}>
          <div className="intern-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="intern-modal-header">
              <h3>Daftar 3 Lokasi Kantor Resmi</h3>
              <button type="button" className="btn-close-sheet" onClick={() => setShowLocationModal(false)}>
                <X size={20} />
              </button>
            </div>
            <p className="intern-modal-sub">
              Sistem secara otomatis mendeteksi kantor terdekat dari koordinat Anda saat presensi:
            </p>

            <div className="intern-office-list">
              {offices.map((office, idx) => (
                <div key={office.id || idx} className="intern-office-card">
                  <div className="intern-office-header">
                    <span className="intern-office-badge">Lokasi {idx + 1}</span>
                    <span className="intern-office-radius">Radius {office.radius_meters || 150}m</span>
                  </div>
                  <h4 className="intern-office-name">{office.name}</h4>
                  <p className="intern-office-addr">{office.address}</p>
                  <div className="intern-office-coords">
                    Lat: {office.latitude} · Long: {office.longitude}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
