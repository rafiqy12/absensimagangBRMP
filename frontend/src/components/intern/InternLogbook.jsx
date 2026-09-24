import React, { useState, useEffect } from 'react';
import { Plus, Lightbulb, Clock, CheckCircle2, AlertCircle, FileText, Send, X, Edit3, Trash2 } from 'lucide-react';

export default function InternLogbook({ student, showToast }) {
  const [logbooks, setLogbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLogbooks = async () => {
    setLoading(true);
    try {
      const res = await fetch('api.php?action=get_student_logbooks', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setLogbooks(data.logbooks || []);
      }
    } catch (e) {
      console.error('Fetch logbooks error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogbooks();
  }, [student]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setDescription(item.description || '');
    setShowAddModal(true);
  };

  const handleDirectSubmit = async (item) => {
    try {
      const res = await fetch('api.php?action=submit_logbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          title: item.title,
          description: item.description,
          duration_minutes: item.duration_minutes || 0,
          date: item.date || new Date().toISOString().split('T')[0],
          attachment_count: item.attachment_count || 0,
          status: 'Terkirim'
        }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        showToast?.('Logbook berhasil dikirim ke pembimbing!', 'success');
        fetchLogbooks();
      } else {
        showToast?.(data.message || 'Gagal mengirim logbook', 'error');
      }
    } catch (e) {
      showToast?.('Gangguan koneksi server', 'error');
    }
  };

  const handleDeleteDraft = async (id) => {
    if (!window.confirm('Yakin ingin menghapus draf aktivitas ini?')) return;
    try {
      const res = await fetch('api.php?action=delete_logbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        showToast?.(data.message, 'success');
        if (showAddModal && editingId === id) {
          setShowAddModal(false);
          setEditingId(null);
        }
        fetchLogbooks();
      } else {
        showToast?.(data.message || 'Gagal menghapus draf', 'error');
      }
    } catch (e) {
      showToast?.('Gangguan koneksi server', 'error');
    }
  };

  const handleSubmit = async (submitStatus) => {
    if (!title.trim()) {
      showToast?.('Judul aktivitas wajib diisi!', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('api.php?action=submit_logbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          title: title.trim(),
          description: description.trim(),
          duration_minutes: 0,
          date: new Date().toISOString().split('T')[0],
          attachment_count: 0,
          status: submitStatus
        }),
        credentials: 'include'
      });
      const data = await res.json();
      setSubmitting(false);

      if (data.success) {
        showToast?.(data.message, 'success');
        setShowAddModal(false);
        setEditingId(null);
        setTitle('');
        setDescription('');
        fetchLogbooks();
      } else {
        showToast?.(data.message || 'Gagal menyimpan logbook', 'error');
      }
    } catch (e) {
      setSubmitting(false);
      showToast?.('Gangguan koneksi server', 'error');
    }
  };

  const renderBadge = (status) => {
    switch (status) {
      case 'Draft':
        return <span className="intern-logbook-badge badge-draft">Draft</span>;
      case 'Terkirim':
      case 'Menunggu':
        return <span className="intern-logbook-badge badge-sent">Terkirim</span>;
      case 'Disetujui':
        return <span className="intern-logbook-badge badge-approved">Disetujui</span>;
      case 'Revisi':
        return <span className="intern-logbook-badge badge-revision">Revisi</span>;
      default:
        return <span className="intern-logbook-badge">{status}</span>;
    }
  };

  return (
    <div className="intern-page">
      {/* Header (Page 6 PDF) */}
      <div className="intern-history-header">
        <h2 className="intern-page-title">Logbook</h2>
        <span className="intern-page-sub">Catat progres magang setiap hari</span>
      </div>

      {/* Button Tambah Aktivitas */}
      <button
        type="button"
        className="intern-primary-btn btn-add-logbook"
        onClick={handleOpenAdd}
      >
        <Plus size={20} />
        <span>Tambah Aktivitas Hari Ini</span>
      </button>

      {/* Warning / Reminder Banner */}
      <div className="intern-tip-banner">
        <div className="intern-tip-icon">
          <Lightbulb size={20} />
        </div>
        <p className="intern-tip-text">
          Lengkapi aktivitas sebelum pukul 20.00 agar dapat ditinjau pembimbing.
        </p>
      </div>

      {/* Entri Terbaru Header */}
      <div className="intern-section-header-row">
        <h3 className="intern-section-title">Entri terbaru</h3>
        <button type="button" className="intern-link-btn">Lihat semua</button>
      </div>

      {/* Logbook Cards List (Page 6 PDF) */}
      <div className="intern-logbook-list">
        {loading ? (
          <div className="intern-loading-box">Memuat catatan logbook...</div>
        ) : logbooks.length === 0 ? (
          <div className="intern-empty-box">Belum ada catatan aktivitas. Tekan tombol di atas untuk menambah.</div>
        ) : (
          logbooks.map((item) => (
            <div key={item.id} className="intern-card intern-logbook-card">
              <div className="intern-lb-header">
                <div className="intern-lb-icon-box">
                  <FileText size={18} />
                </div>
                <div className="intern-lb-meta">
                  <span className="intern-lb-date">{item.date_formatted || 'Hari ini'}</span>
                  <h4 className="intern-lb-title">{item.title}</h4>
                </div>
                <div className="intern-lb-badge-wrap">
                  {renderBadge(item.status)}
                </div>
              </div>

              <div className="intern-lb-body">
                <p className="intern-lb-desc">
                  {item.description ? item.description : 'Belum diisi'}
                </p>
                {item.duration_str && (
                  <div className="intern-lb-duration">
                    <Clock size={14} />
                    <span>{item.duration_str}</span>
                  </div>
                )}
                {item.admin_feedback && (
                  <div className="intern-lb-feedback">
                    <strong>Catatan Pembimbing:</strong> {item.admin_feedback}
                  </div>
                )}

                {/* Tombol Aksi Jika Masih Draft atau Perlu Revisi */}
                {['Draft', 'Revisi'].includes(item.status) && (
                  <div className="intern-lb-card-actions">
                    <button
                      type="button"
                      className="intern-lb-action-btn btn-edit-draft"
                      onClick={() => handleOpenEdit(item)}
                    >
                      <Edit3 size={13} />
                      <span>Edit Draf</span>
                    </button>
                    <button
                      type="button"
                      className="intern-lb-action-btn btn-send-draft"
                      onClick={() => handleDirectSubmit(item)}
                    >
                      <Send size={13} />
                      <span>Kirim Sekarang</span>
                    </button>
                    <button
                      type="button"
                      className="intern-lb-action-btn btn-delete-draft"
                      onClick={() => handleDeleteDraft(item.id)}
                      title="Hapus Draf"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Weekend Banner */}
      <div className="intern-weekend-banner">
        <h5 className="intern-wb-title">Belum ada catatan akhir pekan</h5>
        <p className="intern-wb-sub">Logbook hanya diperlukan pada hari kerja aktif.</p>
      </div>

      {/* Modal Tambah / Edit Aktivitas */}
      {showAddModal && (
        <div className="intern-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="intern-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="intern-modal-header">
              <h3>{editingId ? 'Ubah Draf Aktivitas' : 'Tambah Aktivitas Harian'}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {editingId && (
                  <button
                    type="button"
                    className="btn-trash-header"
                    onClick={() => handleDeleteDraft(editingId)}
                    title="Hapus Draf"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <button type="button" className="btn-close-sheet" onClick={() => setShowAddModal(false)}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="intern-form-group">
              <label className="intern-label">Judul Aktivitas</label>
              <input
                type="text"
                className="intern-input"
                placeholder="Contoh: Membuat wireframe halaman profil"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="intern-form-group">
              <label className="intern-label">Deskripsi & Rincian yang Dilakukan</label>
              <textarea
                className="intern-textarea"
                rows={5}
                placeholder="Tuliskan aktivitas, tugas, atau progres yang kamu selesaikan hari ini..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="intern-modal-actions">
              <button
                type="button"
                className="intern-outline-btn"
                disabled={submitting}
                onClick={() => handleSubmit('Draft')}
              >
                {editingId ? 'Simpan Perubahan' : 'Simpan Draf'}
              </button>
              <button
                type="button"
                className="intern-primary-btn"
                disabled={submitting}
                onClick={() => handleSubmit('Terkirim')}
              >
                <Send size={16} />
                <span>Kirim Logbook</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
