import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  BookOpenCheck, 
  Settings, 
  LogOut, 
  HelpCircle,
  Bell,
  Download,
  ArrowLeft
} from 'lucide-react';
import brmpLogo from '../../assets/logo-brmp.png';

export default function AdminLayout({ 
  admin, 
  activeMenu, 
  onSelectMenu, 
  onLogout, 
  onSwitchToIntern, 
  children 
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'peserta', label: 'Peserta Magang', icon: Users },
    { id: 'presensi', label: 'Kelola Presensi', icon: CalendarCheck },
    { id: 'logbook', label: 'Pemeriksaan Logbook', icon: BookOpenCheck },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
  ];

  // Current Indonesian Date
  const now = new Date();
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const dateStr = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <div className="admin-container">
      {/* Sidebar (Pages 7-11 PDF) */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          {/* Logo BRMP DIY */}
          <div className="admin-brand">
            <div className="admin-logo-box">
              <img src={brmpLogo} alt="Logo BRMP DIY" className="admin-brand-logo-img" />
            </div>
            <div className="admin-brand-text">
              <h1 className="admin-brand-name">BRMP DIY</h1>
              <span className="admin-brand-role">Admin Presensi</span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="admin-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`admin-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectMenu(item.id)}
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="admin-sidebar-bottom">
          {/* Switch to Intern Portal Button */}
          <button
            type="button"
            className="admin-switch-intern-btn"
            onClick={onSwitchToIntern}
            title="Lihat Tampilan Presensi Mahasiswa Magang"
          >
            <ArrowLeft size={16} />
            <span>Mode Anak Magang</span>
          </button>

          {/* Help Box */}
          <div className="admin-help-box">
            <h5 className="admin-help-title">Butuh bantuan?</h5>
            <p className="admin-help-sub">Panduan pengelolaan presensi dan logbook.</p>
          </div>

          {/* Admin User Footer */}
          <div className="admin-user-footer">
            <div className="admin-user-avatar">
              {admin?.name?.charAt(0) || 'N'}
            </div>
            <div className="admin-user-info">
              <span className="admin-user-name">{admin?.name || 'Nadia Putri'}</span>
              <span className="admin-user-sub">{admin?.role || 'Administrator'}</span>
            </div>
            <button
              type="button"
              className="admin-btn-logout"
              onClick={onLogout}
              title="Keluar dari sesi Admin"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Top Header Bar */}
        <header className="admin-topbar">
          <div>
            {/* Context page label is rendered by sub-components or topbar */}
          </div>

          <div className="admin-topbar-right">
            <span className="admin-topbar-date">{dateStr}</span>

            <button 
              type="button" 
              className="admin-icon-btn" 
              title="Notifikasi Masuk"
              onClick={() => alert('Tidak ada notifikasi sistem baru.')}
            >
              <Bell size={19} />
              <span className="admin-bell-dot" />
            </button>
          </div>
        </header>

        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
