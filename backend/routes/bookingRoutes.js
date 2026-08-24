const express = require('express');
const router = express.Router();
const ClassBooking = require('../models/ClassBooking');
const Trainer = require('../models/Trainer');
const { protect, adminOnly } = require('../middleware/authGuard');

// @route   GET /api/bookings/classes & /api/v1/bookings/classes
// @desc    Get all available class schedules
// @access  Public
router.get('/classes', async (req, res, next) => {
  try {
    const { category, date } = req.query;
    let filter = { status: { $ne: 'Cancelled' } };

    if (category && category !== 'All') {
      filter.category = category;
    }
    if (date) {
      filter.date = date;
    }

    const classes = await ClassBooking.find(filter)
      .populate('trainer', 'name specialization rating image hourlyRate available')
      .populate('trainerId', 'name specialization rating image hourlyRate available')
      .sort({ date: 1, timeSlot: 1 });

    res.status(200).json(classes);
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

    const newClass = await ClassBooking.create({
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

    res.status(201).json(populatedClass);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/bookings/book & /api/v1/bookings/book & POST /api/v1/bookings
// @desc    Book a slot in a fitness class for logged in member
// @access  Private (protect)
const handleBookClass = async (req, res, next) => {
  try {
    const { classId, trainerId, className, title, date, timeSlot } = req.body;

    const memberId = req.user?._id || req.member?._id;

    // If classId is provided, book slot in existing class schedule
    if (classId) {
      const fitnessClass = await ClassBooking.findById(classId);
      if (!fitnessClass) {
        return res.status(404).json({ success: false, message: 'Class not found' });
      }

      if (fitnessClass.status === 'Cancelled' || fitnessClass.status === 'cancelled') {
        return res.status(400).json({ success: false, message: 'This class is cancelled' });
      }

      const alreadyBooked = fitnessClass.bookedMembers.some(
        (b) => b.memberId.toString() === memberId.toString()
      );
      if (alreadyBooked) {
        return res.status(400).json({ success: false, message: 'You have already booked a slot in this class' });
      }

      if (fitnessClass.bookedMembers.length >= fitnessClass.capacity) {
        return res.status(400).json({ success: false, message: 'Class is fully booked' });
      }

      fitnessClass.bookedMembers.push({ memberId, bookedAt: new Date() });
      await fitnessClass.save();

      const updatedClass = await ClassBooking.findById(classId)
        .populate('trainer', 'name specialization rating image')
        .populate('trainerId', 'name specialization rating image')
        .populate('memberId', 'name email');

      return res.status(201).json(updatedClass);
    }

    // Direct booking creation
    const classTitle = className || title || 'General Fitness Session';
    const targetTrainerId = trainerId || req.body.trainer;

    if (!targetTrainerId || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Please provide trainerId, className/title, date, and timeSlot'
      });
    }

    const booking = await ClassBooking.create({
      title: classTitle,
      className: classTitle,
      memberId: memberId,
      trainerId: targetTrainerId,
      trainer: targetTrainerId,
      date,
      timeSlot,
      status: 'booked',
      bookedMembers: [{ memberId }]
    });

    const populated = await ClassBooking.findById(booking._id)
      .populate('memberId', 'name email')
      .populate('trainerId', 'name specialization')
      .populate('trainer', 'name specialization');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

router.post('/book', protect, handleBookClass);
router.post('/', protect, handleBookClass);

// @route   GET /api/bookings/my & /api/v1/bookings/my & /api/bookings/my-bookings
// @desc    Get member's booked classes with populated memberId & trainerId
// @access  Private (protect)
const handleGetMyBookings = async (req, res, next) => {
  try {
    const memberId = req.user?._id || req.member?._id;

    const bookings = await ClassBooking.find({
      $or: [
        { memberId: memberId },
        { 'bookedMembers.memberId': memberId }
      ]
    })
      .populate('memberId', 'name email')
      .populate('trainerId', 'name specialization rating image')
      .populate('trainer', 'name specialization rating image')
      .sort({ date: 1, createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

router.get('/my', protect, handleGetMyBookings);
router.get('/my-bookings', protect, handleGetMyBookings);

// @route   PATCH /api/v1/bookings/:id/status
// @desc    Update booking status
// @access  Private (protect)
router.patch('/:id/status', protect, async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['booked', 'attended', 'cancelled', 'Scheduled', 'Completed'];

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const booking = await ClassBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    const updated = await ClassBooking.findById(booking._id)
      .populate('memberId', 'name email')
      .populate('trainerId', 'name specialization')
      .populate('trainer', 'name specialization');

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/bookings/:id & /api/v1/bookings/:id
// @desc    Cancel/Delete booking in MongoDB
// @access  Private (protect)
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const memberId = req.user?._id || req.member?._id;
    const booking = await ClassBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user.role === 'admin') {
      booking.status = 'cancelled';
      await booking.save();
      return res.status(200).json({ success: true, message: 'Class cancelled by admin' });
    }

    // Remove member spot or delete booking
    const idx = booking.bookedMembers.findIndex(
      (b) => b.memberId.toString() === memberId.toString()
    );

    if (idx !== -1) {
      booking.bookedMembers.splice(idx, 1);
      await booking.save();
    } else {
      await booking.deleteOne();
    }

    res.status(200).json({ success: true, message: 'Booking cancelled successfully in MongoDB Atlas' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
