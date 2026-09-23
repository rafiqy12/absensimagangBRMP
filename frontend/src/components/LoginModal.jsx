import React, { useState, useEffect } from 'react';
import { UserCheck, UserPlus, ArrowRight, Sparkles, Building, Briefcase, GraduationCap, KeyRound, ChevronRight, User } from 'lucide-react';
import logoBrmp from '../assets/logo-brmp.png';

export default function LoginModal({ onLoginSuccess, showToast }) {
  const [isRegister, setIsRegister] = useState(false);
  const [nim, setNim] = useState('');
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [division, setDivision] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoStudents, setDemoStudents] = useState([]);

  // Fetch student list for quick demo testing
  useEffect(() => {
    fetch('api.php?action=get_students')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.students) {
          setDemoStudents(data.students);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!nim.trim()) {
      showToast('NIM wajib diisi!', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('api.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nim: nim.trim() }),
        credentials: 'include'
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        showToast(data.message, 'success');
        onLoginSuccess(data.student);
      } else {
        if (data.not_found) {
          showToast('NIM belum terdaftar. Silakan lengkapi formulir pendaftaran di bawah.', 'error');
          setIsRegister(true);
        } else {
          showToast(data.message, 'error');
        }
      }
    } catch (err) {
      setLoading(false);
      showToast('Terjadi kesalahan jaringan saat login.', 'error');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!nim.trim() || !name.trim()) {
      showToast('NIM dan Nama Lengkap wajib diisi!', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('api.php?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nim: nim.trim(),
          name: name.trim(),
          institution: institution.trim() || 'Universitas / Sekolah',
          division: division.trim() || 'Umum'
        }),
        credentials: 'include'
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        showToast(data.message, 'success');
        onLoginSuccess(data.student);
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      setLoading(false);
      showToast('Gagal melakukan pendaftaran.', 'error');
    }
  };

  const selectDemoNim = (demoNim) => {
    setNim(demoNim);
    setIsRegister(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card">
        {/* Brand / Portal Header */}
        <div className="auth-header">
          <img 
            src={logoBrmp} 
            alt="Logo BRMP Kementerian Pertanian" 
            className="auth-logo-img" 
          />
          <div>
            <div className="brand-tag">KEMENTERIAN PERTANIAN RI</div>
            <h2 className="auth-title">
              {isRegister ? 'Pendaftaran Anak Magang' : 'Portal Presensi Magang'}
            </h2>
            <p className="auth-desc">
              {isRegister 
                ? 'Lengkapi data identitas untuk mendaftar sebagai peserta magang di lingkungan BRMP.' 
                : 'Sistem presensi modern berbasis verifikasi kamera live selfie & titik koordinat GPS.'}
            </p>
          </div>
        </div>

        {!isRegister ? (
          /* FORM LOGIN */
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">
                <KeyRound size={15} style={{ color: 'var(--kementan-gold)' }} />
                Nomor Induk Mahasiswa / Siswa (NIM)
              </label>
              <div className="input-icon-wrapper">
                <UserCheck size={18} className="input-icon" />
                <input
                  type="text"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  placeholder="Masukkan NIM Anda (contoh: 2024001)"
                  required
                  autoFocus
                  className="form-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <span className="pulse-dot" />
                  <span>Memverifikasi NIM...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Portal Presensi</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Quick Demo Selector */}
            {demoStudents.length > 0 && (
              <div className="demo-section">
                <div className="demo-title">
                  <Sparkles size={15} style={{ color: 'var(--kementan-gold)' }} />
                  <span>Pilihan Akun Demo (Klik untuk mengisi cepat):</span>
                </div>
                <div className="demo-chips">
                  {demoStudents.slice(0, 4).map((stu) => (
                    <button
                      key={stu.nim}
                      type="button"
                      onClick={() => selectDemoNim(stu.nim)}
                      className="demo-chip"
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="demo-chip-avatar">
                          {stu.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
                            {stu.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                            NIM: {stu.nim} • {stu.division}
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={16} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '1.6rem', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              NIM belum terdaftar di sistem?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--kementan-gold)', 
                  fontWeight: 700, 
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px'
                }}
              >
                Daftar Magang Baru
              </button>
            </div>
          </form>
        ) : (
          /* FORM REGISTER */
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">
                <KeyRound size={15} style={{ color: 'var(--kementan-gold)' }} />
                Nomor Induk Mahasiswa (NIM)
              </label>
              <div className="input-icon-wrapper">
                <UserCheck size={18} className="input-icon" />
                <input
                  type="text"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  placeholder="Contoh: 2024005"
                  required
                  autoFocus
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <User size={15} style={{ color: 'var(--kementan-gold)' }} />
                Nama Lengkap
              </label>
              <div className="input-icon-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Muhammad Fikri"
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Building size={15} style={{ color: 'var(--kementan-gold)' }} />
                Asal Kampus / Sekolah
              </label>
              <div className="input-icon-wrapper">
                <GraduationCap size={18} className="input-icon" />
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Contoh: Institut Pertanian Bogor (IPB)"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Briefcase size={15} style={{ color: 'var(--kementan-gold)' }} />
                Divisi / Bidang Magang
              </label>
              <div className="input-icon-wrapper">
                <Briefcase size={18} className="input-icon" />
                <input
                  type="text"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  placeholder="Contoh: Standardisasi Mutu Pertanian"
                  className="form-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ marginTop: '0.5rem' }}
            >
              {loading ? (
                <>
                  <span className="pulse-dot" />
                  <span>Mendaftarkan...</span>
                </>
              ) : (
                <>
                  <span>Daftar & Masuk Sekarang</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.6rem', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Sudah memiliki akun terdaftar?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--kementan-gold)', 
                  fontWeight: 700, 
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px'
                }}
              >
                Kembali ke Halaman Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
