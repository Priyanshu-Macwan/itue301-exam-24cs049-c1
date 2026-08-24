const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const requestLogger = require('./middleware/requestLogger');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const Member = require('./models/Member');
const Trainer = require('./models/Trainer');
const ClassBooking = require('./models/ClassBooking');

const authRoutes = require('./routes/authRoutes');
const trainerRoutes = require('./routes/trainerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

// 1. Global Request Logger Middleware (MUST use res.on('finish'))
app.use(requestLogger);

// 2. Global CORS & JSON Body Parser
app.use(cors());
app.use(express.json());

// Seeder for Atlas database if empty
const seedInitialData = async () => {
  try {
    const memberCount = await Member.countDocuments();
    if (memberCount === 0) {
      console.log('🌱 Seeding initial members into MongoDB Atlas...');
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const memberPass = await bcrypt.hash('password123', salt);
      const adminPass = await bcrypt.hash('admin123', salt);

      await Member.create([
        {
          name: 'Alex Johnson',
          email: 'member@fitness.com',
          password: memberPass,
          phone: '+1 555-0199',
          membershipType: 'VIP',
          role: 'member'
        },
        {
          name: 'Sarah Connor (Admin)',
          email: 'admin@fitness.com',
          password: adminPass,
          phone: '+1 555-0200',
          membershipType: 'VIP',
          role: 'admin'
        }
      ]);
      console.log('✅ Demo accounts created: member@fitness.com / admin@fitness.com');
    }

    const trainerCount = await Trainer.countDocuments();
    if (trainerCount === 0) {
      console.log('🌱 Seeding initial trainers into MongoDB Atlas...');
      await Trainer.insertMany([
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
    }
  } catch (err) {
    console.error('⚠️ Atlas Seed Note:', err.message);
  }
};

// Priority 2: Connect to MongoDB Atlas via process.env.MONGO_URI
const connectDatabase = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fitness_db';
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('⚡ MongoDB connected successfully Server running on port 5000');
    await seedInitialData();
  } catch (err) {
    console.error('❌ MongoDB Atlas Connection Error:', err.message);
  }
};

// Mount API Routes for both /api and /api/v1 prefixes
app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);

app.use('/api/trainers', trainerRoutes);
app.use('/api/v1/trainers', trainerRoutes);

app.use('/api/bookings', bookingRoutes);
app.use('/api/v1/bookings', bookingRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', system: 'FitZone Gym API' });
});
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'online', system: 'FitZone Gym API v1' });
});

// Priority 6: Global Error Handling Middleware (MUST BE LAST)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 FitZone Backend Server running on port ${PORT}`);
  });
});
