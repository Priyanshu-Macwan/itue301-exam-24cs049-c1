const mongoose = require('mongoose');

// ClassBooking Mongoose Schema
const classBookingSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member ID is required']
    },
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      required: [true, 'Trainer ID is required']
    },
    className: {
      type: String,
      default: 'General Fitness Class'
    },
    date: {
      type: String,
      required: [true, 'Date is required']
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required']
    },
    status: {
      type: String,
      enum: ['booked', 'attended', 'cancelled'],
      default: 'booked'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ClassBooking', classBookingSchema);
