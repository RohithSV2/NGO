import React, { useState, useMemo } from 'react';

const STATUS_OPTIONS = ['All', 'Matched', 'In Progress', 'Resolved', 'Pending'];

export default function RequestTracker({
  requests = [],
  ratings = [],
  onUpdateStatus,
  onAddRating,
  user,
  onNavigateToPostRequest,
  onNavigateToNGOHub
}) {
  const isNGO = user?.role === 'ngo';

  // If viewed by an NGO Representative, inform them that this board is dedicated to citizens/requesters
  if (isNGO) {
    return (
      <div className="section-container" style={{ maxWidth: '800px', margin: '40px auto', textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px' }}>
          🏢
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-h)', margin: '0 0 10px' }}>
          Dedicated Requester Tracking Board
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', margin: '0 0 24px' }}>
          This Aid Request Tracking Board is reserved exclusively for citizens to track their submitted distress requests and rate responding teams. As an authorized NGO Representative ({user.ngoName || 'NGO'}), please manage, view, dispatch, and resolve missions in your dedicated <strong>NGO Response Hub</strong>.
        </p>
        <button
          type="button"
          className="btn-primary-green"
          onClick={onNavigateToNGOHub}
          style={{ padding: '10px 24px', fontSize: '14px', fontWeight: '700' }}
        >
          Open NGO Response Hub &rarr;
        </button>
      </div>
    );
  }

  // Filter requests submitted by this citizen (a user can have many requests)
  const myRequests = useMemo(() => {
    if (!user) return [];
    const nameLower = (user.name || '').toLowerCase().trim();
    const emailLower = (user.email || '').toLowerCase().trim();
    return requests.filter(r => {
      const reqName = (r.requesterName || '').toLowerCase().trim();
      const reqEmail = (r.requesterEmail || '').toLowerCase().trim();
      return (nameLower && reqName === nameLower) || (emailLower && reqEmail === emailLower);
    });
  }, [requests, user]);

  const [activeScope, setActiveScope] = useState(() => (myRequests.length > 0 ? 'mine' : 'all'));
  const [activeStatus, setActiveStatus] = useState('All');

  // Compute scoped list for the citizen
  const scopedRequests = useMemo(() => {
    if (user && activeScope === 'mine') {
      return myRequests;
    }
    return requests;
  }, [requests, user, activeScope, myRequests]);

  // Apply status filter
  const filtered = useMemo(() => {
    return scopedRequests.filter(r => {
      if (activeStatus === 'All') return true;
      return r.status === activeStatus;
    });
  }, [scopedRequests, activeStatus]);

  return (
    <div className="section-container">
      {/* Requester Dedicated Header */}
      <div className="section-header-block">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2>Citizen Aid Request Tracking Board</h2>
            <p>
              Dedicated tracking board for aid requesters. Monitor registered distress needs, contact verified responding NGOs, and rate resolution assistance directly on your card.
            </p>
          </div>

          {onNavigateToPostRequest && (
            <button
              type="button"
              className="btn-primary-green"
              onClick={onNavigateToPostRequest}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', fontSize: '13px', fontWeight: '700' }}
            >
              <span>+</span>
              <span>Post Another Aid Request</span>
            </button>
          )}
        </div>
      </div>

      {/* Requester Scope Filter Toggle */}
      {user && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            className={`sector-tab-pill ${activeScope === 'mine' ? 'active' : ''}`}
            onClick={() => setActiveScope('mine')}
            style={{ fontWeight: '700' }}
          >
            👤 My Submitted Requests ({myRequests.length})
          </button>
          <button
            type="button"
            className={`sector-tab-pill ${activeScope === 'all' ? 'active' : ''}`}
            onClick={() => setActiveScope('all')}
          >
            🌐 All Community Requests ({requests.length})
          </button>

          {myRequests.length > 0 && activeScope === 'mine' && (
            <span style={{ fontSize: '12px', color: '#166534', backgroundColor: '#f0fdf4', padding: '4px 10px', borderRadius: '12px', border: '1px solid #bbf7d0', marginLeft: 'auto' }}>
              ✓ Showing your {myRequests.length} active request{myRequests.length === 1 ? '' : 's'} (Users can submit multiple requests)
            </span>
          )}
        </div>
      )}

      {/* Status Filter Tabs */}
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
              {st === 'All' ? scopedRequests.length : scopedRequests.filter(r => r.status === st).length}
            </span>
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="tracker-list">
        {filtered.length === 0 ? (
          <div className="empty-tracker-message" style={{ textAlign: 'center', padding: '36px 20px' }}>
            <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-muted)' }}>
              No aid requests currently found under the "{activeStatus}" status.
            </p>
            {onNavigateToPostRequest && (
              <button
                type="button"
                className="btn-outline-green"
                onClick={onNavigateToPostRequest}
                style={{ marginTop: '14px' }}
              >
                + Post an Aid Request
              </button>
            )}
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

  const cleanPhone = (req.requesterPhone || '').replace(/\D/g, '');

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
          {req.targetNgoName && (
            <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #86efac', padding: '2px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <span>🎯</span>
              <span>Directed to {req.targetNgoName} Coordinator</span>
            </span>
          )}
          <span className={`status-pill ${getStatusClass(req.status)}`}>{req.status}</span>
          <span className={`urgency-pill ${getUrgencyClass(req.urgency)}`}>{req.urgency} Urgency</span>
          <span className="category-tag-neutral">{req.category}</span>
          <span className="tracker-date-text">
            {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Active'}
          </span>
        </div>

        {/* Requester Action Buttons */}
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

      {/* Resolution Notes Banner */}
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

      {/* Requester Contact Details Bar */}
      <div className="tracker-meta-details-bar" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px' }}>
        <span><strong>Location:</strong> {req.city}{req.state ? `, ${req.state}` : ''}</span>
        <span><strong>Requester:</strong> {req.requesterName}</span>
        <span>
          <strong>Phone:</strong>{' '}
          <a href={`tel:${cleanPhone}`} style={{ color: '#166534', fontWeight: '700', textDecoration: 'none' }}>
            📞 {req.requesterPhone}
          </a>
        </span>
      </div>

      {/* Matched NGOs Section */}
      {req.matchedNGOs && req.matchedNGOs.length > 0 && (
        <div className="tracker-matched-section">
          <span className="matched-label">Matched Responding NGOs:</span>
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
                      style={{ color: 'inherit', textDecoration: 'none', marginLeft: '4px' }}
                      title={`Call ${m.name}`}
                    >
                      📞 {m.contactPhone}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Verified Citizen Review Display */}
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

      {/* Citizen Direct Inline Rating Form */}
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
