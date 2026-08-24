const mongoose = require('mongoose');

const fitnessClassSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Class title is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      default: 'HIIT'
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      required: [true, 'Trainer reference is required']
    },
    date: {
      type: String,
      required: [true, 'Date is required']
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required']
    },
    location: {
      type: String,
      default: 'Studio A - Main Fitness Floor'
    },
    capacity: {
      type: Number,
      default: 20
    },
    availableSpots: {
      type: Number,
      default: 20
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled'
    }
  },
  {
    timestamps: true,
    collection: 'fitnessclasses'
  }
);

module.exports = mongoose.model('FitnessClass', fitnessClassSchema);
