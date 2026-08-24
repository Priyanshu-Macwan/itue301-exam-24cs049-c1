import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { user, token, role, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container header-container">
        <NavLink to={isAuthenticated ? '/classes' : '/'} className="brand-logo">
          FITZONE <span>ATHLETIC CLUB</span>
        </NavLink>

        <nav className="nav-links">
          {!isAuthenticated ? (
            <>
              <NavLink to="/login" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                LOGIN
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                REGISTER
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/classes" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                CLASSES
              </NavLink>

              <NavLink to="/my-bookings" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                MY BOOKINGS
              </NavLink>

              {isAdmin && (
                <NavLink to="/admin" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                  ADMIN PANEL
                </NavLink>
              )}

              <span style={{ fontSize: '0.8rem', color: '#E5B94C', fontWeight: 800, margin: '0 0.5rem' }}>
                [{user?.name || user?.email} {isAdmin ? '• ADMIN' : ''}]
              </span>

              <button
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
                style={{ padding: '0.35rem 0.85rem' }}
              >
                LOGOUT
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
