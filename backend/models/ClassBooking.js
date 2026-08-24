const mongoose = require('mongoose');

const classBookingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Class title is required'],
      trim: true
    },
    className: {
      type: String
    },
    category: {
      type: String,
      default: 'HIIT'
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      required: true
    },
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer'
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member'
    },
    date: {
      type: String,
      required: true
    },
    timeSlot: {
      type: String,
      required: true
    },
    location: {
      type: String,
      default: 'Studio A - Fitness Hub'
    },
    capacity: {
      type: Number,
      default: 20
    },
    bookedMembers: [
      {
        memberId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Member'
        },
        bookedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    status: {
      type: String,
      enum: ['booked', 'attended', 'cancelled', 'Scheduled', 'Completed'],
      default: 'booked'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ClassBooking', classBookingSchema);
