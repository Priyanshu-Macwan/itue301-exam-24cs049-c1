import React from 'react';
import { Star, Award, Clock, DollarSign, Calendar } from 'lucide-react';

const TrainerCard = ({ trainer, onSelectTrainer }) => {
  return (
    <div className="glass-panel" style={{
      overflow: 'hidden',
      transition: 'var(--transition-smooth)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative'
    }}>
      {/* Image & Header Overlay */}
      <div style={{ position: 'relative', height: '200px', width: '100%', overflow: 'hidden' }}>
        <img
          src={trainer.image || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80'}
          alt={trainer.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.85)',
            transition: 'transform 0.4s ease'
          }}
        />
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(7, 9, 14, 0.85)',
          backdropFilter: 'blur(8px)',
          borderRadius: '9999px',
          padding: '0.25rem 0.65rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          border: '1px solid rgba(255, 215, 0, 0.3)'
        }}>
          <Star size={14} color="#f59e0b" fill="#f59e0b" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24' }}>
            {trainer.rating ? trainer.rating.toFixed(1) : '4.9'}
          </span>
        </div>

        <div style={{ position: 'absolute', bottom: '12px', left: '12px' }}>
          <span className="badge badge-cyan">
            {trainer.specialization}
          </span>
        </div>
      </div>

      {/* Details */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{trainer.name}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {trainer.bio}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          background: 'rgba(255, 255, 255, 0.02)',
          padding: '0.65rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-glass)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Award size={15} color="var(--primary)" />
            <span>{trainer.experienceYears} Yrs Exp</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <DollarSign size={15} color="var(--accent-green)" />
            <span>${trainer.hourlyRate}/hr</span>
          </div>
        </div>

        {trainer.availableSlots && trainer.availableSlots.length > 0 && (
          <div style={{ fontSize: '0.775rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={13} color="var(--accent-cyan)" />
            <span>Slots: {trainer.availableSlots[0].day} ({trainer.availableSlots[0].time})</span>
          </div>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
          <button
            onClick={() => onSelectTrainer && onSelectTrainer(trainer)}
            className="btn btn-primary btn-sm"
            style={{ width: '100%' }}
          >
            <Calendar size={15} />
            Book Trainer Class
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainerCard;
