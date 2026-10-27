#!/usr/bin/env python3
"""
MongoDB Population Script for NGO Matching System
Populates MongoDB with NGOs from all JSON files in the `data/` directory.

Handles schema variations:
- Previous JSON (mysore.json): missing social_media, phone/email None values, empty descriptions.
- Newly added JSONs (Chitradurga, Davanagere, Shivamogga): differing presence of social_media, varying keys.
- Normalizes all documents into a unified, high-integrity schema for MongoDB, ML, and frontend operations.
"""

import os
import sys
import glob
import json
import re
from typing import List, Dict, Any
from dotenv import load_dotenv

try:
    from pymongo import MongoClient, TEXT
except ImportError:
    print("Error: 'pymongo' is not installed. Run 'pip install pymongo python-dotenv'")
    sys.exit(1)

# Root of the NGO-Matching-System project
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')

# Try loading .env from server/.env or root .env
for env_candidate in [os.path.join(BASE_DIR, 'server', '.env'), os.path.join(BASE_DIR, '.env')]:
    if os.path.exists(env_candidate):
        load_dotenv(env_candidate)
        print(f"Loaded environment variables from: {env_candidate}")

MONGO_URI = os.getenv('MONGO_URI') or os.getenv('MONGODB_URI') or 'mongodb://127.0.0.1:27017/ngo_platform'

from urllib.parse import urlparse

def get_db_name(uri: str) -> str:
    """Extracts database name from Mongo URI or defaults to 'test'."""
    parsed = urlparse(uri)
    path = parsed.path.lstrip('/')
    if path:
        return path.split('?')[0]
    return 'test'

def detect_district_from_filename(filepath: str) -> str:
    """Extracts standard district name from the JSON filename."""
    base = os.path.splitext(os.path.basename(filepath))[0].lower()
    if 'mysore' in base or 'mysuru' in base:
        return 'Mysore'
    if 'chitradurga' in base:
        return 'Chitradurga'
    if 'davanagere' in base or 'davangere' in base:
        return 'Davanagere'
    if 'shivamogga' in base or 'shimoga' in base:
        return 'Shivamogga'
    return os.path.splitext(os.path.basename(filepath))[0].capitalize()

def synthesize_description(name: str, location: str, sectors: List[str], helps: List[str], services: List[str]) -> str:
    """Synthesizes a descriptive summary for NGOs that lack descriptions (e.g. in mysore.json)."""
    sector_str = ", ".join(sectors[:3]) if sectors else "community welfare and social development"
    helps_str = ", ".join(helps[:3]) if helps else "underprivileged and vulnerable groups"
    service_str = f" offering {', '.join(services[:2])}" if services else ""
    return (
        f"{name} is a dedicated non-governmental organization located in {location}, "
        f"working actively in the areas of {sector_str}. The organization focuses on supporting {helps_str}{service_str} "
        f"to foster inclusive sustainable community development."
    )

