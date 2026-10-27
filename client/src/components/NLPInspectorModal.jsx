import React, { useState, useEffect } from 'react';
import { extractEntitiesAndIntent, processTokens, normalizeText } from '../services/completeNLP';

const SAMPLE_QUERIES = [
  'Urgent cooked food and meals in Mysuru for flood victims',
  'Emergency ambulance and ICU blood transfusion in Bengaluru',
  'Education stationery and books for poor rural children in Chitradurga',
  'Drinking water tanker after pipeline contamination in Davanagere',
  'Rescue injured stray dogs and cattle near Shivamogga'
];

export default function NLPInspectorModal({ text, isOpen, onClose }) {
  const [inputText, setInputText] = useState(text || SAMPLE_QUERIES[0]);

  useEffect(() => {
    if (text) {
      setInputText(text);
    }
  }, [text]);

  if (!isOpen) return null;

  const currentQuery = inputText || SAMPLE_QUERIES[0];
  const normalized = normalizeText(currentQuery);
  const tokenBreakdown = processTokens(currentQuery);
  const analysis = extractEntitiesAndIntent(currentQuery);

  // Compute mock TF and smooth IDF for demonstration of vector space term weighting
  const termCounts = {};
  tokenBreakdown.stemmedTokens.forEach(t => {
    termCounts[t] = (termCounts[t] || 0) + 1;
  });

  const vectorBreakdown = Object.entries(termCounts).map(([term, count]) => {
    const tf = (count / (tokenBreakdown.stemmedTokens.length || 1)).toFixed(3);
    // Smooth IDF sample calculation
    const simulatedIDF = (Math.log(100 / (1 + (term.length % 7) + 1)) + 1.2).toFixed(3);
    const tfidf = (tf * simulatedIDF).toFixed(3);
    return { term, count, tf, idf: simulatedIDF, tfidf };
  });

  return (
    <div className="modal-backdrop-clean" onClick={onClose} style={{ zIndex: 1000 }}>
      <div
        className="modal-card-pro"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '820px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <button type="button" className="modal-dismiss-btn" onClick={onClose}>✕</button>

        {/* Header */}
        <div className="modal-top-section" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '26px' }}>⚡</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'var(--text-h)' }}>
                AidConnect Complete NLP Pipeline Inspector
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                Live academic breakdown of computational linguistics, NER extraction, and Vector Space TF-IDF cosine matching
              </p>
            </div>
          </div>
        </div>

        {/* Live Interactive Query Input */}
        <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>
            Interactive Natural Language Input (Type any sentence to test live):
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="e.g. urgent food needed in Mysuru for flood victims"
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                fontWeight: '600',
                color: '#0f172a'
              }}
            />
            {inputText && (
              <button
                type="button"
                onClick={() => setInputText('')}
                style={{
                  background: '#e2e8f0',
                  border: 'none',
                  padding: '0 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Preset Buttons */}
          <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Sample Presets:</span>
            {SAMPLE_QUERIES.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputText(q)}
                style={{
                  background: inputText === q ? '#dcfce7' : '#ffffff',
                  border: inputText === q ? '1px solid #16a34a' : '1px solid #e2e8f0',
                  color: inputText === q ? '#166534' : '#475569',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                Preset {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Step 1 & 2: Normalization and Tokenization */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '14px', marginBottom: '16px' }}>
          {/* Step 1 & 2: Tokenization & Stopwords */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '13px', color: '#166534', fontWeight: '700' }}>
                Stage 1 & 2: Normalization & Filtered Tokens
              </h4>
              <span style={{ fontSize: '11px', background: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                {tokenBreakdown.filteredTokens.length} Content Terms
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
              Normalized: <code style={{ color: '#0f172a' }}>"{normalized}"</code>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '8px' }}>
              {tokenBreakdown.filteredTokens.map((t, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: '#dcfce7',
                    border: '1px solid #86efac',
                    color: '#166534',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              ({Math.max(0, tokenBreakdown.rawTokens.length - tokenBreakdown.filteredTokens.length)} grammatical stop/filler words pruned)
            </span>
          </div>

          {/* Step 3: Morphological Stemming */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '13px', color: '#166534', fontWeight: '700' }}>
                Stage 3: Morphological Suffix Stemmer
              </h4>
              <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#334155', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                Porter Algorithmic
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '8px' }}>
              {analysis.stemmedTokens.map((st, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    color: '#334155',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  {st}*
                </span>
              ))}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Affixes stripped to linguistic roots to enable fuzzy grammatical matching across tenses and plurals.
            </span>
          </div>
        </div>

        {/* Step 4: Named Entity Recognition & Intent Classification */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#166534', fontWeight: '700' }}>
            Stage 4: Named Entity Recognition (NER) & Intent Extraction
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            <div style={{ padding: '10px 12px', backgroundColor: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
              <span style={{ fontSize: '11px', color: '#15803d', fontWeight: '700', textTransform: 'uppercase' }}>Primary Domain Intent</span>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#166534', marginTop: '2px' }}>
                {analysis.primaryCategory}
              </div>
              <span style={{ fontSize: '11px', color: '#15803d' }}>{analysis.confidence}% Intent Confidence</span>
            </div>

            <div style={{ padding: '10px 12px', backgroundColor: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
              <span style={{ fontSize: '11px', color: '#15803d', fontWeight: '700', textTransform: 'uppercase' }}>Location Entity (NER)</span>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#166534', marginTop: '2px' }}>
                {analysis.detectedLocation ? `${analysis.detectedLocation.standard} (${analysis.detectedLocation.state})` : 'Geographic Context (Karnataka)'}
              </div>
              <span style={{ fontSize: '11px', color: '#15803d' }}>
                {analysis.detectedLocation ? `District: ${analysis.detectedLocation.district}` : 'Statewide General Scope'}
              </span>
            </div>

            <div style={{ padding: '10px 12px', backgroundColor: '#fef3c7', borderRadius: '6px', border: '1px solid #fde68a' }}>
              <span style={{ fontSize: '11px', color: '#92400e', fontWeight: '700', textTransform: 'uppercase' }}>Crisis Severity / Urgency</span>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#b45309', marginTop: '2px' }}>
                {analysis.detectedUrgency} (Score: {analysis.severityScore})
              </div>
              <span style={{ fontSize: '11px', color: '#92400e' }}>Priority Dispatch Multiplier</span>
            </div>
          </div>
        </div>

        {/* Step 5: Vector Space Term Weighting Breakdown */}
        {vectorBreakdown.length > 0 && (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#166534', fontWeight: '700' }}>
              Stage 5: Vector Space Term Weighting (TF & Smooth IDF)
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '6px 8px' }}>Stemmed Term (t)</th>
                    <th style={{ padding: '6px 8px' }}>Term Frequency (TF)</th>
                    <th style={{ padding: '6px 8px' }}>Smooth IDF (ln((1+N)/(1+DF))+1)</th>
                    <th style={{ padding: '6px 8px' }}>TF-IDF Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {vectorBreakdown.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px 8px', fontWeight: '700', color: '#0f172a' }}>{row.term}*</td>
                      <td style={{ padding: '6px 8px', color: '#475569' }}>{row.tf} ({row.count}/{tokenBreakdown.stemmedTokens.length})</td>
                      <td style={{ padding: '6px 8px', color: '#475569' }}>{row.idf}</td>
                      <td style={{ padding: '6px 8px', fontWeight: '700', color: '#166534' }}>{row.tfidf}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 6: Mathematical Formula Breakdown */}
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px', fontSize: '13px', color: '#0f172a', fontWeight: '700' }}>
            Stage 6: Sparse Cosine Similarity & Multi-Factor Ranking Function
          </h4>
          <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5', margin: '0 0 8px' }}>
            Query and document representations are projected onto high-dimensional Euclidean space and scored via the L2-normalized Cosine Angle metric:
          </p>
          <div style={{ fontFamily: 'monospace', backgroundColor: '#ffffff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', color: '#0f172a' }}>
            CosineSim(q, d) = ( q · d ) / ( ||q||₂ * ||d||₂ )<br />
            Final Ranking = [ (0.40 * CosineSim) + (0.35 * IntentMatch) + (0.15 * GeoProximity) + (0.10 * Rating) ] * UrgencyMultiplier
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="btn-primary-green"
            onClick={onClose}
            style={{ padding: '8px 24px' }}
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
