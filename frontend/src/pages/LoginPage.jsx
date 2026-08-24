import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Lock, Mail, User, Shield, Sparkles, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [membershipType, setMembershipType] = useState('Premium');
  const [role, setRole] = useState('member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password, membershipType, role);
      }
      navigate('/classes');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoRole) => {
    if (demoRole === 'member') {
      setEmail('member@fitness.com');
      setPassword('password123');
    } else {
      setEmail('admin@fitness.com');
      setPassword('admin123');
    }
    setIsLogin(true);
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div className="glass-panel-glow animate-fade-in" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '2.5rem 2rem',
        position: 'relative'
      }}>
        {/* Top Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-cyan) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)'
          }}>
            <Dumbbell size={30} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            {isLogin ? 'Sign in to access your fitness classes & bookings' : 'Join PULSE Studio for elite training & sessions'}
          </p>
        </div>

        {/* Quick Demo Credentials Banner */}
        <div style={{
          background: 'rgba(139, 92, 246, 0.08)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1rem',
          marginBottom: '1.5rem',
          fontSize: '0.825rem'
        }}>
          <div style={{ fontWeight: 700, color: '#c084fc', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={14} /> Quick Demo Login (One-Click)
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
            <button
              type="button"
              onClick={() => handleQuickDemo('member')}
              className="btn btn-sm btn-secondary"
              style={{ flex: 1, fontSize: '0.75rem', padding: '0.35rem' }}
            >
              Member Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="btn btn-sm btn-accent"
              style={{ flex: 1, fontSize: '0.75rem', padding: '0.35rem' }}
            >
              Admin Demo
            </button>
          </div>
        </div>

        {/* Mode Toggle Switch */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '0.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          border: '1px solid var(--border-glass)'
        }}>
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: isLogin ? 'var(--primary)' : 'transparent',
              color: isLogin ? '#fff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: !isLogin ? 'var(--primary)' : 'transparent',
              color: !isLogin ? '#fff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
          >
            Register
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: '0.85rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder="Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <User size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                placeholder="member@fitness.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
              <Lock size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Membership Tier</label>
                <select
                  value={membershipType}
                  onChange={(e) => setMembershipType(e.target.value)}
                  className="form-select"
                >
                  <option value="Basic">Basic ($29/mo - Access to Gym)</option>
                  <option value="Premium">Premium ($59/mo - Classes + Trainers)</option>
                  <option value="VIP">VIP ($99/mo - All Access Unlimited)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-select"
                >
                  <option value="member">Standard Gym Member</option>
                  <option value="admin">Administrator / Manager</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', height: '48px', fontSize: '1rem' }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <CheckCircle2 size={18} />
                {isLogin ? 'Sign In Now' : 'Create Account'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
