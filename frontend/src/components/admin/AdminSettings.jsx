import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  ShieldCheck, 
  UserCheck, 
  Save, 
  CheckCircle2, 
  Building2, 
  Crosshair, 
  Plus, 
  Trash2, 
  Map as MapIcon, 
  Navigation 
} from 'lucide-react';
import MapLocationPicker from './MapLocationPicker';

export default function AdminSettings({ admin, showToast }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings State
  const [workStart, setWorkStart] = useState('08:00');
  const [workEnd, setWorkEnd] = useState('17:00');
  const [lateTolerance, setLateTolerance] = useState('10');
  const [autoMarkLate, setAutoMarkLate] = useState(true);

  // 3+ Office Locations State
  const [offices, setOffices] = useState([
    {
      id: 1,
      name: 'Kantor Pusat · Gedung A',
      address: 'Jl. Pemuda No. 12, Semarang',
      latitude: -6.9842,
      longitude: 110.4091,
      radius_meters: 150
    },
    {
      id: 2,
      name: 'Gedung B · Balai Inovasi',
      address: 'Jl. Pahlawan No. 45, Semarang',
      latitude: -6.9925,
      longitude: 110.4208,
      radius_meters: 150
    },
    {
      id: 3,
      name: 'Gedung C · Laboratorium & Riset',
      address: 'Jl. Imam Bonjol No. 88, Semarang',
      latitude: -6.9750,
      longitude: 110.4120,
      radius_meters: 200
    }
  ]);

  // Active Map Modal
  const [activeMapIndex, setActiveMapIndex] = useState(null);

  // Photo / Geolocation Rules
  const [requirePhotoIn, setRequirePhotoIn] = useState(true);
  const [requirePhotoOut, setRequirePhotoOut] = useState(true);
  const [saveLocation, setSaveLocation] = useState(true);

  // Admin Profile
  const [adminName, setAdminName] = useState(admin?.name || 'Nadia Putri');
  const [adminEmail, setAdminEmail] = useState(admin?.email || 'nadia.putri@hadirin.id');
  const [newPassword, setNewPassword] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('api.php?action=get_settings', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        const s = data.settings || {};
        if (s.work_start) setWorkStart(s.work_start);
        if (s.work_end) setWorkEnd(s.work_end);
        if (s.late_tolerance) setLateTolerance(s.late_tolerance);
        setAutoMarkLate(s.auto_mark_late !== '0');
        setRequirePhotoIn(s.require_photo_in !== '0');
        setRequirePhotoOut(s.require_photo_out !== '0');
        setSaveLocation(s.save_location !== '0');

        if (data.offices && data.offices.length > 0) {
          setOffices(data.offices);
        }
      }
    } catch (e) {
      console.error('Fetch settings error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleOfficeChange = (index, field, value) => {
    setOffices(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Tambah Kantor Baru
  const handleAddNewOffice = () => {
    setOffices(prev => [
      ...prev,
      {
        id: 'new_' + Date.now(),
        name: `Lokasi Gedung #${prev.length + 1}`,
        address: 'Jl. Pemuda, Semarang',
        latitude: -6.9842,
        longitude: 110.4091,
        radius_meters: 150,
        is_active: 1
      }
    ]);
    showToast?.('Lokasi baru ditambahkan. Klik tombol "Buka Peta" untuk menentukan titiknya.', 'info');
  };

  // Hapus Kantor
  const handleDeleteOffice = async (index, officeId) => {
    if (offices.length <= 1) {
      showToast?.('Minimal harus ada 1 lokasi kantor untuk presensi.', 'error');
      return;
    }

    if (!confirm('Apakah Anda yakin ingin menghapus lokasi kantor ini?')) return;

    if (officeId && typeof officeId === 'number') {
      try {
        const formData = new FormData();
        formData.append('id', officeId);
        await fetch('api.php?action=admin_delete_office', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
      } catch (e) {}
    }

    setOffices(prev => prev.filter((_, i) => i !== index));
    showToast?.('Lokasi kantor berhasil dihapus.', 'info');
  };

  // Deteksi GPS Langsung untuk Kantor Tersebut
  const handleUseCurrentGps = (index) => {
    if (!navigator.geolocation) {
      showToast?.('Browser tidak mendukung pendeteksian GPS.', 'error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleOfficeChange(index, 'latitude', parseFloat(pos.coords.latitude.toFixed(6)));
        handleOfficeChange(index, 'longitude', parseFloat(pos.coords.longitude.toFixed(6)));
        showToast?.(`Koordinat GPS berhasil diperbarui untuk ${offices[index].name}!`, 'success');
      },
      (err) => {
        showToast?.('Gagal mendeteksi GPS. Pastikan izin lokasi aktif.', 'error');
      },
      { enableHighAccuracy: true }
    );
  };

  // Callback dari Map Location Picker
  const handleMapLocationSelected = (selected) => {
    if (activeMapIndex === null) return;
    setOffices(prev => {
      const copy = [...prev];
      copy[activeMapIndex] = {
        ...copy[activeMapIndex],
        latitude: selected.latitude,
        longitude: selected.longitude,
        radius_meters: selected.radius_meters,
        address: selected.address || copy[activeMapIndex].address
      };
      return copy;
    });
    showToast?.(`Titik lokasi peta berhasil diterapkan untuk ${offices[activeMapIndex]?.name}!`, 'success');
  };

  // Simpan Semua Pengaturan
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const settingsPayload = {
        work_start: workStart,
        work_end: workEnd,
        late_tolerance: lateTolerance,
        auto_mark_late: autoMarkLate ? 1 : 0,
        require_photo_in: requirePhotoIn ? 1 : 0,
        require_photo_out: requirePhotoOut ? 1 : 0,
        save_location: saveLocation ? 1 : 0,
        offices: offices
      };

      const res = await fetch('api.php?action=admin_save_settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsPayload),
        credentials: 'include'
      });
      const data = await res.json();

      // Update admin profile if modified
      if (adminName !== admin?.name || adminEmail !== admin?.email || newPassword) {
        await fetch('api.php?action=admin_update_profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: adminName,
            email: adminEmail,
            new_password: newPassword
          }),
          credentials: 'include'
        });
        setNewPassword('');
      }

      setSaving(false);
      if (data.success) {
        showToast?.('Semua pengaturan aplikasi dan lokasi kantor berhasil disimpan!', 'success');
        fetchSettings();
      } else {
        showToast?.(data.message || 'Gagal menyimpan pengaturan', 'error');
      }
    } catch (err) {
      setSaving(false);
      showToast?.('Gangguan jaringan saat menyimpan pengaturan', 'error');
    }
  };

  const currentMapOffice = activeMapIndex !== null ? offices[activeMapIndex] : null;

  return (
    <div className="admin-page-body">
      {/* Page Header (Page 11 PDF) */}
      <div className="admin-header-row">
        <div>
          <h2 className="admin-page-heading">Pengaturan Aplikasi</h2>
          <p className="admin-page-subheading">Atur kebijakan presensi, kelola lokasi kantor dari peta, dan akun administrator</p>
        </div>

        <button
          type="button"
          className="admin-btn-primary"
          disabled={saving}
          onClick={handleSaveAll}
        >
          <Save size={16} />
          <span>{saving ? 'Menyimpan...' : 'Simpan perubahan'}</span>
        </button>
      </div>

      <div className="admin-settings-layout">
        {/* Section 1: Jam Kerja & Keterlambatan */}
        <div className="admin-panel admin-settings-panel">
          <div className="admin-panel-header">
            <div className="admin-settings-head-icon">
              <Clock size={18} />
            </div>
            <h4 className="admin-panel-title">Jam kerja & keterlambatan</h4>
          </div>

          <div className="admin-settings-grid-3">
            <div className="intern-form-group">
              <label className="intern-label">Jam masuk</label>
              <input
                type="text"
                className="intern-input"
                placeholder="08.00"
                value={workStart}
                onChange={(e) => setWorkStart(e.target.value)}
              />
            </div>

            <div className="intern-form-group">
              <label className="intern-label">Jam pulang</label>
              <input
                type="text"
                className="intern-input"
                placeholder="17.00"
                value={workEnd}
                onChange={(e) => setWorkEnd(e.target.value)}
              />
            </div>

            <div className="intern-form-group">
              <label className="intern-label">Toleransi keterlambatan</label>
              <input
                type="text"
                className="intern-input"
                placeholder="10 menit"
                value={lateTolerance}
                onChange={(e) => setLateTolerance(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-toggle-row">
            <div>
              <div className="admin-toggle-title">Tandai terlambat otomatis</div>
              <p className="admin-toggle-sub">Status terlambat diberikan setelah batas toleransi.</p>
            </div>
            <label className="admin-switch">
              <input
                type="checkbox"
                checked={autoMarkLate}
                onChange={(e) => setAutoMarkLate(e.target.checked)}
              />
              <span className="slider round" />
            </label>
          </div>
        </div>

        {/* Section 2: Kelola Lokasi Presensi (Interactive Map Supported) */}
        <div className="admin-panel admin-settings-panel">
          <div className="admin-panel-header" style={{ alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div className="admin-settings-head-icon">
                <MapPin size={18} />
              </div>
              <div>
                <h4 className="admin-panel-title">Lokasi Presensi ({offices.length} Lokasi Kantor)</h4>
                <p className="admin-panel-sub">
                  Anak magang yang berada di dalam radius salah satu kantor ini akan otomatis <strong>Terverifikasi</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="admin-btn-secondary"
              onClick={handleAddNewOffice}
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}
            >
              <Plus size={16} />
              <span>Tambah Lokasi Baru</span>
            </button>
          </div>

          <div className="admin-offices-settings-list">
            {offices.map((office, idx) => (
              <div key={office.id || idx} className="admin-office-edit-card">
                <div className="admin-office-edit-head">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="admin-office-num-pill">Lokasi #{idx + 1}</span>
                    <span className="text-muted" style={{ fontSize: '0.82rem' }}>{office.name}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {/* Tombol Buka Peta Interaktif */}
                    <button
                      type="button"
                      className="admin-btn-secondary"
                      onClick={() => setActiveMapIndex(idx)}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', background: '#ECFDF5', borderColor: '#A7F3D0', color: '#047857' }}
                      title="Pilih Titik Langsung dari Peta OpenStreetMap"
                    >
                      <MapIcon size={14} />
                      <span>Buka Peta & Radius</span>
                    </button>

                    {/* Tombol Ambil GPS Saya */}
                    <button
                      type="button"
                      className="admin-btn-secondary"
                      onClick={() => handleUseCurrentGps(idx)}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                      title="Gunakan titik koordinat posisi saya sekarang"
                    >
                      <Crosshair size={14} />
                      <span>GPS Saya</span>
                    </button>

                    {/* Tombol Hapus */}
                    {offices.length > 1 && (
                      <button
                        type="button"
                        className="admin-btn-secondary"
                        onClick={() => handleDeleteOffice(idx, office.id)}
                        style={{ padding: '0.4rem 0.6rem', color: '#DC2626', borderColor: '#FCA5A5' }}
                        title="Hapus lokasi kantor ini"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="intern-form-group">
                  <label className="intern-label">Nama Lokasi / Gedung</label>
                  <input
                    type="text"
                    className="intern-input"
                    value={office.name}
                    onChange={(e) => handleOfficeChange(idx, 'name', e.target.value)}
                  />
                </div>

                <div className="intern-form-group">
                  <label className="intern-label">Alamat Lengkap</label>
                  <input
                    type="text"
                    className="intern-input"
                    value={office.address}
                    onChange={(e) => handleOfficeChange(idx, 'address', e.target.value)}
                    placeholder="Contoh: Jl. Pemuda No. 12, Semarang"
                  />
                </div>

                <div className="admin-settings-grid-3">
                  <div className="intern-form-group">
                    <label className="intern-label">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      className="intern-input"
                      value={office.latitude}
                      onChange={(e) => handleOfficeChange(idx, 'latitude', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="intern-form-group">
                    <label className="intern-label">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      className="intern-input"
                      value={office.longitude}
                      onChange={(e) => handleOfficeChange(idx, 'longitude', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="intern-form-group">
                    <label className="intern-label">Radius Presensi Valid (meter)</label>
                    <input
                      type="number"
                      className="intern-input"
                      value={office.radius_meters}
                      onChange={(e) => handleOfficeChange(idx, 'radius_meters', parseInt(e.target.value) || 100)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Bukti Presensi */}
        <div className="admin-panel admin-settings-panel">
          <div className="admin-panel-header">
            <div className="admin-settings-head-icon">
              <ShieldCheck size={18} />
            </div>
            <h4 className="admin-panel-title">Bukti presensi</h4>
          </div>

          <div className="admin-toggle-list">
            <div className="admin-toggle-row">
              <div>
                <div className="admin-toggle-title">Wajib foto saat masuk</div>
                <p className="admin-toggle-sub">Peserta harus mengambil foto selfie langsung.</p>
              </div>
              <label className="admin-switch">
                <input
                  type="checkbox"
                  checked={requirePhotoIn}
                  onChange={(e) => setRequirePhotoIn(e.target.checked)}
                />
                <span className="slider round" />
              </label>
            </div>

            <div className="admin-toggle-row">
              <div>
                <div className="admin-toggle-title">Wajib foto saat pulang</div>
                <p className="admin-toggle-sub">Bukti foto diperlukan saat mengakhiri presensi.</p>
              </div>
              <label className="admin-switch">
                <input
                  type="checkbox"
                  checked={requirePhotoOut}
                  onChange={(e) => setRequirePhotoOut(e.target.checked)}
                />
                <span className="slider round" />
              </label>
            </div>

            <div className="admin-toggle-row">
              <div>
                <div className="admin-toggle-title">Simpan data lokasi GPS</div>
                <p className="admin-toggle-sub">Koordinat dicatat untuk proses verifikasi otomatis.</p>
              </div>
              <label className="admin-switch">
                <input
                  type="checkbox"
                  checked={saveLocation}
                  onChange={(e) => setSaveLocation(e.target.checked)}
                />
                <span className="slider round" />
              </label>
            </div>
          </div>
        </div>

        {/* Section 4: Akun Admin */}
        <div className="admin-panel admin-settings-panel">
          <div className="admin-panel-header">
            <div className="admin-settings-head-icon">
              <UserCheck size={18} />
            </div>
            <h4 className="admin-panel-title">Akun admin</h4>
          </div>

          <div className="admin-profile-head-row">
            <div className="admin-user-avatar large">
              {adminName.charAt(0)}
            </div>
            <div>
              <h5 className="admin-profile-name">{adminName}</h5>
              <span className="admin-profile-email">{adminEmail}</span>
            </div>
          </div>

          <div className="admin-settings-grid-2">
            <div className="intern-form-group">
              <label className="intern-label">Nama Lengkap</label>
              <input
                type="text"
                className="intern-input"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
              />
            </div>

            <div className="intern-form-group">
              <label className="intern-label">Email admin</label>
              <input
                type="email"
                className="intern-input"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="intern-form-group">
            <label className="intern-label">Ubah kata sandi baru (opsional)</label>
            <input
              type="password"
              className="intern-input"
              placeholder="Kosongkan jika tidak ingin mengubah sandi"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Modal Peta Interaktif Leaflet */}
      {activeMapIndex !== null && currentMapOffice && (
        <MapLocationPicker
          initialLat={currentMapOffice.latitude}
          initialLng={currentMapOffice.longitude}
          initialRadius={currentMapOffice.radius_meters || 150}
          initialName={currentMapOffice.name}
          initialAddress={currentMapOffice.address}
          onSelectLocation={handleMapLocationSelected}
          onClose={() => setActiveMapIndex(null)}
        />
      )}
    </div>
  );
}
