"""
Dataset Loading and Preprocessing Module
Reads NGOs from JSON files in `data/` or `ngos.csv`, handles schema variations,
tokenizes metadata, and prepares clean records for TF-IDF vectorization and matching.
"""

import os
import sys
import json
import glob
import csv
from typing import List, Dict, Any

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

try:
    from .nlp.text_preprocessing import clean_text, tokenize_and_filter
except Exception:
    from nlp.text_preprocessing import clean_text, tokenize_and_filter

BASE_DIR = os.path.dirname(os.path.dirname(CURRENT_DIR))
DATA_DIR = os.path.join(BASE_DIR, 'data')
CSV_PATH = os.path.join(os.path.dirname(CURRENT_DIR), 'dataset', 'ngos.csv')

def load_from_json_files() -> List[Dict[str, Any]]:
    """Loads and normalizes NGOs directly from all JSON files in data/."""
    json_files = sorted(glob.glob(os.path.join(DATA_DIR, '*.json')))
    if not json_files:
        return []

    records = []
    seen = set()
    for file_path in json_files:
        base_name = os.path.splitext(os.path.basename(file_path))[0].lower()
        if 'mysore' in base_name:
            default_city = 'Mysore'
        elif 'chitradurga' in base_name:
            default_city = 'Chitradurga'
        elif 'davanagere' in base_name:
            default_city = 'Davanagere'
        elif 'shivamogga' in base_name or 'shimoga' in base_name:
            default_city = 'Shivamogga'
        else:
            default_city = base_name.capitalize()

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = json.load(f)
            items = content.get('ngos', []) if isinstance(content, dict) else content
            for raw in items:
                name = str(raw.get('name') or '').strip()
                name_key = name.lower()
                if not name or name_key in seen:
                    continue
                seen.add(name_key)

                reg_number = str(raw.get('registration_number') or '').strip()
                raw_loc = str(raw.get('location') or '').strip()
                location = raw_loc if raw_loc else f"{default_city}, Karnataka"

                # Normalize phone and email
                raw_p = raw.get('phone') or []
                phones = [str(p).strip() for p in raw_p if p and str(p).strip()] if isinstance(raw_p, list) else ([str(raw_p).strip()] if str(raw_p).strip() else [])
                raw_e = raw.get('email') or []
                emails = [str(e).strip() for e in raw_e if e and str(e).strip()] if isinstance(raw_e, list) else ([str(raw_e).strip()] if str(raw_e).strip() else [])

                # Lists
                helps = [str(h).strip() for h in (raw.get('helps') or []) if h and str(h).strip()]
                sectors = [str(s).strip() for s in (raw.get('sectors') or []) if s and str(s).strip()]
                services = [str(s).strip() for s in (raw.get('services') or []) if s and str(s).strip()]
                areas_served = [str(a).strip() for a in (raw.get('areas_served') or []) if a and str(a).strip()]

                desc = str(raw.get('description') or '').strip()
                if not desc:
                    sector_str = ", ".join(sectors[:3]) if sectors else "community development"
                    helps_str = ", ".join(helps[:3]) if helps else "local communities"
                    desc = f"{name} is an NGO in {location} dedicated to {sector_str}, supporting {helps_str}."

                category = sectors[0] if sectors else "General Aid"

                full_text = f"{name} {category} {' '.join(sectors)} {' '.join(helps)} {' '.join(services)} {location} {desc}"
                tokens = tokenize_and_filter(full_text)

                sm = raw.get('social_media') or {}
                social_media = {
                    'facebook': str(sm.get('facebook') or ''),
                    'instagram': str(sm.get('instagram') or ''),
                    'linkedin': str(sm.get('linkedin') or ''),
                    'twitter': str(sm.get('twitter') or ''),
                    'youtube': str(sm.get('youtube') or '')
                } if isinstance(sm, dict) else {'facebook': '', 'instagram': '', 'linkedin': '', 'twitter': '', 'youtube': ''}

                records.append({
                    'id': len(records) + 1,
                    'name': name,
                    'registration_number': reg_number,
                    'category': category,
                    'sectors': sectors,
                    'helps': helps,
                    'services': services,
                    'areas_served': areas_served,
                    'city': default_city,
                    'state': 'Karnataka',
                    'location': location,
                    'description': desc,
                    'capacity': int(raw.get('capacity', 1000) or 1000),
                    'urgency_levels_handled': ['Low', 'Medium', 'High', 'Critical'],
                    'verified': True,
                    'rating': float(raw.get('rating')) if raw.get('rating') is not None else None,
                    'ratingCount': int(raw.get('ratingCount', 0) or 0),
                    'contact_phone': phones[0] if phones else '',
                    'contact_email': emails[0] if emails else '',
                    'phone': phones,
                    'email': emails,
                    'website': str(raw.get('website') or '').strip(),
                    'social_media': social_media,
                    'sources': raw.get('sources') or [],
                    'tokens': tokens,
                    'searchable_text': clean_text(full_text)
                })
        except Exception as e:
            print(f"[Warning] Error reading {file_path}: {e}")

    return records

