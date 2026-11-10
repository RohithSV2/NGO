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
const STORAGE_VOLUNTEERS = 'ngo_app_volunteers';
const STORAGE_NOTIFICATIONS = 'ngo_app_notifications';
const STORAGE_STOCKPILES = 'ngo_app_stockpiles';
const STORAGE_PLEDGES = 'ngo_app_pledges';

export const INITIAL_STOCKPILES = {
  'The Shimoga Multipurpose Social Service Society': [
    { id: 'item_1', name: 'Cooked Meal & Dry Ration Kits', category: 'Food & Nutrition', available: 450, capacity: 600, unit: 'kits', committed: 45, reorderLevel: 100 },
    { id: 'item_2', name: 'Water Purification Tablets & 20L Cans', category: 'Water & Sanitation', available: 220, capacity: 300, unit: 'cans', committed: 30, reorderLevel: 50 },
    { id: 'item_3', name: 'First Aid Trauma Emergency Kits', category: 'Medical & Healthcare', available: 85, capacity: 100, unit: 'kits', committed: 10, reorderLevel: 25 },
    { id: 'item_4', name: 'Inflatable River Rescue Boats', category: 'Disaster Equipment', available: 6, capacity: 10, unit: 'boats', committed: 1, reorderLevel: 2 },
    { id: 'item_5', name: 'High-Buoyancy Life Jackets', category: 'Disaster Equipment', available: 120, capacity: 150, unit: 'jackets', committed: 20, reorderLevel: 30 },
    { id: 'item_6', name: 'Emergency Patient Ambulances', category: 'Transport', available: 4, capacity: 5, unit: 'vehicles', committed: 1, reorderLevel: 1 }
  ],
  'Vivekananda Rural Development Society': [
    { id: 'item_1', name: 'Drought Dry Grocery & Ration Kits', category: 'Food & Nutrition', available: 320, capacity: 500, unit: 'kits', committed: 25, reorderLevel: 80 },
    { id: 'item_2', name: '5000L Emergency Water Tankers', category: 'Water & Sanitation', available: 5, capacity: 8, unit: 'tankers', committed: 1, reorderLevel: 2 },
    { id: 'item_3', name: 'Potable Drinking Water Cans (20L)', category: 'Water & Sanitation', available: 380, capacity: 500, unit: 'cans', committed: 40, reorderLevel: 100 },
    { id: 'item_4', name: 'Drought Resilient Agricultural Seed Packs', category: 'Rural Livelihood', available: 150, capacity: 200, unit: 'packs', committed: 0, reorderLevel: 40 },
    { id: 'item_5', name: 'Emergency Trauma & Paramedic Packs', category: 'Medical & Healthcare', available: 40, capacity: 60, unit: 'kits', committed: 5, reorderLevel: 15 },
    { id: 'item_6', name: 'All-Terrain 4WD Field Pickup Trucks', category: 'Transport', available: 6, capacity: 8, unit: 'vehicles', committed: 2, reorderLevel: 2 }
  ],
  'Yashaswini mahila educational & rural development trust': [
    { id: 'item_1', name: 'Primary Student Educational Kits', category: 'Education & Literacy', available: 240, capacity: 300, unit: 'kits', committed: 35, reorderLevel: 50 },
    { id: 'item_2', name: 'Warm Winter Blankets & Sweaters', category: 'Shelter & Clothing', available: 310, capacity: 400, unit: 'blankets', committed: 40, reorderLevel: 80 },
    { id: 'item_3', name: 'Nutritional Dry Food Ration Packs', category: 'Food & Nutrition', available: 180, capacity: 250, unit: 'kits', committed: 15, reorderLevel: 40 },
    { id: 'item_4', name: 'Women Hygiene & Sanitary Kits', category: 'Hygiene & Health', available: 260, capacity: 350, unit: 'kits', committed: 20, reorderLevel: 50 },
    { id: 'item_5', name: 'First Aid Medical Supply Boxes', category: 'Medical & Healthcare', available: 55, capacity: 80, unit: 'boxes', committed: 5, reorderLevel: 15 },
    { id: 'item_6', name: 'Student Logistics Passenger Minivans', category: 'Transport', available: 3, capacity: 4, unit: 'vehicles', committed: 1, reorderLevel: 1 }
  ],
  'YOUTH EFFORTS FOR SOCIETY TRUST': [
    { id: 'item_1', name: 'Hot Cooked Meal Packets', category: 'Food & Nutrition', available: 650, capacity: 800, unit: 'packets', committed: 120, reorderLevel: 150 },
    { id: 'item_2', name: 'Bottled Mineral Water Carton Boxes', category: 'Water & Sanitation', available: 400, capacity: 500, unit: 'boxes', committed: 50, reorderLevel: 100 },
    { id: 'item_3', name: 'Senior Citizen Mobility & Wheelchairs', category: 'Aged / Special Care', available: 45, capacity: 60, unit: 'units', committed: 4, reorderLevel: 10 },
    { id: 'item_4', name: 'Medical Grade Oxygen Cylinders (10L)', category: 'Medical & Healthcare', available: 28, capacity: 40, unit: 'cylinders', committed: 2, reorderLevel: 8 },
    { id: 'item_5', name: 'First Aid Emergency Trauma Bags', category: 'Medical & Healthcare', available: 95, capacity: 120, unit: 'bags', committed: 12, reorderLevel: 25 },
    { id: 'item_6', name: 'Disaster Relief Mobile Kitchen Vans', category: 'Transport', available: 5, capacity: 6, unit: 'vans', committed: 1, reorderLevel: 1 }
  ]
};

