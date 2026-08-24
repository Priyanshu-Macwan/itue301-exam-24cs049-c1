const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member reference is required']
    },
    fitnessClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FitnessClass',
      required: [true, 'Fitness class reference is required']
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed'
    }
  },
  {
    timestamps: true
  }
);

// Ensure a member cannot book the exact same class twice
bookingSchema.index({ member: 1, fitnessClass: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