def normalize_ngo_document(raw: Dict[str, Any], default_city: str) -> Dict[str, Any]:
    """
    Normalizes an NGO record from any source JSON into the unified schema.
    Guarantees all fields are present with correct types and fallbacks.
    """
    name = str(raw.get('name') or '').strip()
    reg_number = str(raw.get('registration_number') or '').strip()
    raw_location = str(raw.get('location') or '').strip()
    location = raw_location if raw_location else f"{default_city}, Karnataka"

    # Normalize phone list
    phone_val = raw.get('phone')
    if phone_val is None:
        phone_list = []
    elif isinstance(phone_val, list):
        phone_list = [str(p).strip() for p in phone_val if p and str(p).strip()]
    elif isinstance(phone_val, str) and phone_val.strip():
        phone_list = [phone_val.strip()]
    else:
        phone_list = []

    # Normalize email list
    email_val = raw.get('email')
    if email_val is None:
        email_list = []
    elif isinstance(email_val, list):
        email_list = [str(e).strip() for e in email_val if e and str(e).strip()]
    elif isinstance(email_val, str) and email_val.strip():
        email_list = [email_val.strip()]
    else:
        email_list = []

    # Website
    website = str(raw.get('website') or '').strip()

    # Social media normalization
    raw_social = raw.get('social_media')
    if isinstance(raw_social, dict):
        social_media = {
            'facebook': str(raw_social.get('facebook') or '').strip(),
            'instagram': str(raw_social.get('instagram') or '').strip(),
            'linkedin': str(raw_social.get('linkedin') or '').strip(),
            'twitter': str(raw_social.get('twitter') or '').strip(),
            'youtube': str(raw_social.get('youtube') or '').strip(),
        }
    else:
        social_media = {
            'facebook': '',
            'instagram': '',
            'linkedin': '',
            'twitter': '',
            'youtube': ''
        }

    # Lists
    helps = [str(h).strip() for h in (raw.get('helps') or []) if h and str(h).strip()]
    sectors = [str(s).strip() for s in (raw.get('sectors') or []) if s and str(s).strip()]
    services = [str(s).strip() for s in (raw.get('services') or []) if s and str(s).strip()]
    areas_served = [str(a).strip() for a in (raw.get('areas_served') or []) if a and str(a).strip()]
    if not areas_served and default_city:
        areas_served = [default_city]

    # Sources
    sources = [str(u).strip() for u in (raw.get('sources') or []) if u and str(u).strip()]

    # Description
    desc = str(raw.get('description') or '').strip()
    if not desc:
        desc = synthesize_description(name, location, sectors, helps, services)

    # City & State extraction
    city = default_city
    state = 'Karnataka'
    if 'Karnataka' in location:
        state = 'Karnataka'

    # Primary category mapping
    category = sectors[0] if sectors else "General Aid"

    # Convenience contact strings
    contact_phone = phone_list[0] if phone_list else ""
    contact_email = email_list[0] if email_list else ""

    # Keywords for fast search & ML TF-IDF
    keyword_tokens = set()
    for text_part in [name, category, location, default_city] + sectors + helps + services + areas_served:
        words = re.findall(r'[a-zA-Z]{3,}', text_part.lower())
        keyword_tokens.update(words)
    keywords = sorted(list(keyword_tokens))

    return {
        'name': name,
        'registration_number': reg_number,
        'location': location,
        'city': city,
        'state': state,
        'address': location,
        'category': category,
        'sectors': sectors,
        'helps': helps,
        'services': services,
        'areas_served': areas_served,
        'description': desc,
        'phone': phone_list,
        'email': email_list,
        'contactPhone': contact_phone,
        'contactEmail': contact_email,
        'website': website,
        'social_media': social_media,
        'sources': sources,
        'keywords': keywords,
        'capacity': int(raw.get('capacity', 1000) or 1000),
        'urgencyLevelsHandled': ['Low', 'Medium', 'High', 'Critical'],
        'verified': True,
        'rating': float(raw.get('rating')) if raw.get('rating') is not None else None,
        'ratingCount': int(raw.get('ratingCount', 0) or 0),
        'activeCases': 0,
        'resolvedCases': 0
    }

def load_all_json_ngos(data_dir: str) -> List[Dict[str, Any]]:
    """Loads and normalizes NGOs from all JSON files in data_dir."""
    json_files = sorted(glob.glob(os.path.join(data_dir, '*.json')))
    if not json_files:
        print(f"Warning: No JSON files found in {data_dir}")
        return []

    all_ngos = []
    seen_names = set()

    for file_path in json_files:
        district = detect_district_from_filename(file_path)
        print(f"Processing '{os.path.basename(file_path)}' (Default district: {district})...")
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = json.load(f)
            items = content.get('ngos', []) if isinstance(content, dict) else content
            count = 0
            for raw_item in items:
                normalized = normalize_ngo_document(raw_item, default_city=district)
                name_key = normalized['name'].lower()
                # Deduplicate by name if identical
                if name_key in seen_names:
                    continue
                seen_names.add(name_key)
                all_ngos.append(normalized)
                count += 1
            print(f"  -> Extracted {count} valid NGOs from {os.path.basename(file_path)}")
        except Exception as e:
            print(f"  [Error] Failed to parse {file_path}: {e}")

    print(f"\nTotal unique NGOs loaded across all JSON files: {len(all_ngos)}")
    return all_ngos

