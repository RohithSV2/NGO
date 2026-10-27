import React from 'react';

export default function Hero({ onPostRequest, onExploreDirectory, onTrackRequests, stats }) {
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
