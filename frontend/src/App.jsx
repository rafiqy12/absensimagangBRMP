import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Clock, Calendar, LogOut, CheckCircle2, User, AlertCircle, History, Send } from 'lucide-react';
import logoBrmp from './assets/logo-brmp.png';
import CameraCapture from './components/CameraCapture';
import LocationDetector from './components/LocationDetector';
import AttendanceForm from './components/AttendanceForm';
import LoginModal from './components/LoginModal';
import HistoryView from './components/HistoryView';

export default function App() {
  const [student, setStudent] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('presensi'); // 'presensi' or 'riwayat'

  // Presensi State
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [todayStatus, setTodayStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Live Clock State
  const [currentTime, setCurrentTime] = useState(new Date());

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // 1. Clock interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Check Auth Session
  const checkAuth = async () => {
    try {
      const res = await fetch('api.php?action=get_session', { credentials: 'include' });
      const data = await res.json();
      if (data.authenticated && data.student) {
        setStudent(data.student);
      } else {
        setStudent(null);
      }
    } catch (e) {
      console.error('Auth check error:', e);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // 3. Fetch Today's Attendance Status
  const fetchTodayStatus = async () => {
    if (!student) return;
    try {
      const res = await fetch('api.php?action=get_today', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setTodayStatus(data);
      }
    } catch (e) {
      console.error('Fetch today status error:', e);
    }
  };

  useEffect(() => {
    if (student) {
      fetchTodayStatus();
    }
  }, [student]);

  // 4. Logout
  const handleLogout = async () => {
    try {
      await fetch('api.php?action=logout', { credentials: 'include' });
      setStudent(null);
      setCapturedPhoto(null);
      setLocationData(null);
      showToast('Anda telah keluar dari sesi presensi.', 'info');
    } catch (e) {
      showToast('Gagal logout', 'error');
    }
  };

  // 5. Submit Attendance
  const handleAttendanceSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const res = await fetch('api.php?action=submit_attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      const data = await res.json();
      setSubmitting(false);

      if (data.success) {
        showToast(data.message, 'success');
        // Reset selfie state so they can't duplicate without new live shot
        setCapturedPhoto(null);
        fetchTodayStatus();
        // Switch to history tab to show their attendance log
        setTimeout(() => {
          setActiveTab('riwayat');
        }, 1200);
      } else {
        showToast(data.message || 'Gagal mengirim presensi.', 'error');
      }
    } catch (err) {
      setSubmitting(false);
      showToast('Terjadi kesalahan koneksi saat mengirim presensi.', 'error');
    }
  };

  // Format Date in Indonesian
  const formatIndoDate = (d) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatIndoTime = (d) => {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} WIB`;
  };

  if (checkingAuth) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="pulse-dot" style={{ margin: '0 auto 1rem', width: 14, height: 14 }} />
          <span>Memuat Sistem Presensi...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Toast Alert */}
      {toast && (
        <div className={`alert-toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {toast.type === 'success' ? (
            <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />
          ) : (
            <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
          )}
          <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="app-header">
        <div className="brand-wrapper">
          <img 
            src={logoBrmp} 
            alt="Logo BRMP Kementerian Pertanian" 
            className="brand-logo-img" 
          />
          <div>
            <div className="brand-tag">KEMENTERIAN PERTANIAN RI</div>
            <h1 className="brand-title">Presensi Magang BRMP</h1>
            <p className="brand-subtitle">Badan Riset & Penerapan Standar Instrumen Pertanian</p>
          </div>
        </div>

        {student && (
          <div className="header-nav">
            <button
              type="button"
              onClick={() => setActiveTab('presensi')}
              className={`nav-pill ${activeTab === 'presensi' ? 'active' : ''}`}
            >
              <Send size={15} />
              <span>Presensi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('riwayat')}
              className={`nav-pill ${activeTab === 'riwayat' ? 'active' : ''}`}
            >
              <History size={15} />
              <span>Riwayat</span>
            </button>

            <div className="user-info-pill">
              <div className="user-avatar">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-name">{student.name}</span>
                <span className="user-nim">{student.nim}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="btn-logout"
              title="Keluar dari akun"
            >
              <LogOut size={14} />
              <span>Keluar</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      {!student ? (
        <LoginModal 
          onLoginSuccess={(stu) => {
            setStudent(stu);
            setActiveTab('presensi');
          }}
          showToast={showToast}
        />
      ) : activeTab === 'presensi' ? (
        /* Tab Presensi */
        <div>
          {/* Status & Clock Banner */}
          <div className="status-banner">
            <div>
              <div style={{ fontSize: '0.82rem', color: '#93c5fd', fontWeight: 600 }}>
                Selamat Datang, {student.name}!
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {student.institution} • {student.division}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div className="clock-display">
                <Clock size={19} style={{ color: '#818cf8' }} />
                <span>{formatIndoTime(currentTime)}</span>
              </div>
              <div className="clock-date">
                {formatIndoDate(currentTime)}
              </div>
            </div>
          </div>

          <div className="grid-cols-2">
            {/* Kolom Kiri: Kamera Live & Lokasi GPS */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Camera size={18} style={{ color: '#818cf8' }} />
                  Kamera Selfie Langsung
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.15)', padding: '0.2rem 0.5rem', borderRadius: '999px', fontWeight: 600 }}>
                  Wajib Live
                </span>
              </div>

              {/* Kamera WebRTC Component */}
              <CameraCapture
                capturedPhoto={capturedPhoto}
                onPhotoCaptured={(photo) => {
                  setCapturedPhoto(photo);
                  showToast('Foto selfie berhasil diambil!', 'success');
                }}
                onRetake={() => {
                  setCapturedPhoto(null);
                }}
              />

              {/* Detektor Lokasi GPS */}
              <LocationDetector
                locationData={locationData}
                onLocationDetected={(loc) => {
                  setLocationData(loc);
                  showToast('Titik koordinat GPS berhasil dideteksi!', 'success');
                }}
              />
            </div>

            {/* Kolom Kanan: Form Presensi & Verifikasi */}
            <div className="card">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
                Konfirmasi Data Presensi
              </h3>

              <AttendanceForm
                todayStatus={todayStatus}
                capturedPhoto={capturedPhoto}
                locationData={locationData}
                onSubmit={handleAttendanceSubmit}
                submitting={submitting}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Tab Riwayat */
        <HistoryView 
          currentNim={student.nim} 
          showToast={showToast}
        />
      )}
    </div>
  );
}
