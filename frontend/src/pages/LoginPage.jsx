import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('member@fitness.com');
  const [password, setPassword] = useState('password123');
  const [membershipType, setMembershipType] = useState('Premium');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/classes');
      } else {
        await register(name, email, password, membershipType);
        setSuccessMsg('Account created & saved in MongoDB Atlas! Redirecting...');
        setTimeout(() => navigate('/classes'), 1000);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
  };

  const handleQuickDemo = (demoType) => {
    if (demoType === 'member') {
      setEmail('member@fitness.com');
      setPassword('password123');
    } else {
      setEmail('admin@fitness.com');
      setPassword('admin123');
    }
    setIsLogin(true);
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="editorial-card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div className="editorial-kicker">FITZONE ATHLETIC CLUB</div>
          <h2 className="editorial-title" style={{ fontSize: '1.65rem' }}>
            {isLogin ? 'MEMBER LOGIN' : 'CREATE ACCOUNT'}
          </h2>
          <p className="editorial-subtitle">
            {isLogin ? 'Enter credentials to access fitness classes.' : 'Sign up to register a new member account in MongoDB Atlas.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', backgroundColor: '#F4F0E8', padding: '0.25rem', borderRadius: '4px' }}>
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); setSuccessMsg(''); }}
            className={`btn btn-sm ${isLogin ? 'btn-dark' : 'btn-outline'}`}
            style={{ flex: 1 }}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); }}
            className={`btn btn-sm ${!isLogin ? 'btn-dark' : 'btn-outline'}`}
            style={{ flex: 1 }}
          >
            REGISTER / SIGNUP
          </button>
        </div>

        {/* Demo Accounts Quick Fill */}
        <div style={{ backgroundColor: '#F4F0E8', padding: '0.75rem', borderRadius: '4px', marginBottom: '1.25rem', fontSize: '0.8rem' }}>
          <div style={{ fontWeight: 800, color: '#17231D', marginBottom: '0.35rem' }}>⚡ DEMO LOGIN ACCOUNTS</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleQuickDemo('member')}
              className="btn btn-sm btn-outline"
              style={{ flex: 1, fontSize: '0.7rem' }}
            >
              Member Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="btn btn-sm btn-primary"
              style={{ flex: 1, fontSize: '0.7rem' }}
            >
              Admin Demo
            </button>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FBE8E8', border: '1px solid #E5A9A9', color: '#A93226', padding: '0.75rem', borderRadius: '4px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            ⚠️ {error}
          </div>
        )}

        {successMsg && (
          <div style={{ backgroundColor: '#EAF4EC', border: '1px solid #BCE1C3', color: '#1E6B34', padding: '0.75rem', borderRadius: '4px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            ✅ {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">FULL NAME</label>
              <input
                type="text"
                required
                placeholder="Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">EMAIL ADDRESS</label>
            <input
              type="email"
              required
              placeholder="member@fitness.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">PASSWORD</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">MEMBERSHIP TYPE</label>
              <select value={membershipType} onChange={(e) => setMembershipType(e.target.value)} className="form-select">
                <option value="Basic">Basic ($29/mo)</option>
                <option value="Premium">Premium ($59/mo)</option>
                <option value="VIP">VIP ($99/mo)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', height: '46px' }}
          >
            {loading ? 'PROCESSING...' : isLogin ? '[ SIGN IN NOW ]' : '[ REGISTER ACCOUNT ]'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
