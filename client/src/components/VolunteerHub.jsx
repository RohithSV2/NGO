import React, { useState } from 'react';

const VOLUNTEER_DOMAINS = [
  'Emergency Rescue & Evacuation',
  'Food Packing & Community Kitchens',
  'First Aid & Paramedic Support',
  'Logistics, Transport & Driving',
  'Student Tutoring & Child Care',
  'Elderly Care & Companion Aid',
  'Warehouse Inventory & Supplies'
];

const KARNATAKA_DISTRICTS = ['Chitradurga', 'Davanagere', 'Shivamogga', 'Mysuru'];

export default function VolunteerHub({ volunteers = [], onRegisterVolunteer, user }) {
  const isNGO = user?.role === 'ngo';
  const [activeTab, setActiveTab] = useState(isNGO ? 'pool' : 'register');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [domainFilter, setDomainFilter] = useState('All');

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    district: 'Mysuru',
    domain: 'Food Packing & Community Kitchens',
    availability: 'Immediate Emergency Standby',
    experienceNotes: ''
  });
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Please fill in your name and contact phone number.');
      return;
    }
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      alert('Contact phone must be exactly 10 digits.');
      return;
    }

    const newVolunteer = {
      id: 'vol_' + Date.now(),
      name: formData.name.trim(),
      phone: cleanPhone,
      email: formData.email.trim(),
      district: formData.district,
      domain: formData.domain,
      availability: formData.availability,
      experienceNotes: formData.experienceNotes.trim() || 'Ready to assist in local relief drives.',
      createdAt: new Date().toISOString()
    };

    onRegisterVolunteer(newVolunteer);
    setSubmittedSuccess(true);
  };

  const filteredVolunteers = volunteers.filter(v => {
    if (districtFilter !== 'All' && v.district !== districtFilter) return false;
    if (domainFilter !== 'All' && v.domain !== domainFilter) return false;
    return true;
  });

  return (
    <div className="section-container" style={{ maxWidth: '1160px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Header Banner */}
      <div className="section-header-block" style={{ textAlign: 'left', marginBottom: '24px' }}>
        <div style={{ display: 'inline-block', backgroundColor: '#f0fdf4', border: '1px solid #86efac', color: '#16a34a', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
          Civilian & Student Relief Mobilization
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-h)', margin: '0 0 8px' }}>
          Karnataka Humanitarian Volunteer Hub
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', margin: 0, maxWidth: '820px' }}>
          Connecting willing citizens and student volunteers with certified partner NGOs across Chitradurga, Davanagere, Shivamogga, and Mysuru. Mobilize rapid manpower during emergency flood drives, community meal distributions, and medical assistance.
        </p>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <button
          type="button"
          className={`sector-tab-pill ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => { setActiveTab('register'); setSubmittedSuccess(false); }}
          style={{ fontSize: '14px', padding: '8px 18px' }}
        >
          ✍️ Register as Volunteer
        </button>
        <button
          type="button"
          className={`sector-tab-pill ${activeTab === 'pool' ? 'active' : ''}`}
          onClick={() => setActiveTab('pool')}
          style={{ fontSize: '14px', padding: '8px 18px' }}
        >
          👥 Volunteer Mobilization Pool ({volunteers.length})
        </button>
      </div>

      {activeTab === 'register' && (
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          {submittedSuccess ? (
            <div className="confirmation-card" style={{ padding: '36px 24px', textAlign: 'center' }}>
              <div className="confirmation-icon">✓</div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '12px 0 6px' }}>
                Volunteer Enrollment Confirmed!
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', margin: '0 0 20px' }}>
                Thank you, <strong>{formData.name}</strong>. Your profile has been added to the active <strong>{formData.district}</strong> relief pool for <strong>{formData.domain}</strong>. Authorized NGO coordinators will reach out when field assistance is required.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button
                  type="button"
                  className="btn-primary-green"
                  onClick={() => setActiveTab('pool')}
                >
                  View Deployment Pool &rarr;
                </button>
                <button
                  type="button"
                  className="btn-outline-green"
                  onClick={() => {
                    setSubmittedSuccess(false);
                    setFormData({
                      name: '',
                      phone: '',
                      email: '',
                      district: 'Mysuru',
                      domain: 'Food Packing & Community Kitchens',
                      availability: 'Immediate Emergency Standby',
                      experienceNotes: ''
                    });
                  }}
                >
                  Register Another Volunteer
                </button>
              </div>
            </div>
          ) : (
            <form className="pro-form-card" onSubmit={handleSubmit}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-h)', margin: '0 0 16px' }}>
                Volunteer Registration Details
              </h3>

              <div className="form-field">
                <label htmlFor="vol-name">Full Name *</label>
                <input
                  id="vol-name"
                  type="text"
                  className="input-control"
                  placeholder="e.g. Ramesh Kumar / Ananya Rao"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-columns-2">
                <div className="form-field">
                  <label htmlFor="vol-phone">Contact Mobile Number * (10 Digits)</label>
                  <input
                    id="vol-phone"
                    type="tel"
                    maxLength={10}
                    className="input-control"
                    placeholder="10-digit number"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="vol-email">Email Address</label>
                  <input
                    id="vol-email"
                    type="email"
                    className="input-control"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-columns-2">
                <div className="form-field">
                  <label htmlFor="vol-district">Operational District *</label>
                  <select
                    id="vol-district"
                    className="input-control select-control"
                    value={formData.district}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                  >
                    {KARNATAKA_DISTRICTS.map(d => (
                      <option key={d} value={d}>📍 {d} District</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="vol-domain">Skill / Assistance Domain *</label>
                  <select
                    id="vol-domain"
                    className="input-control select-control"
                    value={formData.domain}
                    onChange={e => setFormData({ ...formData, domain: e.target.value })}
                  >
                    {VOLUNTEER_DOMAINS.map(dm => (
                      <option key={dm} value={dm}>{dm}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="vol-avail">Response Availability *</label>
                <select
                  id="vol-avail"
                  className="input-control select-control"
                  value={formData.availability}
                  onChange={e => setFormData({ ...formData, availability: e.target.value })}
                >
                  <option value="Immediate Emergency Standby">⚡ Immediate Emergency Standby (24/7 Callout)</option>
                  <option value="Weekday Relief Operations">📅 Weekday Relief Operations (Mon - Fri)</option>
                  <option value="Weekend Community Drives">🏖️ Weekend Community Drives (Sat - Sun)</option>
                  <option value="On-Call Logistics Support">📦 On-Call Logistics & Transport Support</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="vol-notes">Relevant Skills, Certifications or Experience</label>
                <textarea
                  id="vol-notes"
                  className="input-control textarea-control"
                  rows="3"
                  placeholder="e.g. Red Cross First-aid certified, 4-wheeler driving license, prior flood relief volunteer in Tunga basin..."
                  value={formData.experienceNotes}
                  onChange={e => setFormData({ ...formData, experienceNotes: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-primary-green submit-btn-full">
                Join Verified Volunteer Network &rarr;
              </button>
            </form>
          )}
        </div>
      )}

      {activeTab === 'pool' && (
        <div>
          {/* Filters Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '20px', backgroundColor: '#ffffff', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#475569' }}>
              Filter Volunteer Pool:
            </span>

            <select
              className="city-select-field"
              value={districtFilter}
              onChange={e => setDistrictFilter(e.target.value)}
              style={{ minWidth: '160px' }}
            >
              <option value="All">All Districts ({volunteers.length})</option>
              {KARNATAKA_DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              className="city-select-field"
              value={domainFilter}
              onChange={e => setDomainFilter(e.target.value)}
              style={{ minWidth: '220px' }}
            >
              <option value="All">All Skills & Domains</option>
              {VOLUNTEER_DOMAINS.map(dm => (
                <option key={dm} value={dm}>{dm}</option>
              ))}
            </select>

            <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#16a34a', fontWeight: '700' }}>
              Showing {filteredVolunteers.length} Active Responders
            </span>
          </div>

          {/* Volunteers Grid */}
          {filteredVolunteers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🤝</span>
              <h4 style={{ margin: '0 0 6px', color: 'var(--text-h)', fontSize: '18px' }}>
                No volunteers matching this filter yet
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 16px' }}>
                Be the first responder to enroll for {districtFilter !== 'All' ? districtFilter : 'your district'}.
              </p>
              <button
                type="button"
                className="btn-primary-green"
                onClick={() => setActiveTab('register')}
              >
                Register as Volunteer &rarr;
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {filteredVolunteers.map(vol => (
                <div
                  key={vol.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '18px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--text-h)' }}>
                          {vol.name}
                        </h4>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          📍 {vol.district} District
                        </span>
                      </div>
                      <span
                        style={{
                          backgroundColor: '#ecfdf5',
                          border: '1px solid #86efac',
                          color: '#166534',
                          fontSize: '11px',
                          fontWeight: '800',
                          padding: '2px 8px',
                          borderRadius: '12px'
                        }}
                      >
                        ✓ Ready
                      </span>
                    </div>

                    <div style={{ margin: '8px 0 10px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                          fontSize: '12px',
                          fontWeight: '700',
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}
                      >
                        🛠️ {vol.domain}
                      </span>
                    </div>

                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.4', margin: '0 0 12px' }}>
                      "{vol.experienceNotes}"
                    </p>

                    <div style={{ fontSize: '12px', color: '#166534', fontWeight: '600', marginBottom: '14px' }}>
                      ⚡ {vol.availability}
                    </div>
                  </div>

                  {/* Contact / Dispatch Actions */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', gap: '8px' }}>
                    <a
                      href={`tel:${vol.phone}`}
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        textDecoration: 'none'
                      }}
                    >
                      📞 Call Volunteer
                    </a>
                    <a
                      href={`https://wa.me/91${vol.phone}?text=${encodeURIComponent(`Hello ${vol.name}, this is an authorized AidConnect coordinator contacting you regarding humanitarian relief deployment in ${vol.district}. Are you available to assist?`)}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        backgroundColor: '#25d366',
                        color: '#ffffff',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        textDecoration: 'none'
                      }}
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
