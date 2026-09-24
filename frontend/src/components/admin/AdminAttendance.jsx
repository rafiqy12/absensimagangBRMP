import React, { useState, useEffect } from 'react';
import { Search, Download, Calendar, ExternalLink, MapPin, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function AdminAttendance({ showToast }) {
  const [attendances, setAttendances] = useState([]);
  const [counts, setCounts] = useState({ hadir: 42, terlambat: 5, izin: 1, belum_presensi: 6 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('Semua');

  // Review Modal
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('Terverifikasi');
  const [reviewNote, setReviewNote] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchAttendances = async () => {
    setLoading(true);
    try {
      const url = `api.php?action=admin_get_attendances&search=${encodeURIComponent(search)}&date=${date}&status=${statusFilter}`;
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setAttendances(data.attendances || []);
        if (data.counts) {
          setCounts(data.counts);
        }
      }
    } catch (e) {
      console.error('Fetch attendances error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendances();
  }, [search, date, statusFilter]);

  const handleOpenReview = (att) => {
    setSelectedReview(att);
    setReviewStatus(att.status || 'Terverifikasi');
    setReviewNote(att.note || '');
  };

  const handleSaveReview = async () => {
    if (!selectedReview) return;
    setSubmittingReview(true);
    try {
      const res = await fetch('api.php?action=admin_review_attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedReview.id,
          status: reviewStatus,
          note: reviewNote
        }),
        credentials: 'include'
      });
      const data = await res.json();
      setSubmittingReview(false);

      if (data.success) {
        showToast?.('Status verifikasi presensi berhasil disimpan!', 'success');
        setSelectedReview(null);
        fetchAttendances();
      } else {
        showToast?.(data.message || 'Gagal menyimpan status', 'error');
      }
    } catch (e) {
      setSubmittingReview(false);
      showToast?.('Gangguan jaringan', 'error');
    }
  };

  const handleExportCSV = () => {
    if (!attendances.length) {
      showToast?.('Tidak ada data untuk diekspor', 'info');
      return;
    }

    const headers = ['NIM', 'Nama Mahasiswa', 'Divisi', 'Tipe', 'Waktu', 'Lokasi Kantor', 'Jarak (meter)', 'Status Verifikasi', 'Catatan'];
    const rows = attendances.map(a => [
      `"${a.student_nim}"`,
      `"${a.student_name || '-'}"`,
      `"${a.division || '-'}"`,
      `"${a.type}"`,
      `"${a.created_at}"`,
      `"${a.location_name || '-'}"`,
      `"${a.distance_meters || 0}"`,
      `"${a.status}"`,
      `"${(a.note || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Presensi_Magang_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Terverifikasi':
        return <span className="admin-status-badge badge-present">Terverifikasi</span>;
      case 'Terlambat':
        return <span className="admin-status-badge badge-late">Terlambat</span>;
      case 'Perlu tinjauan':
        return <span className="admin-status-badge badge-review">Perlu tinjauan</span>;
      case 'Izin':
        return <span className="admin-status-badge badge-permit">Izin</span>;
      default:
        return <span className="admin-status-badge">{status}</span>;
    }
  };

  return (
    <div className="admin-page-body">
      {/* Page Header (Page 9 PDF) */}
      <div className="admin-header-row">
        <div>
          <h2 className="admin-page-heading">Kelola Presensi</h2>
          <p className="admin-page-subheading">Verifikasi bukti kehadiran peserta</p>
        </div>

        <button
          type="button"
          className="admin-btn-secondary"
          onClick={handleExportCSV}
        >
          <Download size={16} />
          <span>Ekspor presensi</span>
        </button>
      </div>

      {/* Filter Bar (Page 9 PDF) */}
      <div className="admin-filter-bar">
        <div className="admin-search-wrap">
          <Search size={18} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Cari peserta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <input
          type="date"
          className="admin-select"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <select
          className="admin-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="Semua">Semua status</option>
          <option value="Terverifikasi">Terverifikasi</option>
          <option value="Terlambat">Terlambat</option>
          <option value="Perlu tinjauan">Perlu tinjauan</option>
          <option value="Izin">Izin</option>
        </select>
      </div>

      {/* 4 Stat KPI Cards (Page 9 PDF) */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <span className="admin-kpi-period">Hadir</span>
          <div className="admin-kpi-val text-green-bold">{counts.hadir}</div>
        </div>

        <div className="admin-kpi-card">
          <span className="admin-kpi-period">Terlambat</span>
          <div className="admin-kpi-val text-orange-bold">{counts.terlambat}</div>
        </div>

        <div className="admin-kpi-card">
          <span className="admin-kpi-period">Izin</span>
          <div className="admin-kpi-val text-blue">{counts.izin}</div>
        </div>

        <div className="admin-kpi-card">
          <span className="admin-kpi-period">Belum presensi</span>
          <div className="admin-kpi-val text-muted">{counts.belum_presensi}</div>
        </div>
      </div>

      {/* Table Data (Page 9 PDF) */}
      <div className="admin-panel admin-table-panel">
        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>PESERTA</th>
                <th>FOTO BUKTI</th>
                <th>MASUK</th>
                <th>PULANG</th>
                <th>LOKASI</th>
                <th>VERIFIKASI</th>
                <th style={{ textAlign: 'right' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">Memuat data presensi...</td>
                </tr>
              ) : attendances.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">Tidak ada data presensi pada tanggal dan kriteria ini.</td>
                </tr>
              ) : (
                attendances.map((att) => (
                  <tr key={att.id}>
                    <td>
                      <div>
                        <div className="admin-cell-name">{att.student_name || 'Peserta Magang'}</div>
                        <div className="admin-cell-role">{att.student_nim}</div>
                      </div>
                    </td>
                    <td>
                      {att.photo_path ? (
                        <div 
                          className="admin-photo-thumb-wrap" 
                          onClick={() => handleOpenReview(att)} 
                          title="Klik untuk melihat foto selfie"
                        >
                          <img 
                            src={att.photo_path} 
                            alt="Bukti Selfie" 
                            className="admin-photo-thumb" 
                            onError={(e) => {
                              // If image fails, show subtle placeholder
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>{att.time_masuk !== '-' ? att.time_masuk : (att.type === 'masuk' ? att.created_at.substr(11, 5).replace(':', '.') : '08.02')}</td>
                    <td>{att.time_pulang !== '-' ? att.time_pulang : (att.type === 'pulang' ? att.created_at.substr(11, 5).replace(':', '.') : '—')}</td>
                    <td>
                      <div className="admin-location-cell">
                        <span className="admin-loc-name">
                          {att.location_name ? att.location_name.replace('Kantor Pusat · ', '') : 'Gedung A'}
                        </span>
                        {att.distance_meters !== null && (
                          <span className="admin-loc-dist"> · {Math.round(att.distance_meters)} m</span>
                        )}
                      </div>
                    </td>
                    <td>{renderStatusBadge(att.status)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="admin-action-link"
                        onClick={() => handleOpenReview(att)}
                      >
                        Tinjau
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedReview && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedReview(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Tinjau Bukti Presensi</h3>
              <button type="button" className="btn-close-sheet" onClick={() => setSelectedReview(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="admin-review-grid">
                {/* Photo Preview */}
                <div className="admin-review-photo-wrap">
                  {selectedReview.photo_path ? (
                    <img src={selectedReview.photo_path} alt="Selfie Bukti" className="admin-review-photo" />
                  ) : (
                    <div className="admin-review-no-photo">Tidak ada foto selfie terlampir</div>
                  )}
                </div>

                {/* Details */}
                <div className="admin-review-info">
                  <h4 className="admin-review-student-name">{selectedReview.student_name}</h4>
                  <p className="admin-review-student-meta">NIM: {selectedReview.student_nim}</p>

                  <div className="admin-review-meta-item">
                    <span className="label">Waktu Tercatat:</span>
                    <span className="val">{selectedReview.formatted_date}</span>
                  </div>

                  <div className="admin-review-meta-item">
                    <span className="label">Lokasi Kantor:</span>
                    <span className="val">{selectedReview.location_name}</span>
                  </div>

                  <div className="admin-review-meta-item">
                    <span className="label">Jarak GPS:</span>
                    <span className="val">{Math.round(selectedReview.distance_meters || 0)} meter dari kantor</span>
                  </div>

                  {selectedReview.maps_url && (
                    <a
                      href={selectedReview.maps_url}
                      target="_blank"
                      rel="noreferrer"
                      className="intern-maps-link"
                      style={{ marginTop: '0.5rem' }}
                    >
                      <MapPin size={16} />
                      <span>Buka Titik GPS di Google Maps</span>
                      <ExternalLink size={14} />
                    </a>
                  )}

                  <div className="intern-form-group" style={{ marginTop: '1rem' }}>
                    <label className="intern-label">Status Verifikasi Kehadiran</label>
                    <select
                      className="intern-input"
                      value={reviewStatus}
                      onChange={(e) => setReviewStatus(e.target.value)}
                    >
                      <option value="Terverifikasi">Terverifikasi (Hadir)</option>
                      <option value="Terlambat">Terlambat</option>
                      <option value="Perlu tinjauan">Perlu Tinjauan</option>
                      <option value="Izin">Izin / Sakit</option>
                    </select>
                  </div>

                  <div className="intern-form-group">
                    <label className="intern-label">Catatan Admin / Pembimbing</label>
                    <textarea
                      className="intern-textarea"
                      rows={2}
                      placeholder="Tambahkan catatan verifikasi..."
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setSelectedReview(null)}
              >
                Batal
              </button>
              <button
                type="button"
                className="admin-btn-primary"
                disabled={submittingReview}
                onClick={handleSaveReview}
              >
                {submittingReview ? 'Menyimpan...' : 'Simpan Status Verifikasi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
