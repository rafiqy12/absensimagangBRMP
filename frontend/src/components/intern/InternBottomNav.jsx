import React from 'react';
import { Home, Calendar, BookOpen, User } from 'lucide-react';

export default function InternBottomNav({ activeTab, onSelectTab }) {
  const navItems = [
    { id: 'beranda', label: 'Beranda', icon: Home },
    { id: 'riwayat', label: 'Riwayat', icon: Calendar },
    { id: 'logbook', label: 'Logbook', icon: BookOpen },
    { id: 'profil', label: 'Profil', icon: User },
  ];

  return (
    <nav className="intern-bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            className={`intern-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTab(item.id)}
          >
            <div className="intern-nav-icon-wrap">
              <Icon size={20} strokeWidth={isActive ? 2.3 : 1.7} />
            </div>
            <span className="intern-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
