import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Users, 
  Clock, 
  BookOpen, 
  Download, 
  ChevronRight, 
  UserPlus, 
  CheckCircle2, 
  FileCheck2,
  CalendarCheck
} from 'lucide-react';

export default function AdminDashboard({ admin, onNavigateMenu }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('api.php?action=admin_get_stats', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setStats(data);
      }
    } catch (e) {
      console.error('Fetch stats error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const kpi = stats?.kpi || {
    attended_today: 42,
    active_students: 48,
    percent_hadir: 87.5,
    late_today: 5,
    pending_logbooks: 12,
    divisions_count: 3
  };

  const trendData = stats?.trend_data || [
    { label: 'Kam', count: 38 },
    { label: 'Jum', count: 44 },
    { label: 'Sen', count: 40 },
    { label: 'Sel', count: 45 },
    { label: 'Rab', count: 43 },
    { label: 'Kam', count: 46 },
    { label: 'Hari ini', count: 42, is_today: true },
  ];

  const recent = stats?.recent_activities || [
    { id: 1, student_name: 'Raka Aditya', type_desc: 'Presensi masuk · 08.02', status: 'Hadir', badgeClass: 'badge-present' },
    { id: 2, student_name: 'Siti Nurhaliza', type_desc: 'Mengirim logbook harian', status: 'Menunggu', badgeClass: 'badge-waiting' },
    { id: 3, student_name: 'Bagas Pratama', type_desc: 'Presensi masuk · 08.17', status: 'Terlambat', badgeClass: 'badge-late' },
  ];

  const handleDownloadReport = () => {
    window.open('api.php?action=admin_get_attendances&export=csv', '_blank');
  };

  return (
    <div className="admin-page-body">
      {/* Page Header (Page 7 PDF) */}
      <div className="admin-header-row">
        <div>
          <h2 className="admin-page-heading">Dashboard</h2>
          <p className="admin-page-subheading">Ringkasan operasional hari ini</p>
        </div>

        <button
          type="button"
          className="admin-btn-secondary"
          onClick={handleDownloadReport}
        >
          <Download size={16} />
          <span>Unduh laporan</span>
        </button>
      </div>

      {/* Greeting Banner */}
      <div className="admin-welcome-banner">
        <h3 className="admin-welcome-title">
          Selamat pagi, {admin?.name ? admin.name.split(' ')[0] : 'Nadia'} 👋
        </h3>
        <p className="admin-welcome-sub">
          Pantau kehadiran dan progres peserta magang dalam satu tempat.
        </p>
      </div>

      {/* 4 Stat KPI Cards (Page 7 PDF) */}
      <div className="admin-kpi-grid">
        {/* KPI 1: Kehadiran Hari ini */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-wrap icon-green">
              <UserCheck size={18} />
            </div>
            <span className="admin-kpi-period">Hari ini</span>
          </div>
          <div className="admin-kpi-val">
            {kpi.attended_today} / {kpi.active_students}
          </div>
          <div className="admin-kpi-sub">
            Kehadiran hari ini <span className="text-green-bold">{kpi.percent_hadir}% hadir</span>
          </div>
        </div>

        {/* KPI 2: Peserta Aktif */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-wrap icon-blue">
              <Users size={18} />
            </div>
            <span className="admin-kpi-period">Hari ini</span>
          </div>
          <div className="admin-kpi-val">{kpi.active_students}</div>
          <div className="admin-kpi-sub">
            Peserta aktif <span className="text-muted">{kpi.divisions_count} divisi</span>
          </div>
        </div>

        {/* KPI 3: Terlambat */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-wrap icon-orange">
              <Clock size={18} />
            </div>
            <span className="admin-kpi-period">Hari ini</span>
          </div>
          <div className="admin-kpi-val">{kpi.late_today}</div>
          <div className="admin-kpi-sub">
            Terlambat <span className="text-green-bold">Turun 2 dari kemarin</span>
          </div>
        </div>

        {/* KPI 4: Logbook Menunggu */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-wrap icon-yellow">
              <BookOpen size={18} />
            </div>
            <span className="admin-kpi-period">Hari ini</span>
          </div>
          <div className="admin-kpi-val">{kpi.pending_logbooks}</div>
          <div className="admin-kpi-sub">
            Logbook menunggu <span className="text-orange-bold">Perlu ditinjau</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Tren Kehadiran & Aksi Cepat */}
      <div className="admin-dashboard-split">
        {/* Tren Kehadiran 7 Hari */}
        <div className="admin-panel admin-trend-panel">
          <div className="admin-panel-header">
            <h4 className="admin-panel-title">Tren kehadiran</h4>
            <span className="admin-panel-badge">7 hari terakhir</span>
          </div>

          <div className="admin-chart-bars">
            {trendData.map((item, idx) => {
              const maxVal = 50;
              const heightPct = Math.min(100, Math.max(20, (item.count / maxVal) * 100));
              return (
                <div key={idx} className="admin-bar-col">
                  <div className="admin-bar-track">
                    <div 
                      className={`admin-bar-fill ${item.is_today ? 'bar-today' : ''}`}
                      style={{ height: `${heightPct}%` }}
                      title={`${item.label}: ${item.count} hadir`}
                    />
                  </div>
                  <span className={`admin-bar-label ${item.is_today ? 'label-today' : ''}`}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Aksi Cepat */}
        <div className="admin-panel admin-quick-panel">
          <div className="admin-panel-header">
            <h4 className="admin-panel-title">Aksi cepat</h4>
          </div>

          <div className="admin-quick-links">
            <button
              type="button"
              className="admin-quick-row"
              onClick={() => onNavigateMenu('peserta')}
            >
              <div className="admin-qr-left">
                <div className="admin-qr-icon">
                  <UserPlus size={18} />
                </div>
                <span>Tambah peserta</span>
              </div>
              <ChevronRight size={18} className="text-gray" />
            </button>

            <button
              type="button"
              className="admin-quick-row"
              onClick={() => onNavigateMenu('presensi')}
            >
              <div className="admin-qr-left">
                <div className="admin-qr-icon">
                  <CalendarCheck size={18} />
                </div>
                <span>Tinjau presensi</span>
              </div>
              <ChevronRight size={18} className="text-gray" />
            </button>

            <button
              type="button"
              className="admin-quick-row"
              onClick={() => onNavigateMenu('logbook')}
            >
              <div className="admin-qr-left">
                <div className="admin-qr-icon">
                  <FileCheck2 size={18} />
                </div>
                <span>Periksa logbook</span>
              </div>
              <ChevronRight size={18} className="text-gray" />
            </button>
          </div>
        </div>
      </div>

      {/* Aktivitas Terbaru (Page 7 PDF) */}
      <div className="admin-panel admin-recent-panel">
        <div className="admin-panel-header">
          <h4 className="admin-panel-title">Aktivitas terbaru</h4>
          <button
            type="button"
            className="admin-link-btn"
            onClick={() => onNavigateMenu('presensi')}
          >
            Lihat semua
          </button>
        </div>

        <div className="admin-recent-grid">
          {recent.map((item, idx) => (
            <div key={item.id || idx} className="admin-recent-item">
              <div className="admin-recent-left">
                <div className="admin-recent-avatar">
                  {item.student_name ? item.student_name.charAt(0) : 'U'}
                </div>
                <div>
                  <h5 className="admin-recent-name">{item.student_name}</h5>
                  <p className="admin-recent-sub">
                    {item.type_desc || `Presensi ${item.type || 'masuk'} · ${item.time_str || '08.02'}`}
                  </p>
                </div>
              </div>
              <span className={`admin-status-badge ${item.badgeClass || (item.status === 'Terlambat' ? 'badge-late' : item.status === 'Menunggu' ? 'badge-waiting' : 'badge-present')}`}>
                {item.status || 'Hadir'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
