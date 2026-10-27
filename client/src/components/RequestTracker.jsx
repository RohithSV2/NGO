import React, { useState } from 'react';

const STATUS_OPTIONS = ['All', 'Matched', 'In Progress', 'Resolved', 'Pending'];

export default function RequestTracker({ requests, onUpdateStatus, onOpenReviewModal }) {
  const [activeStatus, setActiveStatus] = useState('All');

  const filtered = requests.filter(r => {
    if (activeStatus === 'All') return true;
    return r.status === activeStatus;
  });

  const getUrgencyClass = (urgency) => {
    switch ((urgency || '').toLowerCase()) {
      case 'critical': return 'urgency-pill-critical';
      case 'high': return 'urgency-pill-high';
      case 'medium': return 'urgency-pill-medium';
      default: return 'urgency-pill-low';
    }
  };

  const getStatusClass = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'resolved': return 'status-pill-resolved';
      case 'in progress': return 'status-pill-progress';
      case 'matched': return 'status-pill-matched';
      default: return 'status-pill-pending';
    }
  };

  return (
    <div className="section-container">
      <div className="section-header-block">
        <h2>Aid Request Tracking Board</h2>
        <p>Monitor the status of registered aid requests, verified NGO matches, and ongoing relief operations.</p>
      </div>

      <div className="tracker-filter-tabs">
        {STATUS_OPTIONS.map(st => (
          <button
            key={st}
            type="button"
            className={`tracker-tab ${activeStatus === st ? 'active' : ''}`}
            onClick={() => setActiveStatus(st)}
          >
            {st}
            <span className="tab-pill-count">
              {st === 'All' ? requests.length : requests.filter(r => r.status === st).length}
            </span>
          </button>
        ))}
      </div>

      <div className="tracker-list">
        {filtered.length === 0 ? (
          <div className="empty-tracker-message">
            <p>No aid requests currently found under the "{activeStatus}" status.</p>
          </div>
        ) : (
          filtered.map(req => (
            <div key={req._id} className="pro-tracker-card">
              <div className="tracker-card-top-row">
                <div className="tracker-card-badges">
                  <span className={`status-pill ${getStatusClass(req.status)}`}>{req.status}</span>
                  <span className={`urgency-pill ${getUrgencyClass(req.urgency)}`}>{req.urgency} Urgency</span>
                  <span className="category-tag-neutral">{req.category}</span>
                  <span className="tracker-date-text">
                    {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Active'}
                  </span>
                </div>

                <div className="tracker-action-buttons">
                  {req.status === 'Matched' && (
                    <button
                      type="button"
                      className="btn-action-status btn-status-start"
                      onClick={() => onUpdateStatus(req._id, 'In Progress')}
                    >
                      Start Operation
                    </button>
                  )}
                  {req.status === 'In Progress' && (
                    <button
                      type="button"
                      className="btn-action-status btn-status-resolve"
                      onClick={() => {
                        onUpdateStatus(req._id, 'Resolved');
                        if (req.matchedNGOs && req.matchedNGOs.length > 0) {
                          onOpenReviewModal(req.matchedNGOs, req._id);
                        }
                      }}
                    >
                      Mark Resolved
                    </button>
                  )}
                  {req.status === 'Resolved' && (
                    <button
                      type="button"
                      className="btn-action-status btn-status-review"
                      onClick={() => {
                        if (req.matchedNGOs && req.matchedNGOs.length > 0) {
                          onOpenReviewModal(req.matchedNGOs, req._id);
                        }
                      }}
                    >
                      Write Review
                    </button>
                  )}
                </div>
              </div>

              <h3 className="tracker-req-title">{req.title}</h3>
              <p className="tracker-req-desc">{req.description}</p>

              {req.resolutionNotes && (
                <div
                  className="tracker-resolution-banner"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '6px',
                    color: '#166534',
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '12px'
                  }}
                >
                  <span>✓</span>
                  <span>{req.resolutionNotes}</span>
                </div>
              )}

              <div className="tracker-meta-details-bar">
                <span><strong>Location:</strong> {req.city}{req.state ? `, ${req.state}` : ''}</span>
                <span><strong>Contact:</strong> {req.requesterName}</span>
                <span><strong>Phone:</strong> <a href={`tel:${req.requesterPhone}`}>{req.requesterPhone}</a></span>
              </div>

              {req.matchedNGOs && req.matchedNGOs.length > 0 && (
                <div className="tracker-matched-section">
                  <span className="matched-label">Matched NGOs:</span>
                  <div className="matched-chips-wrap">
                    {req.matchedNGOs.map((m, idx) => {
                      const isResolver = req.resolutionNotes && req.resolutionNotes.toLowerCase().includes(m.name.toLowerCase());
                      return (
                        <div
                          key={idx}
                          className={`matched-ngo-chip ${isResolver ? 'resolved-responder' : ''}`}
                        >
                          <span className="chip-score">{m.matchScore}%</span>
                          <span className="chip-name">{m.name}</span>
                          {isResolver && <span className="chip-badge-resolved">★ Resolved</span>}
                          {m.contactPhone && (
                            <a
                              href={`tel:${m.contactPhone}`}
                              className="chip-phone"
                              style={{ color: 'inherit', textDecoration: 'none' }}
                              title={`Call ${m.name}`}
                            >
                              ({m.contactPhone})
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
