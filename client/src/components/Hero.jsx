import React from 'react';

export default function Hero({ onPostRequest, onExploreDirectory, onTrackRequests, onOpenNGOPortal, stats }) {
  return (
    <section className="hero-pro-section">
      <div className="hero-badge-pill">
        <span className="hero-badge-dot"></span>
        Certified NGO Emergency & Humanitarian Platform
      </div>

      <h1 className="hero-headline">
        Direct Aid Delivery & Verified NGO Assistance
      </h1>

      <p className="hero-subhead">
        Submit emergency aid requests and get matched with verified non-profit organizations
        specializing in disaster response, healthcare, food security, education, and social welfare.
      </p>

      <div className="hero-button-group">
        <button
          type="button"
          className="btn-primary-green hero-btn"
          onClick={onPostRequest}
        >
          Post Aid Request
        </button>
        <button
          type="button"
          className="btn-outline-green hero-btn"
          onClick={onTrackRequests}
          title="Directly view live Aid Request Tracking Board"
        >
          📋 Track Requests
        </button>
      </div>

      <div style={{ marginTop: '14px', marginBottom: '8px' }}>
        <button
          type="button"
          onClick={onOpenNGOPortal}
          style={{
            background: '#f0fdf4',
            border: '1px solid #86efac',
            color: '#166534',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 4px rgba(22, 101, 52, 0.08)'
          }}
        >
          <span>🏢</span>
          <span>Are you an NGO? Access NGO Response & Connect Hub &rarr;</span>
        </button>
      </div>

      <div className="hero-metrics-grid">
        <div className="metric-box">
          <div className="metric-value">{stats.totalNGOs || 25}+</div>
          <div className="metric-name">Verified Partner NGOs</div>
        </div>
        <div
          className="metric-box clickable-metric"
          onClick={onTrackRequests}
          role="button"
          tabIndex={0}
          title="Click to directly open Aid Request Tracking Board"
          style={{ cursor: 'pointer' }}
        >
          <div className="metric-value">{stats.totalRequests || 40}+</div>
          <div className="metric-name">Aid Requests Managed &rarr;</div>
        </div>
        <div className="metric-box">
          <div className="metric-value">98.5%</div>
          <div className="metric-name">Assistance Reliability</div>
        </div>
        <div className="metric-box">
          <div className="metric-value">24/7</div>
          <div className="metric-name">Emergency Response</div>
        </div>
      </div>
    </section>
  );
}
