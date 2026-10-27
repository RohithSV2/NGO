"""
Aid Request Prediction & Matching Engine
Ranks NGOs for an incoming aid request using multi-factor NLP and heuristic scoring.
Can be invoked programmatically or via CLI with a JSON argument.
"""

import sys
import json
import os

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from data_preprocessing import load_ngos_dataset
from nlp.text_preprocessing import tokenize_and_filter
from nlp.feature_extraction import TFIDFExtractor, cosine_similarity
from nlp.request_parser import parse_aid_request

class NGOMatcher:
    def __init__(self, dataset_path=None):
        self.ngos = load_ngos_dataset(dataset_path) if dataset_path else load_ngos_dataset()
        self.tfidf = TFIDFExtractor()
        # Train TF-IDF on all NGO documents
        tokenized_docs = [ngo['tokens'] for ngo in self.ngos]
        self.tfidf.fit(tokenized_docs)
        self.ngo_vectors = [self.tfidf.transform(tokens) for tokens in tokenized_docs]

    def match(self, request_data: dict, top_k: int = 5) -> list[dict]:
        """
        Ranks NGOs for an incoming request dictionary.
        Keys accepted: title, description, category, city, urgency
        """
        title = request_data.get('title', '')
        description = request_data.get('description', '')
        category_hint = request_data.get('category', '')
        city_hint = request_data.get('city', '')

        parsed = parse_aid_request(title, description, category_hint, city_hint)
        req_vector = self.tfidf.transform(parsed['tokens'])

        scored_results = []
        for idx, ngo in enumerate(self.ngos):
            # 1. NLP Content Cosine Similarity (0.0 to 1.0)
            text_sim = cosine_similarity(req_vector, self.ngo_vectors[idx])

            # 2. Category / Sector Matching Score (0.0 to 1.0)
            cat_match = 0.3
            req_cat = (parsed['category'] or '').lower().strip()
            ngo_cat = (ngo.get('category') or '').lower().strip()
            ngo_sectors = [s.lower() for s in ngo.get('sectors', [])]
            ngo_helps = [h.lower() for h in ngo.get('helps', [])]

            if req_cat and req_cat != 'general aid':
                if req_cat in ngo_cat or ngo_cat in req_cat or any(req_cat in s or s in req_cat for s in ngo_sectors):
                    cat_match = 1.0
                elif any(req_cat in h or h in req_cat for h in ngo_helps):
                    cat_match = 0.85
                elif any(token in ngo_cat or any(token in s for s in ngo_sectors) for token in parsed['tokens']):
                    cat_match = 0.70

            # 3. Location Matching Score (0.0 to 1.0)
            loc_match = 0.5  # Neutral if request has no specified city
            req_city = (parsed['city'] or '').lower().strip()
            if req_city:
                ngo_city = (ngo.get('city') or '').lower().strip()
                ngo_loc = (ngo.get('location') or '').lower().strip()
                ngo_areas = [a.lower() for a in ngo.get('areas_served', [])]

                if req_city in ngo_city or req_city in ngo_loc or any(req_city in a for a in ngo_areas):
                    loc_match = 1.0
                else:
                    loc_match = 0.2

            # 4. Rating Factor (scaled 0.0 to 1.0 from rating out of 5, neutral 0.8 if unrated)
            rating_val = ngo.get('rating')
            rating_factor = min(float(rating_val) / 5.0, 1.0) if rating_val is not None else 0.8

            # 5. Urgency Capability Match
            urgency_levels = ngo.get('urgency_levels_handled', ['Low', 'Medium', 'High', 'Critical'])
            urgency_boost = 1.0
            if parsed['urgency'] in urgency_levels:
                urgency_boost = 1.15
            elif parsed['urgency'] == 'Critical' and 'Critical' not in urgency_levels:
                urgency_boost = 0.85

            # Weighted Hybrid Score
            # 50% Text similarity + 25% Category/Sector match + 15% Location match + 10% Rating
            base_score = (
                (0.50 * text_sim) +
                (0.25 * cat_match) +
                (0.15 * loc_match) +
                (0.10 * rating_factor)
            )

            final_score = min(base_score * urgency_boost, 1.0)
            confidence_pct = round(final_score * 100, 1)

            scored_results.append({
                'ngo_id': ngo.get('id', idx + 1),
                'name': ngo['name'],
                'registration_number': ngo.get('registration_number', ''),
                'category': ngo.get('category', 'General Aid'),
                'sectors': ngo.get('sectors', []),
                'helps': ngo.get('helps', []),
                'services': ngo.get('services', []),
                'areas_served': ngo.get('areas_served', []),
                'city': ngo.get('city', ''),
                'state': ngo.get('state', 'Karnataka'),
                'location': ngo.get('location', ''),
                'rating': ngo.get('rating'),
                'contact_phone': ngo.get('contact_phone', ''),
                'contact_email': ngo.get('contact_email', ''),
                'website': ngo.get('website', ''),
                'social_media': ngo.get('social_media', {}),
                'description': ngo.get('description', ''),
                'match_score': confidence_pct,
                'breakdown': {
                    'text_similarity': round(text_sim * 100, 1),
                    'category_match': round(cat_match * 100, 1),
                    'location_match': round(loc_match * 100, 1),
                    'urgency_handling': parsed['urgency'] in urgency_levels
                }
            })

        # Sort descending by match score
        scored_results.sort(key=lambda x: x['match_score'], reverse=True)
        return scored_results[:top_k]

# Standalone CLI execution
if __name__ == '__main__':
    matcher = NGOMatcher()
    if len(sys.argv) > 1:
        try:
            input_json = sys.argv[1]
            data = json.loads(input_json)
        except Exception:
            data = {'title': ' '.join(sys.argv[1:]), 'description': ''}
    else:
        # Default test case
        data = {
            'title': 'School books and education aid for rural students',
            'description': 'Underprivileged children in Mysore needing books, tuition, and literacy guidance.',
            'category': 'Education & Literacy',
            'city': 'Mysore'
        }

    matches = matcher.match(data, top_k=5)
    print(json.dumps(matches, indent=2))
