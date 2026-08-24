const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Trainer name is required'],
      trim: true
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true
    },
    bio: {
      type: String,
      default: 'Experienced fitness coach dedicated to strength, endurance, and overall wellness.'
    },
    experienceYears: {
      type: Number,
      default: 5
    },
    rating: {
      type: Number,
      default: 4.9
    },
    hourlyRate: {
      type: Number,
      default: 65
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80'
    },
    available: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Trainer', trainerSchema);
