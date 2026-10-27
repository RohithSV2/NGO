const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const CSV_PATH = path.join(__dirname, '..', '..', 'ml', 'dataset', 'ngos.csv');
const PREDICT_SCRIPT = path.join(__dirname, '..', '..', 'ml', 'src', 'predict.py');

// Parse CSV with full new schema support
let cachedNGOs = null;
const loadCSVNGOs = () => {
  if (cachedNGOs) return cachedNGOs;
  if (!fs.existsSync(CSV_PATH)) return [];

  const raw = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = raw.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());

  cachedNGOs = [];
  for (let i = 1; i < lines.length; i++) {
    // Basic CSV parser handling quoted fields with commas
    const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
    const values = [];
    let match;
    while ((match = regex.exec(lines[i])) !== null) {
      if (match.index === regex.lastIndex) regex.lastIndex++;
      let val = match[1] || '';
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1).replace(/""/g, '"');
      }
      values.push(val);
      if (regex.lastIndex >= lines[i].length) break;
    }

    if (values.length >= headers.length) {
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });

      const sectors = (row.sectors || '').split(';').map(s => s.trim()).filter(Boolean);
      const helps = (row.helps || '').split(';').map(h => h.trim()).filter(Boolean);
      const services = (row.services || '').split(';').map(s => s.trim()).filter(Boolean);
      const areas_served = (row.areas_served || '').split(';').map(a => a.trim()).filter(Boolean);
      const sources = (row.sources || '').split(';').map(s => s.trim()).filter(Boolean);
      const phones = row.contact_phone ? [row.contact_phone] : [];
      const emails = row.contact_email ? [row.contact_email] : [];

      cachedNGOs.push({
        ngo_id: parseInt(row.id || i),
        name: row.name || '',
        registration_number: row.registration_number || '',
        category: row.category || (sectors[0] || 'General Aid'),
        sectors: sectors,
        helps: helps,
        services: services,
        areas_served: areas_served,
        city: row.city || '',
        state: row.state || 'Karnataka',
        location: row.location || `${row.city || ''}, ${row.state || 'Karnataka'}`,
        description: row.description || '',
        keywords: (row.keywords || '').split(' ').filter(Boolean),
        capacity: parseInt(row.capacity || 1000),
        urgencyLevelsHandled: (row.urgency_levels_handled || 'Low,Medium,High,Critical').split(',').map(s => s.trim()),
        verified: row.verified === 'true' || row.verified === true,
        rating: row.rating ? parseFloat(row.rating) : null,
        phone: phones,
        email: emails,
        contactPhone: row.contact_phone || '',
        contactEmail: row.contact_email || '',
        contact_phone: row.contact_phone || '',
        contact_email: row.contact_email || '',
        website: row.website || '',
        social_media: {
          facebook: row.facebook || '',
          instagram: row.instagram || '',
          linkedin: row.linkedin || '',
          twitter: row.twitter || '',
          youtube: row.youtube || ''
        },
        sources: sources
      });
    }
  }
  return cachedNGOs;
};

// Pure JavaScript fallback NLP matcher with full schema intelligence
const jsFallbackMatcher = (requestData, topK = 5) => {
  const ngos = loadCSVNGOs();
  const title = (requestData.title || '').toLowerCase();
  const desc = (requestData.description || '').toLowerCase();
  const text = `${title} ${desc}`;
  let reqCategory = (requestData.category || '').toLowerCase();
  let reqCity = (requestData.city || '').toLowerCase();
  const reqUrgency = requestData.urgency || 'Medium';

  // Natural Language city detection if not explicitly set
  if (!reqCity) {
    if (text.includes('mysuru') || text.includes('mysore')) reqCity = 'mysuru';
    else if (text.includes('bengaluru') || text.includes('bangalore')) reqCity = 'bengaluru';
    else if (text.includes('delhi')) reqCity = 'delhi';
    else if (text.includes('mumbai')) reqCity = 'mumbai';
  }

  // Natural Language category inference
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
    const ngoSearchCorpus = `${ngo.name} ${ngo.category} ${sectorsStr} ${helpsStr} ${areasStr} ${ngo.location || ''} ${ngo.city || ''} ${ngo.state || ''} ${ngo.description || ''}`.toLowerCase();

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

    const ratingFactor = ngo.rating ? (ngo.rating / 5.0) : 0.8;
    const handlesUrgency = (ngo.urgencyLevelsHandled || ngo.urgency_levels_handled || []).includes(reqUrgency);
    const urgencyBoost = handlesUrgency ? 1.20 : 0.82;

    const baseScore = (0.50 * textSim) + (0.25 * catMatch) + (0.15 * locMatch) + (0.10 * ratingFactor);
    const finalScore = Math.min(baseScore * urgencyBoost, 1.0);
    const confidencePct = Math.round(finalScore * 1000) / 10;

    return {
      ngo_id: ngo.ngo_id || ngo._id,
      name: ngo.name,
      category: ngo.category,
      sectors: ngo.sectors || [],
      helps: ngo.helps || [],
      city: ngo.city,
      state: ngo.state,
      location: ngo.location,
      rating: ngo.rating,
      contact_phone: ngo.contactPhone || (ngo.phone && ngo.phone[0]) || '',
      contact_email: ngo.contactEmail || (ngo.email && ngo.email[0]) || '',
      contactPhone: ngo.contactPhone || (ngo.phone && ngo.phone[0]) || '',
      contactEmail: ngo.contactEmail || (ngo.email && ngo.email[0]) || '',
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

/**
 * Matches an aid request to candidate NGOs.
 * Runs Python ML predict script with automatic fallback to JS matcher.
 */
const matchAidRequest = async (requestData, topK = 5) => {
  return new Promise((resolve) => {
    const payload = JSON.stringify(requestData).replace(/"/g, '\\"');
    const pyCmd = process.platform === 'win32' ? 'python' : 'python3';
    const command = `${pyCmd} "${PREDICT_SCRIPT}" "${payload}"`;

    exec(command, { timeout: 6000 }, (error, stdout) => {
      if (!error && stdout) {
        try {
          const parsed = JSON.parse(stdout.trim());
          if (Array.isArray(parsed) && parsed.length > 0) {
            return resolve(parsed.slice(0, topK));
          }
        } catch (e) {
          // parse failed, use fallback
        }
      }
      // Use fallback matching
      const fallbackResults = jsFallbackMatcher(requestData, topK);
      resolve(fallbackResults);
    });
  });
};

module.exports = { matchAidRequest, loadCSVNGOs };
