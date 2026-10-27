/**
 * Natural Language Processing (NLP) Semantic Search Engine
 * Features:
 * 1. Tokenization & Stopword Elimination
 * 2. Humanitarian Intent & Category Signal Extraction
 * 3. Named Entity Recognition for Locations (Cities & Districts)
 * 4. Urgency & Crisis Severity Detection
 * 5. Semantic TF-IDF style Word-Overlap & Cosine Relevance Scoring
 */

const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your',
  'yours', 'he', 'him', 'his', 'she', 'her', 'hers', 'it', 'its', 'they',
  'them', 'their', 'what', 'which', 'who', 'whom', 'this', 'that', 'these',
  'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
  'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the',
  'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at',
  'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through',
  'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
  'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any',
  'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
  'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can',
  'will', 'just', 'should', 'now', 'need', 'needs', 'needed', 'want', 'wants',
  'wanted', 'please', 'help', 'urgently', 'urgent', 'looking', 'find', 'give',
  'provide', 'somebody', 'anyone', 'organisation', 'organization', 'ngo', 'ngos'
]);

const CATEGORY_SIGNALS = {
  'Hunger & Food': [
    'food', 'hunger', 'hungry', 'starving', 'starvation', 'meals', 'meal',
    'ration', 'rations', 'groceries', 'grocery', 'malnutrition', 'kitchen',
    'cooked food', 'dinner', 'lunch', 'breakfast', 'canteen', 'dry ration'
  ],
  'Healthcare': [
    'doctor', 'hospital', 'medicine', 'medicines', 'ambulance', 'blood',
    'clinic', 'surgery', 'illness', 'disease', 'fever', 'oxygen', 'icu',
    'treatment', 'patient', 'health', 'cancer', 'dialysis', 'transfusion',
    'medical', 'first aid', 'pharmacy', 'tablets'
  ],
  'Disaster Relief': [
    'flood', 'floods', 'flooded', 'earthquake', 'cyclone', 'landslide',
    'tsunami', 'disaster', 'calamity', 'rescue', 'trapped', 'evacuation',
    'relief kit', 'tarpaulin', 'shelter', 'collapse', 'drowning', 'rain'
  ],
  'Education & Literacy': [
    'school', 'education', 'student', 'students', 'children', 'books',
    'book', 'stationery', 'study', 'teacher', 'classes', 'tuition',
    'scholarship', 'scholarships', 'literacy', 'learning', 'college', 'notebooks'
  ],
  'Children & Youth': [
    'child', 'children', 'orphan', 'orphanage', 'pediatric', 'infant',
    'baby', 'kids', 'underprivileged children', 'child labor', 'foster'
  ],
  'Women Empowerment': [
    'women', 'woman', 'domestic violence', 'assault', 'maternal', 'girl child',
    'pregnant', 'pregnancy', 'harassment', 'livelihood', 'artisan', 'widow',
    'mahila', 'self help'
  ],
  'Aged & Elderly Care': [
    'elderly', 'old age', 'senior citizen', 'grandfather', 'grandmother',
    'pension', 'hospice', 'dementia', 'aged', 'geriatric', 'old age home'
  ],
  'Clean Water & Sanitation': [
    'water', 'drinking water', 'toilet', 'sanitation', 'clean water',
    'contamination', 'borewell', 'hygiene', 'pipeline', 'purifier'
  ],
  'Animal Welfare': [
    'dog', 'cat', 'puppy', 'kitten', 'cow', 'cattle', 'animal', 'animals',
    'stray', 'injured animal', 'vet', 'rabies', 'veterinary', 'livestock'
  ],
  'Agriculture & Rural': [
    'crop', 'farmer', 'farmers', 'farming', 'seeds', 'irrigation',
    'agriculture', 'fertilizer', 'drought', 'harvest', 'pesticide', 'soil'
  ]
};

const CITY_SYNONYMS = {
  'mysuru': 'Mysuru',
  'mysore': 'Mysuru',
  'bengaluru': 'Bengaluru',
  'bangalore': 'Bengaluru',
  'mumbai': 'Mumbai',
  'delhi': 'Delhi',
  'new delhi': 'Delhi',
  'chennai': 'Chennai',
  'kolkata': 'Kolkata',
  'hyderabad': 'Hyderabad',
  'pune': 'Pune',
  'chitradurga': 'Chitradurga',
  'davanagere': 'Davanagere',
  'davangere': 'Davanagere',
  'shivamogga': 'Shivamogga',
  'shimoga': 'Shivamogga',
  'hubballi': 'Hubballi',
  'hubli': 'Hubballi',
  'mandya': 'Mandya'
};

