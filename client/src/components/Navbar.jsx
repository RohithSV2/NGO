import React from 'react';

export default function Navbar({ activeTab, setActiveTab, user, onOpenAuth, onLogout }) {
  const isNGO = user?.role === 'ngo';

  // Role-specific navigation items:
  // Representative: Response Hub (View, Connect, Resolve), Track Operations, Directory, Reviews
  // Citizen / User: Overview, Post Aid Request (can have many), Track My Requests, Directory, Reviews
  const navItems = isNGO
    ? [
        { id: 'ngo-portal', label: '🏢 NGO Response Hub' },
        { id: 'tracker', label: '📋 Track Operations' },
        { id: 'directory', label: 'NGO Directory' },
        { id: 'reviews', label: 'Reviews & Ratings' }
      ]
    : [
        { id: 'overview', label: 'Overview' },
        { id: 'request-aid', label: 'Post Aid Request' },
        { id: 'tracker', label: user ? 'Track My Requests' : 'Track Requests' },
        { id: 'directory', label: 'NGO Directory' },
        { id: 'reviews', label: 'Reviews & Ratings' }
      ];

  const handleBrandClick = () => {
    if (isNGO) {
      setActiveTab('ngo-portal');
    } else {
      setActiveTab('overview');
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

        <div className="navbar-actions">
          {user ? (
            <div className="user-profile-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isNGO ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('ngo-portal')}
                  title="Directly view NGO Response Operations Center"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    backgroundColor: '#16a34a',
                    border: '1px solid #15803d',
                    borderRadius: '20px',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 6px rgba(22, 101, 52, 0.2)'
                  }}
                >
                  <span>🏢</span>
                  <span>Operations Hub</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-quick-tracker"
                  onClick={() => setActiveTab('tracker')}
                  title="Directly view your Aid Request Tracking Board"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '20px',
                    color: '#166534',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>📋</span>
                  <span>My Tracker</span>
                </button>
              )}

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
