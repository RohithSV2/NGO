import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const CATEGORIES = [
  'Education & Literacy',
  'Health & Family Welfare',
  'Agriculture & Rural Development',
  'Children & Youth Welfare',
  "Women's Development & Empowerment",
  'Aged/Elderly Care',
  'Disaster Relief & Management',
  'Animal Husbandry & Welfare',
  'Drinking Water & Sanitation',
  'General Aid'
];

const URGENCIES = [
  { level: 'Low', label: 'Low', badgeClass: 'urgency-low' },
  { level: 'Medium', label: 'Medium', badgeClass: 'urgency-medium' },
  { level: 'High', label: 'High', badgeClass: 'urgency-high' },
  { level: 'Critical', label: 'Critical', badgeClass: 'urgency-critical' }
];

export default function AidRequestForm({ onRequestSubmitted, onNavigateToTracker }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Education & Literacy',
    urgency: 'Medium',
    city: '',
    state: '',
    requesterName: '',
    requesterPhone: '',
    requesterEmail: '',
    description: ''
  });

  const [liveMatches, setLiveMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(null);

  // Debounced live matching
  useEffect(() => {
    if (!formData.description || formData.description.trim().length < 8) {
      setLiveMatches([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingMatches(true);
      try {
        const matches = await api.getMatchPreview({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          city: formData.city,
          urgency: formData.urgency
        });
        setLiveMatches(matches.slice(0, 3));
      } catch (e) {
        // Handle silently
      } finally {
        setLoadingMatches(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.title, formData.description, formData.category, formData.city, formData.urgency]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.requesterName.trim() || !formData.requesterPhone.trim() || !formData.city.trim()) {
      alert('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.createAidRequest(formData);
      setSubmittedRequest(created);
      onRequestSubmitted(created);
    } catch (err) {
      alert('Error submitting request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section-container">
      <div className="section-header-block">
        <h2>Submit an Aid Request</h2>
        <p>Provide details about the emergency or required assistance to connect with verified response teams.</p>
      </div>

      {submittedRequest ? (
        <div className="confirmation-card">
          <div className="confirmation-icon">✓</div>
          <h3>Aid Request Registered Successfully</h3>
          <p className="confirmation-meta">
            Tracking ID: <code>{submittedRequest._id}</code> &bull; Status: <span className="status-badge-inline">{submittedRequest.status}</span>
          </p>

          <div className="matched-ngos-summary">
            <h4>Matched Organizations ({submittedRequest.matchedNGOs?.length || 0})</h4>
            <div className="matched-grid">
              {submittedRequest.matchedNGOs?.map((ngo, idx) => (
                <div key={idx} className="matched-item-box">
                  <div className="match-percent-tag">{ngo.matchScore}% Match</div>
                  <h5>{ngo.name}</h5>
                  <p>{ngo.category} &bull; {ngo.city}</p>
                  {ngo.contactPhone && (
                    <span className="matched-phone">📞 {ngo.contactPhone}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="confirmation-actions">
            <button
              type="button"
              className="btn-primary-green"
              onClick={onNavigateToTracker}
            >
              View in Request Tracker
            </button>
            <button
              type="button"
              className="btn-outline-green"
              onClick={() => {
                setSubmittedRequest(null);
                setFormData({
                  title: '',
                  category: 'Disaster Relief',
                  urgency: 'Medium',
                  city: '',
                  state: '',
                  requesterName: '',
                  requesterPhone: '',
                  requesterEmail: '',
                  description: ''
                });
              }}
            >
              Submit Another Request
            </button>
          </div>
        </div>
      ) : (
        <div className="form-matcher-layout">
          {/* Main Form */}
          <form className="pro-form-card" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="req-title">Request Title</label>
              <input
                id="req-title"
                type="text"
                className="input-control"
                placeholder="Brief summary of the requirement"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-columns-2">
              <div className="form-field">
                <label htmlFor="req-category">Sector / Category</label>
                <select
                  id="req-category"
                  className="input-control select-control"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="req-city">City / District</label>
                <input
                  id="req-city"
                  type="text"
                  className="input-control"
                  placeholder="e.g. Mysore, Chitradurga, Davanagere, Shivamogga"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label>Urgency Level</label>
              <div className="urgency-buttons-row">
                {URGENCIES.map(u => (
                  <button
                    key={u.level}
                    type="button"
                    className={`urgency-btn ${formData.urgency === u.level ? 'active ' + u.badgeClass : ''}`}
                    onClick={() => setFormData({ ...formData, urgency: u.level })}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="req-desc">Detailed Description & Resources Needed</label>
              <textarea
                id="req-desc"
                className="input-control textarea-control"
                rows="4"
                placeholder="Provide accurate details regarding affected people, location landmarks, and required supplies..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                required
              ></textarea>
            </div>

            <div className="form-columns-2">
              <div className="form-field">
                <label htmlFor="req-name">Requester Name</label>
                <input
                  id="req-name"
                  type="text"
                  className="input-control"
                  placeholder="Full name"
                  value={formData.requesterName}
                  onChange={e => setFormData({ ...formData, requesterName: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="req-phone">Contact Phone Number</label>
                <input
                  id="req-phone"
                  type="tel"
                  className="input-control"
                  placeholder="e.g. +91 98765 43210"
                  value={formData.requesterPhone}
                  onChange={e => setFormData({ ...formData, requesterPhone: e.target.value })}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary-green submit-btn-full"
              disabled={submitting}
            >
              {submitting ? 'Processing Request...' : 'Submit Aid Request'}
            </button>
          </form>

          {/* AI Matching Preview Sidepanel */}
          <aside className="ai-matcher-panel">
            <div className="matcher-panel-header">
              <div className="matcher-title">
                <span className="green-dot"></span>
                AI Matching Engine
              </div>
              {loadingMatches && <span className="matching-spinner-text">Matching...</span>}
            </div>

            <p className="matcher-description">
              As you describe your request, the matching algorithm ranks suitable partner NGOs based on sector alignment, keywords, and location.
            </p>

            {liveMatches.length > 0 ? (
              <div className="matcher-results-list">
                {liveMatches.map((ngo, idx) => (
                  <div key={idx} className="matcher-result-item">
                    <div className="matcher-item-top">
                      <span className="matcher-item-rank">#{idx + 1}</span>
                      <strong className="matcher-item-name">{ngo.name}</strong>
                      <span className="matcher-item-score">{ngo.match_score}%</span>
                    </div>

                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${Math.min(ngo.match_score, 100)}%` }}
                      ></div>
                    </div>

                    <div className="matcher-item-meta">
                      <span>{ngo.category}</span>
                      <span>&bull;</span>
                      <span>{ngo.city}</span>
                      <span>&bull;</span>
                      <span>⭐ {ngo.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="matcher-idle-box">
                <p>Enter the request details on the left to see live NGO recommendations.</p>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
