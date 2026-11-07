import React from 'react';

export default function IncidentReportModal({ requests = [], ngos = [], onClose }) {
  const handlePrint = () => {
    window.print();
  };

  const reportDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const totalMissions = requests.length;
  const resolvedMissions = requests.filter(r => r.status === 'Resolved').length;
  const inProgressMissions = requests.filter(r => r.status === 'In Progress').length;
  const criticalMissions = requests.filter(r => (r.urgency || '').toLowerCase() === 'critical').length;

  return (
    <div className="modal-backdrop-clean" onClick={onClose}>
      <div
        className="modal-card-pro"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '850px', width: '95%', maxHeight: '92vh', overflowY: 'auto', padding: '32px' }}
      >
        <button
          type="button"
          className="modal-dismiss-btn"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Printable Official Document */}
        <div id="incident-report-printable" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', color: '#166534' }}>
              Government of Karnataka &bull; Karnataka State Disaster Management Authority (KSDMA)
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '900', margin: '6px 0 2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Relief Operations Incident & Field Audit Report
            </h1>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Academic Minor Project Evaluation &bull; Department of Information Science & Engineering, The National Institute of Engineering, Mysuru
            </div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#334155', marginTop: '6px' }}>
              Generated On: {reportDate} &bull; Document Reference: KSDMA-AC-KAR-2026-RPT
            </div>
          </div>

          {/* KPI Summary Block */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              marginBottom: '24px',
              textAlign: 'center'
            }}
          >
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>{totalMissions}</div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Total Distress Signals</div>
            </div>
            <div style={{ border: '1px solid #86efac', backgroundColor: '#f0fdf4', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#166534' }}>{resolvedMissions}</div>
              <div style={{ fontSize: '11px', color: '#15803d', fontWeight: '700', textTransform: 'uppercase' }}>Delivered & Verified</div>
            </div>
            <div style={{ border: '1px solid #bae6fd', backgroundColor: '#f0f9ff', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#0284c7' }}>{inProgressMissions}</div>
              <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: '700', textTransform: 'uppercase' }}>In Field Transit</div>
            </div>
            <div style={{ border: '1px solid #fecaca', backgroundColor: '#fef2f2', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#dc2626' }}>{criticalMissions}</div>
              <div style={{ fontSize: '11px', color: '#b91c1c', fontWeight: '700', textTransform: 'uppercase' }}>Critical Urgency</div>
            </div>
          </div>

          {/* Incident Log Table */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Incident Audit & Resolution Log
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>Tracking ID</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>District</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>Category</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>Urgency</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>Responding NGO</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>OTP Audit</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => {
                  const resolvedNgo = req.resolutionNotes && req.resolutionNotes.includes('Resolved by')
                    ? req.resolutionNotes.replace('Resolved by', '').trim()
                    : (req.matchedNGOs && req.matchedNGOs.length > 0 ? req.matchedNGOs[0].name : 'Assigned NGO');
                  return (
                    <tr key={req._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontWeight: '700' }}>{req._id}</td>
                      <td style={{ padding: '8px 10px' }}>{req.city}</td>
                      <td style={{ padding: '8px 10px' }}>{req.category}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{
                          color: (req.urgency || '').toLowerCase() === 'critical' ? '#dc2626' : '#d97706',
                          fontWeight: '700'
                        }}>
                          {req.urgency}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px' }}>{resolvedNgo}</td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>
                        {req.resolutionOtp ? `🔐 ${req.resolutionOtp}` : '—'}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{
                          backgroundColor: req.status === 'Resolved' ? '#dcfce7' : (req.status === 'In Progress' ? '#e0f2fe' : '#fef3c7'),
                          color: req.status === 'Resolved' ? '#166534' : (req.status === 'In Progress' ? '#0369a1' : '#92400e'),
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: '700',
                          fontSize: '11px'
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

          {/* Signatures & Certification */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '36px', paddingTop: '20px', borderTop: '1px solid #cbd5e1' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '36px', borderBottom: '1px solid #475569', width: '180px', margin: '0 auto 6px' }}></div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a' }}>District Relief Coordinator</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>KSDMA Field Operations</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '36px', borderBottom: '1px solid #475569', width: '180px', margin: '0 auto 6px' }}></div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a' }}>Project Candidate / Guide</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Dept. of ISE, NIE Mysuru</div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
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
            <span>Print Official Incident Report (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
