import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TrainerCard from '../components/TrainerCard';
import { Dumbbell, Calendar, Users, Clock, Search, Filter, Check, AlertCircle, Sparkles, X } from 'lucide-react';

const ClassesPage = () => {
  const { user, isAuthenticated, token } = useAuth();
  const [activeTab, setActiveTab] = useState('classes'); // 'classes' | 'trainers'
  const [classes, setClasses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [selectedClass, setSelectedClass] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedCategory, searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Classes
      let classUrl = `/api/bookings/classes?category=${selectedCategory}`;
      const classRes = await fetch(classUrl);
      const classData = await classRes.json();
      if (classData.success) {
        setClasses(classData.classes);
      }

      // Fetch Trainers
      let trainerUrl = `/api/trainers?search=${searchQuery}`;
      const trainerRes = await fetch(trainerUrl);
      const trainerData = await trainerRes.json();
      if (trainerData.success) {
        setTrainers(trainerData.trainers);
      }
    } catch (err) {
      console.error('Error fetching class or trainer data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClass = async (classObj) => {
    if (!isAuthenticated) {
      alert('Please sign in to book a fitness class.');
      return;
    }
    setSelectedClass(classObj);
    setBookingMessage(null);
  };

  const confirmBooking = async () => {
    if (!selectedClass) return;
    setBookingLoading(true);
    setBookingMessage(null);

    try {
      const res = await fetch('/api/bookings/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ classId: selectedClass._id })
      });
      const data = await res.json();

      if (data.success) {
        setBookingMessage({ type: 'success', text: data.message || 'Booking confirmed successfully!' });
        fetchData(); // Refresh list
        setTimeout(() => {
          setSelectedClass(null);
          setBookingMessage(null);
        }, 1800);
      } else {
        setBookingMessage({ type: 'error', text: data.error || 'Failed to book session' });
      }
    } catch (err) {
      setBookingMessage({ type: 'error', text: 'Network error booking class' });
    } finally {
      setBookingLoading(false);
    }
  };

  const categories = ['All', 'HIIT', 'Yoga', 'Strength', 'Pilates'];

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-purple" style={{ marginBottom: '0.5rem' }}>
            <Sparkles size={12} /> Elite Gym & Studio
          </span>
          <h1 className="page-title">Fitness Classes & Personal Trainers</h1>
          <p className="page-subtitle">
            Explore daily workouts, high-intensity HIIT, calming Yoga sessions, and elite trainers.
          </p>
        </div>

        {/* View Switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '0.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-glass)'
        }}>
          <button
            onClick={() => setActiveTab('classes')}
            className={`btn btn-sm ${activeTab === 'classes' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Calendar size={15} />
            Class Schedule ({classes.length})
          </button>
          <button
            onClick={() => setActiveTab('trainers')}
            className={`btn btn-sm ${activeTab === 'trainers' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Dumbbell size={15} />
            Personal Trainers ({trainers.length})
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Category Pill Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', marginRight: '0.3rem' }}>
            <Filter size={14} /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.825rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: selectedCategory === cat ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedCategory === cat ? '#fff' : 'var(--text-muted)',
                transition: 'var(--transition-fast)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '260px' }}>
          <input
            type="text"
            placeholder="Search trainer or class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.4rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', fontSize: '0.875rem' }}
          />
          <Search size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      {/* Main Content Sections */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid rgba(139, 92, 246, 0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
          <p>Loading scheduled fitness sessions...</p>
        </div>
      ) : activeTab === 'classes' ? (
        classes.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertCircle size={40} color="var(--text-subtle)" style={{ marginBottom: '0.5rem' }} />
            <h3>No classes found for category "{selectedCategory}"</h3>
            <p style={{ fontSize: '0.9rem', marginTop: '0.2rem' }}>Try selecting another category filter above.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {classes.map((cls) => {
              const bookedCount = cls.bookedMembers ? cls.bookedMembers.length : 0;
              const isFull = bookedCount >= cls.capacity;
              const isUserBooked = user && cls.bookedMembers?.some(b => b.memberId === user.id || b.memberId?._id === user.id);

              return (
                <div key={cls._id} className="glass-panel" style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  position: 'relative',
                  border: isUserBooked ? '1px solid var(--accent-green)' : '1px solid var(--border-glass)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className={`badge ${cls.category === 'HIIT' ? 'badge-pink' : cls.category === 'Yoga' ? 'badge-green' : 'badge-purple'}`}>
                        {cls.category}
                      </span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.4rem', color: '#fff' }}>
                        {cls.title}
                      </h3>
                    </div>
                    {isUserBooked && (
                      <span className="badge badge-green">
                        <Check size={12} /> Booked
                      </span>
                    )}
                  </div>

                  {/* Trainer Badge */}
                  {cls.trainer && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-md)' }}>
                      <img
                        src={cls.trainer.image || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80'}
                        alt={cls.trainer.name}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{cls.trainer.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{cls.trainer.specialization}</div>
                      </div>
                    </div>
                  )}

                  {/* Date, Time & Location Details */}
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={15} color="var(--primary)" />
                      <span>{cls.date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={15} color="var(--accent-cyan)" />
                      <span>{cls.timeSlot}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={15} color="var(--accent-amber)" />
                      <span>Capacity: {bookedCount} / {cls.capacity} Members ({isFull ? 'FULL' : `${cls.capacity - bookedCount} spots left`})</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                    {isUserBooked ? (
                      <button className="btn btn-secondary btn-sm" disabled style={{ width: '100%', opacity: 0.85 }}>
                        <Check size={16} /> Reserved in My Bookings
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBookClass(cls)}
                        disabled={isFull}
                        className={`btn btn-sm ${isFull ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ width: '100%' }}
                      >
                        {isFull ? 'Class Full' : 'Reserve Spot Now'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {trainers.map((tr) => (
            <TrainerCard
              key={tr._id}
              trainer={tr}
              onSelectTrainer={(trainer) => {
                setActiveTab('classes');
                setSearchQuery(trainer.name);
              }}
            />
          ))}
        </div>
      )}

      {/* Booking Confirmation Modal */}
      {selectedClass && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <button
              onClick={() => setSelectedClass(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
              Confirm Class Reservation
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Review class timing and trainer details before locking in your spot.
            </p>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{selectedClass.title}</h4>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <div>🗓 <strong>Date:</strong> {selectedClass.date}</div>
                <div>⏰ <strong>Time:</strong> {selectedClass.timeSlot}</div>
                <div>📍 <strong>Location:</strong> {selectedClass.location}</div>
                {selectedClass.trainer && <div>💪 <strong>Trainer:</strong> {selectedClass.trainer.name}</div>}
              </div>
            </div>

            {bookingMessage && (
              <div style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                background: bookingMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: bookingMessage.type === 'success' ? '#34d399' : '#fca5a5',
                border: `1px solid ${bookingMessage.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
              }}>
                {bookingMessage.text}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setSelectedClass(null)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmBooking}
                disabled={bookingLoading}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                {bookingLoading ? 'Reserving...' : 'Confirm Reservation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesPage;
