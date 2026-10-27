import React, { useState } from 'react';

const VERIFIED_NGOS_LIST = [
  'Mysuru Relief & Food Care',
  'Akshaya Patra Foundation',
  'Mysuru Vidya Education Trust',
  'Goonj Disaster Relief',
  'Red Cross Society Relief',
  'Smile Foundation',
  'Teach For India',
  'Doctors For You',
  'Helpage India',
  'Other'
];

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('citizen');
  const [selectedNGO, setSelectedNGO] = useState('Mysuru Relief & Food Care');
  const [customNGO, setCustomNGO] = useState('');
  const [designation, setDesignation] = useState('');
  const [orgPhone, setOrgPhone] = useState('');

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
      name: name.trim() || email.split('@')[0],
      email: email.trim(),
      role: isRegister ? role : (email.includes('ngo') ? 'ngo' : 'citizen'),
      ngoName: role === 'ngo' ? effectiveNGO : undefined,
      designation: role === 'ngo' ? (designation.trim() || 'Representative') : undefined,
      phone: orgPhone ? orgPhone.trim() : ''
    };

    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="modal-backdrop-clean" onClick={onClose}>
      <div className="auth-dialog-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <button type="button" className="modal-dismiss-btn" onClick={onClose}>✕</button>

        <div className="auth-card-header">
          <div className="auth-leaf-icon">🌿</div>
          <h3>{isRegister ? 'Create an Account' : 'Sign in to AidConnect'}</h3>
          <p>Access your submitted requests and organization dashboards</p>
        </div>

        <form className="auth-form-content" onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-field">
              <label>Full Name</label>
              <input
                type="text"
                className="input-control"
                placeholder="Enter your full name"
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
              placeholder="name@organization.org"
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

          {isRegister && (
            <>
              <div className="form-field">
                <label>Account Type</label>
                <select
                  className="input-control select-control"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  required
                >
                  <option value="citizen">Citizen / Aid Requester</option>
                  <option value="ngo">NGO Representative</option>
                  <option value="coordinator">Emergency Coordinator</option>
                </select>
              </div>

              {role === 'ngo' && (
                <div style={{ backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0', marginTop: '6px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#166534', marginBottom: '8px' }}>
                    🏢 NGO Organization Details:
                  </div>

                  <div className="form-field" style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '12px', color: '#166534' }}>Select Verified NGO Organization</label>
                    <select
                      className="input-control select-control"
                      value={selectedNGO}
                      onChange={e => setSelectedNGO(e.target.value)}
                      required
                    >
                      {VERIFIED_NGOS_LIST.map(ngo => (
                        <option key={ngo} value={ngo}>{ngo}</option>
                      ))}
                    </select>
                  </div>

                  {selectedNGO === 'Other' && (
                    <div className="form-field" style={{ marginBottom: '8px' }}>
                      <label style={{ fontSize: '12px', color: '#166534' }}>Enter NGO Organization Name</label>
                      <input
                        type="text"
                        className="input-control"
                        placeholder="e.g. Karuna Rural Trust"
                        value={customNGO}
                        onChange={e => setCustomNGO(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="form-field" style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '12px', color: '#166534' }}>Your Official Role / Designation</label>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="e.g. Relief Coordinator, Field Lead, Director"
                      value={designation}
                      onChange={e => setDesignation(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field" style={{ marginBottom: '0' }}>
                    <label style={{ fontSize: '12px', color: '#166534' }}>Official Contact Number (10 digits)</label>
                    <input
                      type="tel"
                      maxLength={10}
                      className="input-control"
                      placeholder="10-digit mobile number"
                      value={orgPhone}
                      onChange={e => setOrgPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      required
                    />
                    {orgPhone && orgPhone.length > 0 && orgPhone.length < 10 && (
                      <span style={{ fontSize: '11px', color: '#dc2626', marginTop: '3px', display: 'block' }}>
                        {10 - orgPhone.length} more digit{10 - orgPhone.length === 1 ? '' : 's'} required
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          <button type="submit" className="btn-primary-green auth-action-btn">
            {isRegister ? 'Register Account' : 'Sign In'}
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
              Don't have an account?{' '}
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
