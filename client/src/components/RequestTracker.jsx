import React, { useState, useMemo } from 'react';

const STATUS_OPTIONS = ['All', 'Matched', 'In Progress', 'Resolved', 'Pending'];

export default function RequestTracker({
  requests = [],
  ratings = [],
  onUpdateStatus,
  onAddRating,
  user,
  onNavigateToPostRequest
}) {
  const isNGO = user?.role === 'ngo';
  const isCitizen = user?.role === 'citizen' || (!isNGO && !!user);

  // Filter requests belonging to this citizen (a user can have many requests)
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

  // Filter requests matched to this NGO representative
  const ngoAssignedRequests = useMemo(() => {
    if (!isNGO) return [];
    const ngoNameLower = (user?.ngoName || 'mysuru relief').toLowerCase().trim();
    return requests.filter(r => {
      return Array.isArray(r.matchedNGOs) && r.matchedNGOs.some(
        m => (m.name || '').toLowerCase().includes(ngoNameLower) || ngoNameLower.includes((m.name || '').toLowerCase())
      );
    });
  }, [requests, isNGO, user]);

  // Scope filter:
  // For NGO: default to 'assigned', can toggle to 'all'
  // For Citizen: default to 'mine' if they have requests, can toggle to 'all'
  const [activeScope, setActiveScope] = useState(() => {
    if (isNGO) return 'assigned';
    if (isCitizen && myRequests.length > 0) return 'mine';
    return 'all';
  });

  const [activeStatus, setActiveStatus] = useState('All');

  // Compute scoped list
  const scopedRequests = useMemo(() => {
    if (isNGO && activeScope === 'assigned') {
      return ngoAssignedRequests;
    }
    if (isCitizen && activeScope === 'mine') {
      return myRequests;
    }
    return requests;
  }, [requests, isNGO, isCitizen, activeScope, ngoAssignedRequests, myRequests]);

  // Apply status filter
  const filtered = useMemo(() => {
    return scopedRequests.filter(r => {
      if (activeStatus === 'All') return true;
      return r.status === activeStatus;
    });
  }, [scopedRequests, activeStatus]);

  return (
    <div className="section-container">
      {/* Role-Aware Section Header */}
      <div className="section-header-block">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2>
              {isNGO ? 'Operations & Mission Tracking Board' : 'Aid Request Tracking Board'}
            </h2>
            <p>
              {isNGO
                ? `Authorized Representative View (${user?.ngoName || 'NGO'}). View, track in-field progress, and resolve humanitarian aid requests.`
                : 'Monitor the status of your distress requests, connect with matched responders, and rate verified assistance directly.'}
            </p>
          </div>

          {/* Action button on right */}
          {!isNGO && onNavigateToPostRequest && (
            <button
              type="button"
              className="btn-primary-green"
              onClick={onNavigateToPostRequest}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', fontSize: '13px' }}
            >
              <span>+</span>
              <span>Post Another Aid Request</span>
            </button>
          )}
        </div>
      </div>

      {/* Role-Aware Scope Filter Toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        {isNGO ? (
          <>
            <button
              type="button"
              className={`sector-tab-pill ${activeScope === 'assigned' ? 'active' : ''}`}
              onClick={() => setActiveScope('assigned')}
              style={{ fontWeight: '700' }}
            >
              🏢 Assigned to {user?.ngoName || 'My NGO'} ({ngoAssignedRequests.length})
            </button>
            <button
              type="button"
              className={`sector-tab-pill ${activeScope === 'all' ? 'active' : ''}`}
              onClick={() => setActiveScope('all')}
            >
              🌐 All Community Requests ({requests.length})
            </button>
          </>
        ) : isCitizen ? (
          <>
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
          </>
        ) : null}

        {isCitizen && myRequests.length > 0 && activeScope === 'mine' && (
          <span style={{ fontSize: '12px', color: '#166534', backgroundColor: '#f0fdf4', padding: '4px 10px', borderRadius: '12px', border: '1px solid #bbf7d0', marginLeft: 'auto' }}>
            ✓ Showing your {myRequests.length} active request{myRequests.length === 1 ? '' : 's'} (Users can submit multiple needs)
          </span>
        )}
      </div>

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
              No aid requests currently found under "{activeStatus}" status in this view.
            </p>
            {!isNGO && onNavigateToPostRequest && (
              <button
                type="button"
                className="btn-outline-green"
                onClick={onNavigateToPostRequest}
                style={{ marginTop: '14px' }}
              >
                + Post a New Aid Request
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
              isNGO={isNGO}
            />
          ))
        )}
      </div>
    </div>
  );
}

function TrackerCard({ req, ratings = [], onUpdateStatus, onAddRating, user, isNGO }) {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedNgo, setSelectedNgo] = useState(() => (req.matchedNGOs && req.matchedNGOs.length > 0 ? req.matchedNGOs[0] : null));
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [resolutionInput, setResolutionInput] = useState('');
  const [showResolveInput, setShowResolveInput] = useState(false);

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

  const handleNgoAccept = () => {
    const note = `Accepted by ${user?.ngoName || 'Responding NGO'}. Relief dispatched.`;
    onUpdateStatus(req._id, 'In Progress', note);
  };

  const handleNgoConfirmResolve = () => {
    const note = resolutionInput.trim() || `Relief completed and verified by ${user?.ngoName || 'Responding NGO'}.`;
    onUpdateStatus(req._id, 'Resolved', note);
    setShowResolveInput(false);
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

        {/* Role-Specific Actions */}
        <div className="tracker-action-buttons">
          {isNGO ? (
            /* Representative: View, Track, and Resolve Actions */
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {(req.status === 'Matched' || req.status === 'Pending') && (
                <button
                  type="button"
                  className="btn-action-status btn-status-start"
                  onClick={handleNgoAccept}
                  title="Accept request and dispatch field relief"
                >
                  🚚 Accept & Dispatch
                </button>
              )}
              {req.status === 'In Progress' && (
                <button
                  type="button"
                  className="btn-action-status btn-status-resolve"
                  onClick={() => setShowResolveInput(!showResolveInput)}
                  title="Mark relief delivered and mission resolved"
                >
                  ✅ Resolve Mission
                </button>
              )}
            </div>
          ) : (
            /* Citizen / User: Track and Rate Actions */
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
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

      {/* Requester Contact Details & Direct Connect Hub */}
      <div className="tracker-meta-details-bar" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px' }}>
        <span><strong>Location:</strong> {req.city}{req.state ? `, ${req.state}` : ''}</span>
        <span><strong>Requester:</strong> {req.requesterName}</span>
        <span>
          <strong>Phone:</strong>{' '}
          <a href={`tel:${cleanPhone}`} style={{ color: '#166534', fontWeight: '700', textDecoration: 'none' }}>
            📞 {req.requesterPhone}
          </a>
        </span>

        {/* Representative Direct Connect Shortcuts */}
        {isNGO && cleanPhone && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
            <a
              href={`tel:${cleanPhone}`}
              style={{
                fontSize: '11px',
                fontWeight: '700',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                padding: '3px 8px',
                borderRadius: '4px',
                textDecoration: 'none'
              }}
            >
              📞 Call
            </a>
            <a
              href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello ${req.requesterName}, this is ${user?.ngoName || 'NGO Responder'} regarding your distress request "${req.title}".`)}`}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '11px',
                fontWeight: '700',
                backgroundColor: '#25d366',
                color: '#ffffff',
                padding: '3px 8px',
                borderRadius: '4px',
                textDecoration: 'none'
              }}
            >
              💬 WhatsApp
            </a>
          </div>
        )}
      </div>

      {/* NGO Representative Inline Resolve Form */}
      {isNGO && showResolveInput && req.status === 'In Progress' && (
        <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#166534', marginBottom: '6px' }}>
            Mission Completion Notes (e.g., 50 food packets delivered, medical team provided first aid):
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="input-control"
              placeholder="Enter resolution details..."
              value={resolutionInput}
              onChange={e => setResolutionInput(e.target.value)}
              style={{ fontSize: '13px' }}
            />
            <button
              type="button"
              className="btn-primary-green"
              onClick={handleNgoConfirmResolve}
              style={{ padding: '6px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
            >
              Confirm Resolved
            </button>
            <button
              type="button"
              className="btn-card-secondary"
              onClick={() => setShowResolveInput(false)}
              style={{ padding: '6px 10px', fontSize: '12px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Matched NGOs Section */}
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
