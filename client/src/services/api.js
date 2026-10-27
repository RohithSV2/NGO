import { INITIAL_NGOS, INITIAL_REQUESTS, INITIAL_RATINGS } from '../data/mockData';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : '/api'
);

// Local storage keys
const STORAGE_REQUESTS = 'ngo_app_requests';
const STORAGE_RATINGS = 'ngo_app_ratings';
const STORAGE_USER = 'ngo_app_user';

// Initialize localStorage if empty
if (!localStorage.getItem(STORAGE_REQUESTS)) {
  localStorage.setItem(STORAGE_REQUESTS, JSON.stringify(INITIAL_REQUESTS));
}
// Initialize and sanitize localStorage: remove any legacy mock reviews
try {
  const existingRatings = JSON.parse(localStorage.getItem(STORAGE_RATINGS) || '[]');
  const cleanedRatings = existingRatings.filter(r =>
    !['rate_1', 'rate_2', 'rate_3'].includes(r._id) &&
    !['Aditya Verma', 'Sunita Joshi', 'Pooja Reddy'].includes(r.userName)
  );
  localStorage.setItem(STORAGE_RATINGS, JSON.stringify(cleanedRatings));
} catch (e) {
  localStorage.setItem(STORAGE_RATINGS, JSON.stringify([]));
}

// Client-side NLP & Heuristic matcher fallback with full schema intelligence
export const clientSideMatch = (requestData, topK = 5) => {
  const ngos = INITIAL_NGOS;
  const title = (requestData.title || '').toLowerCase();
  const desc = (requestData.description || '').toLowerCase();
  const text = `${title} ${desc}`;
  const reqCategory = (requestData.category || '').toLowerCase();
  const reqCity = (requestData.city || '').toLowerCase();
  const reqUrgency = requestData.urgency || 'Medium';

  const scored = ngos.map(ngo => {
    let textSim = 0;
    const sectorsStr = Array.isArray(ngo.sectors) ? ngo.sectors.join(' ') : (ngo.sectors || '');
    const helpsStr = Array.isArray(ngo.helps) ? ngo.helps.join(' ') : (ngo.helps || '');
    const ngoSearchCorpus = `${ngo.name} ${ngo.category} ${sectorsStr} ${helpsStr} ${ngo.location} ${ngo.description}`.toLowerCase();

    const words = text.split(/\W+/).filter(w => w.length > 2);
    if (words.length > 0) {
      const hits = words.filter(w => ngoSearchCorpus.includes(w)).length;
      textSim = hits / words.length;
    }

    let catMatch = 0.3;
    if (reqCategory && reqCategory !== 'general aid') {
      const inCat = (ngo.category || '').toLowerCase().includes(reqCategory) || reqCategory.includes((ngo.category || '').toLowerCase());
      const inSectors = Array.isArray(ngo.sectors) && ngo.sectors.some(s => s.toLowerCase().includes(reqCategory) || reqCategory.includes(s.toLowerCase()));
      const inHelps = Array.isArray(ngo.helps) && ngo.helps.some(h => h.toLowerCase().includes(reqCategory) || reqCategory.includes(h.toLowerCase()));
      if (inCat || inSectors) {
        catMatch = 1.0;
      } else if (inHelps) {
        catMatch = 0.85;
      }
    }

    let locMatch = 0.5;
    if (reqCity) {
      const inCity = (ngo.city || '').toLowerCase().includes(reqCity);
      const inLoc = (ngo.location || '').toLowerCase().includes(reqCity);
      const inAreas = Array.isArray(ngo.areas_served) && ngo.areas_served.some(a => a.toLowerCase().includes(reqCity));
      if (inCity || inLoc || inAreas) {
        locMatch = 1.0;
      } else {
        locMatch = 0.2;
      }
    }

    const ratingFactor = (ngo.rating || 4.7) / 5.0;
    const handlesUrgency = (ngo.urgencyLevelsHandled || ngo.urgency_levels_handled || []).includes(reqUrgency);
    const urgencyBoost = handlesUrgency ? 1.15 : (reqUrgency === 'Critical' ? 0.85 : 1.0);

    const baseScore = (0.50 * textSim) + (0.25 * catMatch) + (0.15 * locMatch) + (0.10 * ratingFactor);
    const finalScore = Math.min(baseScore * urgencyBoost, 1.0);
    const confidencePct = Math.round(finalScore * 1000) / 10;

    const contactPhone = ngo.contactPhone || ngo.contact_phone || (Array.isArray(ngo.phone) ? ngo.phone[0] : ngo.phone) || '';
    const contactEmail = ngo.contactEmail || ngo.contact_email || (Array.isArray(ngo.email) ? ngo.email[0] : ngo.email) || '';

    return {
      ngo_id: ngo.ngo_id || ngo._id,
      name: ngo.name,
      registration_number: ngo.registration_number || '',
      category: ngo.category,
      sectors: ngo.sectors || [],
      helps: ngo.helps || [],
      city: ngo.city,
      state: ngo.state,
      location: ngo.location || `${ngo.city}, ${ngo.state}`,
      rating: ngo.rating,
      contact_phone: contactPhone,
      contact_email: contactEmail,
      contactPhone: contactPhone,
      contactEmail: contactEmail,
      website: ngo.website,
      social_media: ngo.social_media || {},
      description: ngo.description,
      match_score: confidencePct,
      breakdown: {
        text_similarity: Math.round(textSim * 100),
        category_match: Math.round(catMatch * 100),
        location_match: Math.round(locMatch * 100),
        urgency_handling: handlesUrgency
      }
    };
  });

  scored.sort((a, b) => b.match_score - a.match_score);
  return scored.slice(0, topK);
};

