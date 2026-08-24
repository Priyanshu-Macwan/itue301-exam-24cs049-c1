import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Plus, Trash2, Users, Calendar, Award, DollarSign, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const AdminPanel = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'trainers' | 'classes'
  const [trainers, setTrainers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  // New Trainer Form State
  const [trainerForm, setTrainerForm] = useState({
    name: '',
    specialization: 'HIIT & Cardio',
    bio: '',
    experienceYears: 4,
    rating: 4.9,
    hourlyRate: 70,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
  });

  // New Class Form State
  const [classForm, setClassForm] = useState({
    title: '',
    category: 'HIIT',
    trainerId: '',
    date: '2026-08-27',
    timeSlot: '09:00 AM - 10:00 AM',
    location: 'Studio A - Main Fitness Hub',
    capacity: 15
  });

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

      if (tData.success) setTrainers(tData.trainers);
      if (cData.success) {
        setClasses(cData.classes);
        if (tData.trainers.length > 0 && !classForm.trainerId) {
          setClassForm(prev => ({ ...prev, trainerId: tData.trainers[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrainer = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await fetch('/api/trainers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(trainerForm)
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: `Trainer "${data.trainer.name}" added successfully!` });
        setTrainerForm({
          name: '',
          specialization: 'HIIT & Cardio',
          bio: '',
          experienceYears: 4,
          rating: 4.9,
          hourlyRate: 70,
          image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
        });
        fetchAdminData();
      } else {
        setMsg({ type: 'error', text: data.error || 'Failed to add trainer' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Network error creating trainer' });
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await fetch('/api/bookings/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(classForm)
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: `Class "${data.class.title}" scheduled successfully!` });
        setClassForm({
          title: '',
          category: 'HIIT',
          trainerId: trainers[0]?._id || '',
          date: '2026-08-27',
          timeSlot: '09:00 AM - 10:00 AM',
          location: 'Studio A - Main Fitness Hub',
          capacity: 15
        });
        fetchAdminData();
      } else {
        setMsg({ type: 'error', text: data.error || 'Failed to schedule class' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Network error creating class' });
    }
  };

  const handleDeleteTrainer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trainer?')) return;
    try {
      const res = await fetch(`/api/trainers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTrainers(trainers.filter(t => t._id !== id));
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error deleting trainer');
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Are you sure you want to cancel/delete this fitness class?')) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error cancelling class');
    }
  };

  const totalBookingsCount = classes.reduce((acc, c) => acc + (c.bookedMembers ? c.bookedMembers.length : 0), 0);

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-cyan" style={{ marginBottom: '0.5rem' }}>
            <ShieldCheck size={12} /> Management Portal
          </span>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">
            Manage gym trainers, schedule fitness classes, and track member reservations.
          </p>
        </div>

        <button onClick={fetchAdminData} className="btn btn-secondary btn-sm">
          <RefreshCw size={15} />
          Refresh Stats
        </button>
      </div>

      {/* Admin KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)' }}>Total Trainers</span>
            <Users size={22} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>{trainers.length}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-cyan)' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)' }}>Active Classes</span>
            <Calendar size={22} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>{classes.length}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-green)' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)' }}>Class Bookings</span>
            <Award size={22} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>{totalBookingsCount}</div>
        </div>
      </div>

      {msg && (
        <div style={{
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          background: msg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: msg.type === 'success' ? '#34d399' : '#fca5a5',
          border: `1px solid ${msg.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
        }}>
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Add Trainer & Schedule Class
        </button>
        <button
          onClick={() => setActiveTab('trainers')}
          className={`btn btn-sm ${activeTab === 'trainers' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Manage Trainers ({trainers.length})
        </button>
        <button
          onClick={() => setActiveTab('classes')}
          className={`btn btn-sm ${activeTab === 'classes' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Manage Classes ({classes.length})
        </button>
      </div>

      {/* Tab 1: Create Forms */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem' }}>
          {/* Add Trainer Form */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} color="var(--primary)" /> Add New Fitness Trainer
            </h3>
            <form onSubmit={handleCreateTrainer}>
              <div className="form-group">
                <label className="form-label">Trainer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Hayes"
                  value={trainerForm.name}
                  onChange={(e) => setTrainerForm({ ...trainerForm, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Specialization</label>
                <select
                  value={trainerForm.specialization}
                  onChange={(e) => setTrainerForm({ ...trainerForm, specialization: e.target.value })}
                  className="form-select"
                >
                  <option value="HIIT & Cardio">HIIT & Cardio</option>
                  <option value="Yoga & Mindfulness">Yoga & Mindfulness</option>
                  <option value="Strength & Bodybuilding">Strength & Bodybuilding</option>
                  <option value="Pilates & Core">Pilates & Core</option>
                  <option value="CrossFit & Conditioning">CrossFit & Conditioning</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Biography</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Short bio detailing certifications & background..."
                  value={trainerForm.bio}
                  onChange={(e) => setTrainerForm({ ...trainerForm, bio: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Exp (Years)</label>
                  <input
                    type="number"
                    value={trainerForm.experienceYears}
                    onChange={(e) => setTrainerForm({ ...trainerForm, experienceYears: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hourly Rate ($)</label>
                  <input
                    type="number"
                    value={trainerForm.hourlyRate}
                    onChange={(e) => setTrainerForm({ ...trainerForm, hourlyRate: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                Save Trainer Profile
              </button>
            </form>
          </div>

          {/* Schedule Class Form */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} color="var(--accent-cyan)" /> Schedule New Class Slot
            </h3>
            <form onSubmit={handleCreateClass}>
              <div className="form-group">
                <label className="form-label">Class Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cardio Blast 360"
                  value={classForm.title}
                  onChange={(e) => setClassForm({ ...classForm, title: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={classForm.category}
                    onChange={(e) => setClassForm({ ...classForm, category: e.target.value })}
                    className="form-select"
                  >
                    <option value="HIIT">HIIT</option>
                    <option value="Yoga">Yoga</option>
                    <option value="Strength">Strength</option>
                    <option value="Pilates">Pilates</option>
                    <option value="Cardio">Cardio</option>
                    <option value="CrossFit">CrossFit</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Assign Trainer</label>
                  <select
                    value={classForm.trainerId}
                    onChange={(e) => setClassForm({ ...classForm, trainerId: e.target.value })}
                    className="form-select"
                    required
                  >
                    {trainers.map(t => (
                      <option key={t._id} value={t._id}>{t.name} ({t.specialization})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    required
                    value={classForm.date}
                    onChange={(e) => setClassForm({ ...classForm, date: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity (People)</label>
                  <input
                    type="number"
                    value={classForm.capacity}
                    onChange={(e) => setClassForm({ ...classForm, capacity: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Time Slot</label>
                <input
                  type="text"
                  placeholder="e.g. 10:00 AM - 11:30 AM"
                  value={classForm.timeSlot}
                  onChange={(e) => setClassForm({ ...classForm, timeSlot: e.target.value })}
                  className="form-input"
                />
              </div>

              <button type="submit" className="btn btn-accent" style={{ width: '100%', marginTop: '0.5rem' }}>
                Publish Fitness Class
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Manage Trainers */}
      {activeTab === 'trainers' && (
        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Trainer</th>
                <th style={{ padding: '0.75rem 1rem' }}>Specialization</th>
                <th style={{ padding: '0.75rem 1rem' }}>Experience</th>
                <th style={{ padding: '0.75rem 1rem' }}>Rate</th>
                <th style={{ padding: '0.75rem 1rem' }}>Rating</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trainers.map((t) => (
                <tr key={t._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={t.image} alt={t.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontWeight: 700, color: '#fff' }}>{t.name}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}><span className="badge badge-purple">{t.specialization}</span></td>
                  <td style={{ padding: '0.85rem 1rem' }}>{t.experienceYears} Years</td>
                  <td style={{ padding: '0.85rem 1rem' }}>${t.hourlyRate}/hr</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#fbbf24' }}>★ {t.rating}</td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <button onClick={() => handleDeleteTrainer(t._id)} className="btn btn-danger btn-sm">
                      <Trash2 size={14} /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Manage Classes */}
      {activeTab === 'classes' && (
        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Class Title</th>
                <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                <th style={{ padding: '0.75rem 1rem' }}>Trainer</th>
                <th style={{ padding: '0.75rem 1rem' }}>Date & Time</th>
                <th style={{ padding: '0.75rem 1rem' }}>Booked / Cap</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#fff' }}>{c.title}</td>
                  <td style={{ padding: '0.85rem 1rem' }}><span className="badge badge-cyan">{c.category}</span></td>
                  <td style={{ padding: '0.85rem 1rem' }}>{c.trainer ? c.trainer.name : 'N/A'}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{c.date} ({c.timeSlot})</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{c.bookedMembers ? c.bookedMembers.length : 0} / {c.capacity}</td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <button onClick={() => handleDeleteClass(c._id)} className="btn btn-danger btn-sm">
                      <Trash2 size={14} /> Cancel Class
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
