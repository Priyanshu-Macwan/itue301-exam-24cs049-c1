const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ClassBooking = require('../models/ClassBooking');
const store = require('../store');
const { protect, adminOnly } = require('../middleware/authGuard');

// @route   GET /api/bookings/classes & /api/v1/bookings/classes
// @desc    Get all available class schedules
// @access  Public
router.get('/classes', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const classes = await ClassBooking.find({ status: { $ne: 'Cancelled' } })
        .populate('trainer', 'name specialization rating image hourlyRate available')
        .populate('trainerId', 'name specialization rating image hourlyRate available')
        .sort({ date: 1, timeSlot: 1 });
      return res.status(200).json(classes);
    }

    res.status(200).json(store.classBookings);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/bookings/classes & /api/v1/bookings/classes
// @desc    Create a fitness class schedule (Admin Only)
// @access  Private/Admin
router.post('/classes', protect, adminOnly, async (req, res, next) => {
  try {
    const { title, className, category, trainerId, date, timeSlot, location, capacity } = req.body;
    const classTitle = title || className;

    if (!classTitle || !trainerId || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title/className, trainerId, date, and timeSlot'
      });
    }

    let newClass;
    if (mongoose.connection.readyState === 1) {
      newClass = await ClassBooking.create({
        title: classTitle,
        className: classTitle,
        category: category || 'HIIT',
        trainer: trainerId,
        trainerId: trainerId,
        memberId: req.user._id,
        date,
        timeSlot,
        location: location || 'Studio A - Main Fitness Hub',
        capacity: capacity || 20,
        status: 'booked'
      });
      const populatedClass = await ClassBooking.findById(newClass._id)
        .populate('trainer', 'name specialization rating image')
        .populate('trainerId', 'name specialization rating image');
      return res.status(201).json(populatedClass);
    }

    const trainerObj = store.trainers.find((t) => t._id.toString() === trainerId.toString()) || {
      _id: trainerId,
      name: 'Assigned Trainer',
      specialization: 'Fitness'
    };

    newClass = {
      _id: 'cls_' + Date.now(),
      title: classTitle,
      className: classTitle,
      category: category || 'HIIT',
      trainer: trainerObj,
      trainerId: trainerObj,
      date,
      timeSlot,
      location: location || 'Studio A',
      capacity: capacity || 20,
      status: 'booked',
      bookedMembers: []
    };
    store.classBookings.push(newClass);
    res.status(201).json(newClass);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/bookings/book & /api/v1/bookings/book
// @desc    Book a slot in a fitness class for logged in member
// @access  Private (protect)
const handleBookClass = async (req, res, next) => {
  try {
    const { classId, trainerId, className, title, date, timeSlot } = req.body;
    const memberId = req.user?._id || req.member?._id;

    if (mongoose.connection.readyState === 1) {
      if (classId) {
        const fitnessClass = await ClassBooking.findById(classId);
        if (!fitnessClass) return res.status(404).json({ success: false, message: 'Class not found' });
        if (fitnessClass.bookedMembers.some((b) => b.memberId.toString() === memberId.toString())) {
          return res.status(400).json({ success: false, message: 'Already booked' });
        }
        fitnessClass.bookedMembers.push({ memberId, bookedAt: new Date() });
        await fitnessClass.save();
        return res.status(201).json(fitnessClass);
      }

      const booking = await ClassBooking.create({
        title: className || title || 'General Fitness Session',
        className: className || title || 'General Fitness Session',
        memberId,
        trainerId,
        trainer: trainerId,
        date,
        timeSlot,
        status: 'booked'
      });
      const populated = await ClassBooking.findById(booking._id)
        .populate('memberId', 'name email')
        .populate('trainerId', 'name specialization');
      return res.status(201).json(populated);
    }

    const trainerObj = store.trainers.find((t) => t._id.toString() === (trainerId || '').toString()) || {
      _id: trainerId || 'tr_1',
      name: 'Assigned Trainer',
      specialization: 'Fitness'
    };

    const newBooking = {
      _id: 'bk_' + Date.now(),
      memberId: { _id: memberId, name: req.user.name, email: req.user.email },
      trainerId: trainerObj,
      trainer: trainerObj,
      className: className || title || 'General Fitness Session',
      title: className || title || 'General Fitness Session',
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
};

router.post('/book', protect, handleBookClass);
router.post('/', protect, handleBookClass);

// @route   GET /api/bookings/my & /api/v1/bookings/my
// @desc    Get member's booked classes
// @access  Private (protect)
const handleGetMyBookings = async (req, res, next) => {
  try {
    const memberId = req.user?._id || req.member?._id;

    if (mongoose.connection.readyState === 1) {
      const bookings = await ClassBooking.find({
        $or: [{ memberId }, { 'bookedMembers.memberId': memberId }]
      })
        .populate('memberId', 'name email')
        .populate('trainerId', 'name specialization rating image')
        .populate('trainer', 'name specialization rating image')
        .sort({ date: 1, createdAt: -1 });
      return res.status(200).json(bookings);
    }

    const myBookings = store.classBookings.filter((b) => {
      const bMemId = b.memberId?._id || b.memberId;
      return bMemId && bMemId.toString() === memberId.toString();
    });
    res.status(200).json(myBookings);
  } catch (error) {
    next(error);
  }
};

router.get('/my', protect, handleGetMyBookings);
router.get('/my-bookings', protect, handleGetMyBookings);

// @route   DELETE /api/bookings/:id & /api/v1/bookings/:id
// @desc    Cancel/Delete booking
// @access  Private (protect)
router.delete('/:id', protect, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const booking = await ClassBooking.findById(req.params.id);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
      await booking.deleteOne();
      return res.status(200).json({ success: true, message: 'Booking cancelled successfully' });
    }

    const idx = store.classBookings.findIndex((b) => b._id.toString() === req.params.id.toString());
    if (idx !== -1) {
      store.classBookings.splice(idx, 1);
    }
    res.status(200).json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
