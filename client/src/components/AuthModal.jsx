import React, { useState, useMemo } from 'react';

const DEFAULT_NGOS = [
  'The Shimoga Multipurpose Social Service Society',
  'Vishwabharti Trust',
  'Vivekananda Rural Development Society',
  'WEDS- WOMEN AND EDUCATION DEVELOPMENT SOCIETY',
  'Yashaswini mahila educational & rural development trust',
  'youths rural development organisation',
  'YOUTH EFFORTS FOR SOCIETY TRUST',
  'Vidyasinchana Educational Trust'
];

export default function AuthModal({ isOpen, onClose, onLoginSuccess, ngos = [] }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('citizen');
  const [selectedNGO, setSelectedNGO] = useState('The Shimoga Multipurpose Social Service Society');
  const [customNGO, setCustomNGO] = useState('');
  const [designation, setDesignation] = useState('');
  const [orgPhone, setOrgPhone] = useState('');

  const allNgosList = useMemo(() => {
    const set = new Set(DEFAULT_NGOS);
    ngos.forEach(n => {
      if (n.name) set.add(n.name);
    });
    return Array.from(set).sort();
  }, [ngos]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister && !name.trim()) {
      alert('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      alert('Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      alert('Please enter your password.');
      return;
    }
    if (password.trim().length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    if (isRegister && role === 'ngo' && orgPhone.trim().length !== 10) {
      alert('Official NGO contact number must be exactly 10 digits.');
      return;
    }

    const effectiveNGO = selectedNGO === 'Other' ? (customNGO.trim() || 'Community Relief NGO') : selectedNGO;

    const user = {
      id: 'usr_' + Date.now(),
      name: name.trim() || (role === 'ngo' ? `${effectiveNGO} Coordinator` : email.split('@')[0]),
      email: email.trim(),
      role: role,
      ngoName: role === 'ngo' ? effectiveNGO : undefined,
      designation: role === 'ngo' ? (designation.trim() || 'Operations Coordinator') : undefined,
      phone: orgPhone ? orgPhone.trim() : '9876543210'
    };

    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="modal-backdrop-clean" onClick={onClose}>
      <div className="auth-dialog-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <button type="button" className="modal-dismiss-btn" onClick={onClose}>✕</button>

        <div className="auth-card-header">
          <div className="auth-leaf-icon">🌿</div>
          <h3>{isRegister ? 'Create an Account' : 'Sign in to AidConnect'}</h3>
          <p>Connect as a Citizen Requester or Verified NGO Representative</p>
        </div>

        {/* Identity Selector */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            type="button"
            className={`sector-tab-pill ${role === 'citizen' ? 'active' : ''}`}
            onClick={() => setRole('citizen')}
            style={{ flex: 1, padding: '8px', fontSize: '13px', fontWeight: '700' }}
          >
            👤 Citizen Requester
          </button>
          <button
            type="button"
            className={`sector-tab-pill ${role === 'ngo' ? 'active' : ''}`}
            onClick={() => setRole('ngo')}
            style={{ flex: 1, padding: '8px', fontSize: '13px', fontWeight: '700' }}
          >
            🏢 NGO Representative
          </button>
        </div>

        <form className="auth-form-content" onSubmit={handleSubmit}>
          {role === 'ngo' && (
            <div style={{ backgroundColor: '#f0fdf4', padding: '12px 14px', borderRadius: '8px', border: '1px solid #86efac', marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#166534', marginBottom: '6px' }}>
                Select Your Verified NGO Organization:
              </label>
              <select
                className="input-control select-control"
                value={selectedNGO}
                onChange={e => setSelectedNGO(e.target.value)}
                required
              >
                {allNgosList.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
                <option value="Other">Other Verified NGO...</option>
              </select>

              {selectedNGO === 'Other' && (
                <div style={{ marginTop: '8px' }}>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Enter official NGO name..."
                    value={customNGO}
                    onChange={e => setCustomNGO(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>
          )}

          {isRegister && (
            <div className="form-field">
              <label>Full Name</label>
              <input
                type="text"
                className="input-control"
                placeholder={role === 'ngo' ? 'e.g. Rajesh Kumar (Operations Lead)' : 'Your full name'}
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-field">
            <label>Email Address</label>
            <input
              type="email"
              className="input-control"
              placeholder={role === 'ngo' ? 'coordinator@organization.org' : 'name@example.com'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label>Password</label>
            <input
              type="password"
              className="input-control"
              placeholder="••••••••"
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {isRegister && role === 'ngo' && (
            <>
              <div className="form-field">
                <label>Designation / Role in NGO</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="e.g. District Disaster Response Lead"
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label>Official Contact Mobile (10 digits)</label>
                <input
                  type="tel"
                  maxLength={10}
                  className="input-control"
                  placeholder="10-digit mobile number"
                  value={orgPhone}
                  onChange={e => setOrgPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                />
              </div>
            </>
          )}

          <button type="submit" className="btn-primary-green auth-action-btn">
            {isRegister ? (role === 'ngo' ? 'Register NGO Representative' : 'Register Citizen Account') : (role === 'ngo' ? `Sign In as ${selectedNGO.slice(0, 22)}... Coordinator` : 'Sign In')}
          </button>
        </form>

        <div className="auth-toggle-footer">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button type="button" className="auth-link-button" onClick={() => setIsRegister(false)}>
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don&apos;t have an account?{' '}
              <button type="button" className="auth-link-button" onClick={() => setIsRegister(true)}>
                Register
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
