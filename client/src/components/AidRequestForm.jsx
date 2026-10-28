import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const CATEGORIES = [
  'Hunger & Food Relief',
  'Education & Literacy',
  'Health & Family Welfare',
  'Disaster Relief & Management',
  'Children & Youth Welfare',
  "Women's Development & Empowerment",
  'Aged/Elderly Care',
  'Drinking Water & Sanitation',
  'Agriculture & Rural Development',
  'Animal Husbandry & Welfare',
  'General Aid'
];

const URGENCIES = [
  { level: 'Low', label: 'Low', badgeClass: 'urgency-low' },
  { level: 'Medium', label: 'Medium', badgeClass: 'urgency-medium' },
  { level: 'High', label: 'High', badgeClass: 'urgency-high' },
  { level: 'Critical', label: 'Critical', badgeClass: 'urgency-critical' }
];

export default function AidRequestForm({
  user,
  onRequestSubmitted,
  onNavigateToTracker,
  targetNGO = null,
  onClearTargetNGO,
  ngos = []
}) {
  const [selectedTargetNGO, setSelectedTargetNGO] = useState(targetNGO);
  const [formData, setFormData] = useState({
    title: '',
    category: targetNGO?.category || 'Hunger & Food Relief',
    urgency: 'Medium',
    city: targetNGO?.city || '',
    state: '',
    requesterName: user?.name || '',
    requesterPhone: user?.phone || '',
    requesterEmail: user?.email || '',
    description: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(null);

  useEffect(() => {
    if (targetNGO) {
      setSelectedTargetNGO(targetNGO);
      setFormData(prev => ({
        ...prev,
        category: targetNGO.category || prev.category,
        city: targetNGO.city || prev.city
      }));
    }
  }, [targetNGO]);

  const handleSelectNGO = (ngoIdOrName) => {
    if (!ngoIdOrName) {
      setSelectedTargetNGO(null);
      if (onClearTargetNGO) onClearTargetNGO();
      return;
    }
    const found = ngos.find(
      n => String(n._id || n.ngo_id || n.id || n.name) === String(ngoIdOrName) ||
           n.name.toLowerCase() === String(ngoIdOrName).toLowerCase()
    );
    if (found) {
      setSelectedTargetNGO(found);
      setFormData(prev => ({
        ...prev,
        category: found.category || prev.category,
        city: found.city || prev.city
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.requesterName.trim() || !formData.requesterPhone.trim() || !formData.city.trim()) {
      alert('Please complete all required fields.');
      return;
    }

    const cleanPhone = formData.requesterPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      alert('Contact phone number must be exactly 10 digits.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        requesterPhone: cleanPhone,
        targetNGO: selectedTargetNGO ? {
          ngoId: String(selectedTargetNGO._id || selectedTargetNGO.ngo_id || selectedTargetNGO.id || 'direct'),
          name: selectedTargetNGO.name,
          category: selectedTargetNGO.category,
          city: selectedTargetNGO.city,
          contactPhone: selectedTargetNGO.contactPhone || selectedTargetNGO.contact_phone || '',
          contactEmail: selectedTargetNGO.contactEmail || selectedTargetNGO.contact_email || ''
        } : null,
        targetNgoName: selectedTargetNGO ? selectedTargetNGO.name : null,
        isDirectRequest: Boolean(selectedTargetNGO)
      };

      const created = await api.createAidRequest(payload);
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

          {submittedRequest.targetNgoName && (
            <div
              style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                padding: '14px 18px',
                margin: '16px 0 20px',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontWeight: '800', fontSize: '15px' }}>
                <span>🎯</span>
                <span>Direct Distress Request Dispatched to {submittedRequest.targetNgoName}</span>
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#047857', lineHeight: '1.5' }}>
                The coordinator for <strong>{submittedRequest.targetNgoName}</strong> has received this distress signal in their live Operations Desk and is actively monitoring it to establish direct contact and dispatch assistance.
              </p>
            </div>
          )}

          <div className="matched-ngos-summary">
            <h4>Matched Organizations ({submittedRequest.matchedNGOs?.length || 0})</h4>
            <div className="matched-grid">
              {submittedRequest.matchedNGOs?.map((ngo, idx) => (
                <div key={idx} className="matched-item-box">
                  <div className="match-percent-tag">{ngo.matchScore}% Match</div>
                  <h5>{ngo.name}</h5>
                  <p>{ngo.category} &bull; {ngo.city}</p>
                  {ngo.contactPhone && (
                    <span className="matched-phone">
                      📞 <a href={`tel:${ngo.contactPhone}`} style={{ color: 'inherit', textDecoration: 'none' }}>{ngo.contactPhone}</a>
                    </span>
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
                setSelectedTargetNGO(null);
                if (onClearTargetNGO) onClearTargetNGO();
                setFormData({
                  title: '',
                  category: 'Hunger & Food Relief',
                  urgency: 'Medium',
                  city: '',
                  state: '',
                  requesterName: user?.name || '',
                  requesterPhone: user?.phone || '',
                  requesterEmail: user?.email || '',
                  description: ''
                });
              }}
            >
              + Submit Another Request
            </button>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          {/* Direct Targeting Indicator Banner */}
          {selectedTargetNGO && (
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '10px',
                padding: '14px 18px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '26px' }}>🎯</span>
                <div>
                  <div style={{ fontWeight: '800', color: '#166534', fontSize: '15px' }}>
                    Directing Aid Request To: {selectedTargetNGO.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#15803d', marginTop: '2px' }}>
                    Sector: {selectedTargetNGO.category} &bull; City: {selectedTargetNGO.city} &bull; The coordinator of this NGO will receive and monitor your request directly.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedTargetNGO(null);
                  if (onClearTargetNGO) onClearTargetNGO();
                }}
                style={{
                  background: '#ffffff',
                  border: '1px solid #86efac',
                  color: '#166534',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Clear Target (Open Match)
              </button>
            </div>
          )}

          {/* Main Form */}
          <form className="pro-form-card" onSubmit={handleSubmit}>
            {/* Target NGO Selector Dropdown */}
            <div className="form-field">
              <label htmlFor="req-target-ngo">
                Recipient NGO / Destination{' '}
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  (Select a specific NGO coordinator or leave on AI auto-match)
                </span>
              </label>
              <select
                id="req-target-ngo"
                className="input-control select-control"
                value={selectedTargetNGO ? (selectedTargetNGO._id || selectedTargetNGO.ngo_id || selectedTargetNGO.id || selectedTargetNGO.name) : ''}
                onChange={e => handleSelectNGO(e.target.value)}
              >
                <option value="">🌐 Open Emergency Stream (Auto-match top verified NGOs via AI)</option>
                {ngos.map(n => (
                  <option key={n._id || n.ngo_id || n.id || n.name} value={n._id || n.ngo_id || n.id || n.name}>
                    🏢 {n.name} ({n.category} &bull; {n.city})
                  </option>
                ))}
              </select>
            </div>

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
                <label htmlFor="req-phone">
                  Contact Phone Number <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(10 digits)</span>
                </label>
                <input
                  id="req-phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  className="input-control"
                  placeholder="10-digit mobile number (e.g. 9876543210)"
                  value={formData.requesterPhone}
                  onChange={e => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, requesterPhone: digits });
                  }}
                  required
                />
                {formData.requesterPhone && formData.requesterPhone.length > 0 && formData.requesterPhone.length < 10 && (
                  <span style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px', display: 'block' }}>
                    {10 - formData.requesterPhone.length} more digit{10 - formData.requesterPhone.length === 1 ? '' : 's'} required
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary-green submit-btn-full"
              disabled={submitting}
            >
              {submitting ? 'Processing Request...' : (selectedTargetNGO ? `Send Request to ${selectedTargetNGO.name} Coordinator` : 'Submit Aid Request')}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
