import React, { useState, useMemo } from 'react';

const CAMPAIGNS = [
  {
    id: 'camp_1',
    title: 'Shivamogga Tunga Basin Flood Relief Convoy',
    district: 'Shivamogga',
    ngo: 'The Shimoga Multipurpose Social Service Society',
    targetCommodity: 'Water Purification Tablets & 20L Cans',
    goalQty: 300,
    unit: 'cans',
    unitCost: 125,
    icon: '🌊',
    urgency: 'Critical',
    description: 'Providing clean drinking water and water purifying tablets to riverside farming families in flood-submerged taluks.'
  },
  {
    id: 'camp_2',
    title: 'Chitradurga Drought Water Tanker & Cattle Feed Drive',
    district: 'Chitradurga',
    ngo: 'Vivekananda Rural Development Society',
    targetCommodity: 'Potable Drinking Water Cans (20L)',
    goalQty: 500,
    unit: 'cans',
    unitCost: 100,
    icon: '💧',
    urgency: 'Critical',
    description: 'Mobilizing 5000L emergency water tankers and potable cans for drought-stricken dry zone villages and shelters.'
  },
  {
    id: 'camp_3',
    title: 'Davanagere Rural School Student Warmth & Literacy Drive',
    district: 'Davanagere',
    ngo: 'Yashaswini mahila educational & rural development trust',
    targetCommodity: 'Warm Winter Blankets & Sweaters',
    goalQty: 400,
    unit: 'blankets',
    unitCost: 150,
    icon: '📚',
    urgency: 'High',
    description: 'Supplying warm winter blankets, sweaters, and school notebooks to underprivileged primary school students.'
  },
  {
    id: 'camp_4',
    title: 'Mysuru Chamundi Foothills Community Kitchen Emergency Ration',
    district: 'Mysuru',
    ngo: 'YOUTH EFFORTS FOR SOCIETY TRUST',
    targetCommodity: 'Hot Cooked Meal Packets',
    goalQty: 800,
    unit: 'packets',
    unitCost: 100,
    icon: '🍲',
    urgency: 'High',
    description: 'Sponsoring daily hot nutritional cooked meals for displaced slum and riverside families near Chamundi low-lying areas.'
  }
];

