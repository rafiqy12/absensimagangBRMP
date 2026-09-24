import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

// Intern Components (Pages 1-6 PDF)
import InternHome from './components/intern/InternHome';
import InternAttendanceModal from './components/intern/InternAttendanceModal';
import InternSuccessModal from './components/intern/InternSuccessModal';
import InternHistory from './components/intern/InternHistory';
import InternLogbook from './components/intern/InternLogbook';
import InternProfile from './components/intern/InternProfile';
import InternBottomNav from './components/intern/InternBottomNav';

// Admin Components (Pages 7-11 PDF)
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminStudents from './components/admin/AdminStudents';
import AdminAttendance from './components/admin/AdminAttendance';
import AdminLogbook from './components/admin/AdminLogbook';
import AdminSettings from './components/admin/AdminSettings';

// Login Modal
import LoginModal from './components/LoginModal';

export default function App() {
  const [session, setSession] = useState(null); // { role: 'student' | 'admin', user: ... }
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Intern Flow State
  const [internTab, setInternTab] = useState('beranda'); // 'beranda', 'riwayat', 'logbook', 'profil'
  const [todayStatus, setTodayStatus] = useState(null);
  const [attendanceModalType, setAttendanceModalType] = useState(null); // 'masuk' | 'pulang' | null
  const [successResult, setSuccessResult] = useState(null);
  const [offices, setOffices] = useState([]);

  // Admin Flow State
  const [adminMenu, setAdminMenu] = useState('dashboard'); // 'dashboard', 'peserta', 'presensi', 'logbook', 'pengaturan'

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Deteksi rute pintu masuk khusus admin (admin.php atau ?portal=admin)
  const isAdminPortal = typeof window !== 'undefined' && (
    Boolean(window.IS_ADMIN_PORTAL) || 
    window.location.search.includes('admin') || 
    window.location.pathname.includes('admin')
  );

  // 1. Check Active Session on Start
  const checkSession = async () => {
    try {
      const res = await fetch('api.php?action=get_session', { credentials: 'include' });
      const data = await res.json();
      if (data.authenticated && data.role) {
        setSession({
          role: data.role,
          user: data.user || data.student
        });
      } else {
        setSession(null);
      }
    } catch (e) {
      console.error('Session check error:', e);
      setSession(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  // 2. Fetch 3 Office Locations
  const fetchOffices = async () => {
    try {
      const res = await fetch('api.php?action=get_office_locations', { credentials: 'include' });
      const data = await res.json();
      if (data.success && data.locations) {
        setOffices(data.locations);
      }
    } catch (e) {
      console.error('Fetch offices error:', e);
    }
  };

  // 3. Fetch Today Attendance for Intern
  const fetchTodayStatus = async () => {
    if (session?.role !== 'student') return;
    try {
      const res = await fetch('api.php?action=get_today', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setTodayStatus(data);
      }
    } catch (e) {
      console.error('Fetch today error:', e);
    }
  };

  useEffect(() => {
    checkSession();
    fetchOffices();
  }, []);

  useEffect(() => {
    if (session?.role === 'student') {
      fetchTodayStatus();
    }
  }, [session]);

  // 4. Logout Handler
  const handleLogout = async () => {
    try {
      await fetch('api.php?action=logout', { credentials: 'include' });
      setSession(null);
      setAttendanceModalType(null);
      setSuccessResult(null);
      showToast('Berhasil keluar dari akun.', 'info');
      if (isAdminPortal) {
        window.location.href = 'admin.php';
      } else {
        window.location.href = 'index.php';
      }
    } catch (e) {
      showToast('Gagal logout.', 'error');
    }
  };

  // Loading Screen
  if (checkingAuth) {
    return (
      <div className="app-splash-screen">
        <div className="app-splash-box">
          <div className="app-splash-logo">H</div>
          <h2 className="app-splash-title">{isAdminPortal ? 'Hadirin Administrator' : 'Hadirin Presensi'}</h2>
          <div className="app-splash-loader">
            <span className="pulse-dot" />
            <span>Memuat sistem presensi...</span>
          </div>
        </div>
      </div>
    );
  }

  // Jika di pintu Admin tapi belum login sebagai admin
  const showAdminLayout = isAdminPortal && session?.role === 'admin';
  const showStudentLayout = !isAdminPortal && session?.role === 'student';

  return (
    <div className="app-root">
      {/* Toast Alert */}
      {toast && (
        <div className={`alert-toast toast-${toast.type}`}>
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} />
          ) : toast.type === 'error' ? (
            <AlertCircle size={18} />
          ) : (
            <Sparkles size={18} />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. BELUM LOGIN ATAU ROLE TIDAK SESUAI PINTU MASUK -> TAMPILKAN FORM LOGIN KHUSUS */}
      {(!session || (isAdminPortal && session.role !== 'admin') || (!isAdminPortal && session.role !== 'student')) ? (
        <LoginModal
          isAdminPortal={isAdminPortal}
          onLoginSuccess={(loginData) => {
            setSession({
              role: loginData.role,
              user: loginData.data
            });
            if (loginData.role === 'student') {
              setInternTab('beranda');
            } else {
              setAdminMenu('dashboard');
            }
          }}
          showToast={showToast}
        />
      ) : showAdminLayout ? (
        /* ========================================================= */
        /* 2. ROLE ADMINISTRATOR -> DASHBOARD ADMIN (PAGES 7-11 PDF) */
        /* ========================================================= */
        <AdminLayout
          admin={session.user}
          activeMenu={adminMenu}
          onSelectMenu={(menuId) => setAdminMenu(menuId)}
          onLogout={handleLogout}
          onSwitchToIntern={async () => {
            window.location.href = 'index.php';
          }}
        >
          {adminMenu === 'dashboard' && (
            <AdminDashboard
              admin={session.user}
              onNavigateMenu={(menu) => setAdminMenu(menu)}
            />
          )}

          {adminMenu === 'peserta' && (
            <AdminStudents showToast={showToast} />
          )}

          {adminMenu === 'presensi' && (
            <AdminAttendance showToast={showToast} />
          )}

          {adminMenu === 'logbook' && (
            <AdminLogbook showToast={showToast} />
          )}

          {adminMenu === 'pengaturan' && (
            <AdminSettings admin={session.user} showToast={showToast} />
          )}
        </AdminLayout>
      ) : (
        /* ========================================================= */
        /* 3. ROLE ANAK MAGANG -> MOBILE APP LAYOUT (PAGES 1-6 PDF)  */
        /* ========================================================= */
        <div className="intern-viewport-wrapper">
          <div className="intern-mobile-container">
            {/* Status bar mock (09.41) */}
            <div className="intern-statusbar">
              <span className="intern-status-time">09.41</span>
              <div className="intern-status-icons">
                <span className="intern-bar-icon" />
                <span className="intern-bar-icon" />
                <span className="intern-bar-icon" />
              </div>
            </div>

            {/* Content per Tab */}
            <div className="intern-screen-scroll">
              {internTab === 'beranda' && (
                <InternHome
                  student={session.user}
                  todayStatus={todayStatus}
                  offices={offices}
                  onOpenAttendance={(type) => setAttendanceModalType(type)}
                  onNavigateTab={(tab) => setInternTab(tab)}
                  onLogout={handleLogout}
                />
              )}

              {internTab === 'riwayat' && (
                <InternHistory
                  student={session.user}
                  showToast={showToast}
                />
              )}

              {internTab === 'logbook' && (
                <InternLogbook
                  student={session.user}
                  showToast={showToast}
                />
              )}

              {internTab === 'profil' && (
                <InternProfile
                  student={session.user}
                  onLogout={handleLogout}
                  onSwitchToAdmin={() => {
                    setSession({
                      role: 'admin',
                      user: {
                        name: 'Nadia Putri',
                        email: 'nadia.putri@hadirin.id',
                        role: 'Administrator'
                      }
                    });
                    setAdminMenu('dashboard');
                    showToast('Beralih ke Portal Admin Hadirin.', 'info');
                  }}
                />
              )}
            </div>

            {/* Bottom Nav Bar (Pages 2, 5, 6 PDF) */}
            <InternBottomNav
              activeTab={internTab}
              onSelectTab={(t) => setInternTab(t)}
            />

            {/* Modal Presensi (Page 3 PDF) */}
            {attendanceModalType && (
              <InternAttendanceModal
                type={attendanceModalType}
                student={session.user}
                onClose={() => setAttendanceModalType(null)}
                onSubmitSuccess={(result) => {
                  setAttendanceModalType(null);
                  setSuccessResult(result);
                  fetchTodayStatus();
                }}
                showToast={showToast}
              />
            )}

            {/* Modal Presensi Berhasil (Page 4 PDF) */}
            {successResult && (
              <InternSuccessModal
                result={successResult}
                onBackToHome={() => {
                  setSuccessResult(null);
                  setInternTab('beranda');
                }}
                onViewHistory={() => {
                  setSuccessResult(null);
                  setInternTab('riwayat');
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
