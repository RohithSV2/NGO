import React, { useState, useMemo } from 'react';

const COMMON_NGOS = [
  'Mysuru Relief & Food Care',
  'Akshaya Patra Foundation',
  'Mysuru Vidya Education Trust',
  'Goonj Disaster Relief',
  'Red Cross Society Relief',
  'Teach For India',
  'Doctors For You',
  'Smile Foundation'
];

export default function NGODashboard({
  user,
  requests = [],
  ratings = [],
  ngos = [],
  onUpdateStatus,
  onOpenAuth
}) {
  // If user has a registered NGO name, default to that, else 'Mysuru Relief & Food Care'
  const [activeNgoName, setActiveNgoName] = useState(
    user?.ngoName || 'Mysuru Relief & Food Care'
  );

  const [activeTabFilter, setActiveTabFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [operationalNotes, setOperationalNotes] = useState({});
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastList, setBroadcastList] = useState([
    {
      id: 1,
      ngo: 'Mysuru Relief & Food Care',
      text: 'Community Kitchen active in Saraswathipuram: 300 hot food packets ready for dispatch to waterlogged areas.',
      time: 'Just now'
    },
    {
      id: 2,
      ngo: 'Akshaya Patra Foundation',
      text: 'Dry ration kit mobilization available for emergency shelters across Mysuru & Bengaluru districts.',
      time: '2 hours ago'
    }
  ]);

  // Find NGO object if available in dataset
  const currentNGOObj = useMemo(() => {
    return ngos.find(n => n.name.toLowerCase() === activeNgoName.toLowerCase()) || null;
  }, [ngos, activeNgoName]);

  // Filter requests that match this NGO or are relevant to this NGO's sector/city
  const matchedRequests = useMemo(() => {
    return requests.filter(req => {
      // 1. Direct match in matchedNGOs list
      const inMatchedList = Array.isArray(req.matchedNGOs) && req.matchedNGOs.some(
        m => (m.name || '').toLowerCase().includes(activeNgoName.toLowerCase()) ||
             activeNgoName.toLowerCase().includes((m.name || '').toLowerCase())
      );

      // 2. City or Category relevance
      const isSameCity = currentNGOObj && req.city &&
        (req.city.toLowerCase() === (currentNGOObj.city || '').toLowerCase() ||
         (currentNGOObj.areas_served || []).some(a => a.toLowerCase().includes(req.city.toLowerCase())));

      const isSameCategory = currentNGOObj && req.category &&
        (req.category.toLowerCase().includes((currentNGOObj.category || '').toLowerCase()) ||
         (currentNGOObj.category || '').toLowerCase().includes(req.category.toLowerCase()));

      return inMatchedList || (isSameCity && isSameCategory);
    });
  }, [requests, activeNgoName, currentNGOObj]);

  // Operational metrics
  const totalMatched = matchedRequests.length;
  const pendingCount = matchedRequests.filter(r => r.status === 'Pending' || r.status === 'Matched').length;
  const inProgressCount = matchedRequests.filter(r => r.status === 'In Progress').length;
  const resolvedCount = matchedRequests.filter(r => r.status === 'Resolved').length;

  // Filtered requests by selected status tab and search term
  const displayedRequests = useMemo(() => {
    return matchedRequests.filter(req => {
      if (activeTabFilter === 'urgent') {
        if (req.urgency !== 'Critical' && req.urgency !== 'High') return false;
      } else if (activeTabFilter === 'pending') {
        if (req.status !== 'Pending' && req.status !== 'Matched') return false;
      } else if (activeTabFilter === 'in-progress') {
        if (req.status !== 'In Progress') return false;
      } else if (activeTabFilter === 'resolved') {
        if (req.status !== 'Resolved') return false;
      }

      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        const matchesTitle = (req.title || '').toLowerCase().includes(query);
        const matchesDesc = (req.description || '').toLowerCase().includes(query);
        const matchesCity = (req.city || '').toLowerCase().includes(query);
        const matchesName = (req.requesterName || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCity && !matchesName) return false;
      }

      return true;
    });
  }, [matchedRequests, activeTabFilter, searchFilter]);

  // Ratings for this NGO
  const ngoRatings = useMemo(() => {
    return ratings.filter(r => (r.ngoName || '').toLowerCase().includes(activeNgoName.toLowerCase()));
  }, [ratings, activeNgoName]);

  const handleAcceptAndDispatch = async (reqId) => {
    const note = operationalNotes[reqId] || `Relief unit dispatched from ${activeNgoName}. Responders deployed with emergency supplies.`;
    await onUpdateStatus(reqId, 'In Progress', note);
    setOperationalNotes(prev => ({ ...prev, [reqId]: '' }));
  };

  const handleMarkResolved = async (reqId) => {
    const note = operationalNotes[reqId] || `Relief successfully delivered and mission completed by ${activeNgoName}.`;
    await onUpdateStatus(reqId, 'Resolved', note);
    setOperationalNotes(prev => ({ ...prev, [reqId]: '' }));
  };

  const handlePostBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    const newBroadcast = {
      id: Date.now(),
      ngo: activeNgoName,
      text: broadcastMessage.trim(),
      time: 'Just now'
    };
    setBroadcastList([newBroadcast, ...broadcastList]);
    setBroadcastMessage('');
  };

  return (
    <div className="section-container" style={{ maxWidth: '1160px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Top Banner & Representative Identity */}
      <div
        style={{
          background: 'linear-gradient(135deg, #14532d 0%, #166534 60%, #15803d 100%)',
          color: '#ffffff',
          borderRadius: '14px',
          padding: '24px 28px',
          marginBottom: '28px',
          boxShadow: '0 10px 25px -5px rgba(22, 101, 52, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '28px' }}>🏢</span>
            <div>
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                NGO Operations & Response Portal
              </span>
              <h1 style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: '800' }}>
                {activeNgoName}
              </h1>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
            {user ? (
              <span>
                Authorized Representative: <strong>{user.name}</strong> ({user.designation || 'Relief Coordinator'}) &bull;{' '}
                <span style={{ color: '#86efac' }}>✓ Verified Humanitarian Partner</span>
              </span>
            ) : (
              <span>
                Simulating Response View for <strong>{activeNgoName}</strong> &bull;{' '}
                <button
                  type="button"
                  onClick={onOpenAuth}
                  style={{
                    background: '#ffffff',
                    border: 'none',
                    color: '#166534',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    marginLeft: '8px'
                  }}
                >
                  Sign In as NGO Rep
                </button>
              </span>
            )}
          </p>
        </div>

        {/* Quick NGO Switcher (for testing any NGO) */}
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: '10px 14px', borderRadius: '10px', backdropFilter: 'blur(8px)' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#bbf7d0', marginBottom: '4px' }}>
            Switch Active Organization View:
          </label>
          <select
            value={activeNgoName}
            onChange={e => setActiveNgoName(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {COMMON_NGOS.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '18px 20px', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Matched Distress Needs</span>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '4px 0 2px' }}>
            {totalMatched}
          </div>
          <span style={{ fontSize: '12px', color: '#16a34a' }}>AI Natural Language Matches</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '18px 20px', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '12px', color: '#b45309', fontWeight: '700', textTransform: 'uppercase' }}>Action Required</span>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#b45309', margin: '4px 0 2px' }}>
            {pendingCount}
          </div>
          <span style={{ fontSize: '12px', color: '#b45309' }}>Pending Dispatch</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '18px 20px', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: '700', textTransform: 'uppercase' }}>Active Field Missions</span>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0284c7', margin: '4px 0 2px' }}>
            {inProgressCount}
          </div>
          <span style={{ fontSize: '12px', color: '#0284c7' }}>Relief In Transit</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '18px 20px', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '700', textTransform: 'uppercase' }}>Delivered & Resolved</span>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#16a34a', margin: '4px 0 2px' }}>
            {resolvedCount}
          </div>
          <span style={{ fontSize: '12px', color: '#16a34a' }}>Completed Missions</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '18px 20px', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Citizen Feedback Score</span>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '4px 0 2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#eab308' }}>★</span>
            <span>{currentNGOObj?.rating || 4.9}</span>
          </div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>{ngoRatings.length} Verified Reviews</span>
        </div>
      </div>

      {/* Main Content Layout: Stream on Left, Broadcast on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)', gap: '24px' }}>
        {/* Left Column: Response View & Connect Hub */}
        <div>
          {/* Controls & Filter Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <button
                type="button"
                className={`sector-tab-pill ${activeTabFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTabFilter('all')}
              >
                All Matched ({matchedRequests.length})
              </button>
              <button
                type="button"
                className={`sector-tab-pill ${activeTabFilter === 'urgent' ? 'active' : ''}`}
                onClick={() => setActiveTabFilter('urgent')}
              >
                🚨 Urgent & High
              </button>
              <button
                type="button"
                className={`sector-tab-pill ${activeTabFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveTabFilter('pending')}
              >
                ⏳ Action Needed ({pendingCount})
              </button>
              <button
                type="button"
                className={`sector-tab-pill ${activeTabFilter === 'in-progress' ? 'active' : ''}`}
                onClick={() => setActiveTabFilter('in-progress')}
              >
                🚚 In Progress ({inProgressCount})
              </button>
              <button
                type="button"
                className={`sector-tab-pill ${activeTabFilter === 'resolved' ? 'active' : ''}`}
                onClick={() => setActiveTabFilter('resolved')}
              >
                ✅ Resolved ({resolvedCount})
              </button>
            </div>

            <input
              type="text"
              placeholder="Search distress signals..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                fontSize: '13px',
                width: '180px'
              }}
            />
          </div>

          {/* Incoming Distress Cards */}
          {displayedRequests.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {displayedRequests.map(req => {
                const matchInfo = (req.matchedNGOs || []).find(
                  m => (m.name || '').toLowerCase().includes(activeNgoName.toLowerCase()) ||
                       activeNgoName.toLowerCase().includes((m.name || '').toLowerCase())
                );
                const score = matchInfo ? matchInfo.matchScore : 92.5;
                const cleanPhone = (req.requesterPhone || '').replace(/\D/g, '');

                return (
                  <div
                    key={req._id}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '20px',
                      boxShadow: 'var(--shadow-sm)',
                      borderLeft: req.urgency === 'Critical' ? '5px solid #dc2626' : (req.urgency === 'High' ? '5px solid #ea580c' : '5px solid #16a34a')
                    }}
                  >
                    {/* Card Top: Badges and Score */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            backgroundColor: req.urgency === 'Critical' ? '#fee2e2' : (req.urgency === 'High' ? '#ffedd5' : '#dcfce7'),
                            color: req.urgency === 'Critical' ? '#b91c1c' : (req.urgency === 'High' ? '#c2410c' : '#166534')
                          }}
                        >
                          {req.urgency} Urgency
                        </span>

                        <span style={{ fontSize: '12px', background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}>
                          📍 {req.city || 'Karnataka'}
                        </span>

                        <span style={{ fontSize: '12px', background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontWeight: '700', border: '1px solid #86efac' }}>
                          ⚡ {score}% NLP Matched to your NGO
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: '700',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          backgroundColor: req.status === 'Resolved' ? '#dcfce7' : (req.status === 'In Progress' ? '#e0f2fe' : '#fef3c7'),
                          color: req.status === 'Resolved' ? '#166534' : (req.status === 'In Progress' ? '#0369a1' : '#92400e')
                        }}
                      >
                        Status: {req.status}
                      </span>
                    </div>

                    {/* Distress Title & Description */}
                    <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: '700', color: 'var(--text-h)' }}>
                      {req.title}
                    </h3>
                    <p style={{ margin: '0 0 14px', fontSize: '14px', color: '#334155', lineHeight: '1.5' }}>
                      {req.description}
                    </p>

                    {/* Requester Direct Connect Hub */}
                    <div
                      style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '12px 14px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                          Distress Requester Contact Info:
                        </span>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
                          👤 {req.requesterName} &bull; <span style={{ color: '#166534' }}>📞 {req.requesterPhone}</span>
                        </div>
                      </div>

                      {/* Direct Connect Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {cleanPhone && (
                          <a
                            href={`tel:${cleanPhone}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: '#16a34a',
                              color: '#ffffff',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '700',
                              textDecoration: 'none'
                            }}
                          >
                            <span>📞</span>
                            <span>Call Requester</span>
                          </a>
                        )}

                        {cleanPhone && (
                          <a
                            href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello ${req.requesterName}, this is ${activeNgoName} responding to your AidConnect distress request for "${req.title}". We are organizing relief assistance.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: '#25d366',
                              color: '#ffffff',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '700',
                              textDecoration: 'none'
                            }}
                          >
                            <span>💬</span>
                            <span>WhatsApp Connect</span>
                          </a>
                        )}

                        {req.requesterEmail && (
                          <a
                            href={`mailto:${req.requesterEmail}?subject=${encodeURIComponent(`AidConnect Relief Response: ${req.title}`)}&body=${encodeURIComponent(`Dear ${req.requesterName},\n\nWe have received your aid request via AidConnect and our relief team from ${activeNgoName} is coordinating assistance.\n\nWarm regards,\n${activeNgoName}`)}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: '#ffffff',
                              border: '1px solid #cbd5e1',
                              color: '#334155',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              textDecoration: 'none'
                            }}
                          >
                            <span>✉️</span>
                            <span>Email</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Operational Response Actions Bar */}
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                      {req.status === 'Resolved' ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{ fontSize: '13px', color: '#166534', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>✓</span>
                            <span>Relief delivered & marked resolved by {activeNgoName}</span>
                          </span>
                          {req.resolutionNotes && (
                            <span style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                              "{req.resolutionNotes}"
                            </span>
                          )}
                        </div>
                      ) : req.status === 'In Progress' ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                            <span style={{ fontSize: '13px', color: '#0369a1', fontWeight: '700' }}>
                              🚚 Relief Mission In Progress (Dispatched by your NGO)
                            </span>
                            <button
                              type="button"
                              onClick={() => handleMarkResolved(req._id)}
                              style={{
                                backgroundColor: '#16a34a',
                                color: '#ffffff',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <span>✅</span>
                              <span>Mark Relief Delivered & Resolved</span>
                            </button>
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              placeholder="Update field notes (e.g. 50 food packets delivered, medical team on site)..."
                              value={operationalNotes[req._id] || ''}
                              onChange={e => setOperationalNotes({ ...operationalNotes, [req._id]: e.target.value })}
                              style={{
                                flex: 1,
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                fontSize: '12px'
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (operationalNotes[req._id]) {
                                  onUpdateStatus(req._id, 'In Progress', operationalNotes[req._id]);
                                  alert('Operational notes updated!');
                                }
                              }}
                              style={{
                                backgroundColor: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              Save Field Note
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                          <span style={{ fontSize: '13px', color: '#92400e', fontWeight: '600' }}>
                            Distress signal pending response. Citizen awaiting contact.
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAcceptAndDispatch(req._id)}
                            style={{
                              backgroundColor: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              padding: '8px 18px',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <span>🚚</span>
                            <span>Accept Request & Dispatch Relief</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🌿</div>
              <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '700', color: 'var(--text-h)' }}>
                No Requests Found in this Filter
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                Try switching the status filter above or switch the active organization to inspect other incoming missions.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: NGO Profile & Emergency Capacity Broadcast */}
        <div>
          {/* Capacity Broadcast Tool */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '20px' }}>📢</span>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--text-h)' }}>
                Broadcast Relief Capacity
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 12px' }}>
              Notify disaster coordinators and citizens of available rations, medical staff, or beds:
            </p>

            <form onSubmit={handlePostBroadcast}>
              <textarea
                rows="3"
                value={broadcastMessage}
                onChange={e => setBroadcastMessage(e.target.value)}
                placeholder="e.g. 200 hot meals available for dispatch from Mysuru Central Kitchen..."
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  marginBottom: '10px',
                  resize: 'vertical'
                }}
                required
              ></textarea>
              <button
                type="submit"
                style={{
                  width: '100%',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Post Live Capacity Update
              </button>
            </form>

            {/* Broadcast feed */}
            <div style={{ marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                Recent Operational Broadcasts:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {broadcastList.map(b => (
                  <div key={b.id} style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534', fontWeight: '700', marginBottom: '2px' }}>
                      <span>{b.ngo}</span>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>{b.time}</span>
                    </div>
                    <div style={{ color: '#334155' }}>{b.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* NGO Organization Verified Profile */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: '700', color: 'var(--text-h)' }}>
              Organization Credentials
            </h3>
            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <span style={{ color: '#64748b' }}>Organization:</span>{' '}
                <strong>{activeNgoName}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Operational Sector:</span>{' '}
                <strong>{currentNGOObj?.category || 'Hunger & Food / Disaster Relief'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Base City:</span>{' '}
                <strong>{currentNGOObj?.city || 'Mysuru'}, Karnataka</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Emergency Phone:</span>{' '}
                <a href={`tel:${currentNGOObj?.contact_phone || '9845123456'}`} style={{ color: '#16a34a', fontWeight: '700', textDecoration: 'none' }}>
                  {currentNGOObj?.contact_phone || '+91-821-2495000'}
                </a>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Official Email:</span>{' '}
                <a href={`mailto:${currentNGOObj?.contact_email || 'help@mysururelief.org'}`} style={{ color: '#16a34a', textDecoration: 'none' }}>
                  {currentNGOObj?.contact_email || 'help@mysururelief.org'}
                </a>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Verification Status:</span>{' '}
                <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                  ✓ Certified NGO
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
