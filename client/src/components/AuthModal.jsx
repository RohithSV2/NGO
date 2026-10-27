import React, { useState } from 'react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('citizen');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    const user = {
      id: 'usr_' + Date.now(),
      name: name.trim() || email.split('@')[0],
      email: email.trim(),
      role
    };
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="modal-backdrop-clean" onClick={onClose}>
      <div className="auth-dialog-card" onClick={e => e.stopPropagation()}>
        <button type="button" className="modal-dismiss-btn" onClick={onClose}>✕</button>

        <div className="auth-card-header">
          <div className="auth-leaf-icon">🌿</div>
          <h3>{isRegister ? 'Create an Account' : 'Sign in to AidConnect'}</h3>
          <p>Access your submitted requests and organization dashboards</p>
        </div>

        <form className="auth-form-content" onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-field">
              <label>Full Name *</label>
              <input
                type="text"
                className="input-control"
                placeholder="Your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-field">
            <label>Email Address *</label>
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
            <label>Password *</label>
            <input
              type="password"
              className="input-control"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <div className="form-field">
              <label>Account Type *</label>
              <select
                className="input-control select-control"
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                <option value="citizen">Citizen / Aid Requester</option>
                <option value="ngo">NGO Representative</option>
                <option value="coordinator">Emergency Coordinator</option>
              </select>
            </div>
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
