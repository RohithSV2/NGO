import React, { useState } from 'react';

export const SCENARIOS = [
  {
    id: 'scenario_a',
    icon: '🌊',
    badge: 'Disaster Evacuation',
    badgeColor: '#dc2626',
    title: 'Tunga River Flash Flood (Shivamogga) — 40 Families Trapped',
    district: 'Shivamogga',
    category: 'Disaster Relief & Evacuation',
    urgency: 'Critical',
    tokens: ['trapped', 'flood surge', 'drowning', 'infant'],
    requesterName: 'Ramesh Gowda (Gram Panchayat Member)',
    requesterPhone: '9845112233',
    requesterEmail: 'ramesh.gowda@shivamogga-panchayat.gov.in',
    description: 'CRITICAL: Tunga river embankment breached near riverside village. 40 families trapped on rooftops with rising water levels. Two infants and elderly citizens require immediate inflatable rescue boats, life jackets, and dry food kits!',
    targetNgoName: 'The Shimoga Multipurpose Social Service Society',
    volunteerName: 'Sahana Hegde (Civil Defense Trained)',
    volunteerPhone: '9845223344',
    etaMinutes: 25,
    dispatchNote: 'Dispatched 2 inflatable river rescue boats with 120 life jackets and paramedical first aid kits from Tunga flood warehouse.',
    deliveryPhoto: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop&q=80',
    resolutionOtp: '4821'
  },
  {
    id: 'scenario_b',
    icon: '🌾',
    badge: 'Drought Water Crisis',
    badgeColor: '#d97706',
    title: 'Rural Taluk Water Tanker Shortage (Chitradurga)',
    district: 'Chitradurga',
    category: 'Water & Sanitation',
    urgency: 'High',
    tokens: ['drinking water', 'drought', 'elderly', 'shelter'],
    requesterName: 'Boraiah K (Village Head, Hiriyur Taluk)',
    requesterPhone: '9741224466',
    requesterEmail: 'boraiah.hiriyur@karnataka-rural.org',
    description: 'HIGH URGENCY: Community borewells dried up in Hiriyur rural taluk. 200 dairy cattle and 70 farming households facing acute drinking water shortage for 48 hours. Urgent need for 5000L potable water tankers and water purification cans.',
    targetNgoName: 'Vivekananda Rural Development Society',
    volunteerName: 'Deepak Nayak (Field Coordinator)',
    volunteerPhone: '9880445566',
    etaMinutes: 40,
    dispatchNote: 'Dispatched two 5000L potable water tankers and 150 20L water cans from Chitradurga emergency drought stockpile.',
    deliveryPhoto: 'https://images.unsplash.com/photo-1594708767771-a7502209ff51?w=600&auto=format&fit=crop&q=80',
    resolutionOtp: '6194'
  },
  {
    id: 'scenario_c',
    icon: '🏥',
    badge: 'Medical Life-Safety',
    badgeColor: '#dc2626',
    title: 'Critical Trauma Blood Need (Davanagere General Hospital)',
    district: 'Davanagere',
    category: 'Healthcare & Medical Needs',
    urgency: 'Critical',
    tokens: ['bleeding', 'unconscious', 'trauma', 'ambulance', 'oxygen'],
    requesterName: 'Dr. Savitha Patil (Duty Paramedic Officer)',
    requesterPhone: '9880112244',
    requesterEmail: 'er.savitha@davanagere-hospital.gov.in',
    description: 'CRITICAL EMERGENCY: Severe multi-vehicle collision near NH-48 bypass. 4 patients unconscious with heavy bleeding and trauma hemorrhage. Immediate O-negative donor blood bags, trauma suture kits, and transport van required!',
    targetNgoName: 'Yashaswini mahila educational & rural development trust',
    volunteerName: 'Kiran Basavaraj (Emergency Volunteer)',
    volunteerPhone: '9741334455',
    etaMinutes: 18,
    dispatchNote: 'Dispatched emergency trauma first-aid paramedic kits and coordinated with district blood bank for immediate delivery.',
    deliveryPhoto: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
    resolutionOtp: '8312'
  }
];

