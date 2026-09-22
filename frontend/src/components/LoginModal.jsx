import React, { useState, useEffect } from 'react';
import { UserCheck, UserPlus, ArrowRight, Sparkles, Building, Briefcase } from 'lucide-react';
import logoBrmp from '../assets/logo-brmp.png';

export default function LoginModal({ onLoginSuccess, showToast }) {
  const [isRegister, setIsRegister] = useState(false);
  const [nim, setNim] = useState('');
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [division, setDivision] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoStudents, setDemoStudents] = useState([]);

  // Fetch student list for easy demo testing
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
      showToast('Terjadi kesalahan jaringan.', 'error');
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
    <div style={{ maxWidth: 480, margin: '2rem auto' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ marginBottom: '0.85rem' }}>
            <img 
              src={logoBrmp} 
              alt="Logo BRMP Kementerian Pertanian" 
              style={{
                width: 72,
                height: 72,
                objectFit: 'contain',
                filter: 'drop-shadow(0 6px 16px rgba(234, 179, 8, 0.45))'
              }}
            />
          </div>
          <div className="brand-tag" style={{ marginBottom: '0.4rem' }}>
            KEMENTERIAN PERTANIAN REPUBLIK INDONESIA
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            {isRegister ? 'Pendaftaran Anak Magang' : 'Presensi Magang BRMP'}
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
            {isRegister 
              ? 'Lengkapi data Anda untuk mendaftar presensi magang di lingkungan BRMP Kementan' 
              : 'Silakan masukkan NIM Anda untuk verifikasi presensi harian dengan kamera selfie'}
          </p>
        </div>

        {!isRegister ? (
          /* FORM LOGIN */
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Nomor Induk Mahasiswa / Siswa (NIM)</label>
              <input
                type="text"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                placeholder="Contoh: 2024001"
                required
                autoFocus
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ marginTop: '0.5rem' }}
            >
              {loading ? 'Memeriksa NIM...' : 'Masuk ke Portal Presensi'}
              <ArrowRight size={18} />
            </button>

            {/* Quick Demo Pill Selector */}
            {demoStudents.length > 0 && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                  <Sparkles size={14} style={{ color: '#fbbf24' }} />
                  <span>Akun Demo Cepat (Klik untuk memilih):</span>
                </div>
                <div className="demo-pills">
                  {demoStudents.map((stu) => (
                    <button
                      key={stu.nim}
                      type="button"
                      onClick={() => selectDemoNim(stu.nim)}
                      className="demo-pill"
                    >
                      {stu.nim} - {stu.name.split(' ')[0]} ({stu.division})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              NIM Anda belum terdaftar?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 600, cursor: 'pointer' }}
              >
                Daftar Baru
              </button>
            </div>
          </form>
        ) : (
          /* FORM REGISTER */
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">NIM (Nomor Induk)</label>
              <input
                type="text"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                placeholder="Contoh: 2024005"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Muhammad Akbar"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Asal Kampus / Sekolah</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Contoh: Universitas Indonesia"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Divisi / Bagian Magang</label>
              <input
                type="text"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                placeholder="Contoh: IT Support / Backend"
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ marginTop: '0.5rem' }}
            >
              {loading ? 'Mendaftarkan...' : 'Daftar & Masuk Sekarang'}
              <ArrowRight size={18} />
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Sudah pernah terdaftar?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 600, cursor: 'pointer' }}
              >
                Kembali ke Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