export const INITIAL_PLEDGES = [
  {
    id: 'pledge_1',
    donorName: 'Dr. Arvind Rao (Alumni, NIE Mysuru)',
    donorType: 'Alumni Partner',
    phone: '9845011223',
    email: 'arvind.rao@alumni.nie.ac.in',
    district: 'Mysuru',
    targetNGO: 'YOUTH EFFORTS FOR SOCIETY TRUST',
    commodity: 'Hot Cooked Meal Packets',
    quantity: 150,
    unit: 'packets',
    pledgeAmount: '₹ 15,000',
    campaign: 'Monsoon Low-Lying Riverside Shelter Support',
    status: 'Delivered & Verified',
    linkedRequestId: 'req_104',
    otpAuditRef: 'AC-KAR-REQ104-2026',
    message: 'Proud alumnus of NIE Mysuru supporting community kitchens in Chamundi foothills low-lying areas.',
    createdAt: '2026-10-27T11:00:00Z'
  },
  {
    id: 'pledge_2',
    donorName: 'Kavitha Suresh',
    donorType: 'Citizen Philanthropist',
    phone: '9845332211',
    email: 'kavitha.s@gmail.com',
    district: 'Shivamogga',
    targetNGO: 'The Shimoga Multipurpose Social Service Society',
    commodity: 'Water Purification Tablets & 20L Cans',
    quantity: 100,
    unit: 'cans',
    pledgeAmount: '₹ 12,500',
    campaign: 'Tunga River Flood Emergency Relief Drive',
    status: 'Warehouse Ready',
    linkedRequestId: 'req_101',
    otpAuditRef: 'AC-KAR-REQ101-2026',
    message: 'Standing in solidarity with riverside farming families in flood-affected taluks.',
    createdAt: '2026-10-28T16:00:00Z'
  },
  {
    id: 'pledge_3',
    donorName: 'Chitradurga Youth Welfare Association',
    donorType: 'Community Foundation',
    phone: '9741224466',
    email: 'contact@cywa-karnataka.org',
    district: 'Chitradurga',
    targetNGO: 'Vivekananda Rural Development Society',
    commodity: 'Potable Drinking Water Cans (20L)',
    quantity: 80,
    unit: 'cans',
    pledgeAmount: '₹ 8,000',
    campaign: 'Rural Taluk Drought & Water Tanker Drive',
    status: 'Dispatched to Field',
    linkedRequestId: 'req_102',
    otpAuditRef: 'AC-KAR-REQ102-2026',
    message: 'Ensuring clean drinking water for rural drought-affected families and cattle shelters.',
    createdAt: '2026-10-29T10:15:00Z'
  },
  {
    id: 'pledge_4',
    donorName: 'Davanagere Cotton Merchants Trust',
    donorType: 'Corporate Partner',
    phone: '9880112244',
    email: 'csr@davanagerecotton.com',
    district: 'Davanagere',
    targetNGO: 'Yashaswini mahila educational & rural development trust',
    commodity: 'Warm Winter Blankets & Sweaters',
    quantity: 120,
    unit: 'blankets',
    pledgeAmount: '₹ 18,000',
    campaign: 'Rural Primary Student Educational Aid',
    status: 'Delivered & Verified',
    linkedRequestId: 'req_103',
    otpAuditRef: 'AC-KAR-REQ103-2026',
    message: 'Empowering rural primary school children with study stationery and winter warmth.',
    createdAt: '2026-10-29T14:30:00Z'
  }
];

