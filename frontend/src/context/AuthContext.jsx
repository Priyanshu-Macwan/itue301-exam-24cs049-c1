import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [role, setRole] = useState(() => localStorage.getItem('role') || 'member');
  const [loading, setLoading] = useState(false);

  // Restore & verify user on mount if token exists
  useEffect(() => {
    if (token && !user) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setUser(data.user);
            setRole(data.user.role || 'member');
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('role', data.user.role || 'member');
          }
        })
        .catch(() => {});
    }
  }, [token]);

  const register = async (name, email, password, membershipType = 'Premium') => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, membershipType })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      setUser(data.user);
      setToken(data.token);
      setRole('member');

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', 'member');

      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed. Invalid credentials.');
      }

      setUser(data.user);
      setToken(data.token);
      setRole(data.user.role || 'member');

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role || 'member');

      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
    setRole('member');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        member: user,
        token,
        role,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!token,
        isAdmin: role === 'admin' || user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
