import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Trash2, CheckCircle2, AlertCircle, Dumbbell, UserCheck } from 'lucide-react';

const MyBookingsPage = () => {
  const { token, user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyBookings();
  }, [token]);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bookings/my-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings);
      } else {
        setError(data.error || 'Failed to load bookings');
      }
    } catch (err) {
      setError('Network error fetching bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (classId) => {
    if (!window.confirm('Are you sure you want to cancel this class reservation?')) {
      return;
    }

    setCancellingId(classId);
    try {
      const response = await fetch(`/api/bookings/${classId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setBookings(bookings.filter((b) => b._id !== classId));
      } else {
        alert(data.error || 'Could not cancel booking');
      }
    } catch (err) {
      alert('Error cancelling booking');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-cyan" style={{ marginBottom: '0.5rem' }}>
            <UserCheck size={12} /> Member Portal
          </span>
          <h1 className="page-title">My Class Schedule</h1>
          <p className="page-subtitle">
            Manage your active fitness class reservations and trainer sessions.
          </p>
        </div>

        <Link to="/classes" className="btn btn-primary btn-sm">
          <Dumbbell size={16} />
          Book More Classes
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid rgba(139, 92, 246, 0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
          <p>Fetching your reservations...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '560px', margin: '2rem auto' }}>
          <Calendar size={56} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>No Active Bookings Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            You haven't reserved any fitness classes. Browse our available sessions and lock in your spots now!
          </p>
          <Link to="/classes" className="btn btn-primary">
            Browse Class Schedule
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {bookings.map((booking) => (
            <div key={booking._id} className="glass-panel-glow animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="badge badge-purple">{booking.category || 'Fitness'}</span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginTop: '0.35rem' }}>
                    {booking.title}
                  </h3>
                </div>
                <span className="badge badge-green">
                  <CheckCircle2 size={12} /> Confirmed
                </span>
              </div>

              {/* Trainer Info */}
              {booking.trainer && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                  <img
                    src={booking.trainer.image || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80'}
                    alt={booking.trainer.name}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{booking.trainer.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{booking.trainer.specialization}</div>
                  </div>
                </div>
              )}

              {/* Timing & Location */}
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} color="var(--primary)" />
                  <span><strong>Date:</strong> {booking.date}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} color="var(--accent-cyan)" />
                  <span><strong>Time Slot:</strong> {booking.timeSlot}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={16} color="var(--accent-pink)" />
                  <span>{booking.location || 'Studio A - Main Fitness Hub'}</span>
                </div>
              </div>

              {/* Action Button */}
              <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                <button
                  onClick={() => handleCancelBooking(booking._id)}
                  disabled={cancellingId === booking._id}
                  className="btn btn-danger btn-sm"
                  style={{ width: '100%' }}
                >
                  <Trash2 size={15} />
                  {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Reservation'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