const URGENCY_SIGNALS = {
  'Critical': ['critical', 'emergency', 'immediately', 'life threatening', 'blood', 'oxygen', 'dying', 'icu', 'trapped'],
  'High': ['urgent', 'urgently', 'asap', 'starving', 'severe', 'fast', 'needed today', 'flood'],
  'Medium': ['needed', 'support', 'assistance', 'help', 'supplies'],
  'Low': ['routine', 'regular', 'coaching', 'tuition', 'general', 'future']
};

/**
 * Tokenizes raw text into clean meaningful tokens.
 */
export function tokenizeText(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOP_WORDS.has(token));
}

/**
 * Parses natural language search query and extracts semantic intents and entities.
 */
export function parseSearchIntent(query) {
  if (!query || query.trim() === '') return null;
  const lower = query.toLowerCase();
  const tokens = tokenizeText(lower);

  // 1. Detect Category Intent
  let detectedCategory = null;
  let maxCatScore = 0;
  for (const [category, keywords] of Object.entries(CATEGORY_SIGNALS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score += 1;
    }
    if (score > maxCatScore) {
      maxCatScore = score;
      detectedCategory = category;
    }
  }

  // 2. Detect Location Entity
  let detectedLocation = null;
  for (const [variant, standardized] of Object.entries(CITY_SYNONYMS)) {
    if (lower.includes(variant)) {
      detectedLocation = standardized;
      break;
    }
  }

  // 3. Detect Urgency
  let detectedUrgency = null;
  for (const [level, keywords] of Object.entries(URGENCY_SIGNALS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      detectedUrgency = level;
      break;
    }
  }

  return {
    rawQuery: query,
    tokens,
    category: detectedCategory,
    location: detectedLocation,
    urgency: detectedUrgency,
    isNaturalLanguage: tokens.length >= 2 || Boolean(detectedCategory || detectedLocation)
  };
}

/**
 * Performs Semantic NLP search and ranks NGOs according to multi-dimensional relevance.
 */
