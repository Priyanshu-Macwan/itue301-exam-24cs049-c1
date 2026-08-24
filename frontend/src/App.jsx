import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ClassesPage from './pages/ClassesPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navigation />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/classes" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/classes" element={<ClassesPage />} />

          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/classes" replace />} />
        </Routes>
      </main>

      <footer style={{
        background: 'rgba(7, 9, 14, 0.95)',
        borderTop: '1px solid var(--border-glass)',
        padding: '1.5rem 0',
        marginTop: 'auto',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: 'var(--text-subtle)'
      }}>
        <div className="container">
          <p>© 2026 PULSE Studio & Fitness Management - ITUE301 Exam Solution (24CS049-C1)</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
