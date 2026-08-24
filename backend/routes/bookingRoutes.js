const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const FitnessClass = require('../models/FitnessClass');
const { protect } = require('../middleware/authGuard');

// @route   POST /api/bookings
// @desc    Book a slot in a fitness class for logged in member
// @access  Private (protect)
router.post('/', protect, async (req, res, next) => {
  try {
    const { fitnessClassId, classId } = req.body;
    const targetClassId = fitnessClassId || classId;

    if (!targetClassId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide fitnessClassId'
      });
    }

    const fitnessClass = await FitnessClass.findById(targetClassId);
    if (!fitnessClass) {
      return res.status(404).json({
        success: false,
        message: 'Fitness class not found'
      });
    }

    if (fitnessClass.availableSpots <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Class is full'
      });
    }

    // Check if member already booked this class
    const existingBooking = await Booking.findOne({
      member: req.user._id,
      fitnessClass: targetClassId,
      status: 'confirmed'
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Already booked'
      });
    }

    // Create Booking
    const booking = await Booking.create({
      member: req.user._id,
      fitnessClass: targetClassId,
      status: 'confirmed'
    });

    // Decrease availableSpots by 1
    fitnessClass.availableSpots = Math.max(0, fitnessClass.availableSpots - 1);
    await fitnessClass.save();

    const populated = await Booking.findById(booking._id)
      .populate('member', 'name email')
      .populate({
        path: 'fitnessClass',
        populate: { path: 'trainer', select: 'name specialization rating image' }
      });

    res.status(201).json({
      success: true,
      booking: populated
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/bookings/my
// @desc    Get logged in member's bookings
// @access  Private (protect)
router.get('/my', protect, async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      member: req.user._id,
      status: 'confirmed'
    })
      .populate({
        path: 'fitnessClass',
        populate: { path: 'trainer', select: 'name specialization rating image' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Cancel member booking and restore available spot
// @access  Private (protect)
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Security check: Only owner or admin can cancel
    if (
      booking.member.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Cannot cancel another member booking'
      });
    }

    // Increase availableSpots by 1
    const fitnessClass = await FitnessClass.findById(booking.fitnessClass);
    if (fitnessClass) {
      fitnessClass.availableSpots = Math.min(
        fitnessClass.capacity,
        fitnessClass.availableSpots + 1
      );
      await fitnessClass.save();
    }

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
