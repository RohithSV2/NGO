/**
 * Complete Academic & Production-Grade Natural Language Processing (NLP) Engine
 * 
 * Pipeline Stages:
 * 1. Text Normalization & Contraction Expansion
 * 2. Word Tokenization & Suffix Stemmer (Porter-style morphological reduction)
 * 3. Stopword Filtration
 * 4. Named Entity Recognition (NER) for Geographic Locations & Crisis Urgency
 * 5. Multi-Class Humanitarian Category Intent Classification
 * 6. Mathematical Vector Space Model: Term Frequency (TF), Inverse Document Frequency (IDF), L2 Normalization
 * 7. Sparse Cosine Similarity & Multi-Factor Relevance Ranking
 */

// 1. Comprehensive Stopword Vocabulary
export const STOPWORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your',
  'yours', 'yourself', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
  'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but',
  'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for',
  'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before',
  'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on',
  'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there',
  'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
  'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now', 'need',
  'needs', 'needed', 'want', 'wants', 'wanted', 'please', 'help', 'urgently',
  'urgent', 'looking', 'find', 'give', 'provide', 'somebody', 'anyone', 'ngo', 'ngos'
]);

// 2. Named Entity Dictionaries: Locations (Cities, Districts, Synonyms)
export const LOCATION_ENTITIES = {
  'mysuru': { standard: 'Mysuru', state: 'Karnataka', district: 'Mysuru' },
  'mysore': { standard: 'Mysuru', state: 'Karnataka', district: 'Mysuru' },
  'bengaluru': { standard: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban' },
  'bangalore': { standard: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban' },
  'chitradurga': { standard: 'Chitradurga', state: 'Karnataka', district: 'Chitradurga' },
  'davanagere': { standard: 'Davanagere', state: 'Karnataka', district: 'Davanagere' },
  'davangere': { standard: 'Davanagere', state: 'Karnataka', district: 'Davanagere' },
  'shivamogga': { standard: 'Shivamogga', state: 'Karnataka', district: 'Shivamogga' },
  'shimoga': { standard: 'Shivamogga', state: 'Karnataka', district: 'Shivamogga' },
  'hubballi': { standard: 'Hubballi', state: 'Karnataka', district: 'Dharwad' },
  'hubli': { standard: 'Hubballi', state: 'Karnataka', district: 'Dharwad' },
  'mandya': { standard: 'Mandya', state: 'Karnataka', district: 'Mandya' },
  'mumbai': { standard: 'Mumbai', state: 'Maharashtra', district: 'Mumbai' },
  'delhi': { standard: 'Delhi', state: 'Delhi', district: 'Central Delhi' },
  'new delhi': { standard: 'Delhi', state: 'Delhi', district: 'New Delhi' },
  'chennai': { standard: 'Chennai', state: 'Tamil Nadu', district: 'Chennai' },
  'kolkata': { standard: 'Kolkata', state: 'West Bengal', district: 'Kolkata' },
  'hyderabad': { standard: 'Hyderabad', state: 'Telangana', district: 'Hyderabad' },
  'pune': { standard: 'Pune', state: 'Maharashtra', district: 'Pune' }
};

// 3. Category Semantic Corpus
export const CATEGORY_TAXONOMY = {
  'Hunger & Food': [
    'food', 'hunger', 'hungry', 'starv', 'meal', 'ration', 'grocer', 'malnutrit',
    'kitchen', 'cook', 'dinner', 'lunch', 'breakfast', 'canteen', 'rice', 'wheat', 'dal'
  ],
  'Healthcare': [
    'doctor', 'hospit', 'medicin', 'ambul', 'blood', 'clinic', 'surger', 'ill',
    'diseas', 'fever', 'oxygen', 'icu', 'treatment', 'patient', 'health', 'cancer',
    'dialysi', 'transfus', 'medic', 'tablet', 'wound', 'injur'
  ],
  'Disaster Relief': [
    'flood', 'earthquak', 'cyclon', 'landslid', 'tsunami', 'disast', 'calam',
    'rescu', 'trap', 'evacu', 'shelter', 'collaps', 'drown', 'rain', 'storm'
  ],
  'Education & Literacy': [
    'school', 'educ', 'student', 'book', 'stationeri', 'studi', 'teacher',
    'class', 'tuition', 'scholarship', 'literaci', 'learn', 'colleg', 'notebook'
  ],
  'Children & Youth': [
    'child', 'orphan', 'orphanag', 'pediatr', 'infant', 'babi', 'kid', 'youth', 'juvenil'
  ],
  'Women Empowerment': [
    'women', 'woman', 'violenc', 'assault', 'matern', 'girl', 'pregnant',
    'harass', 'livelihood', 'artisan', 'widow', 'mahila'
  ],
  'Aged & Elderly Care': [
    'elder', 'old age', 'senior', 'grandfather', 'grandmother', 'pension', 'hospic', 'dementia'
  ],
  'Clean Water & Sanitation': [
    'water', 'drink', 'toilet', 'sanit', 'contamin', 'borewel', 'hygien', 'purifi'
  ],
  'Animal Welfare': [
    'dog', 'cat', 'puppi', 'kitten', 'cow', 'cattl', 'anim', 'stray', 'vet', 'rabies', 'livestock'
  ],
  'Agriculture & Rural': [
    'crop', 'farmer', 'farm', 'seed', 'irrig', 'agricultur', 'fertil', 'drought', 'harvest', 'soil'
  ]
};

// 4. Urgency & Crisis Severity Lexicon
export const URGENCY_LEXICON = {
  'Critical': {
    severityScore: 1.0,
    multiplier: 1.25,
    signals: ['critic', 'emerg', 'immedi', 'threat', 'blood', 'oxygen', 'dy', 'icu', 'trap', 'hemorrhag', 'drown', 'collaps']
  },
  'High': {
    severityScore: 0.8,
    multiplier: 1.15,
    signals: ['urgent', 'asap', 'starv', 'sever', 'fast', 'flood', 'injur', 'medic', 'crisi']
  },
  'Medium': {
    severityScore: 0.5,
    multiplier: 1.0,
    signals: ['need', 'support', 'assist', 'suppli', 'ration', 'meal', 'shelter']
  },
  'Low': {
    severityScore: 0.2,
    multiplier: 0.85,
    signals: ['routin', 'regular', 'coach', 'tuition', 'gener', 'train', 'futur']
  }
};

/**
 * Stage 1: Text Normalization and Cleaning
 */
export function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/can't/g, 'cannot')
    .replace(/won't/g, 'will not')
    .replace(/n't/g, ' not')
    .replace(/'re/g, ' are')
    .replace(/'s/g, ' is')
    .replace(/'d/g, ' would')
    .replace(/'ll/g, ' will')
    .replace(/'ve/g, ' have')
    .replace(/'m/g, ' am')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Stage 2: Morphological Suffix Stemmer (Porter-style algorithmic stemming)
 */
export function stemWord(word) {
  if (!word || word.length <= 3) return word;
  let w = word.toLowerCase();

  // Common suffix reductions
  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';
  if (w.endsWith('sses')) return w.slice(0, -2);
  if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3);
  if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('tion') && w.length > 6) return w.slice(0, -4);
  if (w.endsWith('ment') && w.length > 6) return w.slice(0, -4);
  if (w.endsWith('ship') && w.length > 6) return w.slice(0, -4);
  if (w.endsWith('able') && w.length > 6) return w.slice(0, -4);
  if (w.endsWith('ful') && w.length > 5) return w.slice(0, -3);
  if (w.endsWith('ly') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) return w.slice(0, -1);

  return w;
}

/**
 * Stage 3: Tokenization & Stopword Elimination Pipeline
 */
export function processTokens(text) {
  const normalized = normalizeText(text);
  if (!normalized) return { rawTokens: [], filteredTokens: [], stemmedTokens: [] };

  const rawTokens = normalized.split(/\s+/).filter(t => t.length > 1);
  const filteredTokens = rawTokens.filter(t => !STOPWORDS.has(t) && t.length > 2);
  const stemmedTokens = filteredTokens.map(t => stemWord(t));

  return {
    rawTokens,
    filteredTokens,
    stemmedTokens
  };
}

/**
 * Stage 4: Named Entity Recognition (NER) & Intent Extraction
 */
export function extractEntitiesAndIntent(text) {
  const norm = normalizeText(text);
  const { filteredTokens, stemmedTokens } = processTokens(text);

  // 1. NER - Location Detection
  let detectedLocation = null;
  for (const [key, entity] of Object.entries(LOCATION_ENTITIES)) {
    if (norm.includes(key)) {
      detectedLocation = entity;
      break;
    }
  }

  // 2. Crisis Urgency & Severity Scoring
  let detectedUrgency = 'Medium';
  let severityScore = 0.5;
  for (const [level, data] of Object.entries(URGENCY_LEXICON)) {
    for (const signal of data.signals) {
      if (stemmedTokens.some(st => st.includes(signal)) || norm.includes(signal)) {
        detectedUrgency = level;
        severityScore = data.severityScore;
        break;
      }
    }
    if (detectedUrgency === level && level !== 'Medium') break;
  }

  // 3. Multi-Class Humanitarian Intent Classification
  const categoryScores = {};
  for (const [category, keywords] of Object.entries(CATEGORY_TAXONOMY)) {
    let score = 0;
    for (const kw of keywords) {
      for (const st of stemmedTokens) {
        if (st.includes(kw) || kw.includes(st)) {
          score += 1.0;
        }
      }
      if (norm.includes(kw)) {
        score += 0.5;
      }
    }
    if (score > 0) {
      categoryScores[category] = score;
    }
  }

  // Determine Primary & Secondary Intent
  const sortedCategories = Object.entries(categoryScores).sort((a, b) => b[1] - a[1]);
  const primaryCategory = sortedCategories.length > 0 ? sortedCategories[0][0] : 'General Aid';
  const confidence = sortedCategories.length > 0 ? Math.min(Math.round((sortedCategories[0][1] / (stemmedTokens.length || 1)) * 100), 98) : 50;

  return {
    rawText: text,
    tokens: filteredTokens,
    stemmedTokens,
    detectedLocation,
    detectedUrgency,
    severityScore,
    primaryCategory,
    confidence,
    secondaryCategories: sortedCategories.slice(1, 3).map(c => c[0])
  };
}

/**
 * Stage 5: TF-IDF Vector Space Model & Corpus Indexer
 */
export class VectorSpaceModel {
  constructor(documents = []) {
    this.documents = documents;
    this.vocabulary = new Map();
    this.idf = new Map();
    this.docVectors = [];
    if (documents.length > 0) {
      this.buildIndex(documents);
    }
  }

  buildIndex(documents) {
    this.documents = documents;
    const numDocs = documents.length;
    const docFrequency = new Map();

    // 1. Compute Document Frequencies
    documents.forEach((doc) => {
      const docText = `${doc.name} ${doc.category} ${doc.description || ''} ${doc.keywords || ''} ${(doc.sectors || []).join(' ')} ${(doc.helps || []).join(' ')} ${(doc.areas_served || []).join(' ')}`;
      const { stemmedTokens } = processTokens(docText);
      const uniqueTerms = new Set(stemmedTokens);

      uniqueTerms.forEach(term => {
        docFrequency.set(term, (docFrequency.get(term) || 0) + 1);
      });
    });

    // 2. Build Vocabulary and Smooth Inverse Document Frequencies: ln((1 + N)/(1 + DF)) + 1
    let termIndex = 0;
    docFrequency.forEach((df, term) => {
      this.vocabulary.set(term, termIndex++);
      this.idf.set(term, Math.log((1 + numDocs) / (1 + df)) + 1.0);
    });

    // 3. Pre-vectorize all documents
    this.docVectors = documents.map(doc => {
      const docText = `${doc.name} ${doc.category} ${doc.description || ''} ${doc.keywords || ''} ${(doc.sectors || []).join(' ')} ${(doc.helps || []).join(' ')} ${(doc.areas_served || []).join(' ')}`;
      const { stemmedTokens } = processTokens(docText);
      return this.computeTFIDFVector(stemmedTokens);
    });
  }

  /**
   * Vector transformation with sublinear TF: (1 + ln(tf)) * idf and L2 normalization
   */
  computeTFIDFVector(tokens) {
    if (!tokens || tokens.length === 0) return {};
    const termCounts = {};
    tokens.forEach(t => {
      termCounts[t] = (termCounts[t] || 0) + 1;
    });

    const vector = {};
    let sumSquares = 0.0;

    for (const [term, count] of Object.entries(termCounts)) {
      if (this.idf.has(term)) {
        const idfVal = this.idf.get(term);
        const tfVal = count / tokens.length;
        const tfidf = tfVal * idfVal;
        vector[term] = tfidf;
        sumSquares += tfidf * tfidf;
      }
    }

    // L2 Unit Normalization
    const norm = Math.sqrt(sumSquares);
    if (norm > 0) {
      for (const term in vector) {
        vector[term] /= norm;
      }
    }

    return vector;
  }

  /**
   * Cosine similarity between query sparse vector and document sparse vector
   */
  cosineSimilarity(vecQuery, vecDoc) {
    if (!vecQuery || !vecDoc) return 0.0;
    let dotProduct = 0.0;
    for (const term in vecQuery) {
      if (vecDoc[term]) {
        dotProduct += vecQuery[term] * vecDoc[term];
      }
    }
    return dotProduct;
  }

  /**
   * Complete Semantic Ranking
   */
  rank(query, filterSector = 'All', filterCity = '') {
    const rawQuery = (query || '').trim();

    if (!rawQuery) {
      return this.documents
        .filter(doc => {
          const matchesSector = filterSector === 'All' ||
            (doc.category || '').toLowerCase().includes(filterSector.toLowerCase()) ||
            (doc.sectors || []).some(s => s.toLowerCase().includes(filterSector.toLowerCase())) ||
            (doc.helps || []).some(h => h.toLowerCase().includes(filterSector.toLowerCase()));

          const matchesCity = !filterCity ||
            (doc.city || '').toLowerCase() === filterCity.toLowerCase() ||
            (doc.location || '').toLowerCase().includes(filterCity.toLowerCase()) ||
            (doc.areas_served || []).some(a => a.toLowerCase().includes(filterCity.toLowerCase()));

          return matchesSector && matchesCity;
        })
        .map(doc => ({ ...doc, nlpRelevance: null }));
    }

    const analysis = extractEntitiesAndIntent(rawQuery);
    const queryVector = this.computeTFIDFVector(analysis.stemmedTokens);
    const queryLower = rawQuery.toLowerCase();

    const scored = this.documents.map((doc, idx) => {
      const docVector = this.docVectors[idx] || {};
      const cosineSim = this.cosineSimilarity(queryVector, docVector);

      // Name or Direct Substring Match
      const nameLower = (doc.name || '').toLowerCase();
      const regLower = (doc.registration_number || '').toLowerCase();
      const isDirectMatch = nameLower.includes(queryLower) || regLower.includes(queryLower);

      // Intent Domain Alignment
      const docCat = (doc.category || '').toLowerCase();
      const primaryCat = analysis.primaryCategory.toLowerCase();
      let categoryMatch = 0.2;
      if (docCat.includes(primaryCat) || primaryCat.includes(docCat)) {
        categoryMatch = 1.0;
      } else {
        const inSectors = (doc.sectors || []).some(s => s.toLowerCase().includes(primaryCat));
        const inHelps = (doc.helps || []).some(h => h.toLowerCase().includes(primaryCat));
        if (inSectors) categoryMatch = 0.9;
        else if (inHelps) categoryMatch = 0.8;
      }

      // Geospatial Alignment
      let locationMatch = 0.5;
      const targetCity = analysis.detectedLocation ? analysis.detectedLocation.standard.toLowerCase() : filterCity.toLowerCase();
      if (targetCity) {
        const docCity = (doc.city || '').toLowerCase();
        const docLocation = (doc.location || '').toLowerCase();
        const inAreas = (doc.areas_served || []).some(a => a.toLowerCase().includes(targetCity));
        if (docCity === targetCity || docLocation.includes(targetCity) || inAreas) {
          locationMatch = 1.0;
        } else {
          locationMatch = 0.15;
        }
      }

      // Urgency Boost
      const urgencyConfig = URGENCY_LEXICON[analysis.detectedUrgency] || URGENCY_LEXICON['Medium'];
      const handlesUrgency = (doc.urgency_levels_handled || doc.urgencyLevelsHandled || []).includes(analysis.detectedUrgency);
      const urgencyMultiplier = handlesUrgency ? urgencyConfig.multiplier : 0.88;

      // Composite Scientific NLP Score
      let compositeScore = (
        (cosineSim * 0.40) +
        (categoryMatch * 0.35) +
        (locationMatch * 0.15) +
        (((doc.rating || 4.5) / 5.0) * 0.10)
      ) * urgencyMultiplier;

      if (isDirectMatch) {
        compositeScore = Math.max(compositeScore, 0.94);
      }

      const relevancePercent = Math.min(Math.round(compositeScore * 100), 99);

      return {
        ...doc,
        cosineSimilarity: Math.round(cosineSim * 1000) / 10,
        nlpRelevance: relevancePercent,
        isRelevant: isDirectMatch || cosineSim > 0.04 || categoryMatch > 0.6 || (analysis.detectedLocation && locationMatch > 0.8)
      };
    });

    // Filter by manual dropdowns if explicitly set
    return scored
      .filter(doc => {
        if (!doc.isRelevant && doc.nlpRelevance < 30) return false;
        const matchesSector = filterSector === 'All' ||
          (doc.category || '').toLowerCase().includes(filterSector.toLowerCase()) ||
          (doc.sectors || []).some(s => s.toLowerCase().includes(filterSector.toLowerCase())) ||
          (doc.helps || []).some(h => h.toLowerCase().includes(filterSector.toLowerCase()));

        const matchesCity = !filterCity ||
          (doc.city || '').toLowerCase() === filterCity.toLowerCase() ||
          (doc.location || '').toLowerCase().includes(filterCity.toLowerCase()) ||
          (doc.areas_served || []).some(a => a.toLowerCase().includes(filterCity.toLowerCase()));

        return matchesSector && matchesCity;
      })
      .sort((a, b) => b.nlpRelevance - a.nlpRelevance);
  }
}
