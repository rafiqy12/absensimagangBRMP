import React from 'react';
import { User, Building2, Briefcase, Award, LogOut, ShieldCheck, ChevronRight } from 'lucide-react';

export default function InternProfile({ student, onLogout, onSwitchToAdmin }) {
  return (
    <div className="intern-page">
      {/* Header */}
      <div className="intern-history-header">
        <h2 className="intern-page-title">Profil Magang</h2>
        <span className="intern-page-sub">Informasi akun dan data penempatan</span>
      </div>

      {/* Profile Card */}
      <div className="intern-card intern-profile-hero">
        <div className="intern-profile-avatar">
          {student?.name?.charAt(0)?.toUpperCase() || 'M'}
        </div>
        <h3 className="intern-profile-name">{student?.name}</h3>
        <p className="intern-profile-nim">NIM: {student?.nim}</p>
        <span className="intern-profile-status-badge">Peserta Magang Aktif</span>
      </div>

      {/* Detail Information */}
      <div className="intern-card intern-profile-details">
        <div className="intern-profile-row">
          <div className="intern-picon-wrap">
            <Building2 size={18} />
          </div>
          <div className="intern-prow-info">
            <span className="intern-prow-label">Instansi / Kampus</span>
            <span className="intern-prow-val">{student?.institution || 'PT Nusantara Digital'}</span>
          </div>
        </div>

        <div className="intern-prow-divider" />

        <div className="intern-prow-row">
          <div className="intern-picon-wrap">
            <Briefcase size={18} />
          </div>
          <div className="intern-prow-info">
            <span className="intern-prow-label">Divisi / Penempatan</span>
            <span className="intern-prow-val">{student?.division || 'UI/UX Intern'}</span>
          </div>
        </div>

        <div className="intern-prow-divider" />

        <div className="intern-prow-row">
          <div className="intern-picon-wrap">
            <Award size={18} />
          </div>
          <div className="intern-prow-info">
            <span className="intern-prow-label">Pembimbing Lapangan</span>
            <span className="intern-prow-val">{student?.supervisor || 'Dian Pratiwi'}</span>
          </div>
        </div>
      </div>


      {/* Logout Button */}
      <button
        type="button"
        className="intern-logout-btn"
        onClick={onLogout}
      >
        <LogOut size={18} />
        <span>Keluar dari Akun</span>
      </button>
    </div>
  );
}
