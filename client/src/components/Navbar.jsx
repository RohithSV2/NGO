import React, { useState } from 'react';

export default function Navbar({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onLogout,
  notifications = [],
  onMarkNotificationsRead
}) {
  const isNGO = user?.role === 'ngo';
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = isNGO
    ? [
        { id: 'ngo-portal', label: 'NGO Hub' },
        { id: 'tracker', label: 'Tracker' },
        { id: 'directory', label: 'Directory' },
        { id: 'analytics', label: 'Analytics' },
        { id: 'pledges', label: 'Pledges' },
        { id: 'volunteers', label: 'Volunteers' },
        { id: 'reviews', label: 'Reviews' }
      ]
    : [
        { id: 'overview', label: 'Overview' },
        { id: 'request-aid', label: 'Post Aid' },
        { id: 'tracker', label: 'Track Aid' },
        { id: 'directory', label: 'Directory' },
        { id: 'analytics', label: 'Analytics' },
        { id: 'pledges', label: 'Pledges' },
        { id: 'volunteers', label: 'Volunteers' },
        { id: 'reviews', label: 'Reviews' }
      ];

  const handleBrandClick = () => {
    if (isNGO) {
      setActiveTab('ngo-portal');
    } else {
      setActiveTab('overview');
    }
  };

  const handleToggleNotifications = () => {
    setIsNotifOpen(!isNotifOpen);
    if (!isNotifOpen && unreadCount > 0 && onMarkNotificationsRead) {
      onMarkNotificationsRead();
    }
  };

  return (
    <header className="navbar-root">
      <div className="navbar-inner">
        <div className="navbar-brand" onClick={handleBrandClick} role="button" tabIndex={0}>
          <div className="brand-badge-icon">🌿</div>
          <div className="brand-info">
            <span className="brand-title">AidConnect</span>
            <span className="brand-tagline">
              {isNGO ? 'NGO Operations Network' : 'Humanitarian Aid Platform'}
            </span>
          </div>
        </div>

        <nav className="navbar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              type="button"
              className={`nav-link-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Notification Bell Icon */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={handleToggleNotifications}
              style={{
                position: 'relative',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                cursor: 'pointer'
              }}
              title="Emergency Notifications & Live Alerts"
            >
              🔔
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: '800',
                    borderRadius: '10px',
                    minWidth: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    border: '2px solid #ffffff'
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer Popover */}
            {isNotifOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '46px',
                  right: '0',
                  width: '330px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                  zIndex: 2000,
                  overflow: 'hidden'
                }}
              >
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: '800', fontSize: '13px', color: '#0f172a' }}>
                    🚨 Live Mission Alerts
                  </div>
                  <span style={{ fontSize: '11px', color: '#166534', fontWeight: '700' }}>
                    {notifications.length} Total
                  </span>
                </div>

                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {notifications.length > 0 ? (
                    notifications.map((n, idx) => (
                      <div
                        key={n.id || idx}
                        style={{
                          padding: '10px 14px',
                          borderBottom: '1px solid #f1f5f9',
                          backgroundColor: n.read ? '#ffffff' : '#f0fdf4'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>
                            {n.title}
                          </span>
                          <span style={{ fontSize: '10px', color: '#64748b' }}>{n.time}</span>
                        </div>
                        <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#475569', lineHeight: '1.4' }}>
                          {n.message}
                        </p>
                        {n.district && (
                          <span style={{ fontSize: '10px', fontWeight: '700', color: '#166534', backgroundColor: '#dcfce7', padding: '1px 6px', borderRadius: '4px' }}>
                            📍 {n.district}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '24px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
                      No active emergency alerts.
                    </div>
                  )}
                </div>

                <div style={{ padding: '8px 12px', borderTop: '1px solid #e2e8f0', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (onMarkNotificationsRead) onMarkNotificationsRead();
                      setIsNotifOpen(false);
                    }}
                    style={{ background: 'none', border: 'none', color: '#166534', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Close Notification Drawer
                  </button>
                </div>
              </div>
            )}
          </div>

          {user ? (
            <div className="user-profile-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="user-profile-pill">
                <span className="user-icon">{isNGO ? '🏢' : '👤'}</span>
                <span className="user-display-name">
                  {user.name}
                  {isNGO && (
                    <span style={{ fontSize: '11px', color: '#166534', display: 'block', fontWeight: '700' }}>
                      {user.ngoName ? `${user.ngoName} Rep` : 'NGO Representative'}
                    </span>
                  )}
                  {!isNGO && (
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: '600' }}>
                      Citizen Requester
                    </span>
                  )}
                </span>
                <button type="button" className="logout-action-btn" onClick={onLogout} title="Sign Out">
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="btn-signin" onClick={onOpenAuth}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
