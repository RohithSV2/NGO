import React, { useState } from 'react';

export default function IncidentReportModal({ requests = [], ngos = [], onClose }) {
  const [selectedIncidentId, setSelectedIncidentId] = useState(requests.length > 0 ? requests[0]._id : null);

  const handlePrint = () => {
    window.print();
  };

  const reportDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const reportTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const totalMissions = requests.length;
  const resolvedMissions = requests.filter(r => r.status === 'Resolved').length;
  const inProgressMissions = requests.filter(r => r.status === 'In Progress').length;
  const criticalMissions = requests.filter(r => (r.urgency || '').toLowerCase() === 'critical').length;

  const activeIncident = requests.find(r => r._id === selectedIncidentId) || requests[0] || null;

  return (
    <div className="modal-backdrop-clean incident-report-modal-backdrop" onClick={onClose} style={{ zIndex: 10000 }}>
      <div
        className="modal-card-pro incident-dossier-card"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '920px',
          width: '95%',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '36px',
          backgroundColor: '#ffffff'
        }}
      >
        <button
          type="button"
          className="modal-dismiss-btn no-print"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Printable Official Government Docket */}
        <div id="incident-report-printable" className="ksdma-dossier-container">
          {/* Official Karnataka Disaster Cell & NDRF Header */}
          <div className="dossier-header" style={{ textAlign: 'center', borderBottom: '3px double #0f172a', paddingBottom: '18px', marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
              <div style={{ fontSize: '36px' }}>🏛️</div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#166534' }}>
                  Government of Karnataka &bull; Relief Operations Wing
                </div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', letterSpacing: '0.5px' }}>
                  Karnataka State Disaster Management Authority (KSDMA)
                </div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', letterSpacing: '1px' }}>
                  In Joint Collaboration with National Disaster Response Force (NDRF) Field Cell
                </div>
              </div>
              <div style={{ fontSize: '36px' }}>🛡️</div>
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: '900', margin: '12px 0 4px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#0f172a' }}>
              Official Incident Dossier & Relief Field Audit Report
            </h1>

            <div style={{ fontSize: '12px', color: '#475569', fontWeight: '500' }}>
              Academic Minor Project Evaluation &bull; Department of Information Science & Engineering, The National Institute of Engineering (NIE), Mysuru
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', fontSize: '11.5px', color: '#334155' }}>
              <div>
                <strong>Dossier Ref:</strong> <span style={{ fontFamily: 'monospace' }}>DOC/KSDMA-NDRF/2026/KA-{activeIncident?._id || 'AUDIT'}</span>
              </div>
              <div>
                <strong>Audit Timestamp:</strong> {reportDate} at {reportTime}
              </div>
              <div>
                <strong>Security Level:</strong> <span style={{ color: '#dc2626', fontWeight: '700' }}>RESTRICTED OFFICIAL RELIEF</span>
              </div>
            </div>
          </div>

          {/* Quick Filter Pill Selector (Hidden in Print) */}
          {requests.length > 1 && (
            <div className="no-print" style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>
                Select Incident Case to Feature in Detail:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {requests.map(r => (
                  <button
                    key={r._id}
                    type="button"
                    onClick={() => setSelectedIncidentId(r._id)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      borderRadius: '6px',
                      border: r._id === activeIncident?._id ? '2px solid #16a34a' : '1px solid #cbd5e1',
                      backgroundColor: r._id === activeIncident?._id ? '#f0fdf4' : '#ffffff',
                      color: r._id === activeIncident?._id ? '#166534' : '#334155',
                      fontWeight: r._id === activeIncident?._id ? '800' : '600',
                      cursor: 'pointer'
                    }}
                  >
                    #{r._id} &bull; {r.city} ({r.urgency})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Key Executive Metrics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              marginBottom: '24px',
              textAlign: 'center'
            }}
          >
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 14px' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>{totalMissions}</div>
              <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Ingested Distress Calls</div>
            </div>
            <div style={{ border: '1px solid #86efac', backgroundColor: '#f0fdf4', borderRadius: '8px', padding: '10px 14px' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#166534' }}>{resolvedMissions}</div>
              <div style={{ fontSize: '10.5px', color: '#15803d', fontWeight: '700', textTransform: 'uppercase' }}>OTP Verified Delivery</div>
            </div>
            <div style={{ border: '1px solid #bae6fd', backgroundColor: '#f0f9ff', borderRadius: '8px', padding: '10px 14px' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#0284c7' }}>{inProgressMissions}</div>
              <div style={{ fontSize: '10.5px', color: '#0369a1', fontWeight: '700', textTransform: 'uppercase' }}>Active Field Transit</div>
            </div>
            <div style={{ border: '1px solid #fecaca', backgroundColor: '#fef2f2', borderRadius: '8px', padding: '10px 14px' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#dc2626' }}>{criticalMissions}</div>
              <div style={{ fontSize: '10.5px', color: '#b91c1c', fontWeight: '700', textTransform: 'uppercase' }}>Critical Urgency</div>
            </div>
          </div>

          {/* Featured Incident Detailed Dossier */}
          {activeIncident && (
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '18px', marginBottom: '24px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Featured Incident Case Study
                  </span>
                  <h3 style={{ margin: '2px 0 0', fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                    {activeIncident.title}
                  </h3>
                </div>
                <span
                  style={{
                    backgroundColor: activeIncident.urgency === 'Critical' ? '#fee2e2' : '#fef3c7',
                    color: activeIncident.urgency === 'Critical' ? '#dc2626' : '#d97706',
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    textTransform: 'uppercase'
                  }}
                >
                  {activeIncident.urgency} Urgency
                </span>
              </div>

              {/* 5-Stage Incident Severity Timeline */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#334155', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                  Incident Severity & Operational Lifecycle Timeline
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', textAlign: 'center', fontSize: '11px' }}>
                  <div style={{ backgroundColor: '#f1f5f9', padding: '8px 4px', borderRadius: '6px', borderTop: '3px solid #16a34a' }}>
                    <div style={{ fontWeight: '800', color: '#0f172a' }}>1. Distress Ingestion</div>
                    <div style={{ color: '#64748b', fontSize: '10px', marginTop: '2px' }}>Citizen GPS Locked</div>
                  </div>
                  <div style={{ backgroundColor: '#f1f5f9', padding: '8px 4px', borderRadius: '6px', borderTop: '3px solid #16a34a' }}>
                    <div style={{ fontWeight: '800', color: '#0f172a' }}>2. NLP Severity Triage</div>
                    <div style={{ color: '#166534', fontSize: '10px', fontWeight: '700', marginTop: '2px' }}>Tokens Evaluated</div>
                  </div>
                  <div style={{ backgroundColor: '#f1f5f9', padding: '8px 4px', borderRadius: '6px', borderTop: '3px solid #16a34a' }}>
                    <div style={{ fontWeight: '800', color: '#0f172a' }}>3. Heuristic NGO Match</div>
                    <div style={{ color: '#0f172a', fontSize: '10px', marginTop: '2px' }}>Capacity Audited</div>
                  </div>
                  <div style={{ backgroundColor: '#f1f5f9', padding: '8px 4px', borderRadius: '6px', borderTop: '3px solid #16a34a' }}>
                    <div style={{ fontWeight: '800', color: '#0f172a' }}>4. Volunteer Dispatch</div>
                    <div style={{ color: '#0284c7', fontSize: '10px', fontWeight: '700', marginTop: '2px' }}>ETA Countdown Active</div>
                  </div>
                  <div style={{ backgroundColor: activeIncident.status === 'Resolved' ? '#dcfce7' : '#f1f5f9', padding: '8px 4px', borderRadius: '6px', borderTop: `3px solid ${activeIncident.status === 'Resolved' ? '#166534' : '#cbd5e1'}` }}>
                    <div style={{ fontWeight: '800', color: activeIncident.status === 'Resolved' ? '#166534' : '#64748b' }}>5. OTP Verification</div>
                    <div style={{ color: activeIncident.status === 'Resolved' ? '#15803d' : '#94a3b8', fontSize: '10px', fontWeight: '700', marginTop: '2px' }}>
                      {activeIncident.status === 'Resolved' ? 'Verified Handshake' : 'Pending OTP'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Three-Column Credentials & Verification Block */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', fontSize: '11.5px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                {/* Column 1: Responding NGO */}
                <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontWeight: '800', color: '#166534', marginBottom: '4px', textTransform: 'uppercase', fontSize: '11px' }}>
                    🏢 Assigned NGO Credentials
                  </div>
                  <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '12px' }}>
                    {activeIncident.targetNgoName || (activeIncident.matchedNGOs && activeIncident.matchedNGOs[0] ? activeIncident.matchedNGOs[0].name : 'Primary Karnataka Foundation')}
                  </div>
                  <div style={{ color: '#64748b', marginTop: '2px' }}>
                    Sector: {activeIncident.category}
                  </div>
                  <div style={{ color: '#64748b' }}>
                    District Base: {activeIncident.city}
                  </div>
                  <div style={{ color: '#15803d', fontWeight: '600', marginTop: '4px' }}>
                    State Certified Partner &bull; Darpan Verified
                  </div>
                </div>

                {/* Column 2: Assigned Volunteer Details */}
                <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontWeight: '800', color: '#0284c7', marginBottom: '4px', textTransform: 'uppercase', fontSize: '11px' }}>
                    🦺 Assigned Volunteer & Dispatch
                  </div>
                  <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '12px' }}>
                    {activeIncident.assignedVolunteerName || 'Sahana Hegde (Civil Defense)'}
                  </div>
                  <div style={{ color: '#64748b', marginTop: '2px' }}>
                    Contact Phone: {activeIncident.assignedVolunteerPhone || '+91 98452 23344'}
                  </div>
                  <div style={{ color: '#64748b' }}>
                    Field ETA: {activeIncident.etaMinutes ? `${activeIncident.etaMinutes} minutes` : '20 minutes'}
                  </div>
                  <div style={{ color: '#0369a1', fontWeight: '600', marginTop: '4px' }}>
                    Vehicle: 4WD Emergency Relief Minivan
                  </div>
                </div>

                {/* Column 3: OTP Verification & Delivery Photo */}
                <div style={{ backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontWeight: '800', color: '#166534', marginBottom: '4px', textTransform: 'uppercase', fontSize: '11px' }}>
                    🔐 Delivery Verification & Photo Audit
                  </div>
                  <div style={{ color: '#334155' }}>
                    Citizen OTP: <strong style={{ fontFamily: 'monospace', color: '#2563eb' }}>#{activeIncident.resolutionOtp || '4821'}</strong>
                  </div>
                  <div style={{ color: '#15803d', fontWeight: '700', marginTop: '2px' }}>
                    {activeIncident.status === 'Resolved' ? '✅ Handshake OTP Verified' : '⏳ Awaiting Citizen Handshake'}
                  </div>
                  {activeIncident.deliveryProofPhoto && (
                    <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <img
                        src={activeIncident.deliveryProofPhoto}
                        alt="Delivery Proof"
                        style={{ width: '40px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #86efac' }}
                      />
                      <span style={{ fontSize: '10px', color: '#166534', fontWeight: '600' }}>
                        Geo-tagged Photo Attached
                      </span>
                    </div>
                  )}
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                    Timestamp: {reportDate}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Mission Audit Log Table */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Consolidated Karnataka Field Operations Incident Log
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>Docket ID</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>District</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>Sector</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>Urgency</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>Responding NGO</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>Volunteer</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>OTP Verification</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => {
                  const resolvedNgo = req.targetNgoName || (req.matchedNGOs && req.matchedNGOs.length > 0 ? req.matchedNGOs[0].name : 'Primary Partner');
                  return (
                    <tr key={req._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '7px 10px', fontFamily: 'monospace', fontWeight: '700' }}>{req._id}</td>
                      <td style={{ padding: '7px 10px' }}>{req.city}</td>
                      <td style={{ padding: '7px 10px' }}>{req.category}</td>
                      <td style={{ padding: '7px 10px' }}>
                        <span style={{
                          color: (req.urgency || '').toLowerCase() === 'critical' ? '#dc2626' : '#d97706',
                          fontWeight: '800'
                        }}>
                          {req.urgency}
                        </span>
                      </td>
                      <td style={{ padding: '7px 10px' }}>{resolvedNgo}</td>
                      <td style={{ padding: '7px 10px' }}>{req.assignedVolunteerName || 'Field Team'}</td>
                      <td style={{ padding: '7px 10px', fontFamily: 'monospace', color: '#2563eb' }}>
                        {req.resolutionOtp ? `🔐 #${req.resolutionOtp}` : '—'}
                      </td>
                      <td style={{ padding: '7px 10px' }}>
                        <span style={{
                          backgroundColor: req.status === 'Resolved' ? '#dcfce7' : (req.status === 'In Progress' ? '#e0f2fe' : '#fef3c7'),
                          color: req.status === 'Resolved' ? '#166534' : (req.status === 'In Progress' ? '#0369a1' : '#92400e'),
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: '800',
                          fontSize: '10.5px'
                        }}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Official Signatures & Certification Block */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '36px', paddingTop: '20px', borderTop: '2px solid #0f172a' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '36px', borderBottom: '1px solid #475569', width: '200px', margin: '0 auto 6px' }}></div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a' }}>District Relief Commissioner</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>KSDMA Disaster Management Division</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '36px', borderBottom: '1px solid #475569', width: '200px', margin: '0 auto 6px' }}></div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a' }}>Senior NDRF Coordinating Officer</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>National Disaster Response Force, Karnataka</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '36px', borderBottom: '1px solid #475569', width: '200px', margin: '0 auto 6px' }}></div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a' }}>Candidate & Faculty Guide</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Dept. of Information Science, NIE Mysuru</div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer (Hidden in Print) */}
        <div className="modal-actions-footer no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Printer-friendly CSS enabled &bull; Use browser print to save directly as PDF
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn-card-secondary"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="btn-card-primary"
              onClick={handlePrint}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span>🖨️</span>
              <span>Export Incident Dossier (PDF / Print)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
