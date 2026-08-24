import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Calendar, ShieldCheck, LogOut, LogIn, User, Sparkles } from 'lucide-react';

const Navigation = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(7, 9, 14, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-glass)',
      padding: '0.85rem 0'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-cyan) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)'
          }}>
            <Dumbbell size={24} color="#ffffff" />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff' }}>
              PULSE<span style={{ color: 'var(--accent-cyan)' }}>FIT</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-subtle)', fontWeight: 700, letterSpacing: '0.1em' }}>
              STUDIO & CLUB
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link
            to="/classes"
            className={`btn btn-sm ${isActive('/classes') ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Dumbbell size={16} />
            Fitness Classes & Trainers
          </Link>

          {isAuthenticated && (
            <Link
              to="/my-bookings"
              className={`btn btn-sm ${isActive('/my-bookings') ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Calendar size={16} />
              My Bookings
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={`btn btn-sm ${isActive('/admin') ? 'btn-accent' : 'btn-secondary'}`}
            >
              <ShieldCheck size={16} />
              Admin Portal
            </Link>
          )}
        </nav>

        {/* Auth Controls & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                border: '1px solid var(--border-glass)'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isAdmin ? 'var(--accent-cyan)' : 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  color: '#fff'
                }}>
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, lineHeight: 1 }}>{user.name}</div>
                  <span className={`badge ${isAdmin ? 'badge-cyan' : 'badge-purple'}`} style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', marginTop: '0.1rem' }}>
                    {isAdmin ? 'Admin' : `${user.membershipType} Member`}
                  </span>
                </div>
              </div>

              <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Logout">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              <LogIn size={16} />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navigation;
