import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ClassesPage from './pages/ClassesPage';
import MyBookingsPage from './pages/MyBookingsPage';

const AdminPanel = lazy(() => import('./pages/AdminPanel'));

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navigation />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<LoginPage />} />

          <Route
            path="/classes"
            element={
              <ProtectedRoute>
                <ClassesPage />
              </ProtectedRoute>
            }
          />

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
                <Suspense fallback={
                  <div style={{ textAlign: 'center', padding: '4rem', color: '#6B705C' }}>
                    <p>Loading Admin Dashboard...</p>
                  </div>
                }>
                  <AdminPanel />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer style={{
        backgroundColor: '#17231D',
        color: '#6B705C',
        padding: '1.25rem 0',
        marginTop: 'auto',
        textAlign: 'center',
        fontSize: '0.8rem',
        borderTop: '1px solid #26382F'
      }}>
        <div className="container">
          <p>© FITZONE ATHLETIC CLUB & FITNESS MANAGEMENT — ITUE301 PRACTICAL EXAM</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
