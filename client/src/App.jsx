import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AidRequestForm from './components/AidRequestForm';
import NGODirectory from './components/NGODirectory';
import RequestTracker from './components/RequestTracker';
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
              stats={{
                totalNGOs: ngos.length,
                totalRequests: requests.length
              }}
            />
            <div className="featured-ngos-section">
              <div className="section-divider"></div>
              <NGODirectory
                ngos={ngos}
                onDirectRequest={handleDirectRequest}
              />
            </div>
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
        }}
      />
    </div>
  );
}

export default App;

