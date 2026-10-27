import React, { useState, useMemo } from 'react';

const TOP_SECTORS = [
  'All',
  'Education & Literacy',
  'Children',
  'Agriculture',
  'Health & Family Welfare',
  'Rural Development & Poverty Alleviation',
  "Women's Development & Empowerment",
  'Aged/Elderly',
  'Animal Husbandry, Dairying & Fisheries',
  'Disaster Management',
  'Environment & Forests',
  'Drinking Water'
];

export default function NGODirectory({ ngos, onDirectRequest }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedCity, setSelectedCity] = useState('');
  const [activeModalNGO, setActiveModalNGO] = useState(null);

  const cities = useMemo(() => {
    const set = new Set();
    ngos.forEach(n => {
      if (n.city) set.add(n.city);
    });
    return Array.from(set).sort();
  }, [ngos]);

  const filteredNGOs = useMemo(() => {
    return ngos.filter(ngo => {
      const s = searchQuery.toLowerCase();
      const sectorsList = Array.isArray(ngo.sectors) ? ngo.sectors : [];
      const helpsList = Array.isArray(ngo.helps) ? ngo.helps : [];
      const servicesList = Array.isArray(ngo.services) ? ngo.services : [];
      const areasList = Array.isArray(ngo.areas_served) ? ngo.areas_served : [];

      const matchesSearch =
        searchQuery === '' ||
        (ngo.name || '').toLowerCase().includes(s) ||
        (ngo.description || '').toLowerCase().includes(s) ||
        (ngo.category || '').toLowerCase().includes(s) ||
        (ngo.location || '').toLowerCase().includes(s) ||
        (ngo.registration_number || '').toLowerCase().includes(s) ||
        sectorsList.some(sec => sec.toLowerCase().includes(s)) ||
        helpsList.some(h => h.toLowerCase().includes(s)) ||
        servicesList.some(srv => srv.toLowerCase().includes(s)) ||
        areasList.some(a => a.toLowerCase().includes(s));

      const matchesSector =
        selectedSector === 'All' ||
        (ngo.category || '').toLowerCase().includes(selectedSector.toLowerCase()) ||
        sectorsList.some(sec => sec.toLowerCase().includes(selectedSector.toLowerCase())) ||
        helpsList.some(h => h.toLowerCase().includes(selectedSector.toLowerCase()));

      const matchesCity =
        selectedCity === '' ||
        (ngo.city || '').toLowerCase() === selectedCity.toLowerCase() ||
        (ngo.location || '').toLowerCase().includes(selectedCity.toLowerCase()) ||
        areasList.some(a => a.toLowerCase().includes(selectedCity.toLowerCase()));

      return matchesSearch && matchesSector && matchesCity;
    });
  }, [ngos, searchQuery, selectedSector, selectedCity]);

  // Helper to extract clean phone and email
  const getPrimaryPhone = (ngo) => {
    if (ngo.contactPhone) return ngo.contactPhone;
    if (ngo.contact_phone) return ngo.contact_phone;
    if (Array.isArray(ngo.phone) && ngo.phone.length > 0) return ngo.phone[0];
    return '';
  };

  const getPrimaryEmail = (ngo) => {
    if (ngo.contactEmail) return ngo.contactEmail;
    if (ngo.contact_email) return ngo.contact_email;
    if (Array.isArray(ngo.email) && ngo.email.length > 0) return ngo.email[0];
    return '';
  };

  const getAllPhones = (ngo) => {
    if (Array.isArray(ngo.phone) && ngo.phone.length > 0) return ngo.phone;
    const p = getPrimaryPhone(ngo);
    return p ? [p] : [];
  };

  const getAllEmails = (ngo) => {
    if (Array.isArray(ngo.email) && ngo.email.length > 0) return ngo.email;
    const e = getPrimaryEmail(ngo);
    return e ? [e] : [];
  };

  return (
    <div className="section-container">
      <div className="section-header-block">
        <h2>Verified NGO Directory</h2>
        <p>Explore certified humanitarian partner organizations across healthcare, agriculture, education, rural development, and social welfare.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="directory-filter-row">
        <div className="search-input-wrap">
          <span className="search-icon-symbol">🔍</span>
          <input
            type="text"
            className="search-input-field"
            placeholder="Search by NGO name, registration number, sector, or focus areas..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-action"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        <select
          className="city-select-field"
          value={selectedCity}
          onChange={e => setSelectedCity(e.target.value)}
        >
          <option value="">All Locations ({cities.length} Districts)</option>
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {/* Sector Pill Tabs */}
      <div className="sector-pills-container">
        {TOP_SECTORS.map(sec => (
          <button
            key={sec}
            type="button"
            className={`sector-tab-pill ${selectedSector === sec ? 'active' : ''}`}
            onClick={() => setSelectedSector(sec)}
          >
            {sec}
          </button>
        ))}
      </div>

      <div className="results-count-text">
        Showing <strong>{filteredNGOs.length}</strong> verified organizations
        {selectedSector !== 'All' && ` in ${selectedSector}`}
        {selectedCity && ` in ${selectedCity}`}
      </div>

      {/* Cards Grid */}
      <div className="ngo-grid-layout">
        {filteredNGOs.map(ngo => {
          const sectorsList = Array.isArray(ngo.sectors) && ngo.sectors.length > 0
            ? ngo.sectors
            : [ngo.category || 'General Aid'];
          const helpsList = Array.isArray(ngo.helps) ? ngo.helps : [];

          return (
            <div key={ngo._id || ngo.ngo_id || ngo.registration_number} className="pro-ngo-card">
              <div className="pro-card-header">
                <div>
                  <h3 className="pro-card-title">{ngo.name}</h3>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                    <span className="verified-green-badge">✓ Verified</span>
                    {ngo.registration_number && (
                      <span style={{ fontSize: '0.75rem', background: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>
                        Reg: {ngo.registration_number}
                      </span>
                    )}
                  </div>
                </div>
                <span className="rating-badge">
                  ★ {ngo.rating && ngo.ratingCount > 0 ? Number(ngo.rating).toFixed(1) : '-'}
                </span>
              </div>

              <div className="pro-card-tags" style={{ marginTop: '8px', flexWrap: 'wrap' }}>
                {sectorsList.slice(0, 2).map((sec, i) => (
                  <span key={i} className="green-category-tag">{sec}</span>
                ))}
                <span className="neutral-location-tag">📍 {ngo.location || `${ngo.city}, ${ngo.state}`}</span>
              </div>

              {helpsList.length > 0 && (
                <div style={{ fontSize: '0.8rem', color: '#047857', marginTop: '6px' }}>
                  <strong>Supports:</strong> {helpsList.slice(0, 3).join(', ')}{helpsList.length > 3 ? ` +${helpsList.length - 3} more` : ''}
                </div>
              )}

              <p className="pro-card-description">{ngo.description}</p>

              <div className="pro-card-actions">
                <button
                  type="button"
                  className="btn-card-secondary"
                  onClick={() => setActiveModalNGO(ngo)}
                >
                  Details & Social
                </button>
                <button
                  type="button"
                  className="btn-card-primary"
                  onClick={() => onDirectRequest(ngo)}
                >
                  Request Aid
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {activeModalNGO && (
        <div className="modal-backdrop-clean" onClick={() => setActiveModalNGO(null)}>
          <div className="modal-card-pro" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="modal-dismiss-btn"
              onClick={() => setActiveModalNGO(null)}
            >
              ✕
            </button>

            <div className="modal-top-section">
              <h3>{activeModalNGO.name}</h3>
              <div className="modal-badge-row" style={{ flexWrap: 'wrap', gap: '8px' }}>
                <span className="verified-green-badge">✓ Verified Organization</span>
                {activeModalNGO.registration_number && (
                  <span style={{ fontSize: '0.8rem', background: '#e2e8f0', color: '#334155', padding: '3px 8px', borderRadius: '4px', fontWeight: 500 }}>
                    Reg: {activeModalNGO.registration_number}
                  </span>
                )}
                <span className="green-category-tag">{activeModalNGO.category}</span>
                <span className="rating-badge">
                  ★ {activeModalNGO.rating && activeModalNGO.ratingCount > 0 ? `${Number(activeModalNGO.rating).toFixed(1)} (${activeModalNGO.ratingCount} review${activeModalNGO.ratingCount > 1 ? 's' : ''})` : '-'}
                </span>
              </div>
            </div>

            <div className="modal-content-section">
              <p className="modal-bio">{activeModalNGO.description}</p>

              {/* Sectors and Helps Section */}
              <div style={{ margin: '14px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Array.isArray(activeModalNGO.sectors) && activeModalNGO.sectors.length > 0 && (
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>Working Sectors:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                      {activeModalNGO.sectors.map((s, idx) => (
                        <span key={idx} style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '9999px' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(activeModalNGO.helps) && activeModalNGO.helps.length > 0 && (
                  <div style={{ marginTop: '4px' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>Beneficiaries Supported:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                      {activeModalNGO.helps.map((h, idx) => (
                        <span key={idx} style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '9999px' }}>
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(activeModalNGO.services) && activeModalNGO.services.length > 0 && (
                  <div style={{ marginTop: '4px' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>Key Services:</strong>
                    <ul style={{ margin: '4px 0 0 18px', fontSize: '0.82rem', color: '#475569' }}>
                      {activeModalNGO.services.map((srv, idx) => (
                        <li key={idx}>{srv}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="modal-info-grid">
                <div className="info-grid-cell">
                  <strong>Location & District</strong>
                  <span>{activeModalNGO.location || `${activeModalNGO.city}, ${activeModalNGO.state}`}</span>
                </div>
                <div className="info-grid-cell">
                  <strong>Areas Served</strong>
                  <span>
                    {Array.isArray(activeModalNGO.areas_served) && activeModalNGO.areas_served.length > 0
                      ? activeModalNGO.areas_served.join(', ')
                      : (activeModalNGO.city || 'Karnataka')}
                  </span>
                </div>
                <div className="info-grid-cell">
                  <strong>Contact Phone</strong>
                  <div>
                    {getAllPhones(activeModalNGO).length > 0 ? (
                      getAllPhones(activeModalNGO).map((p, idx) => (
                        <div key={idx}>
                          <a href={`tel:${p}`} className="green-link">{p}</a>
                        </div>
                      ))
                    ) : (
                      <span>Available upon aid match</span>
                    )}
                  </div>
                </div>
                <div className="info-grid-cell">
                  <strong>Contact Email</strong>
                  <div>
                    {getAllEmails(activeModalNGO).length > 0 ? (
                      getAllEmails(activeModalNGO).map((e, idx) => (
                        <div key={idx}>
                          <a href={`mailto:${e}`} className="green-link">{e}</a>
                        </div>
                      ))
                    ) : (
                      <span>Available upon aid match</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Media Links if present */}
              {activeModalNGO.social_media && Object.values(activeModalNGO.social_media).some(v => Boolean(v)) && (
                <div style={{ marginTop: '16px', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '6px' }}>Social Profiles:</strong>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {activeModalNGO.social_media.facebook && (
                      <a href={activeModalNGO.social_media.facebook} target="_blank" rel="noreferrer" className="green-link" style={{ fontSize: '0.82rem' }}>
                        Facebook ↗
                      </a>
                    )}
                    {activeModalNGO.social_media.instagram && (
                      <a href={activeModalNGO.social_media.instagram} target="_blank" rel="noreferrer" className="green-link" style={{ fontSize: '0.82rem' }}>
                        Instagram ↗
                      </a>
                    )}
                    {activeModalNGO.social_media.linkedin && (
                      <a href={activeModalNGO.social_media.linkedin} target="_blank" rel="noreferrer" className="green-link" style={{ fontSize: '0.82rem' }}>
                        LinkedIn ↗
                      </a>
                    )}
                    {activeModalNGO.social_media.twitter && (
                      <a href={activeModalNGO.social_media.twitter} target="_blank" rel="noreferrer" className="green-link" style={{ fontSize: '0.82rem' }}>
                        Twitter ↗
                      </a>
                    )}
                    {activeModalNGO.social_media.youtube && (
                      <a href={activeModalNGO.social_media.youtube} target="_blank" rel="noreferrer" className="green-link" style={{ fontSize: '0.82rem' }}>
                        YouTube ↗
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions-footer">
              {activeModalNGO.website && (
                <a
                  href={activeModalNGO.website}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-card-secondary"
                >
                  Visit Website ↗
                </a>
              )}
              <button
                type="button"
                className="btn-card-primary"
                onClick={() => {
                  const target = activeModalNGO;
                  setActiveModalNGO(null);
                  onDirectRequest(target);
                }}
              >
                Submit Request to this NGO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
