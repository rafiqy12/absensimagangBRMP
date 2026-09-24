import React, { useState } from 'react';
import { UserCheck, ShieldCheck, ArrowRight, UserPlus, HelpCircle, KeyRound, Mail, Sparkles, Building2, ArrowLeft } from 'lucide-react';

export default function LoginModal({ onLoginSuccess, showToast, isAdminPortal = false }) {
  // If in admin portal route, default role to admin; otherwise strictly student
  const [role, setRole] = useState(isAdminPortal ? 'admin' : 'student');
  const [isRegister, setIsRegister] = useState(false);

  // Student Login State (Page 1 PDF)
  const [nim, setNim] = useState('');
  const [submittingStudent, setSubmittingStudent] = useState(false);

  // Student Register State
  const [regNim, setRegNim] = useState('');
  const [regName, setRegName] = useState('');
  const [regInstitution, setRegInstitution] = useState('PT Nusantara Digital');
  const [regDivision, setRegDivision] = useState('UI/UX Intern');
  const [regSupervisor, setRegSupervisor] = useState('Dian Pratiwi');
  const [submittingReg, setSubmittingReg] = useState(false);

  // Admin Login State
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [submittingAdmin, setSubmittingAdmin] = useState(false);

  // 1. Submit Student Login (Page 1 PDF)
  const handleStudentLogin = async (e) => {
    e?.preventDefault();
    if (!nim.trim()) {
      showToast('Harap masukkan Nomor Induk Mahasiswa (NIM)!', 'error');
      return;
    }

    setSubmittingStudent(true);
    try {
      const res = await fetch('api.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nim: nim.trim() }),
        credentials: 'include'
      });
      const data = await res.json();
      setSubmittingStudent(false);

      if (data.success && data.student) {
        showToast(data.message, 'success');
        onLoginSuccess({ role: 'student', data: data.student });
      } else if (data.not_found) {
        showToast(data.message, 'info');
        setRegNim(nim.trim());
        setIsRegister(true);
      } else {
        showToast(data.message || 'Login gagal.', 'error');
      }
    } catch (err) {
      setSubmittingStudent(false);
      showToast('Koneksi server terganggu.', 'error');
    }
  };

  // 2. Submit Student Register
  const handleStudentRegister = async (e) => {
    e?.preventDefault();
    if (!regNim.trim() || !regName.trim()) {
      showToast('NIM dan Nama Lengkap wajib diisi!', 'error');
      return;
    }

    setSubmittingReg(true);
    try {
      const res = await fetch('api.php?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nim: regNim.trim(),
          name: regName.trim(),
          institution: regInstitution.trim(),
          division: regDivision.trim(),
          supervisor: regSupervisor.trim()
        }),
        credentials: 'include'
      });
      const data = await res.json();
      setSubmittingReg(false);

      if (data.success && data.student) {
        showToast(data.message, 'success');
        onLoginSuccess({ role: 'student', data: data.student });
      } else {
        showToast(data.message || 'Pendaftaran gagal.', 'error');
      }
    } catch (err) {
      setSubmittingReg(false);
      showToast('Koneksi server terganggu.', 'error');
    }
  };

  // 3. Submit Admin Login
  const handleAdminLogin = async (e) => {
    e?.preventDefault();
    if (!adminUsername.trim() || !adminPassword.trim()) {
      showToast('Username/Email dan kata sandi admin wajib diisi!', 'error');
      return;
    }

    setSubmittingAdmin(true);
    try {
      const res = await fetch('api.php?action=admin_login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminUsername.trim(),
          password: adminPassword.trim()
        }),
        credentials: 'include'
      });
      const data = await res.json();
      setSubmittingAdmin(false);

      if (data.success && data.admin) {
        showToast(data.message, 'success');
        onLoginSuccess({ role: 'admin', data: data.admin });
      } else {
        showToast(data.message || 'Login admin gagal.', 'error');
      }
    } catch (err) {
      setSubmittingAdmin(false);
      showToast('Koneksi server terganggu.', 'error');
    }
  };

  return (
    <div className="login-screen-wrap">
      <div className="login-box-card">
        {/* JIKA BERADA DI PINTU MASUK ADMIN (admin.php atau ?portal=admin) */}
        {isAdminPortal ? (
          <div>
            <div className="login-icon-top">
              <div className="login-avatar-sq admin-sq">
                <ShieldCheck size={38} strokeWidth={2.2} />
              </div>
            </div>

            <h2 className="login-title">Portal Admin Hadirin</h2>
            <p className="login-subtitle">
              Pintu masuk khusus administrator & pembimbing presensi magang.
            </p>

            <form onSubmit={handleAdminLogin} className="login-form">
              <div className="login-field-wrap">
                <label className="login-field-label">Email atau Username Admin</label>
                <input
                  type="text"
                  className="login-field-input"
                  placeholder="admin atau nadia.putri@hadirin.id"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="login-field-wrap">
                <label className="login-field-label">Kata Sandi</label>
                <input
                  type="password"
                  className="login-field-input"
                  placeholder="Kata sandi admin"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="login-btn-submit"
                disabled={submittingAdmin}
              >
                <span>{submittingAdmin ? 'Memverifikasi...' : 'Masuk sebagai Admin'}</span>
              </button>
            </form>

            <div className="login-demo-bar">
              <span className="login-demo-label">Akun Administrator:</span>
              <div className="login-demo-chips">
                <button 
                  type="button" 
                  className="login-demo-chip"
                  onClick={() => {
                    setAdminUsername('admin');
                    setAdminPassword('admin123');
                  }}
                >
                  Nadia Putri (admin / admin123)
                </button>
              </div>
            </div>

            <div className="login-footer-links">
              <a href="index.php" className="login-help-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ArrowLeft size={14} />
                <span>Kembali ke Halaman Presensi Magang</span>
              </a>
            </div>
          </div>
        ) : (
          /* JIKA DI HALAMAN UTAMA UMUM (HANYA UNTUK ANAK MAGANG - PERSIS HALAMAN 1 PDF) */
          !isRegister ? (
            <div>
              {/* Icon Top (Page 1 PDF) */}
              <div className="login-icon-top">
                <div className="login-avatar-sq">
                  <UserCheck size={38} strokeWidth={2.2} />
                </div>
              </div>

              {/* Title & Subtitle (Page 1 PDF) */}
              <h1 className="login-title">Presensi Magang</h1>
              <p className="login-subtitle">
                Masuk untuk mencatat kehadiran dan aktivitas magangmu.
              </p>

              {/* Form Input NIM */}
              <form onSubmit={handleStudentLogin} className="login-form">
                <div className="login-field-wrap">
                  <label className="login-field-label">Nomor Induk Mahasiswa</label>
                  <input
                    type="text"
                    className="login-field-input"
                    placeholder="Contoh: 231011401234"
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    autoFocus
                  />
                  <p className="login-field-hint">
                    Gunakan NIM yang terdaftar di sistem kampus.
                  </p>
                </div>

                {/* Tombol Masuk -> (Page 1 PDF) */}
                <button
                  type="submit"
                  className="login-btn-submit"
                  disabled={submittingStudent}
                >
                  <span>{submittingStudent ? 'Memverifikasi NIM...' : '→ Masuk'}</span>
                </button>
              </form>

              {/* Quick Demo Accounts */}
              <div className="login-demo-bar">
                <span className="login-demo-label">Pilih akun demo mahasiswa:</span>
                <div className="login-demo-chips">
                  <button type="button" className="login-demo-chip" onClick={() => setNim('231011401234')}>
                    Raka Aditya (UI/UX)
                  </button>
                  <button type="button" className="login-demo-chip" onClick={() => setNim('231011401235')}>
                    Siti Nurhaliza (Frontend)
                  </button>
                  <button type="button" className="login-demo-chip" onClick={() => setNim('231011401236')}>
                    Bagas Pratama (Data)
                  </button>
                </div>
              </div>

              {/* Footer Links (Page 1 PDF) */}
              <div className="login-footer-links">
                <a
                  href="#bantuan"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Silakan hubungi koordinator magang kampus atau admin pembimbing lapangan (Nadia Putri).');
                  }}
                  className="login-help-link"
                >
                  Kesulitan masuk? Hubungi koordinator magang
                </a>
              </div>
            </div>
          ) : (
            /* PENDAFTARAN MAHASISWA BARU JIKA NIM BELUM ADA */
            <div>
              <div className="login-icon-top">
                <div className="login-avatar-sq">
                  <UserPlus size={36} strokeWidth={2.2} />
                </div>
              </div>

              <h2 className="login-title">Daftar Akun Magang</h2>
              <p className="login-subtitle">
                Lengkapi data diri untuk registrasi presensi.
              </p>

              <form onSubmit={handleStudentRegister} className="login-form">
                <div className="login-field-wrap">
                  <label className="login-field-label">Nomor Induk Mahasiswa (NIM)</label>
                  <input
                    type="text"
                    className="login-field-input"
                    value={regNim}
                    onChange={(e) => setRegNim(e.target.value)}
                    required
                  />
                </div>

                <div className="login-field-wrap">
                  <label className="login-field-label">Nama Lengkap</label>
                  <input
                    type="text"
                    className="login-field-input"
                    placeholder="Contoh: Raka Aditya"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>

                <div className="login-field-wrap">
                  <label className="login-field-label">Instansi / Universitas</label>
                  <input
                    type="text"
                    className="login-field-input"
                    value={regInstitution}
                    onChange={(e) => setRegInstitution(e.target.value)}
                  />
                </div>

                <div className="login-field-wrap">
                  <label className="login-field-label">Divisi Magang</label>
                  <input
                    type="text"
                    className="login-field-input"
                    value={regDivision}
                    onChange={(e) => setRegDivision(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="login-btn-submit"
                  disabled={submittingReg}
                >
                  <span>{submittingReg ? 'Mendaftarkan...' : 'Daftar & Masuk Sekarang'}</span>
                </button>
              </form>

              <div className="login-footer-links">
                <button
                  type="button"
                  className="login-link-btn"
                  onClick={() => setIsRegister(false)}
                >
                  ← Kembali ke Login NIM
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