export const api = {
  // Fetch NGOs from backend API or local fallback
  async getNGOs(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.category && filters.category !== 'All') params.append('category', filters.category);
      if (filters.city) params.append('city', filters.city);
      if (filters.search) params.append('search', filters.search);

      const res = await fetch(`${API_BASE}/ngos?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) return json.data;
      }
    } catch (e) {
      // Offline fallback
    }

    let list = [...INITIAL_NGOS];
    if (filters.category && filters.category !== 'All') {
      const cat = filters.category.toLowerCase();
      list = list.filter(n => {
        const inCat = (n.category || '').toLowerCase().includes(cat);
        const inSectors = Array.isArray(n.sectors) && n.sectors.some(s => s.toLowerCase().includes(cat));
        const inHelps = Array.isArray(n.helps) && n.helps.some(h => h.toLowerCase().includes(cat));
        return inCat || inSectors || inHelps;
      });
    }
    if (filters.city) {
      const c = filters.city.toLowerCase();
      list = list.filter(n => {
        const inCity = (n.city || '').toLowerCase().includes(c);
        const inLoc = (n.location || '').toLowerCase().includes(c);
        const inAreas = Array.isArray(n.areas_served) && n.areas_served.some(a => a.toLowerCase().includes(c));
        return inCity || inLoc || inAreas;
      });
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(n => {
        const nameMatch = (n.name || '').toLowerCase().includes(s);
        const descMatch = (n.description || '').toLowerCase().includes(s);
        const catMatch = (n.category || '').toLowerCase().includes(s);
        const locMatch = (n.location || '').toLowerCase().includes(s);
        const regMatch = (n.registration_number || '').toLowerCase().includes(s);
        return nameMatch || descMatch || catMatch || locMatch || regMatch;
      });
    }
    return list;
  },

  // Submit new Aid Request
  async createAidRequest(requestData) {
    try {
      const res = await fetch(`${API_BASE}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      // Offline fallback
    }

    const matches = clientSideMatch(requestData, 5);
    const newRequest = {
      _id: 'req_' + Date.now(),
      ...requestData,
      status: matches.length > 0 ? 'Matched' : 'Pending',
      matchedNGOs: matches.map(m => ({
        ngoId: String(m.ngo_id),
        name: m.name,
        category: m.category,
        city: m.city,
        contactPhone: m.contact_phone || m.contactPhone || '',
        contactEmail: m.contact_email || m.contactEmail || '',
        matchScore: m.match_score,
        breakdown: m.breakdown
      })),
      createdAt: new Date().toISOString()
    };

    const current = JSON.parse(localStorage.getItem(STORAGE_REQUESTS) || '[]');
    current.unshift(newRequest);
    localStorage.setItem(STORAGE_REQUESTS, JSON.stringify(current));
    return newRequest;
  },

  // Get all Aid Requests
  async getAidRequests() {
    try {
      const res = await fetch(`${API_BASE}/requests`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {
      // Offline fallback
    }
    return JSON.parse(localStorage.getItem(STORAGE_REQUESTS) || '[]');
  },

  // Update Request status
  async updateRequestStatus(id, status, notes = '') {
    try {
      const res = await fetch(`${API_BASE}/requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolutionNotes: notes })
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      // Offline fallback
    }

    const current = JSON.parse(localStorage.getItem(STORAGE_REQUESTS) || '[]');
    const idx = current.findIndex(r => r._id === id);
    if (idx !== -1) {
      current[idx].status = status;
      if (status === 'Resolved') current[idx].resolvedAt = new Date().toISOString();
      if (notes) current[idx].resolutionNotes = notes;
      localStorage.setItem(STORAGE_REQUESTS, JSON.stringify(current));
      return current[idx];
    }
    return null;
  },

  // Live Match Preview
  async getMatchPreview(data) {
    try {
      const res = await fetch(`${API_BASE}/requests/match-preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      // Offline fallback
    }
    return clientSideMatch(data, 5);
  },

  // Submit Rating
  async submitRating(ratingData) {
    try {
      const res = await fetch(`${API_BASE}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ratingData)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const current = JSON.parse(localStorage.getItem(STORAGE_RATINGS) || '[]');
          const filtered = current.filter(r => r._id !== json.data._id);
          localStorage.setItem(STORAGE_RATINGS, JSON.stringify([json.data, ...filtered]));
          return json.data;
        }
      }
    } catch (e) {
      console.warn('API rating submission error, falling back:', e);
    }

    const newRating = {
      _id: 'rate_' + Date.now(),
      ...ratingData,
      createdAt: new Date().toISOString()
    };
    const current = JSON.parse(localStorage.getItem(STORAGE_RATINGS) || '[]');
    current.unshift(newRating);
    localStorage.setItem(STORAGE_RATINGS, JSON.stringify(current));
    return newRating;
  },

  // Get ratings for NGO or all
  async getRatings(ngoId = null) {
    try {
      const url = ngoId ? `${API_BASE}/ratings/ngo/${ngoId}` : `${API_BASE}/ratings`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          if (!ngoId) {
            localStorage.setItem(STORAGE_RATINGS, JSON.stringify(json.data));
          }
          return json.data;
        }
      }
    } catch (e) {
      console.warn('API fetch ratings error, using cache:', e);
    }
    const all = JSON.parse(localStorage.getItem(STORAGE_RATINGS) || '[]');
    if (ngoId) return all.filter(r => String(r.ngoId) === String(ngoId));
    return all;
  },

  // Local user authentication state
  getCurrentUser() {
    return JSON.parse(localStorage.getItem(STORAGE_USER) || 'null');
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_USER);
    }
  }
};