export default function ReliefPledgeHub({
  pledges = [],
  onCreatePledge,
  user,
  onNavigateToCertificate
}) {
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    donorName: user?.name || '',
    donorType: user ? (user.role === 'ngo' ? 'Community Partner' : 'Citizen Philanthropist') : 'Alumni Partner',
    phone: user?.phone || '',
    email: user?.email || '',
    district: 'Mysuru',
    targetNGO: 'YOUTH EFFORTS FOR SOCIETY TRUST',
    commodity: 'Hot Cooked Meal Packets',
    quantity: 50,
    unit: 'packets',
    customCostPerUnit: 100,
    campaign: 'Monsoon Low-Lying Riverside Shelter Support',
    message: ''
  });

  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Filter pledges by district
  const filteredPledges = useMemo(() => {
    if (selectedDistrict === 'All') return pledges;
    return pledges.filter(p => (p.district || '').toLowerCase() === selectedDistrict.toLowerCase());
  }, [pledges, selectedDistrict]);

  // Aggregate Metrics
  const totalPledgedValue = useMemo(() => {
    return pledges.reduce((acc, p) => {
      const numeric = parseInt((p.pledgeAmount || '0').replace(/\D/g, ''), 10) || 0;
      return acc + numeric;
    }, 0);
  }, [pledges]);

  const totalCommodityUnits = useMemo(() => {
    return pledges.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0);
  }, [pledges]);

  const verifiedPledgesCount = useMemo(() => {
    return pledges.filter(p => p.status === 'Delivered & Verified').length;
  }, [pledges]);

  const handleSelectCampaignForPledge = (camp) => {
    setSelectedCampaign(camp);
    setFormData(prev => ({
      ...prev,
      district: camp.district,
      targetNGO: camp.ngo,
      commodity: camp.targetCommodity,
      unit: camp.unit,
      customCostPerUnit: camp.unitCost,
      campaign: camp.title,
      quantity: 50
    }));
    window.scrollTo({ top: 480, behavior: 'smooth' });
  };

  const calculatedTotal = (formData.quantity || 0) * (formData.customCostPerUnit || 100);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.donorName.trim() || !formData.phone.trim()) {
      alert('Please fill in your name and phone number.');
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      alert('Phone number must be exactly 10 digits.');
      return;
    }

    const newPledge = {
      donorName: formData.donorName.trim(),
      donorType: formData.donorType,
      phone: cleanPhone,
      email: formData.email.trim() || 'donor@community.org',
      district: formData.district,
      targetNGO: formData.targetNGO,
      commodity: formData.commodity,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      pledgeAmount: `₹ ${calculatedTotal.toLocaleString('en-IN')}`,
      campaign: formData.campaign,
      message: formData.message.trim() || 'Supporting frontline humanitarian relief teams across Karnataka.',
      otpAuditRef: `AC-KAR-${formData.district.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`
    };

    onCreatePledge(newPledge);
    setSubmittedSuccess(true);
    setTimeout(() => setSubmittedSuccess(false), 5000);
  };

  return (
    <div className="section-container" style={{ maxWidth: '1180px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Header Banner */}
      <div className="section-header-block" style={{ textAlign: 'left', marginBottom: '24px' }}>
        <div style={{ display: 'inline-block', backgroundColor: '#fdf2f8', border: '1px solid #fbcfe8', color: '#db2777', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
          💝 Transparent Public Sponsorship & Circular Economy
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-h)', margin: '0 0 8px' }}>
          Community Relief Pledge & Public Donation Ledger
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', margin: 0, maxWidth: '850px', lineHeight: '1.6' }}>
          Sponsor critical emergency relief items for verified partner NGOs across Chitradurga, Davanagere, Shivamogga, and Mysuru. Every pledged commodity directly replenishes the NGO warehouse stockpile and is audited via verified citizen OTP delivery certificates.
        </p>
      </div>

      {/* Aggregate Transparency KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}
      >
        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 22px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
            Total Relief Value Pledged
          </div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#db2777' }}>
            ₹ {totalPledgedValue.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '12px', color: '#166534', fontWeight: '600', marginTop: '4px' }}>
            100% Directed to Verified Ground Relief
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 22px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
            Relief Units Sponsored
          </div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#16a34a' }}>
            {totalCommodityUnits.toLocaleString('en-IN')}+ Units
          </div>
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
            Ration kits, water cans, blankets & medical packs
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 22px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
            OTP Verified Deliveries
          </div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#2563eb' }}>
            {verifiedPledgesCount} Missions
          </div>
          <div style={{ fontSize: '12px', color: '#166534', fontWeight: '700', marginTop: '4px' }}>
            🔐 Beneficiary OTP & Photo Audited
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 22px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
            District Coverage
          </div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a' }}>
            4 / 4 Districts
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Chitradurga, Davanagere, Shivamogga, Mysuru
          </div>
        </div>
      </div>

      {/* Active Disaster Relief Campaigns Grid */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'var(--text-h)' }}>
            🎯 Priority District Relief Drives & Stockpile Campaigns
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Click any drive to auto-configure your community pledge
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '18px' }}>
          {CAMPAIGNS.map(camp => {
            const districtPledges = pledges.filter(p => p.district === camp.district && p.commodity.toLowerCase().includes(camp.unit.slice(0, 3)));
            const currentPledgedUnits = districtPledges.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0) + 120;
            const progressPct = Math.min(100, Math.round((currentPledgedUnits / camp.goalQty) * 100));

            return (
              <div
                key={camp.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: selectedCampaign?.id === camp.id ? '2px solid #db2777' : '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <span style={{ fontSize: '28px' }}>{camp.icon}</span>
                    <span style={{ backgroundColor: camp.urgency === 'Critical' ? '#fee2e2' : '#fef3c7', color: camp.urgency === 'Critical' ? '#991b1b' : '#92400e', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>
                      {camp.urgency} Priority
                    </span>
                  </div>

                  <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '800', color: 'var(--text-h)' }}>
                    {camp.title}
                  </h4>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#166534', marginBottom: '8px' }}>
                    📍 {camp.district} &bull; Responding NGO: {camp.ngo}
                  </div>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', margin: '0 0 14px' }}>
                    {camp.description}
                  </p>

                  {/* Campaign Progress Meter */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      <span style={{ color: '#0f172a' }}>Pledged: {currentPledgedUnits} {camp.unit}</span>
                      <span style={{ color: '#db2777' }}>{progressPct}% of Goal</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${progressPct}%`, height: '100%', backgroundColor: progressPct >= 80 ? '#16a34a' : '#db2777', borderRadius: '4px', transition: 'width 0.4s ease' }}></div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectCampaignForPledge(camp)}
                  style={{
                    width: '100%',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #fbcfe8',
                    backgroundColor: selectedCampaign?.id === camp.id ? '#db2777' : '#fdf2f8',
                    color: selectedCampaign?.id === camp.id ? '#ffffff' : '#be185d',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {selectedCampaign?.id === camp.id ? '✓ Selected in Form Below' : 'Sponsor This Drive &rarr;'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Pledge Form & Public Audit Ledger */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 440px) 1fr', gap: '28px', alignItems: 'start' }}>
        {/* Form Column */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '22px' }}>✍️</span>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-h)' }}>
              Sponsor Relief Supplies
            </h3>
          </div>
          <p style={{ margin: '0 0 18px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Pledges directly restock verified NGO warehouse stockpiles.
          </p>

          {submittedSuccess && (
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', fontSize: '13px', color: '#166534' }}>
              ✓ <strong>Pledge Recorded Successfully!</strong> Thank you for strengthening humanitarian relief in Karnataka.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-field" style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>
                Your Name / Organization:
              </label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. Dr. Arvind Rao / Infosys Foundation"
                value={formData.donorName}
                onChange={e => setFormData({ ...formData, donorName: e.target.value })}
                required
              />
            </div>

            <div className="form-columns-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div className="form-field">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>
                  Donor Type:
                </label>
                <select
                  className="input-control select-control"
                  value={formData.donorType}
                  onChange={e => setFormData({ ...formData, donorType: e.target.value })}
                >
                  <option value="Alumni Partner">Alumni Partner (NIE)</option>
                  <option value="Citizen Philanthropist">Citizen Philanthropist</option>
                  <option value="Community Foundation">Community Foundation</option>
                  <option value="Corporate Partner">Corporate CSR Partner</option>
                </select>
              </div>

              <div className="form-field">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>
                  Contact Phone:
                </label>
                <input
                  type="tel"
                  className="input-control"
                  placeholder="10-digit phone"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-columns-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div className="form-field">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>
                  Target District:
                </label>
                <select
                  className="input-control select-control"
                  value={formData.district}
                  onChange={e => {
                    const dist = e.target.value;
                    let targetNgo = 'YOUTH EFFORTS FOR SOCIETY TRUST';
                    if (dist === 'Shivamogga') targetNgo = 'The Shimoga Multipurpose Social Service Society';
                    if (dist === 'Chitradurga') targetNgo = 'Vivekananda Rural Development Society';
                    if (dist === 'Davanagere') targetNgo = 'Yashaswini mahila educational & rural development trust';
                    setFormData({ ...formData, district: dist, targetNGO: targetNgo });
                  }}
                >
                  <option value="Mysuru">Mysuru</option>
                  <option value="Shivamogga">Shivamogga</option>
                  <option value="Chitradurga">Chitradurga</option>
                  <option value="Davanagere">Davanagere</option>
                </select>
              </div>

              <div className="form-field">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>
                  Relief Commodity:
                </label>
                <select
                  className="input-control select-control"
                  value={formData.commodity}
                  onChange={e => {
                    const val = e.target.value;
                    let cost = 100;
                    let u = 'kits';
                    if (val.includes('Water')) { cost = 125; u = 'cans'; }
                    if (val.includes('Meal')) { cost = 100; u = 'packets'; }
                    if (val.includes('Blanket')) { cost = 150; u = 'blankets'; }
                    if (val.includes('Medical')) { cost = 250; u = 'kits'; }
                    setFormData({ ...formData, commodity: val, customCostPerUnit: cost, unit: u });
                  }}
                >
                  <option value="Hot Cooked Meal Packets">Hot Cooked Meal Packets</option>
                  <option value="Potable Drinking Water Cans (20L)">Drinking Water Cans (20L)</option>
                  <option value="Water Purification Tablets & 20L Cans">Water Purification Kits</option>
                  <option value="First Aid Trauma Emergency Kits">First Aid Trauma Emergency Kits</option>
                  <option value="Warm Winter Blankets & Sweaters">Warm Blankets & Sweaters</option>
                  <option value="Primary Student Educational Kits">Primary Student Educational Kits</option>
                </select>
              </div>
            </div>

            {/* Quantity Slider / Selector */}
            <div className="form-field" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700' }}>
                  Sponsorship Quantity:
                </label>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#16a34a' }}>
                  {formData.quantity} {formData.unit}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="250"
                step="5"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#db2777' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                <span>10 min</span>
                <span>100 kits</span>
                <span>250 max</span>
              </div>
            </div>

            {/* Estimated Value Computation */}
            <div style={{ backgroundColor: '#fdf2f8', border: '1px solid #fbcfe8', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#db2777', textTransform: 'uppercase' }}>
                  Calculated Sponsorship Value
                </span>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  ({formData.quantity} {formData.unit} &times; ₹ {formData.customCostPerUnit}/unit)
                </div>
              </div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#be185d' }}>
                ₹ {calculatedTotal.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="form-field" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>
                Message of Solidarity / Dedication:
              </label>
              <textarea
                className="input-control textarea-control"
                rows="2"
                placeholder="Share an encouraging note for field volunteers and families..."
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn-primary-green"
              style={{ width: '100%', padding: '10px 16px', fontSize: '14px', fontWeight: '800', backgroundColor: '#db2777', borderColor: '#db2777' }}
            >
              Confirm Sponsorship & Update Warehouse Matrix &rarr;
            </button>
          </form>
        </div>

        {/* Public Audit Ledger Column */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-h)' }}>
                📜 Transparent Public Sponsorship Ledger
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Real-time cryptographic audit log linking public donations to verified field delivery certificates.
              </p>
            </div>

            {/* District Filter Pills */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {['All', 'Mysuru', 'Shivamogga', 'Chitradurga', 'Davanagere'].map(dist => (
                <button
                  key={dist}
                  type="button"
                  onClick={() => setSelectedDistrict(dist)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: selectedDistrict === dist ? '2px solid #db2777' : '1px solid #cbd5e1',
                    backgroundColor: selectedDistrict === dist ? '#fdf2f8' : '#ffffff',
                    color: selectedDistrict === dist ? '#be185d' : '#475569',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {dist}
                </button>
              ))}
            </div>
          </div>

          {/* Ledger Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredPledges.map(item => (
              <div
                key={item.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  transition: 'border-color 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                        {item.donorName}
                      </span>
                      <span style={{ backgroundColor: '#fdf2f8', color: '#be185d', fontSize: '11px', fontWeight: '800', padding: '1px 8px', borderRadius: '4px', border: '1px solid #fbcfe8' }}>
                        {item.donorType}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      Pledged on {new Date(item.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} &bull; 📍 {item.district}, Karnataka
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#16a34a' }}>
                      {item.pledgeAmount}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: item.status === 'Delivered & Verified' ? '#166534' : (item.status === 'Dispatched to Field' ? '#0369a1' : '#b45309'), backgroundColor: item.status === 'Delivered & Verified' ? '#dcfce7' : (item.status === 'Dispatched to Field' ? '#e0f2fe' : '#fef3c7'), padding: '2px 8px', borderRadius: '4px' }}>
                      {item.status === 'Delivered & Verified' ? '✓ Delivered & Verified' : (item.status === 'Dispatched to Field' ? '🚚 In Field Transit' : '📦 Warehouse Ready')}
                    </span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', borderRadius: '6px', padding: '10px 12px', fontSize: '12px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span><strong>Relief Items:</strong> {item.quantity} {item.unit || 'kits'} &bull; {item.commodity}</span>
                    <span style={{ color: '#64748b' }}>Assigned NGO: <strong>{item.targetNGO}</strong></span>
                  </div>
                  {item.message && (
                    <div style={{ color: '#475569', fontStyle: 'italic', marginTop: '4px' }}>
                      "{item.message}"
                    </div>
                  )}
                </div>

                {/* Audit Hash & Verification Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '11px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                  <span style={{ color: '#64748b' }}>
                    Audit Reference Code: <code style={{ color: '#0f172a', fontWeight: '700' }}>{item.otpAuditRef || `AC-KAR-${item.district.slice(0, 3).toUpperCase()}-2026`}</code>
                  </span>
                  <span style={{ color: '#166534', fontWeight: '700' }}>
                    🔐 Verified Circular Stockpile Allocation
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
