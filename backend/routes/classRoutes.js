const express = require('express');
const router = express.Router();
const FitnessClass = require('../models/FitnessClass');
const { protect, adminOnly } = require('../middleware/authGuard');

// @route   GET /api/classes
// @desc    Get all fitness classes populated with trainer details
// @access  Public / Protected
router.get('/', async (req, res, next) => {
  try {
    const classes = await FitnessClass.find({ status: { $ne: 'Cancelled' } })
      .populate('trainer', 'name specialization rating image hourlyRate available')
      .sort({ date: 1, timeSlot: 1 });
    res.status(200).json(classes);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/classes/:id
// @desc    Get single fitness class
// @access  Public / Protected
router.get('/:id', async (req, res, next) => {
  try {
    const fitnessClass = await FitnessClass.findById(req.params.id)
      .populate('trainer', 'name specialization rating image');
    if (!fitnessClass) {
      return res.status(404).json({ success: false, message: 'Fitness class not found' });
    }
    res.status(200).json(fitnessClass);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/classes
// @desc    Create a new fitness class schedule (Admin Only)
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { title, category, trainerId, trainer, date, timeSlot, location, capacity } = req.body;
    const targetTrainer = trainerId || trainer;

    if (!title || !targetTrainer || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, trainer (ID), date, and timeSlot'
      });
    }

    const maxCapacity = capacity || 20;

    const fitnessClass = await FitnessClass.create({
      title,
      category: category || 'HIIT',
      trainer: targetTrainer,
      date,
      timeSlot,
      location: location || 'Studio A - Main Fitness Floor',
      capacity: maxCapacity,
      availableSpots: maxCapacity,
      status: 'Scheduled'
    });

    const populated = await FitnessClass.findById(fitnessClass._id)
      .populate('trainer', 'name specialization rating image');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/classes/:id
// @desc    Update class schedule (Admin Only)
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    let fitnessClass = await FitnessClass.findById(req.params.id);
    if (!fitnessClass) {
      return res.status(404).json({ success: false, message: 'Fitness class not found' });
    }

    fitnessClass = await FitnessClass.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('trainer', 'name specialization rating image');

    res.status(200).json(fitnessClass);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/classes/:id
// @desc    Delete/Cancel class schedule (Admin Only)
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const fitnessClass = await FitnessClass.findById(req.params.id);
    if (!fitnessClass) {
      return res.status(404).json({ success: false, message: 'Fitness class not found' });
    }

    await fitnessClass.deleteOne();
    res.status(200).json({ success: true, message: 'Fitness class deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