if (!localStorage.getItem(STORAGE_STOCKPILES)) {
  localStorage.setItem(STORAGE_STOCKPILES, JSON.stringify(INITIAL_STOCKPILES));
}

if (!localStorage.getItem(STORAGE_PLEDGES)) {
  localStorage.setItem(STORAGE_PLEDGES, JSON.stringify(INITIAL_PLEDGES));
}

export const DISTRICT_COORDS = {
  Mysuru: { lat: 12.2958, lng: 76.6394 },
  Shivamogga: { lat: 13.9299, lng: 75.5681 },
  Davanagere: { lat: 14.4644, lng: 75.9218 },
  Chitradurga: { lat: 14.2287, lng: 76.3996 }
};

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_1',
    title: 'Critical Water Need in Chitradurga',
    message: 'Basavaraj Patil reported drought water scarcity. Vivekananda Rural Dev Society dispatched a relief tanker.',
    urgency: 'Critical',
    district: 'Chitradurga',
    time: '10 mins ago',
    read: false
  },
  {
    id: 'notif_2',
    title: 'Responders Dispatched in Mysuru',
    message: 'YOUTH EFFORTS FOR SOCIETY TRUST accepted distress request #req_104. ETA: 30 minutes.',
    urgency: 'High',
    district: 'Mysuru',
    time: '25 mins ago',
    read: false
  },
  {
    id: 'notif_3',
    title: 'Relief Delivered & OTP Verified',
    message: 'School study kits in Davanagere verified by citizen using OTP #7319.',
    urgency: 'Normal',
    district: 'Davanagere',
    time: '1 hour ago',
    read: true
  }
];

