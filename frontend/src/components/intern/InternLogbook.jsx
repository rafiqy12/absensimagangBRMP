import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  FileText, 
  X, 
  Edit3, 
  Trash2, 
  Calendar, 
  BookOpen, 
  Search, 
  CheckCircle2, 
  Info,
  Save,
  Check
} from 'lucide-react';
import brmpLogo from '../../assets/logo-brmp.png';

export default function InternLogbook({ student, showToast }) {
  const [logbooks, setLogbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
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
    setDate(new Date().toISOString().split('T')[0]);
    setShowAddModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setDescription(item.description || '');
    setDate(item.date || new Date().toISOString().split('T')[0]);
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus catatan aktivitas ini?')) return;
    try {
      const res = await fetch('api.php?action=delete_logbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        showToast?.('Catatan aktivitas berhasil dihapus.', 'success');
        if (showAddModal && editingId === id) {
          setShowAddModal(false);
          setEditingId(null);
        }
        fetchLogbooks();
      } else {
        showToast?.(data.message || 'Gagal menghapus catatan', 'error');
      }
    } catch (e) {
      showToast?.('Gangguan koneksi server', 'error');
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
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
          date: date,
          attachment_count: 0
        }),
        credentials: 'include'
      });
      const data = await res.json();
      setSubmitting(false);

      if (data.success) {
        showToast?.(data.message || 'Catatan aktivitas berhasil disimpan.', 'success');
        setShowAddModal(false);
        setEditingId(null);
        setTitle('');
        setDescription('');
        fetchLogbooks();
      } else {
        showToast?.(data.message || 'Gagal menyimpan catatan', 'error');
      }
    } catch (e) {
      setSubmitting(false);
      showToast?.('Gangguan koneksi server', 'error');
    }
  };

  // Unduh CSV
  const handleDownloadCsv = () => {
    if (logbooks.length === 0) {
      showToast?.('Belum ada catatan logbook untuk diunduh', 'error');
      return;
    }

    const headers = ['No', 'Tanggal', 'Judul Aktivitas', 'Rincian Kegiatan'];
    const rows = logbooks.map((item, idx) => [
      idx + 1,
      `"${item.date || ''}"`,
      `"${(item.title || '').replace(/"/g, '""')}"`,
      `"${(item.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const studentName = (student?.name || 'Peserta').replace(/[^a-zA-Z0-9_\-]/g, '_');
    link.setAttribute('href', url);
    link.setAttribute('download', `Logbook_Magang_${studentName}_${student?.nim || ''}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast?.('Semua logbook berhasil diunduh ke file CSV!', 'success');
    setShowDownloadModal(false);
  };

  // Buka Pratinjau Cetak / PDF
  const handleOpenPrint = () => {
    if (logbooks.length === 0) {
      showToast?.('Belum ada catatan logbook untuk dicetak', 'error');
      return;
    }
    setShowDownloadModal(false);
    setShowPrintModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter pencarian
  const filteredLogbooks = logbooks.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.date && item.date.toLowerCase().includes(q))
    );
  });

  // Format tanggal formal Indonesia
  const formatDateFormal = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="intern-page">
      {/* Header Halaman */}
      <div className="intern-history-header">
        <div>
          <h2 className="intern-page-title">Logbook Magang</h2>
          <span className="intern-page-sub">Catatan & jurnal aktivitas mandiri selama magang</span>
        </div>
        <div className="intern-logbook-counter-pill">
          <span>{logbooks.length} Catatan</span>
        </div>
      </div>

      {/* Tombol Aksi: Tambah & Unduh */}
      <div className="intern-logbook-actions-bar">
        <button
          type="button"
          className="intern-primary-btn btn-add-logbook-primary"
          onClick={handleOpenAdd}
        >
          <Plus size={18} />
          <span>Tambah Aktivitas</span>
        </button>

        <button
          type="button"
          className="intern-outline-btn btn-download-logbook"
          onClick={() => setShowDownloadModal(true)}
          title="Unduh seluruh catatan logbook"
        >
          <Download size={18} />
          <span>Unduh Semua Logbook</span>
        </button>
      </div>

      {/* Banner Informasi Catatan Mandiri */}
      <div className="intern-tip-banner intern-tip-banner-logbook">
        <div className="intern-tip-icon">
          <Info size={20} />
        </div>
        <div className="intern-tip-content">
          <p className="intern-tip-title">Catatan Pribadi Anak Magang</p>
          <p className="intern-tip-text">
            Logbook ini berfungsi sebagai jurnal harian mandiri untuk mendokumentasikan kegiatan & tugas kamu. 
            Catatan ini tidak perlu diperiksa oleh mentor dan dapat kamu unduh kapan saja untuk keperluan laporan magang.
          </p>
        </div>
      </div>

      {/* Search Bar jika ada entri */}
      {logbooks.length > 0 && (
        <div className="intern-logbook-search-box">
          <Search size={16} className="intern-lb-search-icon" />
          <input
            type="text"
            className="intern-lb-search-input"
            placeholder="Cari aktivitas atau catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="intern-lb-search-clear"
              onClick={() => setSearchQuery('')}
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Daftar Catatan Logbook */}
      <div className="intern-logbook-list">
        {loading ? (
          <div className="intern-loading-box">Memuat catatan logbook...</div>
        ) : filteredLogbooks.length === 0 ? (
          <div className="intern-empty-box">
            {searchQuery 
              ? 'Tidak ada catatan aktivitas yang cocok dengan pencarian.' 
              : 'Belum ada catatan aktivitas. Tekan tombol "+ Tambah Aktivitas" untuk mulai mencatat kegiatan kamu.'}
          </div>
        ) : (
          filteredLogbooks.map((item) => (
            <div key={item.id} className="intern-card intern-logbook-card-clean">
              <div className="intern-lb-header">
                <div className="intern-lb-icon-box">
                  <FileText size={18} />
                </div>
                <div className="intern-lb-meta">
                  <div className="intern-lb-date-row">
                    <Calendar size={13} className="text-muted" />
                    <span className="intern-lb-date">{formatDateFormal(item.date)}</span>
                  </div>
                  <h4 className="intern-lb-title">{item.title}</h4>
                </div>
              </div>

              <div className="intern-lb-body">
                <p className="intern-lb-desc">
                  {item.description ? item.description : 'Tidak ada rincian kegiatan'}
                </p>

                <div className="intern-lb-footer-row">
                  <div />

                  {/* Tombol Aksi Edit & Hapus Kapan Saja */}
                  <div className="intern-lb-card-actions-clean">
                    <button
                      type="button"
                      className="intern-lb-btn-edit"
                      onClick={() => handleOpenEdit(item)}
                      title="Ubah Catatan"
                    >
                      <Edit3 size={14} />
                      <span>Ubah</span>
                    </button>
                    <button
                      type="button"
                      className="intern-lb-btn-delete"
                      onClick={() => handleDelete(item.id)}
                      title="Hapus Catatan"
                    >
                      <Trash2 size={14} />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* =========================================================================
          MODAL TAMBAH / UBAH AKTIVITAS
          ========================================================================= */}
      {showAddModal && (
        <div className="intern-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="intern-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="intern-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className="intern-modal-icon-badge">
                  <BookOpen size={18} />
                </div>
                <h3>{editingId ? 'Ubah Catatan Aktivitas' : 'Tambah Aktivitas Magang'}</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {editingId && (
                  <button
                    type="button"
                    className="btn-trash-header"
                    onClick={() => handleDelete(editingId)}
                    title="Hapus Catatan Ini"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <button type="button" className="btn-close-sheet" onClick={() => setShowAddModal(false)}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="intern-form-group">
                <label className="intern-label">
                  Tanggal Aktivitas <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div className="intern-input-icon-wrap">
                  <Calendar size={16} className="intern-input-icon" />
                  <input
                    type="date"
                    className="intern-input intern-input-with-icon"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="intern-form-group">
                <label className="intern-label">
                  Judul Aktivitas / Tugas <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  className="intern-input"
                  placeholder="Contoh: Membuat rancangan UI presensi & logbook"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="intern-form-group">
                <label className="intern-label">Deskripsi & Rincian yang Dikerjakan</label>
                <textarea
                  className="intern-textarea"
                  rows={5}
                  placeholder="Tuliskan aktivitas, tugas, riset, atau progres yang kamu selesaikan hari ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>



              <div className="intern-modal-actions">
                <button
                  type="button"
                  className="intern-outline-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="intern-primary-btn"
                  disabled={submitting}
                >
                  <Save size={16} />
                  <span>{submitting ? 'Menyimpan...' : 'Simpan Catatan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL PILIHAN FORMAT UNDUH
          ========================================================================= */}
      {showDownloadModal && (
        <div className="intern-modal-backdrop" onClick={() => setShowDownloadModal(false)}>
          <div className="intern-modal-sheet intern-download-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="intern-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className="intern-modal-icon-badge badge-download">
                  <Download size={18} />
                </div>
                <h3>Unduh Seluruh Logbook</h3>
              </div>
              <button type="button" className="btn-close-sheet" onClick={() => setShowDownloadModal(false)}>
                <X size={20} />
              </button>
            </div>

            <p className="intern-download-modal-sub">
              Pilih format dokumen logbook magang yang ingin kamu simpan atau gunakan untuk laporan:
            </p>

            <div className="intern-download-options-grid">
              {/* Opsi 1: Cetak / Simpan PDF Resmi */}
              <button
                type="button"
                className="intern-download-option-card"
                onClick={handleOpenPrint}
              >
                <div className="intern-option-icon-box option-pdf">
                  <Printer size={24} />
                </div>
                <div className="intern-option-text">
                  <div className="intern-option-title">Cetak / Simpan PDF (Laporan Resmi)</div>
                  <div className="intern-option-desc">
                    Tampilan format lembar laporan resmi lengkap dengan kop BRMP, data mahasiswa, tabel aktivitas, dan tanda tangan pembimbing.
                  </div>
                </div>
              </button>

              {/* Opsi 2: Unduh Excel / CSV */}
              <button
                type="button"
                className="intern-download-option-card"
                onClick={handleDownloadCsv}
              >
                <div className="intern-option-icon-box option-csv">
                  <FileSpreadsheet size={24} />
                </div>
                <div className="intern-option-text">
                  <div className="intern-option-title">Unduh Excel / CSV (.csv)</div>
                  <div className="intern-option-desc">
                    Format tabel data mentah yang dapat langsung dibuka dan diolah di Microsoft Excel atau Google Spreadsheet.
                  </div>
                </div>
              </button>
            </div>

            <div className="intern-modal-actions" style={{ marginTop: '1.25rem' }}>
              <button
                type="button"
                className="intern-outline-btn"
                style={{ width: '100%' }}
                onClick={() => setShowDownloadModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL PRATINJAU CETAK / SIMPAN PDF (PRINT VIEW)
          ========================================================================= */}
      {showPrintModal && (
        <div className="intern-print-modal-backdrop">
          <div className="intern-print-modal-container">
            {/* Top Toolbar Pratinjau (disembunyikan saat dicetak) */}
            <div className="intern-print-toolbar no-print">
              <div className="intern-print-toolbar-left">
                <Printer size={18} />
                <span>Pratinjau Lembar Laporan Logbook</span>
              </div>
              <div className="intern-print-toolbar-actions">
                <button
                  type="button"
                  className="intern-print-btn-action btn-print-execute"
                  onClick={handlePrint}
                >
                  <Printer size={16} />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  type="button"
                  className="intern-print-btn-action btn-print-close"
                  onClick={() => setShowPrintModal(false)}
                >
                  <X size={16} />
                  <span>Tutup</span>
                </button>
              </div>
            </div>

            {/* Dokumen Laporan Resmi A4 yang Siap Dicetak */}
            <div className="intern-print-document-sheet" id="printable-logbook-document">
              {/* Kop Laporan Resmi */}
              <div className="print-kop-wrapper">
                <div className="print-kop-logo">
                  <img src={brmpLogo} alt="Logo Instansi" className="print-kop-logo-img" />
                </div>
                <div className="print-kop-text">
                  <h3 className="print-kop-instansi">BALAI BESAR PENERAPAN MODERNISASI PERTANIAN</h3>
                  <h4 className="print-kop-subinstansi">DAERAH ISTIMEWA YOGYAKARTA</h4>
                  <h2 className="print-kop-title">LAPORAN LOGBOOK KEGIATAN MAGANG</h2>
                  <p className="print-kop-address">
                    Sistem Presensi & Jurnal Logbook Magang Mandiri · BRMP DIY
                  </p>
                </div>
              </div>
              <div className="print-kop-line"></div>

              {/* Data Identitas Mahasiswa Magang */}
              <div className="print-student-info-grid">
                <div className="print-info-row">
                  <span className="print-info-label">Nama Peserta</span>
                  <span className="print-info-sep">:</span>
                  <span className="print-info-val"><strong>{student?.name || '-'}</strong></span>
                </div>
                <div className="print-info-row">
                  <span className="print-info-label">NIM / NISN</span>
                  <span className="print-info-sep">:</span>
                  <span className="print-info-val">{student?.nim || '-'}</span>
                </div>
                <div className="print-info-row">
                  <span className="print-info-label">Asal Institusi</span>
                  <span className="print-info-sep">:</span>
                  <span className="print-info-val">{student?.institution || '-'}</span>
                </div>
                <div className="print-info-row">
                  <span className="print-info-label">Divisi / Penempatan</span>
                  <span className="print-info-sep">:</span>
                  <span className="print-info-val">{student?.division || 'Umum'}</span>
                </div>
                <div className="print-info-row">
                  <span className="print-info-label">Pembimbing Lapangan</span>
                  <span className="print-info-sep">:</span>
                  <span className="print-info-val">{student?.supervisor || 'Pembimbing Magang BRMP'}</span>
                </div>
                <div className="print-info-row">
                  <span className="print-info-label">Total Catatan</span>
                  <span className="print-info-sep">:</span>
                  <span className="print-info-val">{logbooks.length} Kegiatan Tercatat</span>
                </div>
              </div>

              {/* Tabel Daftar Seluruh Logbook */}
              <table className="print-logbook-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>No</th>
                    <th style={{ width: '140px' }}>Hari & Tanggal</th>
                    <th style={{ width: '240px' }}>Judul Aktivitas / Tugas</th>
                    <th>Uraian Rincian Pekerjaan & Progres</th>
                  </tr>
                </thead>
                <tbody>
                  {logbooks.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '1.5rem' }}>
                        Belum ada catatan aktivitas logbook.
                      </td>
                    </tr>
                  ) : (
                    logbooks.map((item, index) => (
                      <tr key={item.id || index}>
                        <td style={{ textAlign: 'center' }}>{index + 1}</td>
                        <td>{formatDateFormal(item.date)}</td>
                        <td><strong>{item.title}</strong></td>
                        <td style={{ whiteSpace: 'pre-line' }}>{item.description || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Lembar Tanda Tangan */}
              <div className="print-signature-section">
                <div className="print-sig-col">
                  <p className="print-sig-title">Mengetahui,<br />Pembimbing Lapangan</p>
                  <div className="print-sig-space"></div>
                  <p className="print-sig-name"><u>{student?.supervisor || 'Pembimbing Magang'}</u></p>
                  <p className="print-sig-nip">NIP / Pembimbing Lapangan</p>
                </div>

                <div className="print-sig-col">
                  <p className="print-sig-title">
                    Yogyakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />
                    Peserta Magang
                  </p>
                  <div className="print-sig-space"></div>
                  <p className="print-sig-name"><u>{student?.name || 'Peserta Magang'}</u></p>
                  <p className="print-sig-nip">NIM. {student?.nim || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
