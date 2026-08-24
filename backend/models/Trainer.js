const mongoose = require('mongoose');

// Trainer Mongoose Schema
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
