import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AidRequestForm from './components/AidRequestForm';
import NGODirectory from './components/NGODirectory';
import RequestTracker from './components/RequestTracker';
import NGODashboard from './components/NGODashboard';
import RatingsSection from './components/RatingsSection';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import { api } from './services/api';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(() => api.getCurrentUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [ngos, setNgos] = useState([]);
  const [requests, setRequests] = useState([]);
  const [ratings, setRatings] = useState([]);

  // Review modal state triggered upon resolving an aid request
  const [reviewModalTarget, setReviewModalTarget] = useState(null);
  const [reviewScore, setReviewScore] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Load dataset from backend API or local storage fallback
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ngosData, reqsData, ratingsData] = await Promise.all([
          api.getNGOs(),
          api.getAidRequests(),
          api.getRatings()
        ]);
        setNgos(ngosData);
        setRequests(reqsData);
        setRatings(ratingsData);
      } catch (err) {
        console.error('Data initialization error:', err);
      }
    };
    fetchData();
  }, []);

  const handleRequestSubmitted = (newRequest) => {
    setRequests(prev => [newRequest, ...prev]);
  };

  const handleUpdateStatus = async (id, status, notes = '') => {
    const updated = await api.updateRequestStatus(id, status, notes);
    if (updated) {
      setRequests(prev => prev.map(r => (r._id === id ? { ...r, ...updated } : r)));
    }
  };

  const handleAddRating = async (ratingData) => {
    const created = await api.submitRating(ratingData);
    if (created) {
      setRatings(prev => [created, ...prev]);
    }
    // Re-fetch NGOs dynamically from MongoDB so the new rating immediately reflects everywhere
    try {
      const refreshedNGOs = await api.getNGOs();
      if (refreshedNGOs && refreshedNGOs.length > 0) {
        setNgos(refreshedNGOs);
      }
    } catch (err) {
      console.warn('Could not refresh NGOs dynamically:', err);
    }
  };

  const handleDirectRequest = (targetNGO) => {
    setActiveTab('request-aid');
  };

  const handleOpenReviewModal = (ngoOrList, reqId) => {
    const list = Array.isArray(ngoOrList) ? ngoOrList : (ngoOrList ? [ngoOrList] : []);
    const initialNGO = list.length > 0 ? list[0] : null;
    setReviewModalTarget({
      ngo: initialNGO,
      matchedNGOs: list,
      reqId
    });
    setReviewScore(5);
    setReviewComment('');
  };

  const handleSaveResolutionReview = async () => {
    if (!reviewModalTarget || !reviewModalTarget.ngo) return;
    const resolvedNgoName = reviewModalTarget.ngo.name;
    await handleAddRating({
      ngoId: String(reviewModalTarget.ngo._id || reviewModalTarget.ngo.ngoId || reviewModalTarget.ngo.ngo_id || '1'),
      ngoName: resolvedNgoName,
      userName: user ? user.name : 'Verified Citizen',
      rating: reviewScore,
      review: reviewComment || `Prompt response and effective assistance provided by ${resolvedNgoName}.`,
      aidRequestId: reviewModalTarget.reqId
    });

    if (reviewModalTarget.reqId) {
      await handleUpdateStatus(
        reviewModalTarget.reqId,
        'Resolved',
        `Resolved by ${resolvedNgoName}`
      );
    }

    setReviewModalTarget(null);
  };

  return (
    <div className="app-shell">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => {
          api.setCurrentUser(null);
          setUser(null);
        }}
      />

      <main className="content-area">
        {activeTab === 'overview' && (
          <>
            <Hero
              onPostRequest={() => setActiveTab('request-aid')}
              onExploreDirectory={() => setActiveTab('directory')}
              onTrackRequests={() => setActiveTab('tracker')}
              onOpenNGOPortal={() => setActiveTab('ngo-portal')}
              stats={{
                totalNGOs: ngos.length,
                totalRequests: requests.length
              }}
            />

            {user?.role === 'ngo' && (
              <div
                style={{
                  maxWidth: '1100px',
                  margin: '20px auto 0',
                  padding: '0 20px'
                }}
              >
                <div
                  style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>🏢</span>
                    <div>
                      <div style={{ fontWeight: '800', color: '#166534', fontSize: '15px' }}>
                        Welcome back, {user.name} ({user.ngoName || 'NGO Representative'})!
                      </div>
                      <div style={{ fontSize: '13px', color: '#15803d', marginTop: '2px' }}>
                        You have incoming citizen distress signals matched to your organization awaiting field response.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ngo-portal')}
                    style={{
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Open NGO Response Hub &rarr;
                  </button>
                </div>
              </div>
            )}

            <section
              className="how-it-works-section"
              style={{
                maxWidth: '1100px',
                margin: '32px auto 48px',
                padding: '0 20px'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#16a34a',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px'
                  }}
                >
                  Operational Workflow
                </span>
                <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-h)', margin: '0 0 8px' }}>
                  How AidConnect Delivers Relief
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '640px', margin: '0 auto' }}>
                  A decentralized, AI-augmented matching pipeline ensuring distress requests reach verified responders with zero latency.
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '24px',
                  marginBottom: '32px'
                }}
              >
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      marginBottom: '16px'
                    }}
                  >
                    📝
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-h)', marginBottom: '8px' }}>
                    1. Post Distress Need
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
                    Enter your emergency request in simple language. Specify your city, contact phone, and urgency level.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      marginBottom: '16px'
                    }}
                  >
                    ⚡
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-h)', marginBottom: '8px' }}>
                    2. AI Matching & Ranking
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
                    Our NLP engine scores verified NGOs by category, geographic proximity, and crisis urgency.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      marginBottom: '16px'
                    }}
                  >
                    🤝
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-h)', marginBottom: '8px' }}>
                    3. Dispatch & Direct Rating
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
                    Responding teams contact you directly to deliver aid. Once resolved, rate the assisting NGO right on your card.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === 'request-aid' && (
          <AidRequestForm
            onRequestSubmitted={handleRequestSubmitted}
            onNavigateToTracker={() => setActiveTab('tracker')}
          />
        )}

        {activeTab === 'directory' && (
          <NGODirectory
            ngos={ngos}
            onDirectRequest={handleDirectRequest}
          />
        )}

        {activeTab === 'tracker' && (
          <RequestTracker
            requests={requests}
            ratings={ratings}
            user={user}
            onUpdateStatus={handleUpdateStatus}
            onAddRating={handleAddRating}
            onOpenReviewModal={handleOpenReviewModal}
          />
        )}

        {activeTab === 'ngo-portal' && (
          <NGODashboard
            user={user}
            requests={requests}
            ratings={ratings}
            ngos={ngos}
            onUpdateStatus={handleUpdateStatus}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === 'reviews' && (
          <RatingsSection
            ratings={ratings}
            ngos={ngos}
            onAddRating={handleAddRating}
          />
        )}
      </main>

      <Footer />

      {/* Review Feedback Modal */}
      {reviewModalTarget && (
        <div className="modal-backdrop-clean" onClick={() => setReviewModalTarget(null)}>
          <div className="modal-card-pro" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="modal-dismiss-btn"
              onClick={() => setReviewModalTarget(null)}
            >
              ✕
            </button>
            <div className="modal-top-section">
              <h3>Rate & Review {reviewModalTarget.ngo ? reviewModalTarget.ngo.name : 'Responding NGO'}</h3>
              <p>Share feedback on response velocity and assistance effectiveness.</p>
            </div>
            <div className="modal-content-section">
              {reviewModalTarget.matchedNGOs && reviewModalTarget.matchedNGOs.length > 1 && (
                <div className="form-field" style={{ marginBottom: '16px' }}>
                  <label htmlFor="modal-ngo-select" style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                    Which NGO resolved your problem?
                  </label>
                  <select
                    id="modal-ngo-select"
                    className="input-control select-control"
                    value={reviewModalTarget.ngo ? String(reviewModalTarget.ngo.ngoId || reviewModalTarget.ngo.ngo_id || reviewModalTarget.ngo.name) : ''}
                    onChange={(e) => {
                      const selected = reviewModalTarget.matchedNGOs.find(
                        n => String(n.ngoId || n.ngo_id || n.name) === e.target.value
                      );
                      if (selected) {
                        setReviewModalTarget(prev => ({ ...prev, ngo: selected }));
                      }
                    }}
                  >
                    {reviewModalTarget.matchedNGOs.map((n, idx) => (
                      <option key={idx} value={String(n.ngoId || n.ngo_id || n.name)}>
                        {n.name} {n.matchScore ? `(${n.matchScore}% match)` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-field">
                <label>Rating (1 to 5 Stars):</label>
                <div className="star-selection-row">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={`star-select-btn ${reviewScore >= star ? 'active' : ''}`}
                      onClick={() => setReviewScore(star)}
                    >
                      ★
                    </button>
                  ))}
                  <span className="star-selection-label">{reviewScore} of 5 Stars</span>
                </div>
              </div>

              <div className="form-field">
                <label>Feedback Comments:</label>
                <textarea
                  className="input-control textarea-control"
                  rows="3"
                  placeholder="Describe your experience with the response team..."
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="modal-actions-footer">
              <button
                type="button"
                className="btn-card-secondary"
                onClick={() => setReviewModalTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-card-primary"
                onClick={handleSaveResolutionReview}
                disabled={!reviewModalTarget.ngo}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(loggedUser) => {
          api.setCurrentUser(loggedUser);
          setUser(loggedUser);
          if (loggedUser.role === 'ngo') {
            setActiveTab('ngo-portal');
          }
        }}
      />
    </div>
  );
}

export default App;

