import React, { useState, useEffect } from 'react';
import { Search, Clock, Paperclip, Check, AlertCircle, X, CheckCircle2 } from 'lucide-react';

export default function AdminLogbook({ showToast }) {
  const [logbooks, setLogbooks] = useState([]);
  const [pendingCount, setPendingCount] = useState(12);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('Menunggu');

  // Revision Modal
  const [revisionItem, setRevisionItem] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchLogbooks = async () => {
    setLoading(true);
    try {
      const url = `api.php?action=admin_get_logbooks&search=${encodeURIComponent(search)}&date=${date}&status=${statusFilter}`;
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setLogbooks(data.logbooks || []);
        if (data.pending_count !== undefined) {
          setPendingCount(data.pending_count);
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
  }, [search, date, statusFilter]);

  const handleApprove = async (item) => {
    try {
      const res = await fetch('api.php?action=admin_review_logbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          status: 'Disetujui',
          feedback: 'Aktivitas logbook telah diperiksa dan disetujui.'
        }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        showToast?.(`Logbook ${item.student_name} berhasil disetujui!`, 'success');
        fetchLogbooks();
      }
    } catch (err) {
      showToast?.('Gagal menyetujui logbook', 'error');
    }
  };

  const handleOpenRevision = (item) => {
    setRevisionItem(item);
    setFeedback(item.admin_feedback || '');
  };

  const handleSaveRevision = async () => {
    if (!revisionItem) return;
    setSubmittingReview(true);
    try {
      const res = await fetch('api.php?action=admin_review_logbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: revisionItem.id,
          status: 'Revisi',
          feedback: feedback || 'Mohon lengkapi rincian dokumen dan penjelasan aktivitas.'
        }),
        credentials: 'include'
      });
      const data = await res.json();
      setSubmittingReview(false);

      if (data.success) {
        showToast?.('Permintaan revisi telah dikirim ke mahasiswa!', 'success');
        setRevisionItem(null);
        fetchLogbooks();
      }
    } catch (err) {
      setSubmittingReview(false);
      showToast?.('Gagal mengirim revisi', 'error');
    }
  };

  const renderBadge = (status) => {
    switch (status) {
      case 'Disetujui':
        return <span className="admin-status-badge badge-present">Disetujui</span>;
      case 'Revisi':
        return <span className="admin-status-badge badge-late">Revisi</span>;
      default:
        return <span className="admin-status-badge badge-waiting">Menunggu</span>;
    }
  };

  return (
    <div className="admin-page-body">
      {/* Page Header (Page 10 PDF) */}
      <div className="admin-header-row">
        <div>
          <h2 className="admin-page-heading">Pemeriksaan Logbook</h2>
          <p className="admin-page-subheading">Tinjau aktivitas harian peserta magang</p>
        </div>

        <div className="admin-pending-counter-pill">
          <span>{pendingCount} entri perlu ditinjau</span>
        </div>
      </div>

      {/* Filter Bar (Page 10 PDF) */}
      <div className="admin-filter-bar">
        <div className="admin-search-wrap">
          <Search size={18} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Cari peserta atau aktivitas"
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
          <option value="Menunggu">Menunggu tinjauan</option>
          <option value="Semua">Semua status</option>
          <option value="Disetujui">Disetujui</option>
          <option value="Revisi">Revisi</option>
        </select>
      </div>

      {/* Logbook Cards Timeline (Page 10 PDF) */}
      <div className="admin-panel admin-logbook-panel">
        {loading ? (
          <div className="text-center py-6">Memuat data logbook peserta...</div>
        ) : logbooks.length === 0 ? (
          <div className="text-center py-6 text-muted">Tidak ada catatan logbook dengan kriteria ini.</div>
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
                    <h5 className="admin-lb-student-name">{item.student_name || 'Raka Aditya'}</h5>
                    {renderBadge(item.status)}
                  </div>

                  <h4 className="admin-lb-activity-title">{item.title}</h4>
                  <p className="admin-lb-activity-desc">{item.description}</p>

                  <div className="admin-lb-meta-badges">
                    {item.duration_str && (
                      <span className="admin-lb-meta-pill">
                        <Clock size={14} />
                        <span>{item.duration_str}</span>
                      </span>
                    )}

                    {item.attachment_count > 0 && (
                      <span className="admin-lb-meta-pill">
                        <Paperclip size={14} />
                        <span>{item.attachment_count} lampiran</span>
                      </span>
                    )}
                  </div>

                  {item.admin_feedback && (
                    <div className="admin-lb-feedback-alert">
                      <strong>Catatan Revisi:</strong> {item.admin_feedback}
                    </div>
                  )}
                </div>

                {/* Right Action Buttons (Page 10 PDF) */}
                <div className="admin-lb-actions">
                  <button
                    type="button"
                    className="admin-btn-outline-action"
                    onClick={() => handleOpenRevision(item)}
                  >
                    Minta revisi
                  </button>
                  <button
                    type="button"
                    className="admin-btn-primary-action"
                    onClick={() => handleApprove(item)}
                  >
                    Setujui
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="admin-table-footer">
          <span>Menampilkan {logbooks.length} dari {pendingCount} entri</span>
          <div className="admin-pagination">
            <button type="button" className="page-btn active">1</button>
            <button type="button" className="page-btn">2</button>
            <button type="button" className="page-btn">3</button>
          </div>
        </div>
      </div>

      {/* Modal Minta Revisi */}
      {revisionItem && (
        <div className="admin-modal-backdrop" onClick={() => setRevisionItem(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Minta Revisi Logbook</h3>
              <button type="button" className="btn-close-sheet" onClick={() => setRevisionItem(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <p className="admin-modal-sub" style={{ marginBottom: '1rem' }}>
                Peserta: <strong>{revisionItem.student_name}</strong> - <em>"{revisionItem.title}"</em>
              </p>

              <div className="intern-form-group">
                <label className="intern-label">Catatan & Masukan Perbaikan</label>
                <textarea
                  className="intern-textarea"
                  rows={4}
                  placeholder="Jelaskan hal-hal yang perlu diperbaiki atau dilengkapi oleh mahasiswa magang..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setRevisionItem(null)}
              >
                Batal
              </button>
              <button
                type="button"
                className="admin-btn-primary"
                disabled={submittingReview}
                onClick={handleSaveRevision}
              >
                {submittingReview ? 'Mengirim...' : 'Kirim Permintaan Revisi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
