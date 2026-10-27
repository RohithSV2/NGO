"""
Evaluation & Benchmark Suite
Tests the NGO recommendation engine across diverse crisis and humanitarian aid requests
targeting the unified NGO knowledge base across Karnataka districts (Mysore, Chitradurga, Davanagere, Shivamogga).
"""

import sys
import os
import json

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from predict import NGOMatcher

TEST_CASES = [
    {
        'name': 'Primary School Education & Books',
        'request': {
            'title': 'School books and tuition for children',
            'description': 'Providing free primary school books, pencils, and reading classes for underprivileged students.',
            'category': 'Education & Literacy',
            'city': 'Mysore'
        },
        'expected_categories': ['Education & Literacy', 'Children', 'Education']
    },
    {
        'name': 'Rural Agriculture & Farmer Drought Aid',
        'request': {
            'title': 'Drought irrigation and seeds for dryland farmers',
            'description': 'Small farmers needing drought resistant seeds, drip irrigation kits and agrarian support.',
            'category': 'Agriculture',
            'city': 'Chitradurga'
        },
        'expected_categories': ['Agriculture', 'Rural Development', 'Rural Development & Poverty Alleviation', 'Poverty Alleviation']
    },
    {
        'name': 'Women SHG & Skill Development',
        'request': {
            'title': 'Vocational tailoring and women empowerment program',
            'description': 'Setting up self-help groups for rural women to provide stitching machinery, micro finance, and livelihood training.',
            'category': "Women's Development & Empowerment",
            'city': 'Davanagere'
        },
        'expected_categories': ["Women's Development & Empowerment", "Women's Development", "Education & Literacy", "Micro Finance (SHGs)", "Rural Development"]
    },
    {
        'name': 'Healthcare Clinic & Child Malnutrition',
        'request': {
            'title': 'Mobile medical camp and nutritional food for children',
            'description': 'Urgent health checkup clinic, medicines, and supplementary infant nutrition for malnourished kids.',
            'category': 'Health & Family Welfare',
            'city': 'Shivamogga'
        },
        'expected_categories': ['Health & Family Welfare', 'Children', 'Nutrition', 'Healthcare']
    },
    {
        'name': 'Cattle Livestock & Dairy Support',
        'request': {
            'title': 'Emergency cattle fodder and veterinary aid',
            'description': 'Veterinary doctors and animal feed needed for cows and livestock in village dairy farms.',
            'category': 'Animal Husbandry',
            'city': 'Davanagere'
        },
        'expected_categories': ['Animal Husbandry', 'Animal Husbandry, Dairying & Fisheries', 'Agriculture']
    }
]

def run_evaluation():
    print("=" * 65)
    print("RUNNING AID REQUEST MATCHING BENCHMARK & EVALUATION")
    print("=" * 65)

    matcher = NGOMatcher()
    passed = 0

    for idx, test in enumerate(TEST_CASES, 1):
        name = test['name']
        req = test['request']
        expected = test['expected_categories']

        matches = matcher.match(req, top_k=3)
        top_match = matches[0] if matches else None

        is_match_valid = False
        if top_match:
            top_sectors = [s.lower() for s in (top_match.get('sectors') or [])]
            top_cat = (top_match.get('category') or '').lower()
            for exp in expected:
                exp_low = exp.lower()
                if exp_low in top_cat or top_cat in exp_low:
                    is_match_valid = True
                    break
                if any(exp_low in s or s in exp_low for s in top_sectors):
                    is_match_valid = True
                    break

        status = "PASSED" if is_match_valid else "FAILED"
        if is_match_valid:
            passed += 1

        print(f"\n[Test {idx}/{len(TEST_CASES)}] {name} -> {status}")
        print(f"  Query: \"{req['title']}\" ({req['city'] or 'Any City'})")
        if top_match:
            print(f"  Top Match: {top_match['name']} | Category: {top_match['category']} | Location: {top_match['location']} | Score: {top_match['match_score']}%")
            print(f"  Breakdown: Similarity {top_match['breakdown']['text_similarity']}%, Category {top_match['breakdown']['category_match']}%, Location {top_match['breakdown']['location_match']}%")

    accuracy = (passed / len(TEST_CASES)) * 100
    print("\n" + "=" * 65)
    print(f"EVALUATION SUMMARY: {passed}/{len(TEST_CASES)} Tests Passed ({accuracy:.1f}% Top-1 Accuracy)")
    print("=" * 65)
    return passed == len(TEST_CASES)

if __name__ == '__main__':
    run_evaluation()
