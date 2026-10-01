import React, { useState, useEffect } from 'react';
import { Search, Clock, Paperclip, Calendar, Download, BookOpen, User, Building } from 'lucide-react';

export default function AdminLogbook({ showToast }) {
  const [logbooks, setLogbooks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');

  const fetchLogbooks = async () => {
    setLoading(true);
    try {
      const url = `api.php?action=admin_get_logbooks&search=${encodeURIComponent(search)}&date=${date}&status=Semua`;
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setLogbooks(data.logbooks || []);
        if (data.total_count !== undefined) {
          setTotalCount(data.total_count);
        } else if (data.pending_count !== undefined) {
          setTotalCount(data.pending_count);
        }
      }
    } catch (e) {
      console.error('Fetch admin logbooks error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogbooks();
  }, [search, date]);

  // Ekspor CSV untuk Admin
  const handleExportCsv = () => {
    if (logbooks.length === 0) {
      showToast?.('Tidak ada data logbook untuk diunduh', 'error');
      return;
    }

    const headers = ['No', 'NIM', 'Nama Mahasiswa', 'Institusi', 'Divisi', 'Tanggal', 'Judul Aktivitas', 'Rincian Kegiatan', 'Durasi'];
    const rows = logbooks.map((item, idx) => [
      idx + 1,
      `"${item.student_nim || ''}"`,
      `"${(item.student_name || '').replace(/"/g, '""')}"`,
      `"${(item.institution || '').replace(/"/g, '""')}"`,
      `"${(item.division || '').replace(/"/g, '""')}"`,
      `"${item.date || ''}"`,
      `"${(item.title || '').replace(/"/g, '""')}"`,
      `"${(item.description || '').replace(/"/g, '""')}"`,
      `"${item.duration_str || (item.duration_minutes ? item.duration_minutes + ' menit' : '-')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekap_Logbook_Peserta_Magang_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast?.('Rekap logbook peserta berhasil diunduh ke CSV!', 'success');
  };

  return (
    <div className="admin-page-body">
      {/* Page Header */}
      <div className="admin-header-row">
        <div>
          <h2 className="admin-page-heading">Logbook Peserta Magang</h2>
          <p className="admin-page-subheading">
            Pantau catatan & jurnal aktivitas mandiri peserta magang (catatan mandiri siswa)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="admin-pending-counter-pill" style={{ background: '#ECFDF5', color: '#047857' }}>
            <span>{logbooks.length} Catatan Ditampilkan</span>
          </div>

          <button
            type="button"
            className="admin-btn-secondary"
            onClick={handleExportCsv}
            title="Ekspor Seluruh Logbook ke Excel/CSV"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Download size={16} />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-wrap" style={{ flex: 1 }}>
          <Search size={18} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Cari nama peserta, instansi, atau judul aktivitas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="date"
            className="admin-select"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            title="Filter Tanggal"
          />
          {date && (
            <button
              type="button"
              className="admin-btn-outline-action"
              onClick={() => setDate('')}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
            >
              Reset Tanggal
            </button>
          )}
        </div>
      </div>

      {/* Logbook Cards Timeline */}
      <div className="admin-panel admin-logbook-panel">
        {loading ? (
          <div className="text-center py-6">Memuat data logbook peserta...</div>
        ) : logbooks.length === 0 ? (
          <div className="text-center py-6 text-muted">
            {search || date 
              ? 'Tidak ada catatan logbook dengan filter pencarian ini.' 
              : 'Belum ada catatan logbook peserta yang tersimpan.'}
          </div>
        ) : (
          <div className="admin-logbook-card-list">
            {logbooks.map((item) => (
              <div key={item.id} className="admin-logbook-item-card">
                {/* Left Date Block */}
                <div className="admin-lb-date-block">
                  <span className="admin-lb-day">{item.day_number || '23'}</span>
                  <span className="admin-lb-month">{item.month_abbr || 'SEP'}</span>
                </div>

                {/* Center Content */}
                <div className="admin-lb-main">
                  <div className="admin-lb-top-row">
                    <div>
                      <h5 className="admin-lb-student-name">{item.student_name || 'Peserta Magang'}</h5>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {item.division || 'Divisi Magang'} · {item.institution || 'Institusi'}
                      </span>
                    </div>

                    <span className="admin-status-badge badge-present" style={{ fontSize: '0.74rem' }}>
                      Tercatat
                    </span>
                  </div>

                  <h4 className="admin-lb-activity-title" style={{ marginTop: '0.5rem' }}>
                    {item.title}
                  </h4>
                  <p className="admin-lb-activity-desc" style={{ whiteSpace: 'pre-line' }}>
                    {item.description || 'Tidak ada deskripsi'}
                  </p>

                  <div className="admin-lb-meta-badges">
                    <span className="admin-lb-meta-pill">
                      <Calendar size={13} />
                      <span>{item.date}</span>
                    </span>

                    {item.duration_str && (
                      <span className="admin-lb-meta-pill">
                        <Clock size={13} />
                        <span>{item.duration_str}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="admin-table-footer">
          <span>Menampilkan {logbooks.length} entri catatan aktivitas peserta</span>
        </div>
      </div>
    </div>
  );
}
