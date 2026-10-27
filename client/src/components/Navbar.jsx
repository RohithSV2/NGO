import React from 'react';

export default function Navbar({ activeTab, setActiveTab, user, onOpenAuth, onLogout }) {
  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'request-aid', label: 'Post Aid Request' },
    { id: 'directory', label: 'NGO Directory' },
    { id: 'tracker', label: 'Track Requests' },
    { id: 'reviews', label: 'Reviews & Ratings' }
  ];

  return (
    <header className="navbar-root">
      <div className="navbar-inner">
        <div className="navbar-brand" onClick={() => setActiveTab('overview')} role="button" tabIndex={0}>
          <div className="brand-badge-icon">🌿</div>
          <div className="brand-info">
            <span className="brand-title">AidConnect</span>
            <span className="brand-tagline">NGO Humanitarian Network</span>
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

        <div className="navbar-actions">
          {user ? (
            <div className="user-profile-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="btn-quick-tracker"
                onClick={() => setActiveTab('tracker')}
                title="Directly view Aid Request Tracking Board"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: '20px',
                  color: '#166534',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>📋</span>
                <span>My Tracker</span>
              </button>
              <div className="user-profile-pill">
                <span className="user-icon">👤</span>
                <span className="user-display-name">{user.name}</span>
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
