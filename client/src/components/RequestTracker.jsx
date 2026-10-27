import React, { useState } from 'react';

const STATUS_OPTIONS = ['All', 'Matched', 'In Progress', 'Resolved', 'Pending'];

export default function RequestTracker({ requests, ratings = [], onUpdateStatus, onAddRating, user }) {
  const [activeStatus, setActiveStatus] = useState('All');

  const filtered = requests.filter(r => {
    if (activeStatus === 'All') return true;
    return r.status === activeStatus;
  });

  return (
    <div className="section-container">
      <div className="section-header-block">
        <h2>Aid Request Tracking Board</h2>
        <p>Monitor the status of registered aid requests, verified NGO matches, and rate resolution assistance directly on your request.</p>
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
            <TrackerCard
              key={req._id}
              req={req}
              ratings={ratings}
              onUpdateStatus={onUpdateStatus}
              onAddRating={onAddRating}
              user={user}
            />
          ))
        )}
      </div>
    </div>
  );
}

function TrackerCard({ req, ratings = [], onUpdateStatus, onAddRating, user }) {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedNgo, setSelectedNgo] = useState(() => (req.matchedNGOs && req.matchedNGOs.length > 0 ? req.matchedNGOs[0] : null));
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Check if this request has already been rated
  const existingReview = ratings.find(
    r => r.aidRequestId === req._id || (r.aidRequestId && String(r.aidRequestId) === String(req._id))
  );

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

  const handleResolveAndOpenReview = () => {
    onUpdateStatus(req._id, 'Resolved');
    setIsReviewOpen(true);
  };

  const handleSubmitInlineReview = async () => {
    if (!selectedNgo || !onAddRating) return;
    setSubmittingReview(true);
    try {
      const resolvedNgoName = selectedNgo.name;
      await onAddRating({
        ngoId: String(selectedNgo.ngoId || selectedNgo.ngo_id || selectedNgo._id || '1'),
        ngoName: resolvedNgoName,
        userName: user ? user.name : 'Verified Citizen',
        rating: score,
        review: comment.trim() || `Prompt response and effective assistance delivered by ${resolvedNgoName}.`,
        aidRequestId: req._id
      });

      await onUpdateStatus(
        req._id,
        'Resolved',
        `Resolved by ${resolvedNgoName}`
      );

      setIsReviewOpen(false);
    } catch (e) {
      alert('Error submitting rating: ' + e.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="pro-tracker-card">
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
              onClick={handleResolveAndOpenReview}
            >
              Mark Resolved
            </button>
          )}
          {req.status === 'Resolved' && !existingReview && (
            <button
              type="button"
              className="btn-action-status btn-status-review"
              onClick={() => setIsReviewOpen(!isReviewOpen)}
            >
              {isReviewOpen ? 'Close Rating' : '★ Rate & Review'}
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

      {/* 1. Directly Display Verified Review if already submitted */}
      {existingReview && (
        <div
          className="tracker-inline-review-display"
          style={{
            marginTop: '16px',
            padding: '12px 16px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #16a34a',
            borderRadius: '8px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ color: '#eab308', fontSize: '15px' }}>
              {'★'.repeat(existingReview.rating)}{'☆'.repeat(5 - existingReview.rating)}
              <strong style={{ color: '#166534', marginLeft: '6px', fontSize: '13px' }}>
                {existingReview.rating}/5 Stars &bull; Rated for {existingReview.ngoName}
              </strong>
            </span>
            <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '700', textTransform: 'uppercase' }}>
              ✓ Verified Citizen Review
            </span>
          </div>
          <p style={{ margin: '4px 0 6px', fontSize: '13px', color: '#334155', fontStyle: 'italic' }}>
            "{existingReview.review}"
          </p>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Submitted by <strong>{existingReview.userName || 'Verified Requester'}</strong>
          </div>
        </div>
      )}

      {/* 2. Direct Inline Rating Form (No detached popups or separate tabs needed) */}
      {isReviewOpen && !existingReview && (
        <div
          className="tracker-inline-review-card"
          style={{
            marginTop: '16px',
            padding: '16px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px'
          }}
        >
          <h4 style={{ margin: '0 0 6px', fontSize: '14px', color: '#166534', fontWeight: '700' }}>
            Rate & Review the Assistance Received
          </h4>
          <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#15803d' }}>
            Rate the organization that actually resolved this request. Your feedback helps other citizens in need.
          </p>

          {/* NGO Selector */}
          {req.matchedNGOs && req.matchedNGOs.length > 1 && (
            <div className="form-field" style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#166534', marginBottom: '4px' }}>
                Which NGO resolved your problem?
              </label>
              <select
                className="input-control select-control"
                value={selectedNgo ? String(selectedNgo.ngoId || selectedNgo.ngo_id || selectedNgo.name) : ''}
                onChange={(e) => {
                  const chosen = req.matchedNGOs.find(m => String(m.ngoId || m.ngo_id || m.name) === e.target.value);
                  if (chosen) setSelectedNgo(chosen);
                }}
                style={{ padding: '6px 10px', fontSize: '13px', backgroundColor: '#ffffff' }}
              >
                {req.matchedNGOs.map((m, idx) => (
                  <option key={idx} value={String(m.ngoId || m.ngo_id || m.name)}>
                    {m.name} ({m.matchScore}% match)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Star Rating */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#166534', marginBottom: '4px' }}>
              Rating (1 to 5 Stars):
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setScore(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '22px',
                    cursor: 'pointer',
                    color: score >= star ? '#eab308' : '#cbd5e1',
                    padding: '0 2px'
                  }}
                >
                  ★
                </button>
              ))}
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#166534', marginLeft: '6px' }}>
                {score} of 5 Stars
              </span>
            </div>
          </div>

          {/* Feedback Comments */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#166534', marginBottom: '4px' }}>
              Feedback Comments:
            </label>
            <textarea
              className="input-control"
              rows="2"
              placeholder={`Describe your experience with ${selectedNgo ? selectedNgo.name : 'the responding team'}...`}
              value={comment}
              onChange={e => setComment(e.target.value)}
              style={{ fontSize: '13px', backgroundColor: '#ffffff' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              className="btn-card-secondary"
              onClick={() => setIsReviewOpen(false)}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary-green"
              onClick={handleSubmitInlineReview}
              disabled={submittingReview}
              style={{ padding: '6px 16px', fontSize: '12px' }}
            >
              {submittingReview ? 'Saving...' : 'Submit Rating Directly'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
