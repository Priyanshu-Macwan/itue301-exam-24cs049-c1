const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const requestLogger = require('./middleware/requestLogger');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const Member = require('./models/Member');
const Trainer = require('./models/Trainer');
const FitnessClass = require('./models/FitnessClass');
const Booking = require('./models/Booking');

const authRoutes = require('./routes/authRoutes');
const trainerRoutes = require('./routes/trainerRoutes');
const classRoutes = require('./routes/classRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

// Middlewares
app.use(requestLogger);
app.use(cors());
app.use(express.json());

// Seed initial data when MongoDB Atlas database is empty
const seedDatabase = async () => {
  try {
    const memberCount = await Member.countDocuments();
    if (memberCount === 0) {
      console.log('🌱 Seeding demo accounts into MongoDB Atlas...');
      const salt = await bcrypt.genSalt(10);
      const memberPass = await bcrypt.hash('password123', salt);
      const adminPass = await bcrypt.hash('admin123', salt);

      await Member.create([
        {
          name: 'Alex Johnson',
          email: 'member@fitness.com',
          password: memberPass,
          membershipType: 'VIP',
          role: 'member'
        },
        {
          name: 'Sarah Connor',
          email: 'admin@fitness.com',
          password: adminPass,
          membershipType: 'VIP',
          role: 'admin'
        }
      ]);
      console.log('✅ Demo accounts seeded: member@fitness.com / admin@fitness.com');
    }

    const trainerCount = await Trainer.countDocuments();
    let sampleTrainers = [];
    if (trainerCount === 0) {
      console.log('🌱 Seeding initial trainers into MongoDB Atlas...');
      sampleTrainers = await Trainer.insertMany([
        {
          name: 'Marcus Vance',
          specialization: 'HIIT & Cardio',
          bio: 'Elite strength & conditioning coach with 8+ years experience.',
          experienceYears: 8,
          rating: 4.95,
          hourlyRate: 75,
          image: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80',
          available: true
        },
        {
          name: 'Elena Rostova',
          specialization: 'Yoga & Mindfulness',
          bio: 'Certified Vinyasa & Ashtanga master focused on mobility.',
          experienceYears: 6,
          rating: 4.98,
          hourlyRate: 65,
          image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
          available: true
        },
        {
          name: 'Darius Thorne',
          specialization: 'Strength & Bodybuilding',
          bio: 'Former powerlifting competitor specializing in hypertrophy.',
          experienceYears: 10,
          rating: 4.91,
          hourlyRate: 85,
          image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80',
          available: false
        },
        {
          name: 'Maya Lin',
          specialization: 'Pilates & Core',
          bio: 'Precision Pilates specialist obsessed with postural mechanics.',
          experienceYears: 7,
          rating: 4.94,
          hourlyRate: 70,
          image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
          available: true
        }
      ]);
      console.log('✅ Trainers seeded in Atlas');
    } else {
      sampleTrainers = await Trainer.find();
    }

    const classCount = await FitnessClass.countDocuments();
    if (classCount === 0 && sampleTrainers.length > 0) {
      console.log('🌱 Seeding initial fitness classes into MongoDB Atlas...');
      await FitnessClass.insertMany([
        {
          title: 'Extreme HIIT Burnout',
          category: 'HIIT',
          trainer: sampleTrainers[0]._id,
          date: '2026-08-25',
          timeSlot: '08:00 AM - 09:00 AM',
          location: 'Studio A - High Tech Zone',
          capacity: 20,
          availableSpots: 18,
          status: 'Scheduled'
        },
        {
          title: 'Morning Vinyasa Flow & Zen',
          category: 'Yoga',
          trainer: sampleTrainers[1]._id,
          date: '2026-08-25',
          timeSlot: '07:00 AM - 08:15 AM',
          location: 'Zen Sanctuary Studio',
          capacity: 20,
          availableSpots: 20,
          status: 'Scheduled'
        },
        {
          title: 'Hyper-Strength Hypertrophy',
          category: 'Strength',
          trainer: sampleTrainers[2]._id,
          date: '2026-08-26',
          timeSlot: '05:00 PM - 06:30 PM',
          location: 'Iron Pit Gym Floor',
          capacity: 15,
          availableSpots: 15,
          status: 'Scheduled'
        },
        {
          title: 'Core Sculpt & Reformer Pilates',
          category: 'Pilates',
          trainer: sampleTrainers[3]._id,
          date: '2026-08-26',
          timeSlot: '10:00 AM - 11:00 AM',
          location: 'Studio B - Reformer Room',
          capacity: 10,
          availableSpots: 10,
          status: 'Scheduled'
        }
      ]);
      console.log('✅ Fitness classes seeded in Atlas');
    }
  } catch (err) {
    console.error('⚠️ Database seed error:', err.message);
  }
};

// Connect MongoDB Atlas
const connectDatabase = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fitness_db';
  try {
    await mongoose.connect(mongoUri);
    console.log('⚡ MongoDB connected successfully');
    await seedDatabase();
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
  }
};

// Mount REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/bookings', bookingRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 FitZone Backend Server running on port ${PORT}`);
  });
});
