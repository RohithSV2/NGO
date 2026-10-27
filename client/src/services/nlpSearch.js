/**
 * AidConnect NLP Semantic Search Engine
 * Powered by VectorSpaceModel, Porter Stemmer, NER, and TF-IDF Cosine Similarity
 */

import {
  extractEntitiesAndIntent,
  processTokens,
  VectorSpaceModel,
  STOPWORDS,
  LOCATION_ENTITIES,
  CATEGORY_TAXONOMY,
  URGENCY_LEXICON
} from './completeNLP';

export {
  extractEntitiesAndIntent,
  processTokens,
  VectorSpaceModel,
  STOPWORDS,
  LOCATION_ENTITIES,
  CATEGORY_TAXONOMY,
  URGENCY_LEXICON
};

// VSM Cache to avoid re-indexing static list on every keystroke
let cachedVSM = null;
let cachedNGOsRef = null;

export function getVectorSpaceModel(ngos) {
  if (cachedVSM && cachedNGOsRef === ngos) {
    return cachedVSM;
  }
  cachedVSM = new VectorSpaceModel(ngos);
  cachedNGOsRef = ngos;
  return cachedVSM;
}

/**
 * Parses natural language search query and extracts semantic intents and entities.
 */
export function parseSearchIntent(query) {
  if (!query || query.trim() === '') return null;
  const analysis = extractEntitiesAndIntent(query);
  const locationStr = analysis.detectedLocation ? analysis.detectedLocation.standard : null;
  const isNaturalLanguage = analysis.tokens.length >= 2 || Boolean(analysis.primaryCategory !== 'General Aid' || locationStr);

  return {
    rawQuery: query,
    tokens: analysis.tokens,
    stemmedTokens: analysis.stemmedTokens,
    category: analysis.primaryCategory !== 'General Aid' ? analysis.primaryCategory : null,
    location: locationStr,
    urgency: analysis.detectedUrgency !== 'Medium' ? analysis.detectedUrgency : (analysis.rawText.toLowerCase().includes('medium') ? 'Medium' : null),
    confidence: analysis.confidence,
    isNaturalLanguage
  };
}

/**
 * Tokenizes raw text into clean meaningful tokens.
 */
export function tokenizeText(text) {
  const { filteredTokens } = processTokens(text);
  return filteredTokens;
}

/**
 * Performs Semantic NLP search and ranks NGOs according to multi-dimensional relevance.
 */
export function semanticNLPSearch(ngos, query, filterSector = 'All', filterCity = '') {
  if (!ngos || ngos.length === 0) return [];
  const vsm = getVectorSpaceModel(ngos);
  return vsm.rank(query, filterSector, filterCity);
}