def populate_mongodb(ngos: List[Dict[str, Any]], uri: str) -> None:
    """Connects to MongoDB and populates the `ngos` collection."""
    db_name = get_db_name(uri)
    print(f"\nConnecting to MongoDB cluster...")
    print(f"  Target Database: '{db_name}'")
    print(f"  Target Collection: 'ngos'")

    client = MongoClient(uri, serverSelectionTimeoutMS=8000)
    db = client[db_name]
    collection = db['ngos']

    # Test connection
    client.admin.command('ping')
    print("  ✓ Connected successfully to MongoDB!")

    # Drop existing ngos collection to ensure clean state
    drop_res = collection.drop()
    print("  ✓ Cleared existing 'ngos' collection for clean schema population.")

    # Insert batch
    if ngos:
        insert_res = collection.insert_many(ngos)
        print(f"  ✓ Successfully inserted {len(insert_res.inserted_ids)} NGOs into MongoDB!")

        # Create indexes
        collection.create_index([
            ('name', TEXT),
            ('description', TEXT),
            ('sectors', TEXT),
            ('helps', TEXT),
            ('services', TEXT),
            ('location', TEXT),
            ('category', TEXT),
            ('city', TEXT)
        ], name='ngo_text_search_index')
        collection.create_index([('city', 1)])
        collection.create_index([('category', 1)])
        collection.create_index([('registration_number', 1)])
        print("  ✓ Created compound text and field indexes for ultra-fast query performance.")
    else:
        print("  No NGOs to insert.")

def export_to_csv(ngos: List[Dict[str, Any]]) -> None:
    """
    Synchronizes `ml/dataset/ngos.csv` with all populated NGOs
    so the ML training/prediction has access to the full dataset.
    """
    import csv

    csv_path = os.path.join(BASE_DIR, 'ml', 'dataset', 'ngos.csv')
    os.makedirs(os.path.dirname(csv_path), exist_ok=True)
    fieldnames = [
        'id', 'name', 'registration_number', 'category', 'sectors', 'helps',
        'city', 'state', 'location', 'description', 'keywords', 'capacity',
        'urgency_levels_handled', 'verified', 'rating', 'contact_phone',
        'contact_email', 'website', 'facebook', 'instagram', 'linkedin',
        'twitter', 'youtube', 'services', 'areas_served', 'sources'
    ]

    with open(csv_path, mode='w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for idx, ngo in enumerate(ngos, 1):
            writer.writerow({
                'id': idx,
                'name': ngo['name'],
                'registration_number': ngo['registration_number'],
                'category': ngo['category'],
                'sectors': "; ".join(ngo['sectors']),
                'helps': "; ".join(ngo['helps']),
                'city': ngo['city'],
                'state': ngo['state'],
                'location': ngo['location'],
                'description': ngo['description'],
                'keywords': " ".join(ngo['keywords'][:25]),
                'capacity': ngo['capacity'],
                'urgency_levels_handled': ",".join(ngo['urgencyLevelsHandled']),
                'verified': 'true' if ngo['verified'] else 'false',
                'rating': ngo['rating'] if ngo['rating'] is not None else '',
                'contact_phone': ngo['contactPhone'],
                'contact_email': ngo['contactEmail'],
                'website': ngo['website'],
                'facebook': ngo['social_media']['facebook'],
                'instagram': ngo['social_media']['instagram'],
                'linkedin': ngo['social_media']['linkedin'],
                'twitter': ngo['social_media']['twitter'],
                'youtube': ngo['social_media']['youtube'],
                'services': "; ".join(ngo['services']),
                'areas_served': "; ".join(ngo['areas_served']),
                'sources': "; ".join(ngo['sources'])
            })
    print(f"  ✓ Synchronized ML dataset with all {len(ngos)} NGOs at: {csv_path}")

def main():
    print("=" * 65)
    print("NGO MATCHING SYSTEM - MONGODB POPULATION SCRIPT")
    print("=" * 65)
    print(f"Data directory: {DATA_DIR}")

    ngos = load_all_json_ngos(DATA_DIR)
    if not ngos:
        print("No NGOs parsed. Exiting.")
        return

    # Populate MongoDB
    populate_mongodb(ngos, MONGO_URI)

    # Sync CSV for ML modules
    export_to_csv(ngos)

    print("\n" + "=" * 65)
    print("POPULATION COMPLETE: MongoDB and ML dataset are fully initialized!")
    print("=" * 65)

if __name__ == '__main__':
    main()
