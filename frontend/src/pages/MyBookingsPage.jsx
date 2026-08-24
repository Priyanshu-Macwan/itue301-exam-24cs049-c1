import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const MyBookingsPage = () => {
  const { token, user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyBookings();
  }, [token]);

  const fetchMyBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/bookings/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to load bookings');
      }

      setBookings(Array.isArray(data) ? data : data.bookings || []);
    } catch (err) {
      setError(err.message || 'Error fetching member bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to cancel booking');
      }

      setBookings(bookings.filter((b) => b._id !== bookingId));
    } catch (err) {
      alert(err.message || 'Error cancelling booking');
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div className="editorial-kicker">MEMBER PORTAL</div>
        <h1 className="editorial-title">MY SCHEDULED SESSIONS.</h1>
        <p className="editorial-subtitle">
          Active class reservations for <strong>{user?.name || user?.email}</strong>.
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#6B705C' }}>
          <p>Loading member schedule from MongoDB Atlas...</p>
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#FBE8E8', border: '1px solid #E5A9A9', color: '#A93226', padding: '1rem', borderRadius: '4px' }}>
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="editorial-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#17231D' }}>NO ACTIVE RESERVATIONS</h3>
          <p style={{ color: '#6B705C', fontSize: '0.9rem', marginTop: '0.4rem' }}>
            You haven't reserved any fitness class sessions yet.
          </p>
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {bookings.map((b) => {
            const trainerObj = b.trainerId || b.trainer || {};
            const titleText = b.className || b.title || 'Fitness Session';

            return (
              <div key={b._id} className="editorial-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6B705C', textTransform: 'uppercase' }}>CLASS</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#17231D', margin: '0.2rem 0' }}>
                      {titleText}
                    </h3>
                  </div>
                  <span className={`badge ${(b.status === 'booked' || b.status === 'Scheduled') ? 'badge-available' : 'badge-booked'}`}>
                    {(b.status || 'booked').toUpperCase()}
                  </span>
                </div>

                <div style={{ background: '#F4F0E8', padding: '0.75rem', borderRadius: '4px', fontSize: '0.85rem', color: '#17231D', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
                  <div>💪 <strong>Trainer:</strong> {trainerObj.name || 'Assigned Trainer'}</div>
                  <div>🏷️ <strong>Specialization:</strong> {trainerObj.specialization || 'Fitness'}</div>
                  <div>🗓️ <strong>Date:</strong> {b.date}</div>
                  <div>⏰ <strong>Time Slot:</strong> {b.timeSlot}</div>
                </div>

                <button
                  onClick={() => handleCancelBooking(b._id)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', backgroundColor: '#A93226' }}
                >
                  CANCEL BOOKING
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