if (!localStorage.getItem(STORAGE_NOTIFICATIONS)) {
  localStorage.setItem(STORAGE_NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
}

export const INITIAL_VOLUNTEERS = [
  {
    id: 'vol_1',
    name: 'Prajwal Kumar M',
    phone: '9845112233',
    email: 'prajwal.k@gmail.com',
    district: 'Mysuru',
    domain: 'Emergency Rescue & Evacuation',
    availability: 'Immediate Emergency Standby',
    experienceNotes: 'Civil defense trained volunteer with boat navigation experience in Kabini basin.',
    createdAt: '2026-10-25T10:00:00Z'
  },
  {
    id: 'vol_2',
    name: 'Sahana Hegde',
    phone: '9845223344',
    email: 'sahana.h@gmail.com',
    district: 'Shivamogga',
    domain: 'First Aid & Paramedic Support',
    availability: 'Immediate Emergency Standby',
    experienceNotes: 'Nursing graduate volunteer with emergency trauma first aid experience.',
    createdAt: '2026-10-26T12:30:00Z'
  },
  {
    id: 'vol_3',
    name: 'Kiran Basavaraj',
    phone: '9741334455',
    email: 'kiran.b@gmail.com',
    district: 'Davanagere',
    domain: 'Food Packing & Community Kitchens',
    availability: 'Weekday Relief Operations',
    experienceNotes: 'Organized student kitchen drives distributing cooked food to drought shelters.',
    createdAt: '2026-10-27T14:15:00Z'
  },
  {
    id: 'vol_4',
    name: 'Deepak Nayak',
    phone: '9880445566',
    email: 'deepak.n@gmail.com',
    district: 'Chitradurga',
    domain: 'Logistics, Transport & Driving',
    availability: 'Immediate Emergency Standby',
    experienceNotes: '4-wheel drive owner available for rough terrain rural water delivery.',
    createdAt: '2026-10-28T09:45:00Z'
  }
];

// Initialize volunteers storage if empty
if (!localStorage.getItem(STORAGE_VOLUNTEERS)) {
  localStorage.setItem(STORAGE_VOLUNTEERS, JSON.stringify(INITIAL_VOLUNTEERS));
}

// Initialize and sanitize localStorage: remove any legacy mock requests from fake cities
try {
  const existingReqs = JSON.parse(localStorage.getItem(STORAGE_REQUESTS) || '[]');
  const cleanedReqs = existingReqs.filter(r =>
    !['Mumbai', 'Chennai', 'New Delhi', 'Delhi', 'Kolkata', 'Ahmedabad', 'Dehradun', 'Gurugram'].includes(r.city)
  );
  if (cleanedReqs.length === 0) {
    localStorage.setItem(STORAGE_REQUESTS, JSON.stringify(INITIAL_REQUESTS));
  } else if (cleanedReqs.length !== existingReqs.length) {
    localStorage.setItem(STORAGE_REQUESTS, JSON.stringify(cleanedReqs));
  }
} catch (e) {
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
  let reqCategory = (requestData.category || '').toLowerCase();
  let reqCity = (requestData.city || '').toLowerCase();
  const reqUrgency = requestData.urgency || 'Medium';

  // Natural Language city detection for real Karnataka districts
  if (!reqCity) {
    if (text.includes('mysuru') || text.includes('mysore')) reqCity = 'mysuru';
    else if (text.includes('chitradurga')) reqCity = 'chitradurga';
    else if (text.includes('davanagere') || text.includes('davangere')) reqCity = 'davanagere';
    else if (text.includes('shivamogga') || text.includes('shimoga') || text.includes('smg')) reqCity = 'shivamogga';
  }

  // Natural Language category inference if general aid or food/education mentioned
  if (!reqCategory || reqCategory === 'general aid' || reqCategory.includes('general')) {
    if (text.includes('food') || text.includes('meal') || text.includes('ration') || text.includes('hunger') || text.includes('starv')) {
      reqCategory = 'hunger & food';
    } else if (text.includes('education') || text.includes('school') || text.includes('book') || text.includes('student') || text.includes('tuition')) {
      reqCategory = 'education';
    } else if (text.includes('blood') || text.includes('medic') || text.includes('hospital') || text.includes('health') || text.includes('oxygen')) {
      reqCategory = 'health & family welfare';
    } else if (text.includes('flood') || text.includes('earthquake') || text.includes('disaster') || text.includes('cyclone')) {
      reqCategory = 'disaster relief & management';
    }
  }

  const scored = ngos.map(ngo => {
    let textSim = 0;
    const sectorsStr = Array.isArray(ngo.sectors) ? ngo.sectors.join(' ') : (ngo.sectors || '');
    const helpsStr = Array.isArray(ngo.helps) ? ngo.helps.join(' ') : (ngo.helps || '');
    const areasStr = Array.isArray(ngo.areas_served) ? ngo.areas_served.join(' ') : '';
    const ngoSearchCorpus = `${ngo.name} ${ngo.category} ${sectorsStr} ${helpsStr} ${areasStr} ${ngo.keywords || ''} ${ngo.location || ''} ${ngo.city || ''} ${ngo.state || ''} ${ngo.description || ''}`.toLowerCase();

    const words = text.split(/\W+/).filter(w => w.length > 2);
    if (words.length > 0) {
      const hits = words.filter(w => ngoSearchCorpus.includes(w)).length;
      textSim = hits / words.length;
    }

    let catMatch = 0.25;
    if (reqCategory && reqCategory !== 'general aid') {
      const ngoCat = (ngo.category || '').toLowerCase();
      const inCat = ngoCat.includes(reqCategory) || reqCategory.includes(ngoCat);
      const isFood = (reqCategory.includes('food') || reqCategory.includes('hunger')) && (ngoCat.includes('food') || ngoCat.includes('hunger'));
      const isEdu = reqCategory.includes('education') && ngoCat.includes('education');
      const isHealth = (reqCategory.includes('health') || reqCategory.includes('medic')) && (ngoCat.includes('health') || ngoCat.includes('medic'));
      const isDisaster = reqCategory.includes('disaster') && ngoCat.includes('disaster');

      const inSectors = Array.isArray(ngo.sectors) && ngo.sectors.some(s => s.toLowerCase().includes(reqCategory) || reqCategory.includes(s.toLowerCase()));
      const inHelps = Array.isArray(ngo.helps) && ngo.helps.some(h => h.toLowerCase().includes(reqCategory) || reqCategory.includes(h.toLowerCase()));

      if (inCat || isFood || isEdu || isHealth || isDisaster || inSectors) {
        catMatch = 1.0;
      } else if (inHelps) {
        catMatch = 0.85;
      } else {
        catMatch = 0.15;
      }
    }

    let locMatch = 0.5;
    if (reqCity) {
      const inCity = (ngo.city || '').toLowerCase().includes(reqCity) || reqCity.includes((ngo.city || '').toLowerCase());
      const inLoc = (ngo.location || '').toLowerCase().includes(reqCity);
      const inAreas = Array.isArray(ngo.areas_served) && ngo.areas_served.some(a => a.toLowerCase().includes(reqCity) || reqCity.includes(a.toLowerCase()));
      const isKarnataka = (reqCity.includes('mysur') || reqCity.includes('mysore') || reqCity.includes('bengalur') || reqCity.includes('bangalore')) &&
        ((ngo.state || '').toLowerCase().includes('karnataka') || (ngo.city || '').toLowerCase().includes('bengaluru'));

      if (inCity || inLoc || inAreas) {
        locMatch = 1.0;
      } else if (isKarnataka) {
        locMatch = 0.85;
      } else {
        locMatch = 0.15;
      }
    }

    const ratingFactor = (ngo.rating || 4.7) / 5.0;
    const handlesUrgency = (ngo.urgencyLevelsHandled || ngo.urgency_levels_handled || []).includes(reqUrgency);
    const urgencyBoost = handlesUrgency ? 1.20 : 0.82;

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
    let formattedMatches = matches.map(m => ({
      ngoId: String(m.ngo_id),
      name: m.name,
      category: m.category,
      city: m.city,
      contactPhone: m.contact_phone || m.contactPhone || '',
      contactEmail: m.contact_email || m.contactEmail || '',
      matchScore: m.match_score,
      breakdown: m.breakdown
    }));

    const directTargetName = requestData.targetNgoName || requestData.targetNGO?.name || '';
    if (directTargetName) {
      formattedMatches = formattedMatches.filter(m => (m.name || '').toLowerCase() !== directTargetName.toLowerCase());
      formattedMatches.unshift({
        ngoId: String(requestData.targetNGO?.ngoId || requestData.targetNGO?._id || requestData.targetNGO?.ngo_id || 'direct'),
        name: directTargetName,
        category: requestData.targetNGO?.category || requestData.category || 'General Aid',
        city: requestData.targetNGO?.city || requestData.city || '',
        contactPhone: requestData.targetNGO?.contactPhone || requestData.targetNGO?.contact_phone || '',
        contactEmail: requestData.targetNGO?.contactEmail || requestData.targetNGO?.contact_email || '',
        matchScore: 100,
        breakdown: { directSelection: 100, note: 'Direct distress request sent by citizen to this NGO coordinator' }
      });
    }

    const cityCoords = DISTRICT_COORDS[requestData.city] || { lat: 12.2958, lng: 76.6394 };
    const jitterLat = Number((cityCoords.lat + (Math.random() - 0.5) * 0.04).toFixed(4));
    const jitterLng = Number((cityCoords.lng + (Math.random() - 0.5) * 0.04).toFixed(4));
    const resolutionOtp = String(Math.floor(1000 + Math.random() * 9000));

    const newRequest = {
      _id: 'req_' + Date.now(),
      ...requestData,
      lat: requestData.lat || jitterLat,
      lng: requestData.lng || jitterLng,
      resolutionOtp: requestData.resolutionOtp || resolutionOtp,
      targetNgoName: directTargetName || null,
      isDirectRequest: Boolean(directTargetName || requestData.isDirectRequest),
      status: formattedMatches.length > 0 ? 'Matched' : 'Pending',
      matchedNGOs: formattedMatches,
      createdAt: new Date().toISOString()
    };

    const current = JSON.parse(localStorage.getItem(STORAGE_REQUESTS) || '[]');
    current.unshift(newRequest);
    localStorage.setItem(STORAGE_REQUESTS, JSON.stringify(current));

    // Register live notification
    try {
      this.addNotification({
        title: `🚨 New ${requestData.urgency || 'High'} Need: ${requestData.city || 'Karnataka'}`,
        message: `${requestData.title || 'Aid request'} submitted by ${requestData.requesterName || 'Citizen'}.`,
        urgency: requestData.urgency || 'High',
        district: requestData.city || 'Karnataka'
      });
    } catch (e) {}

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
  async updateRequestStatus(id, status, notes = '', extraData = {}) {
    try {
      const res = await fetch(`${API_BASE}/requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolutionNotes: notes, ...extraData })
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
      if (extraData && typeof extraData === 'object') {
        Object.assign(current[idx], extraData);
      }
      localStorage.setItem(STORAGE_REQUESTS, JSON.stringify(current));

      // Trigger notification for status changes
      try {
        if (status === 'In Progress') {
          this.addNotification({
            title: `🚚 Relief Mission Dispatched (${current[idx].city})`,
            message: `Field team dispatched for "${current[idx].title}". ${extraData.etaMinutes ? `ETA: ${extraData.etaMinutes} mins.` : ''}`,
            urgency: 'High',
            district: current[idx].city
          });
        } else if (status === 'Resolved') {
          this.addNotification({
            title: `✅ Mission Resolved & OTP Verified (${current[idx].city})`,
            message: `Assistance delivered for "${current[idx].title}". Citizen verified resolution.`,
            urgency: 'Normal',
            district: current[idx].city
          });
        }
      } catch (e) {}

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

  // Get all registered volunteers
  async getVolunteers() {
    try {
      const res = await fetch(`${API_BASE}/volunteers`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          localStorage.setItem(STORAGE_VOLUNTEERS, JSON.stringify(json.data));
          return json.data;
        }
      }
    } catch (e) {
      // Offline fallback
    }
    return JSON.parse(localStorage.getItem(STORAGE_VOLUNTEERS) || '[]');
  },

  // Register a new volunteer
  async registerVolunteer(volunteerData) {
    const newVol = {
      id: 'vol_' + Date.now(),
      ...volunteerData,
      createdAt: new Date().toISOString()
    };
    try {
      const res = await fetch(`${API_BASE}/volunteers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVol)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      // Offline fallback
    }
    const current = JSON.parse(localStorage.getItem(STORAGE_VOLUNTEERS) || '[]');
    current.unshift(newVol);
    localStorage.setItem(STORAGE_VOLUNTEERS, JSON.stringify(current));
    return newVol;
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
  },

  // Notification Feed System
  getNotifications() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_NOTIFICATIONS) || '[]');
      return data.length > 0 ? data : INITIAL_NOTIFICATIONS;
    } catch (e) {
      return INITIAL_NOTIFICATIONS;
    }
  },

  addNotification(notif) {
    const current = this.getNotifications();
    const item = {
      id: 'notif_' + Date.now(),
      time: 'Just now',
      read: false,
      ...notif
    };
    current.unshift(item);
    localStorage.setItem(STORAGE_NOTIFICATIONS, JSON.stringify(current));
    return item;
  },

  markNotificationsRead() {
    const current = this.getNotifications().map(n => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_NOTIFICATIONS, JSON.stringify(current));
    return current;
  },

  // Stockpile & Inventory Matrix Methods
  getStockpiles() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_STOCKPILES) || 'null');
      return data || INITIAL_STOCKPILES;
    } catch (e) {
      return INITIAL_STOCKPILES;
    }
  },

  updateStockpileItem(ngoName, itemId, newAvailable) {
    const stockpiles = this.getStockpiles();
    const list = stockpiles[ngoName] || [];
    const item = list.find(i => i.id === itemId);
    if (item) {
      item.available = Math.max(0, Math.min(item.capacity, Number(newAvailable)));
      localStorage.setItem(STORAGE_STOCKPILES, JSON.stringify(stockpiles));
    }
    return stockpiles;
  },

  deductStockpileForMission(ngoName, category, qty = 15) {
    const stockpiles = this.getStockpiles();
    const list = stockpiles[ngoName] || [];
    if (list.length === 0) return stockpiles;

    const catLower = (category || '').toLowerCase();
    let targetItem = list.find(i => catLower.includes(i.category.toLowerCase()) || i.category.toLowerCase().includes(catLower));
    if (!targetItem) targetItem = list[0];

    if (targetItem) {
      targetItem.available = Math.max(0, targetItem.available - qty);
      targetItem.committed = (targetItem.committed || 0) + qty;
      localStorage.setItem(STORAGE_STOCKPILES, JSON.stringify(stockpiles));
    }
    return stockpiles;
  },

  replenishStockpileFromPledge(ngoName, commodityName, qty) {
    const stockpiles = this.getStockpiles();
    const list = stockpiles[ngoName] || [];
    const item = list.find(i => i.name.toLowerCase().includes(commodityName.toLowerCase()) || commodityName.toLowerCase().includes(i.name.toLowerCase()));
    if (item) {
      item.available = Math.min(item.capacity, item.available + Number(qty));
      localStorage.setItem(STORAGE_STOCKPILES, JSON.stringify(stockpiles));
    }
    return stockpiles;
  },

  calculateKnapsackCoverage(ngoName, requestedCategory) {
    const stockpiles = this.getStockpiles();
    const list = stockpiles[ngoName] || [];
    if (list.length === 0) return { score: 92, status: 'Adequate', available: 100, needed: 30, unit: 'kits' };

    const catLower = (requestedCategory || '').toLowerCase();
    const targetItem = list.find(i => catLower.includes(i.category.toLowerCase()) || i.category.toLowerCase().includes(catLower)) || list[0];

    const requestedQty = 30;
    const coverageRatio = Math.min(1.0, targetItem.available / requestedQty);
    const score = Math.round(coverageRatio * 100);

    return {
      score,
      commodityName: targetItem.name,
      available: targetItem.available,
      needed: requestedQty,
      unit: targetItem.unit,
      status: score >= 90 ? 'High Stock' : (score >= 50 ? 'Moderate' : 'Critical Restock Needed')
    };
  },

  // Community Relief Pledge Ledger Methods
  getPledges() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_PLEDGES) || 'null');
      return data && data.length > 0 ? data : INITIAL_PLEDGES;
    } catch (e) {
      return INITIAL_PLEDGES;
    }
  },

  createPledge(pledgeData) {
    const current = this.getPledges();
    const newPledge = {
      id: 'pledge_' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'Warehouse Ready',
      ...pledgeData
    };
    current.unshift(newPledge);
    localStorage.setItem(STORAGE_PLEDGES, JSON.stringify(current));

    if (newPledge.targetNGO && newPledge.commodity && newPledge.quantity) {
      this.replenishStockpileFromPledge(newPledge.targetNGO, newPledge.commodity, newPledge.quantity);
    }

    try {
      this.addNotification({
        title: `💝 New Community Relief Pledge (${newPledge.district})`,
        message: `${newPledge.donorName} sponsored ${newPledge.quantity} ${newPledge.unit || 'kits'} of ${newPledge.commodity}.`,
        urgency: 'Normal',
        district: newPledge.district
      });
    } catch (e) {}

    return newPledge;
  }
};