export default function ExaminerLiveDemoModal({
  isOpen,
  onClose,
  onExecuteScenario
}) {
  const [runningId, setRunningId] = useState(null);
  const [stepStatus, setStepStatus] = useState('');

  if (!isOpen) return null;

  const handleRun = async (scenario, isLive) => {
    setRunningId(scenario.id);
    if (isLive) {
      setStepStatus('Step 1/3: Ingesting distress signal & running NLP Severity Token Scanner...');
      await new Promise(r => setTimeout(r, 900));
      setStepStatus(`Step 2/3: NLP escalated to ${scenario.urgency}. Matching nearest verified NGO (${scenario.targetNgoName})...`);
      await new Promise(r => setTimeout(r, 900));
      setStepStatus(`Step 3/3: Dispatching volunteer ${scenario.volunteerName} with ETA ${scenario.etaMinutes} mins & generating OTP #${scenario.resolutionOtp}...`);
      await new Promise(r => setTimeout(r, 900));
    }
    await onExecuteScenario(scenario, isLive);
    setRunningId(null);
    setStepStatus('');
    onClose();
  };

  return (
    <div className="modal-backdrop-clean" onClick={onClose} style={{ zIndex: 10000 }}>
      <div
        className="modal-card-pro"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '780px', width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}
      >
        <button
          type="button"
          className="modal-dismiss-btn"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ fontSize: '26px' }}>⚡</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
              Examiner Viva Live Demo Console
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
              One-click academic simulation of real Karnataka disaster relief scenarios without manual typing.
            </p>
          </div>
        </div>

        {stepStatus && (
          <div
            style={{
              margin: '14px 0',
              padding: '10px 14px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              color: '#1d4ed8',
              fontSize: '13px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span className="spinner-small" style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid #bfdbfe', borderTopColor: '#1d4ed8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></span>
            <span>{stepStatus}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
          {SCENARIOS.map(sc => (
            <div
              key={sc.id}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '24px' }}>{sc.icon}</span>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '15px', color: '#0f172a' }}>
                      {sc.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      District: <strong>{sc.district}</strong> &bull; Sector: <strong>{sc.category}</strong>
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    backgroundColor: sc.urgency === 'Critical' ? '#fee2e2' : '#fef3c7',
                    color: sc.urgency === 'Critical' ? '#dc2626' : '#d97706',
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    textTransform: 'uppercase'
                  }}
                >
                  {sc.urgency} Urgency
                </span>
              </div>

              <p style={{ fontSize: '12.5px', color: '#334155', lineHeight: '1.5', margin: '0 0 10px', backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>
                {sc.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '11.5px', marginBottom: '12px' }}>
                <div style={{ color: '#475569' }}>
                  🏢 Responding NGO: <strong style={{ color: '#0f172a' }}>{sc.targetNgoName}</strong>
                </div>
                <div style={{ color: '#475569' }}>
                  🦺 Volunteer: <strong style={{ color: '#0f172a' }}>{sc.volunteerName}</strong>
                </div>
                <div style={{ color: '#475569' }}>
                  ⏱️ Field ETA: <strong style={{ color: '#16a34a' }}>{sc.etaMinutes} mins</strong>
                </div>
                <div style={{ color: '#475569' }}>
                  🔐 Verification OTP: <strong style={{ color: '#2563eb', fontFamily: 'monospace' }}>#{sc.resolutionOtp}</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-outline-green"
                  disabled={runningId !== null}
                  onClick={() => handleRun(sc, false)}
                  style={{ fontSize: '12px', padding: '6px 12px', fontWeight: '700' }}
                >
                  ⚡ Instant 1-Click Injection
                </button>
                <button
                  type="button"
                  className="btn-primary-green"
                  disabled={runningId !== null}
                  onClick={() => handleRun(sc, true)}
                  style={{ fontSize: '12px', padding: '6px 14px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>🚀</span>
                  <span>{runningId === sc.id ? 'Simulating...' : 'Run Live Viva Walkthrough'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
          <span>Department of Information Science & Engineering &bull; Minor Project 2026</span>
          <button
            type="button"
            className="btn-card-secondary"
            onClick={onClose}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
