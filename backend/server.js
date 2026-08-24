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

// 1. Global Request Logger Middleware (runs for every request)
app.use(requestLogger);

// 2. Global Parsing & CORS Middlewares
app.use(cors());
app.use(express.json());

// Seed initial data if MongoDB is connected
const seedInitialData = async () => {
  try {
    const memberCount = await Member.countDocuments();
    if (memberCount === 0) {
      console.log('🌱 Seeding initial members...');
      await Member.create([
        {
          name: 'Alex Johnson',
          email: 'member@example.com',
          phone: '+1 555-0199',
          membershipType: 'platinum',
          role: 'member'
        },
        {
          name: 'Sarah Connor',
          email: 'admin@example.com',
          phone: '+1 555-0200',
          membershipType: 'platinum',
          role: 'admin'
        }
      ]);
    }

    const trainerCount = await Trainer.countDocuments();
    if (trainerCount === 0) {
      console.log('🌱 Seeding initial trainers...');
      await Trainer.insertMany([
        { name: 'Marcus Vance', specialization: 'HIIT & Conditioning', available: true },
        { name: 'Elena Rostova', specialization: 'Yoga & Mobility', available: true },
        { name: 'Darius Thorne', specialization: 'Strength & Powerlifting', available: false },
        { name: 'Maya Lin', specialization: 'Pilates & Core', available: true }
      ]);
    }
    console.log('✅ Initial database seed checked.');
  } catch (err) {
    console.error('⚠️ Seeding note:', err.message);
  }
};

// Database Connection
const connectDatabase = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fitzone_db';
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log('⚡ Connected to MongoDB database');
    await seedInitialData();
  } catch (err) {
    console.log('⚠️ MongoDB connection unavailable. Active in-memory fallback enabled.');
  }
};

// 3. Mount API v1 Routes (Requirement #3)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/trainers', trainerRoutes);
app.use('/api/v1/bookings', bookingRoutes);

// Health Endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'online', name: 'FitZone API v1' });
});

// 4. Global Error Handling Middleware (MUST BE LAST MIDDLEWARE - Requirement #6)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 FitZone API Server running on port ${PORT}`);
    console.log(`🔗 Base URL: http://localhost:${PORT}/api/v1`);
  });
});
