import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ClassesPage = () => {
  const { token, user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittingId, setSubmittingId] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch fitness classes from database');
      }

      setClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Error loading fitness classes.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookClass = async (classId) => {
    setSubmittingId(classId);
    setFeedback({});

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ fitnessClassId: classId })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to book class');
      }

      setFeedback({ [classId]: { success: true, message: 'Class session booked successfully!' } });

      // Update available spots locally
      setClasses((prev) =>
        prev.map((c) =>
          c._id === classId
            ? { ...c, availableSpots: Math.max(0, c.availableSpots - 1) }
            : c
        )
      );
    } catch (err) {
      setFeedback({ [classId]: { success: false, message: err.message || 'Booking failed' } });
    } finally {
      setSubmittingId(null);
    }
  };

  const filteredClasses = classes.filter(
    (c) => categoryFilter === 'All' || c.category === categoryFilter
  );

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="editorial-kicker">FITZONE ATHLETIC CLUB</div>
        <h1 className="editorial-title">AVAILABLE FITNESS CLASSES.</h1>
        <p className="editorial-subtitle">Select a scheduled class below to reserve your slot.</p>
      </div>

      {/* Category Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {['All', 'HIIT', 'Yoga', 'Strength', 'Pilates'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`btn btn-sm ${categoryFilter === cat ? 'btn-dark' : 'btn-outline'}`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#6B705C' }}>
          <p>Loading scheduled classes from MongoDB Atlas...</p>
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#FBE8E8', border: '1px solid #E5A9A9', color: '#A93226', padding: '1rem', borderRadius: '4px', marginBottom: '2rem' }}>
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && filteredClasses.length === 0 && (
        <div className="editorial-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#17231D' }}>NO CLASSES FOUND</h3>
          <p style={{ color: '#6B705C', fontSize: '0.9rem', marginTop: '0.4rem' }}>
            No scheduled classes match category filter "{categoryFilter}".
          </p>
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
          {filteredClasses.map((cls) => {
            const trainerObj = cls.trainer || {};
            const isFull = cls.availableSpots <= 0;
            const itemFb = feedback[cls._id];

            return (
              <div key={cls._id} className="editorial-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span className="badge badge-booked">{cls.category || 'HIIT'}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isFull ? '#A93226' : '#17231D' }}>
                      AVAILABLE: {cls.availableSpots} / {cls.capacity || 20}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#17231D', margin: '0.5rem 0' }}>
                    {cls.title}
                  </h3>

                  <div style={{ background: '#F4F0E8', padding: '0.85rem', borderRadius: '4px', fontSize: '0.85rem', color: '#17231D', display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: '1rem 0' }}>
                    <div>💪 <strong>Trainer:</strong> {trainerObj.name || 'Assigned Trainer'} ({trainerObj.specialization || 'Fitness'})</div>
                    <div>🗓️ <strong>Date:</strong> {cls.date}</div>
                    <div>⏰ <strong>Time:</strong> {cls.timeSlot}</div>
                    <div>📍 <strong>Location:</strong> {cls.location || 'Studio A'}</div>
                  </div>
                </div>

                <div>
                  {itemFb && (
                    <div style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '4px',
                      marginBottom: '0.75rem',
                      fontSize: '0.8rem',
                      backgroundColor: itemFb.success ? '#EAF4EC' : '#FBE8E8',
                      color: itemFb.success ? '#1E6B34' : '#A93226',
                      border: `1px solid ${itemFb.success ? '#BCE1C3' : '#E5A9A9'}`
                    }}>
                      {itemFb.message}
                    </div>
                  )}

                  <button
                    onClick={() => handleBookClass(cls._id)}
                    disabled={isFull || submittingId === cls._id}
                    className="btn btn-primary"
                    style={{ width: '100%', height: '44px' }}
                  >
                    {submittingId === cls._id ? 'BOOKING...' : isFull ? 'CLASS IS FULL' : '[ BOOK CLASS ]'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClassesPage;
