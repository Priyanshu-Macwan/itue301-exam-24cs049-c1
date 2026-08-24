import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const { token } = useAuth();
  const [trainers, setTrainers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Add Trainer Form State
  const [trainerName, setTrainerName] = useState('');
  const [specialization, setSpecialization] = useState('HIIT & Cardio');
  const [bio, setBio] = useState('');

  // Add Class Form State
  const [classTitle, setClassTitle] = useState('');
  const [category, setCategory] = useState('HIIT');
  const [selectedTrainerId, setSelectedTrainerId] = useState('');
  const [date, setDate] = useState('2026-08-28');
  const [timeSlot, setTimeSlot] = useState('09:00 AM - 10:00 AM');

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [tRes, cRes] = await Promise.all([
        fetch('/api/trainers'),
        fetch('/api/bookings/classes')
      ]);
      const tData = await tRes.json();
      const cData = await cRes.json();

      const trainersList = Array.isArray(tData) ? tData : tData.trainers || [];
      setTrainers(trainersList);
      if (trainersList.length > 0 && !selectedTrainerId) {
        setSelectedTrainerId(trainersList[0]._id);
      }

      setClasses(Array.isArray(cData) ? cData : cData.classes || []);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrainer = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch('/api/trainers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: trainerName, specialization, bio })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ success: true, text: `Trainer "${trainerName}" added to MongoDB Atlas!` });
        setTrainerName('');
        setBio('');
        fetchAdminData();
      } else {
        setMessage({ success: false, text: data.message || data.error || 'Failed to add trainer' });
      }
    } catch (err) {
      setMessage({ success: false, text: 'Error adding trainer' });
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch('/api/bookings/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: classTitle,
          className: classTitle,
          category,
          trainerId: selectedTrainerId,
          date,
          timeSlot
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ success: true, text: `Class "${classTitle}" created successfully!` });
        setClassTitle('');
        fetchAdminData();
      } else {
        setMessage({ success: false, text: data.message || data.error || 'Failed to create class' });
      }
    } catch (err) {
      setMessage({ success: false, text: 'Error creating class' });
    }
  };

  const handleDeleteTrainer = async (id) => {
    if (!window.confirm('Delete trainer profile?')) return;
    try {
      const res = await fetch(`/api/trainers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      alert('Error deleting trainer');
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Cancel/Delete fitness class schedule?')) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      alert('Error cancelling class');
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div className="editorial-kicker">MANAGEMENT PORTAL (PROTECTED + ADMIN ONLY)</div>
        <h1 className="editorial-title">ADMINISTRATOR CONTROL PANEL.</h1>
        <p className="editorial-subtitle">Add trainers, publish class schedules, and manage gym sessions.</p>
      </div>

      {message && (
        <div style={{
          padding: '0.75rem',
          borderRadius: '4px',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          backgroundColor: message.success ? '#EAF4EC' : '#FBE8E8',
          color: message.success ? '#1E6B34' : '#A93226',
          border: `1px solid ${message.success ? '#BCE1C3' : '#E5A9A9'}`
        }}>
          {message.text}
        </div>
      )}

      {/* Forms Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        
        {/* Form 1: Add Trainer */}
        <div className="editorial-card">
          <div className="editorial-kicker">TRAINER MANAGEMENT</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '1rem', color: '#17231D' }}>
            ADD NEW TRAINER
          </h3>
          <form onSubmit={handleAddTrainer}>
            <div className="form-group">
              <label className="form-label">TRAINER NAME</label>
              <input
                type="text"
                required
                placeholder="e.g. Jordan Vance"
                value={trainerName}
                onChange={(e) => setTrainerName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">SPECIALIZATION</label>
              <select value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="form-select">
                <option value="HIIT & Cardio">HIIT & Cardio</option>
                <option value="Yoga & Mindfulness">Yoga & Mindfulness</option>
                <option value="Strength & Bodybuilding">Strength & Bodybuilding</option>
                <option value="Pilates & Core">Pilates & Core</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">BIOGRAPHY</label>
              <input
                type="text"
                placeholder="Short bio..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="form-input"
              />
            </div>

            <button type="submit" className="btn btn-dark" style={{ width: '100%', marginTop: '0.5rem' }}>
              [ SAVE TRAINER ]
            </button>
          </form>
        </div>

        {/* Form 2: Create Class */}
        <div className="editorial-card">
          <div className="editorial-kicker">CLASS MANAGEMENT</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '1rem', color: '#17231D' }}>
            CREATE CLASS SCHEDULE
          </h3>
          <form onSubmit={handleCreateClass}>
            <div className="form-group">
              <label className="form-label">CLASS TITLE</label>
              <input
                type="text"
                required
                placeholder="e.g. Cardio Blast 360"
                value={classTitle}
                onChange={(e) => setClassTitle(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">ASSIGN TRAINER</label>
              <select value={selectedTrainerId} onChange={(e) => setSelectedTrainerId(e.target.value)} className="form-select" required>
                {trainers.map((t) => (
                  <option key={t._id} value={t._id}>{t.name} ({t.specialization})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">DATE</label>
                <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">TIME SLOT</label>
                <input type="text" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} className="form-input" />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              [ PUBLISH CLASS ]
            </button>
          </form>
        </div>
      </div>

      {/* Tables Section */}
      <div className="editorial-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 900, marginBottom: '1rem', color: '#17231D' }}>
          CLUB TRAINERS ({trainers.length})
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #17231D', color: '#17231D' }}>
              <th style={{ padding: '0.75rem' }}>NAME</th>
              <th style={{ padding: '0.75rem' }}>SPECIALIZATION</th>
              <th style={{ padding: '0.75rem' }}>AVAILABILITY</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {trainers.map((t) => (
              <tr key={t._id} style={{ borderBottom: '1px solid #DCD6CD' }}>
                <td style={{ padding: '0.75rem', fontWeight: 700 }}>{t.name}</td>
                <td style={{ padding: '0.75rem', color: '#6B705C' }}>{t.specialization}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span className={`badge ${t.available !== false ? 'badge-available' : 'badge-booked'}`}>
                    {t.available !== false ? 'AVAILABLE' : 'FULLY BOOKED'}
                  </span>
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                  <button onClick={() => handleDeleteTrainer(t._id)} className="btn btn-primary btn-sm" style={{ backgroundColor: '#A93226' }}>
                    DELETE
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="editorial-card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 900, marginBottom: '1rem', color: '#17231D' }}>
          SCHEDULED CLASSES ({classes.length})
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #17231D', color: '#17231D' }}>
              <th style={{ padding: '0.75rem' }}>CLASS TITLE</th>
              <th style={{ padding: '0.75rem' }}>TRAINER</th>
              <th style={{ padding: '0.75rem' }}>DATE & TIME</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((c) => (
              <tr key={c._id} style={{ borderBottom: '1px solid #DCD6CD' }}>
                <td style={{ padding: '0.75rem', fontWeight: 700 }}>{c.title || c.className}</td>
                <td style={{ padding: '0.75rem', color: '#6B705C' }}>
                  {(c.trainer && c.trainer.name) || (c.trainerId && c.trainerId.name) || 'Assigned Trainer'}
                </td>
                <td style={{ padding: '0.75rem' }}>{c.date} ({c.timeSlot})</td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                  <button onClick={() => handleDeleteClass(c._id)} className="btn btn-primary btn-sm" style={{ backgroundColor: '#A93226' }}>
                    CANCEL CLASS
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
