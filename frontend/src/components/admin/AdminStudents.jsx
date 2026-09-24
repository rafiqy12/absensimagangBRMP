import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, UserX, UserCheck, X, Check, Filter } from 'lucide-react';

export default function AdminStudents({ showToast }) {
  const [students, setStudents] = useState([]);
  const [counts, setCounts] = useState({ total: 52, active: 48, completed: 3, inactive: 1 });
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [divisionFilter, setDivisionFilter] = useState('Semua');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Form State
  const [nim, setNim] = useState('');
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('BRMP DIY');
  const [division, setDivision] = useState('UI/UX Intern');
  const [supervisor, setSupervisor] = useState('Dian Pratiwi');
  const [status, setStatus] = useState('Aktif');
  const [submitting, setSubmitting] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const url = `api.php?action=admin_get_students&search=${encodeURIComponent(search)}&status=${statusFilter}&division=${divisionFilter}`;
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setStudents(data.students || []);
        if (data.counts) {
          setCounts({
            total: data.counts.total || 52,
            active: data.counts.active || 48,
            completed: data.counts.completed || 3,
            inactive: data.counts.inactive || 1
          });
        }
        if (data.divisions) {
          setDivisions(data.divisions);
        }
      }
    } catch (e) {
      console.error('Fetch students error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, statusFilter, divisionFilter]);

  const handleOpenAdd = () => {
    setNim('');
    setName('');
    setInstitution('BRMP DIY');
    setDivision('UI/UX Intern');
    setSupervisor('Dian Pratiwi');
    setStatus('Aktif');
    setShowAddModal(true);
  };

  const handleOpenEdit = (st) => {
    setEditingStudent(st);
    setNim(st.nim);
    setName(st.name);
    setInstitution(st.institution || '');
    setDivision(st.division || '');
    setSupervisor(st.supervisor || '');
    setStatus(st.status || 'Aktif');
  };

  const handleSaveStudent = async (isEdit = false) => {
    if (!nim.trim() || !name.trim()) {
      showToast?.('NIM dan Nama Lengkap wajib diisi!', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const action = isEdit ? 'admin_edit_student' : 'admin_add_student';
      const res = await fetch(`api.php?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nim, name, institution, division, supervisor, status }),
        credentials: 'include'
      });
      const data = await res.json();
      setSubmitting(false);

      if (data.success) {
        showToast?.(data.message, 'success');
        setShowAddModal(false);
        setEditingStudent(null);
        fetchStudents();
      } else {
        showToast?.(data.message || 'Gagal menyimpan data', 'error');
      }
    } catch (err) {
      setSubmitting(false);
      showToast?.('Gangguan jaringan', 'error');
    }
  };

  const handleToggleStatus = async (st) => {
    const nextStatus = st.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    try {
      const res = await fetch('api.php?action=admin_toggle_student_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nim: st.nim, status: nextStatus }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        showToast?.(data.message, 'success');
        fetchStudents();
      }
    } catch (err) {
      showToast?.('Gagal mengubah status peserta', 'error');
    }
  };

  return (
    <div className="admin-page-body">
      {/* Page Header (Page 8 PDF) */}
      <div className="admin-header-row">
        <div>
          <h2 className="admin-page-heading">Peserta Magang</h2>
          <p className="admin-page-subheading">Kelola data dan status peserta aktif</p>
        </div>

        <button
          type="button"
          className="admin-btn-primary"
          onClick={handleOpenAdd}
        >
          <Plus size={18} />
          <span>Tambah peserta</span>
        </button>
      </div>

      {/* Filter & Search Bar (Page 8 PDF) */}
      <div className="admin-filter-bar">
        <div className="admin-search-wrap">
          <Search size={18} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Cari nama, NIM, atau instansi"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="admin-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="Semua">Semua status</option>
          <option value="Aktif">Aktif</option>
          <option value="Nonaktif">Nonaktif</option>
          <option value="Selesai">Selesai</option>
        </select>

        <select
          className="admin-select"
          value={divisionFilter}
          onChange={(e) => setDivisionFilter(e.target.value)}
        >
          <option value="Semua">Semua divisi</option>
          {divisions.map((d, i) => (
            <option key={i} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* 4 Stat KPI Cards (Page 8 PDF) */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <span className="admin-kpi-period">Total peserta</span>
          <div className="admin-kpi-val">{counts.total}</div>
        </div>

        <div className="admin-kpi-card">
          <span className="admin-kpi-period">Aktif</span>
          <div className="admin-kpi-val text-green-bold">{counts.active}</div>
        </div>

        <div className="admin-kpi-card">
          <span className="admin-kpi-period">Selesai bulan ini</span>
          <div className="admin-kpi-val">{counts.completed}</div>
        </div>

        <div className="admin-kpi-card">
          <span className="admin-kpi-period">Nonaktif</span>
          <div className="admin-kpi-val text-muted">{counts.inactive}</div>
        </div>
      </div>

      {/* Table Data (Page 8 PDF) */}
      <div className="admin-panel admin-table-panel">
        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>PESERTA</th>
                <th>PENEMPATAN</th>
                <th>PEMBIMBING</th>
                <th>AKTIVITAS TERAKHIR</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">Memuat data peserta magang...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">Tidak ada data peserta yang cocok dengan filter.</td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr key={st.nim}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-cell-avatar">
                          {st.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="admin-cell-name">{st.name}</div>
                          <div className="admin-cell-role">{st.division || 'UI/UX Intern'}</div>
                        </div>
                      </div>
                    </td>
                    <td>{st.institution || 'BRMP DIY'}</td>
                    <td>{st.supervisor || 'Dian Pratiwi'}</td>
                    <td>{st.last_activity_formatted || '23 Sep 2026'}</td>
                    <td>
                      <span className={`admin-status-badge ${st.status === 'Aktif' ? 'badge-present' : 'badge-gray'}`}>
                        {st.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-actions-cell">
                        <button
                          type="button"
                          className="admin-action-link"
                          onClick={() => handleOpenEdit(st)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={`admin-action-link ${st.status === 'Aktif' ? 'text-danger' : 'text-success'}`}
                          onClick={() => handleToggleStatus(st)}
                        >
                          {st.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-table-footer">
          <span>Menampilkan 1–{students.length} dari {counts.total} peserta</span>
          <div className="admin-pagination">
            <button type="button" className="page-btn active">1</button>
            <button type="button" className="page-btn">2</button>
            <button type="button" className="page-btn">3</button>
          </div>
        </div>
      </div>

      {/* Modal Tambah / Edit Peserta */}
      {(showAddModal || editingStudent) && (
        <div className="admin-modal-backdrop" onClick={() => { setShowAddModal(false); setEditingStudent(null); }}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingStudent ? 'Edit Data Peserta Magang' : 'Tambah Peserta Magang Baru'}</h3>
              <button type="button" className="btn-close-sheet" onClick={() => { setShowAddModal(false); setEditingStudent(null); }}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="intern-form-group">
                <label className="intern-label">Nomor Induk Mahasiswa (NIM)</label>
                <input
                  type="text"
                  className="intern-input"
                  placeholder="Contoh: 231011401234"
                  value={nim}
                  disabled={!!editingStudent}
                  onChange={(e) => setNim(e.target.value)}
                />
              </div>

              <div className="intern-form-group">
                <label className="intern-label">Nama Lengkap</label>
                <input
                  type="text"
                  className="intern-input"
                  placeholder="Contoh: Raka Aditya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="intern-form-group">
                <label className="intern-label">Instansi / Kampus</label>
                <input
                  type="text"
                  className="intern-input"
                  placeholder="Contoh: BRMP DIY / IPB University"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                />
              </div>

              <div className="intern-form-row">
                <div className="intern-form-group flex-1">
                  <label className="intern-label">Divisi / Posisi Magang</label>
                  <input
                    type="text"
                    className="intern-input"
                    placeholder="Contoh: UI/UX Intern"
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                  />
                </div>
                <div className="intern-form-group flex-1">
                  <label className="intern-label">Nama Pembimbing</label>
                  <input
                    type="text"
                    className="intern-input"
                    placeholder="Contoh: Dian Pratiwi"
                    value={supervisor}
                    onChange={(e) => setSupervisor(e.target.value)}
                  />
                </div>
              </div>

              <div className="intern-form-group">
                <label className="intern-label">Status Keaktifan</label>
                <select
                  className="intern-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => { setShowAddModal(false); setEditingStudent(null); }}
              >
                Batal
              </button>
              <button
                type="button"
                className="admin-btn-primary"
                disabled={submitting}
                onClick={() => handleSaveStudent(!!editingStudent)}
              >
                {submitting ? 'Menyimpan...' : 'Simpan Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
