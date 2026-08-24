import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TrainerCard from '../components/TrainerCard';

const ClassesPage = () => {
  const { token, user } = useAuth();
  const [trainers, setTrainers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchSpecialization, setSearchSpecialization] = useState('');

  // Booking Form State
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [className, setClassName] = useState('Extreme HIIT Burnout');
  const [date, setDate] = useState('2026-08-25');
  const [timeSlot, setTimeSlot] = useState('08:00 AM - 09:00 AM');

  // Booking Status Feedback
  const [bookingStatus, setBookingStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tRes, cRes] = await Promise.all([
        fetch('/api/trainers'),
        fetch('/api/bookings/classes')
      ]);

      if (!tRes.ok) throw new Error('Failed to fetch trainers from API');
      const tData = await tRes.json();
      setTrainers(Array.isArray(tData) ? tData : tData.trainers || []);
      if (tData.length > 0) {
        setSelectedTrainer(tData[0]);
      }

      if (cRes.ok) {
        const cData = await cRes.json();
        setClasses(Array.isArray(cData) ? cData : cData.classes || []);
      }
    } catch (err) {
      setError(err.message || 'Error loading fitness data from server.');
    } finally {
      setLoading(false);
    }
  };

  // Local Specialization Search Filter (Priority 5 - NO EXTRA API REQUEST!)
  const filteredTrainers = trainers.filter((t) =>
    (t.specialization || '')
      .toLowerCase()
      .includes(searchSpecialization.toLowerCase().trim())
  );

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTrainer) {
      alert('Please select a trainer first.');
      return;
    }

    setSubmitting(true);
    setBookingStatus(null);

    try {
      const res = await fetch('/api/bookings/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          trainerId: selectedTrainer._id,
          className,
          date,
          timeSlot
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || (data.errors && data.errors[0]) || 'Booking failed');
      }

      setBookingStatus({ success: true, message: 'Class session booked successfully in MongoDB!' });
    } catch (err) {
      setBookingStatus({ success: false, message: err.message || 'Failed to submit booking' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="editorial-kicker">FITZONE ATHLETIC CLUB</div>
        <h1 className="editorial-title">BOOK YOUR NEXT SESSION.</h1>
        <p className="editorial-subtitle">Choose your trainer, class and preferred time.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* LEFT COLUMN: Trainer Search & Cards */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#17231D' }}>
              TRAINERS ({filteredTrainers.length})
            </h3>
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Search by specialization (e.g. HIIT, Yoga, Core)..."
              value={searchSpecialization}
              onChange={(e) => setSearchSpecialization(e.target.value)}
              className="form-input"
            />
          </div>

          {loading && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6B705C' }}>
              <p>Loading available club trainers...</p>
            </div>
          )}

          {error && (
            <div style={{ backgroundColor: '#FBE8E8', border: '1px solid #E5A9A9', color: '#A93226', padding: '1rem', borderRadius: '4px' }}>
              ⚠️ {error}
            </div>
          )}

          {!loading && !error && filteredTrainers.length === 0 && (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#6B705C', background: '#FFFFFF', border: '1px solid #DCD6CD' }}>
              No trainers match specialization filter "{searchSpecialization}".
            </div>
          )}

          {!loading && !error && filteredTrainers.map((t) => (
            <TrainerCard
              key={t._id}
              name={t.name}
              specialization={t.specialization}
              available={t.available !== undefined ? t.available : true}
              isSelected={selectedTrainer?._id === t._id}
              onSelect={() => setSelectedTrainer(t)}
            />
          ))}
        </div>

        {/* RIGHT COLUMN: Booking Form */}
        <div>
          <div className="editorial-card">
            <div className="editorial-kicker">BOOK A CLASS</div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1rem', color: '#17231D' }}>
              SESSION RESERVATION
            </h3>

            <div style={{ background: '#F4F0E8', padding: '0.75rem 1rem', border: '1px solid #DCD6CD', borderRadius: '4px', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6B705C', textTransform: 'uppercase' }}>Selected Trainer:</span>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#17231D' }}>
                {selectedTrainer ? `${selectedTrainer.name} (${selectedTrainer.specialization})` : 'None Selected'}
              </div>
            </div>

            {bookingStatus && (
              <div style={{
                padding: '0.75rem',
                borderRadius: '4px',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
                backgroundColor: bookingStatus.success ? '#EAF4EC' : '#FBE8E8',
                color: bookingStatus.success ? '#1E6B34' : '#A93226',
                border: `1px solid ${bookingStatus.success ? '#BCE1C3' : '#E5A9A9'}`
              }}>
                {bookingStatus.message}
              </div>
            )}

            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label className="form-label">CLASS NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Extreme HIIT Burnout"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">DATE</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">TIME SLOT</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="form-select"
                >
                  <option value="07:00 AM - 08:00 AM">07:00 AM - 08:00 AM</option>
                  <option value="08:00 AM - 09:00 AM">08:00 AM - 09:00 AM</option>
                  <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                  <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM</option>
                  <option value="06:30 PM - 07:30 PM">06:30 PM - 07:30 PM</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedTrainer || (selectedTrainer.available === false)}
                className="btn btn-primary"
                style={{ width: '100%', height: '46px', marginTop: '0.5rem' }}
              >
                {submitting ? 'PROCESSING...' : '[ BOOK CLASS ]'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClassesPage;