def load_from_csv(csv_path: str) -> List[Dict[str, Any]]:
    """Loads records from ngos.csv."""
    records = []
    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            sectors = [s.strip() for s in (row.get('sectors') or '').split(';') if s.strip()]
            helps = [h.strip() for h in (row.get('helps') or '').split(';') if h.strip()]
            services = [s.strip() for s in (row.get('services') or '').split(';') if s.strip()]
            areas = [a.strip() for a in (row.get('areas_served') or '').split(';') if a.strip()]

            full_text = f"{row.get('name', '')} {row.get('category', '')} {' '.join(sectors)} {' '.join(helps)} {' '.join(services)} {row.get('location', '')} {row.get('description', '')}"
            tokens = tokenize_and_filter(full_text)

            urgency_levels = [u.strip() for u in (row.get('urgency_levels_handled') or 'Low,Medium,High,Critical').split(',') if u.strip()]

            phone = row.get('contact_phone', '').strip()
            email = row.get('contact_email', '').strip()

            records.append({
                'id': int(row.get('id', len(records) + 1)),
                'name': row.get('name', '').strip(),
                'registration_number': row.get('registration_number', '').strip(),
                'category': row.get('category', '').strip() or (sectors[0] if sectors else 'General Aid'),
                'sectors': sectors,
                'helps': helps,
                'services': services,
                'areas_served': areas,
                'city': row.get('city', '').strip(),
                'state': row.get('state', '').strip(),
                'location': row.get('location', '').strip(),
                'description': row.get('description', '').strip(),
                'capacity': int(row.get('capacity', 1000) or 1000),
                'urgency_levels_handled': urgency_levels,
                'verified': str(row.get('verified', 'true')).lower() in ('true', '1', 'yes'),
                'rating': float(row.get('rating')) if row.get('rating') else None,
                'ratingCount': int(row.get('ratingCount', 0) or 0),
                'contact_phone': phone,
                'contact_email': email,
                'phone': [phone] if phone else [],
                'email': [email] if email else [],
                'website': row.get('website', '').strip(),
                'social_media': {
                    'facebook': row.get('facebook', ''),
                    'instagram': row.get('instagram', ''),
                    'linkedin': row.get('linkedin', ''),
                    'twitter': row.get('twitter', ''),
                    'youtube': row.get('youtube', '')
                },
                'tokens': tokens,
                'searchable_text': clean_text(full_text)
            })
    return records

def load_ngos_dataset(filepath: str = None) -> List[Dict[str, Any]]:
    """Loads NGO records from JSON files first; falls back to CSV."""
    if filepath and os.path.exists(filepath):
        if filepath.endswith('.csv'):
            return load_from_csv(filepath)
        elif filepath.endswith('.json'):
            return load_from_json_files()

    # Try JSON files
    json_records = load_from_json_files()
    if json_records:
        return json_records

    # Fallback to CSV
    if os.path.exists(CSV_PATH):
        return load_from_csv(CSV_PATH)

    raise FileNotFoundError("No NGO dataset found in data/ or dataset/ngos.csv")
