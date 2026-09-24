import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, Calendar, MapPin, Clock, X, ExternalLink, ShieldCheck, 
  LogIn, LogOut, ArrowDownLeft, ArrowUpRight, CheckCircle2, AlertCircle, Sparkles 
} from 'lucide-react';

export default function InternHistory({ student, showToast }) {
  const [typeTab, setTypeTab] = useState('Semua'); // 'Semua', 'masuk', 'pulang'
  const [statusFilter, setStatusFilter] = useState('Semua'); // 'Semua', 'Hadir', 'Terlambat', 'Izin'
  const [history, setHistory] = useState([]);
  const [counts, setCounts] = useState({ hadir: 0, terlambat: 0, izin: 0, masuk: 0, pulang: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const typeParam = typeTab !== 'Semua' ? typeTab : 'Semua';
      const res = await fetch(`api.php?action=get_history&nim=${student?.nim}&status=${statusFilter}&type=${typeParam}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.history || []);
        if (data.counts) {
          setCounts(data.counts);
        }
      }
    } catch (err) {
      console.error('Fetch history error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [typeTab, statusFilter, student]);

  // Current month name
  const monthYearStr = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date());

  const getStatusBadge = (status) => {
    if (status === 'Terlambat') {
      return <span className="intern-history-badge badge-late">Terlambat</span>;
    }
    if (status === 'Izin') {
      return <span className="intern-history-badge badge-permit">Izin</span>;
    }
    if (status === 'Perlu tinjauan') {
      return <span className="intern-history-badge badge-review">Perlu Tinjauan</span>;
    }
    return <span className="intern-history-badge badge-present">Hadir</span>;
  };

  return (
    <div className="intern-page">
      {/* Header */}
      <div className="intern-history-header">
        <div>
          <h2 className="intern-page-title">Riwayat Presensi</h2>
          <span className="intern-page-sub">{monthYearStr}</span>
        </div>
        <div className="intern-hsummary-counts">
          <span className="hcount-pill hcount-masuk">
            <ArrowDownLeft size={13} /> {counts.masuk || 0} Masuk
          </span>
          <span className="hcount-pill hcount-pulang">
            <ArrowUpRight size={13} /> {counts.pulang || 0} Pulang
          </span>
        </div>
      </div>

      {/* Primary Tab: Pemisah Masuk vs Keluar / Pulang */}
      <div className="intern-type-tabs">
        <button
          type="button"
          className={`intern-type-tab ${typeTab === 'Semua' ? 'active' : ''}`}
          onClick={() => setTypeTab('Semua')}
        >
          Semua Catatan
        </button>
        <button
          type="button"
          className={`intern-type-tab tab-masuk ${typeTab === 'masuk' ? 'active' : ''}`}
          onClick={() => setTypeTab('masuk')}
        >
          <ArrowDownLeft size={16} />
          <span>Absensi Masuk</span>
          {counts.masuk > 0 && <span className="tab-badge">{counts.masuk}</span>}
        </button>
        <button
          type="button"
          className={`intern-type-tab tab-pulang ${typeTab === 'pulang' ? 'active' : ''}`}
          onClick={() => setTypeTab('pulang')}
        >
          <ArrowUpRight size={16} />
          <span>Absensi Keluar / Pulang</span>
          {counts.pulang > 0 && <span className="tab-badge">{counts.pulang}</span>}
        </button>
      </div>

      {/* Filter Status Pills */}
      <div className="intern-filter-pills">
        {['Semua', 'Hadir', 'Terlambat', 'Izin'].map((item) => (
          <button
            key={item}
            type="button"
            className={`intern-filter-pill ${statusFilter === item ? 'active' : ''}`}
            onClick={() => setStatusFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {/* KPI Stats Bulanan */}
      <div className="intern-card intern-history-summary">
        <div className="intern-hstat-col">
          <span className="intern-hstat-number text-forest">{counts.hadir || 0}</span>
          <span className="intern-hstat-label">Tepat Waktu</span>
        </div>
        <div className="intern-hstat-divider" />
        <div className="intern-hstat-col">
          <span className="intern-hstat-number text-orange">{counts.terlambat || 0}</span>
          <span className="intern-hstat-label">Terlambat</span>
        </div>
        <div className="intern-hstat-divider" />
        <div className="intern-hstat-col">
          <span className="intern-hstat-number text-blue">{counts.izin || 0}</span>
          <span className="intern-hstat-label">Izin / Sakit</span>
        </div>
      </div>

      {/* List Riwayat Kehadiran */}
      <div className="intern-history-list">
        {loading ? (
          <div className="intern-loading-box">Memuat riwayat kehadiran...</div>
        ) : history.length === 0 ? (
          <div className="intern-empty-box">
            <Clock size={36} style={{ color: 'var(--text-subtle)', marginBottom: '0.5rem' }} />
            <p>Belum ada catatan presensi untuk filter ini.</p>
          </div>
        ) : (
          history.map((item) => {
            const isPulang = item.type === 'pulang';
            return (
              <div
                key={item.id}
                className={`intern-card intern-history-card-enhanced ${isPulang ? 'is-pulang' : 'is-masuk'}`}
                onClick={() => setSelectedDetail(item)}
              >
                {/* Visual Type Indicator & Photo Thumbnail */}
                <div className="intern-hitem-leading">
                  {item.photo_path && item.photo_path !== 'uploads/placeholder.jpg' ? (
                    <div className="intern-hitem-thumb-wrap">
                      <img src={item.photo_path} alt="Selfie" className="intern-hitem-thumb" />
                      <span className={`intern-hitem-thumb-badge ${isPulang ? 'thumb-pulang' : 'thumb-masuk'}`}>
                        {isPulang ? <ArrowUpRight size={10} /> : <ArrowDownLeft size={10} />}
                      </span>
                    </div>
                  ) : (
                    <div className={`intern-hitem-icon-circle ${isPulang ? 'circle-pulang' : 'circle-masuk'}`}>
                      {isPulang ? <LogOut size={18} /> : <LogIn size={18} />}
                    </div>
                  )}
                </div>

                {/* Content: Type Title, Date, Time & Office */}
                <div className="intern-hitem-body">
                  <div className="intern-hitem-type-line">
                    <span className={`intern-type-pill ${isPulang ? 'pill-pulang' : 'pill-masuk'}`}>
                      {isPulang ? '↑ Presensi Keluar / Pulang' : '↓ Presensi Masuk'}
                    </span>
                    {isPulang && item.work_duration && (
                      <span className="intern-duration-chip">
                        <Clock size={11} /> {item.work_duration}
                      </span>
                    )}
                  </div>

                  <h4 className="intern-hitem-date">{item.formatted_date || item.date_only}</h4>
                  
                  <div className="intern-hitem-meta-row">
                    <span className="intern-hitem-time-badge">
                      <Clock size={12} /> {item.time_only}
                    </span>
                    <span className="intern-hitem-office">
                      <MapPin size={12} /> {item.location_name || 'Kantor BRMP'}
                    </span>
                  </div>
                </div>

                {/* Right side status */}
                <div className="intern-hitem-right">
                  {getStatusBadge(item.status)}
                  <ChevronRight size={18} className="intern-chevron" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Detail Presensi */}
      {selectedDetail && (
        <div className="intern-modal-backdrop" onClick={() => setSelectedDetail(null)}>
          <div className="intern-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="intern-modal-header">
              <div>
                <span className={`intern-type-pill ${selectedDetail.type === 'pulang' ? 'pill-pulang' : 'pill-masuk'}`}>
                  {selectedDetail.type === 'pulang' ? '↑ Presensi Keluar / Pulang' : '↓ Presensi Masuk'}
                </span>
                <h3 style={{ marginTop: '4px' }}>Detail Catatan Kehadiran</h3>
              </div>
              <button type="button" className="btn-close-sheet" onClick={() => setSelectedDetail(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="intern-detail-content">
              {selectedDetail.photo_path && selectedDetail.photo_path !== 'uploads/placeholder.jpg' && (
                <div className="intern-detail-photo-wrap">
                  <img src={selectedDetail.photo_path} alt="Foto Presensi" className="intern-detail-photo" />
                  <div className="intern-photo-caption">
                    <span>Foto Selfie Presensi {selectedDetail.type === 'pulang' ? 'Pulang' : 'Masuk'}</span>
                  </div>
                </div>
              )}

              <div className="intern-summary-row">
                <span className="intern-summary-label">Tipe Presensi</span>
                <span className={`intern-type-pill ${selectedDetail.type === 'pulang' ? 'pill-pulang' : 'pill-masuk'}`}>
                  {selectedDetail.type === 'pulang' ? 'Presensi Pulang / Keluar' : 'Presensi Masuk'}
                </span>
              </div>

              <div className="intern-summary-row">
                <span className="intern-summary-label">Status Verifikasi</span>
                <span>{getStatusBadge(selectedDetail.status)}</span>
              </div>

              <div className="intern-summary-row">
                <span className="intern-summary-label">Waktu Tercatat</span>
                <span className="intern-summary-val">{selectedDetail.formatted_date} · {selectedDetail.time_only}</span>
              </div>

              {selectedDetail.type === 'pulang' && selectedDetail.work_duration && (
                <div className="intern-summary-row">
                  <span className="intern-summary-label">Total Jam Kerja</span>
                  <span className="intern-summary-val font-bold text-forest">
                    {selectedDetail.work_duration}
                  </span>
                </div>
              )}

              <div className="intern-summary-row">
                <span className="intern-summary-label">Lokasi Kantor</span>
                <span className="intern-summary-val">{selectedDetail.location_name || 'Gedung Kantor BRMP'}</span>
              </div>

              {selectedDetail.distance_meters && (
                <div className="intern-summary-row">
                  <span className="intern-summary-label">Jarak ke Titik Kantor</span>
                  <span className="intern-summary-val">{Math.round(selectedDetail.distance_meters)} meter</span>
                </div>
              )}

              {selectedDetail.note && (
                <div className="intern-summary-row">
                  <span className="intern-summary-label">Catatan</span>
                  <span className="intern-summary-val">{selectedDetail.note}</span>
                </div>
              )}

              {selectedDetail.maps_url && (
                <a
                  href={selectedDetail.maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="intern-maps-link"
                >
                  <MapPin size={16} />
                  <span>Buka Titik Koordinat di Google Maps</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
