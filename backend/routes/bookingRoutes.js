const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ClassBooking = require('../models/ClassBooking');
const store = require('../store');
const authGuard = require('../middleware/authGuard');

// @route   POST /api/v1/bookings
// @desc    Create a new class booking for logged-in member (Requirement #8)
// @access  Private (authGuard)
router.post('/', authGuard, async (req, res, next) => {
  try {
    const { trainerId, className, date, timeSlot } = req.body;

    if (!trainerId || !className || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: ['trainerId, className, date, and timeSlot are required']
      });
    }

    let newBooking;
    if (mongoose.connection.readyState === 1) {
      newBooking = await ClassBooking.create({
        memberId: req.member._id,
        trainerId,
        className,
        date,
        timeSlot,
        status: 'booked'
      });

      const populated = await ClassBooking.findById(newBooking._id)
        .populate('memberId', 'name email')
        .populate('trainerId', 'name specialization');

      return res.status(201).json(populated);
    }

    // In-memory fallback
    const trainerObj = store.trainers.find(
      (t) => t._id.toString() === trainerId.toString()
    ) || { _id: trainerId, name: 'Assigned Trainer', specialization: 'Fitness' };

    newBooking = {
      _id: 'bk_' + Date.now(),
      memberId: { _id: req.member._id, name: req.member.name, email: req.member.email },
      trainerId: trainerObj,
      className,
      date,
      timeSlot,
      status: 'booked',
      createdAt: new Date()
    };

    store.classBookings.push(newBooking);
    res.status(201).json(newBooking);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/bookings/my
// @desc    Get logged in member's bookings with populated memberId & trainerId (Requirement #9)
// @access  Private (authGuard)
router.get('/my', authGuard, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const bookings = await ClassBooking.find({ memberId: req.member._id })
        .populate('memberId', 'name email')
        .populate('trainerId', 'name specialization')
        .sort({ date: 1 });

      return res.status(200).json(bookings);
    }

    // In-memory fallback
    const myBookings = store.classBookings.filter(
      (b) =>
        (b.memberId._id || b.memberId).toString() === req.member._id.toString()
    );

    res.status(200).json(myBookings);
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/v1/bookings/:id/status
// @desc    Update booking status (booked, attended, cancelled) (Requirement #10)
// @access  Private (authGuard)
router.patch('/:id/status', authGuard, async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['booked', 'attended', 'cancelled'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: ['Allowed status values: booked, attended, cancelled']
      });
    }

    if (mongoose.connection.readyState === 1) {
      const booking = await ClassBooking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      if (booking.memberId.toString() !== req.member._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Cannot modify another member booking'
        });
      }

      booking.status = status;
      await booking.save();

      const updated = await ClassBooking.findById(booking._id)
        .populate('memberId', 'name email')
        .populate('trainerId', 'name specialization');

      return res.status(200).json(updated);
    }

    // In-memory fallback
    const booking = store.classBookings.find(
      (b) => b._id.toString() === req.params.id.toString()
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.status = status;
    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
