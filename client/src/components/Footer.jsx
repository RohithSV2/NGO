import React from 'react';

export default function Footer() {
  return (
    <footer className="pro-footer">
      <div className="footer-container">
        <div className="footer-brand-col">
          <div className="footer-brand-title">
            <span className="footer-leaf">🌿</span>
            <strong>AidConnect</strong>
          </div>
          <p className="footer-brand-desc">
            A nationwide humanitarian coordination and emergency aid matching platform
            connecting distress requests with certified non-governmental relief organizations.
          </p>
        </div>

        <div className="footer-links-grid">
          <div className="footer-nav-col">
            <h4>Platform</h4>
            <ul>
              <li><a href="#overview">Overview</a></li>
              <li><a href="#request-aid">Post Aid Request</a></li>
              <li><a href="#directory">NGO Directory</a></li>
              <li><a href="#tracker">Tracking Board</a></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4>Open Source</h4>
            <ul>
              <li>
                <a
                  href="https://github.com/RohithSV2/NGO"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-github-link"
                >
                  GitHub Repository
                </a>
              </li>
              <li><span>Emergency Assistance: 24/7</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom-strip">
        <span>&copy; {new Date().getFullYear()} AidConnect Humanitarian Aid Platform</span>
        <span>Verified NGO Relief Network</span>
      </div>
    </footer>
  );
}