export function semanticNLPSearch(ngos, query, filterSector = 'All', filterCity = '') {
  if (!query || query.trim() === '') {
    // Standard filtering when query is empty
    return ngos
      .filter(ngo => {
        const sectorsList = Array.isArray(ngo.sectors) ? ngo.sectors : [];
        const helpsList = Array.isArray(ngo.helps) ? ngo.helps : [];
        const areasList = Array.isArray(ngo.areas_served) ? ngo.areas_served : [];

        const matchesSector =
          filterSector === 'All' ||
          (ngo.category || '').toLowerCase().includes(filterSector.toLowerCase()) ||
          sectorsList.some(s => s.toLowerCase().includes(filterSector.toLowerCase())) ||
          helpsList.some(h => h.toLowerCase().includes(filterSector.toLowerCase()));

        const matchesCity =
          filterCity === '' ||
          (ngo.city || '').toLowerCase() === filterCity.toLowerCase() ||
          (ngo.location || '').toLowerCase().includes(filterCity.toLowerCase()) ||
          areasList.some(a => a.toLowerCase().includes(filterCity.toLowerCase()));

        return matchesSector && matchesCity;
      })
      .map(ngo => ({ ...ngo, nlpRelevance: null }));
  }

  const intent = parseSearchIntent(query);
  const queryTokens = intent.tokens;

  const scoredNGOs = ngos.map(ngo => {
    const sectorsStr = Array.isArray(ngo.sectors) ? ngo.sectors.join(' ') : '';
    const helpsStr = Array.isArray(ngo.helps) ? ngo.helps.join(' ') : '';
    const servicesStr = Array.isArray(ngo.services) ? ngo.services.join(' ') : '';
    const areasStr = Array.isArray(ngo.areas_served) ? ngo.areas_served.join(' ') : '';

    const corpus = `${ngo.name} ${ngo.category} ${sectorsStr} ${helpsStr} ${servicesStr} ${areasStr} ${ngo.city || ''} ${ngo.location || ''} ${ngo.state || ''} ${ngo.description || ''} ${ngo.keywords || ''}`.toLowerCase();

    // 1. Direct Substring Match
    const rawLower = query.toLowerCase().trim();
    const isDirectMatch = corpus.includes(rawLower) || (ngo.registration_number || '').toLowerCase().includes(rawLower);

    // 2. Token overlap similarity
    let tokenHits = 0;
    if (queryTokens.length > 0) {
      tokenHits = queryTokens.filter(t => corpus.includes(t)).length;
    }
    const tokenScore = queryTokens.length > 0 ? (tokenHits / queryTokens.length) : 0;

    // 3. Category / Intent Alignment
    let intentScore = 0;
    if (intent.category) {
      const ngoCat = (ngo.category || '').toLowerCase();
      const catTarget = intent.category.toLowerCase();
      if (ngoCat.includes(catTarget) || catTarget.includes(ngoCat)) {
        intentScore = 1.0;
      } else if (sectorsStr.toLowerCase().includes(catTarget) || helpsStr.toLowerCase().includes(catTarget)) {
        intentScore = 0.85;
      } else {
        intentScore = 0.1;
      }
    } else {
      intentScore = 0.5;
    }

    // 4. Location Entity Alignment
    let locationScore = 0.5;
    const targetCity = intent.location || filterCity;
    if (targetCity) {
      const cityLower = targetCity.toLowerCase();
      const inCity = (ngo.city || '').toLowerCase().includes(cityLower);
      const inLoc = (ngo.location || '').toLowerCase().includes(cityLower);
      const inAreas = areasStr.toLowerCase().includes(cityLower);
      if (inCity || inLoc || inAreas) {
        locationScore = 1.0;
      } else {
        locationScore = 0.15;
      }
    }

    // 5. Urgency Handling
    let urgencyFactor = 1.0;
    if (intent.urgency) {
      const handles = (ngo.urgency_levels_handled || ngo.urgencyLevelsHandled || []).includes(intent.urgency);
      urgencyFactor = handles ? 1.15 : 0.90;
    }

    // 6. Rating boost
    const ratingBoost = ((ngo.rating || 4.5) / 5.0) * 0.10;

    // Composite NLP Relevance (0 to 100)
    let totalScore = (
      (tokenScore * 0.40) +
      (intentScore * 0.35) +
      (locationScore * 0.15) +
      ratingBoost
    ) * urgencyFactor;

    if (isDirectMatch) totalScore = Math.max(totalScore, 0.85);

    const relevancePercent = Math.min(Math.round(totalScore * 100), 99);

    return {
      ...ngo,
      nlpRelevance: relevancePercent,
      isRelevant: isDirectMatch || tokenHits > 0 || (intent.category && intentScore > 0.5) || (intent.location && locationScore > 0.8)
    };
  });

  // Filter out completely irrelevant NGOs, then apply optional strict dropdown filters if active
  return scoredNGOs
    .filter(ngo => {
      if (!ngo.isRelevant && ngo.nlpRelevance < 30) return false;

      const sectorsList = Array.isArray(ngo.sectors) ? ngo.sectors : [];
      const helpsList = Array.isArray(ngo.helps) ? ngo.helps : [];
      const areasList = Array.isArray(ngo.areas_served) ? ngo.areas_served : [];

      const matchesSector =
        filterSector === 'All' ||
        (ngo.category || '').toLowerCase().includes(filterSector.toLowerCase()) ||
        sectorsList.some(s => s.toLowerCase().includes(filterSector.toLowerCase())) ||
        helpsList.some(h => h.toLowerCase().includes(filterSector.toLowerCase()));

      const matchesCity =
        filterCity === '' ||
        (ngo.city || '').toLowerCase() === filterCity.toLowerCase() ||
        (ngo.location || '').toLowerCase().includes(filterCity.toLowerCase()) ||
        areasList.some(a => a.toLowerCase().includes(filterCity.toLowerCase()));

      return matchesSector && matchesCity;
    })
    .sort((a, b) => (b.nlpRelevance || 0) - (a.nlpRelevance || 0));
}
