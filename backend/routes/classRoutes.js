const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const FitnessClass = require('../models/FitnessClass');
const { protect, adminOnly } = require('../middleware/authGuard');

const sampleClasses = [
  {
    _id: 'cls_1',
    title: 'Extreme HIIT Burnout',
    category: 'HIIT',
    trainer: { _id: 'tr_1', name: 'Marcus Vance', specialization: 'HIIT & Cardio', rating: 4.95 },
    date: '2026-08-25',
    timeSlot: '08:00 AM - 09:00 AM',
    location: 'Studio A - High Tech Zone',
    capacity: 20,
    availableSpots: 18,
    status: 'Scheduled'
  },
  {
    _id: 'cls_2',
    title: 'Morning Vinyasa Flow & Zen',
    category: 'Yoga',
    trainer: { _id: 'tr_2', name: 'Elena Rostova', specialization: 'Yoga & Mindfulness', rating: 4.98 },
    date: '2026-08-25',
    timeSlot: '07:00 AM - 08:15 AM',
    location: 'Zen Sanctuary Studio',
    capacity: 20,
    availableSpots: 20,
    status: 'Scheduled'
  },
  {
    _id: 'cls_3',
    title: 'Hyper-Strength Hypertrophy',
    category: 'Strength',
    trainer: { _id: 'tr_3', name: 'Darius Thorne', specialization: 'Strength & Bodybuilding', rating: 4.91 },
    date: '2026-08-26',
    timeSlot: '05:00 PM - 06:30 PM',
    location: 'Iron Pit Gym Floor',
    capacity: 15,
    availableSpots: 15,
    status: 'Scheduled'
  },
  {
    _id: 'cls_4',
    title: 'Core Sculpt & Reformer Pilates',
    category: 'Pilates',
    trainer: { _id: 'tr_4', name: 'Maya Lin', specialization: 'Pilates & Core', rating: 4.94 },
    date: '2026-08-26',
    timeSlot: '10:00 AM - 11:00 AM',
    location: 'Studio B - Reformer Room',
    capacity: 10,
    availableSpots: 10,
    status: 'Scheduled'
  }
];

// @route   GET /api/classes
// @desc    Get all fitness classes populated with trainer details
// @access  Public / Protected
router.get('/', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const classes = await FitnessClass.find({ status: { $ne: 'Cancelled' } })
        .populate('trainer', 'name specialization rating image hourlyRate available')
        .sort({ date: 1, timeSlot: 1 });
      return res.status(200).json(classes);
    }

    res.status(200).json(sampleClasses);
  } catch (error) {
    res.status(200).json(sampleClasses);
  }
});

// @route   GET /api/classes/:id
// @desc    Get single fitness class
// @access  Public / Protected
router.get('/:id', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const fitnessClass = await FitnessClass.findById(req.params.id)
        .populate('trainer', 'name specialization rating image');
      if (!fitnessClass) {
        return res.status(404).json({ success: false, message: 'Fitness class not found' });
      }
      return res.status(200).json(fitnessClass);
    }

    const cls = sampleClasses.find((c) => c._id === req.params.id);
    if (!cls) return res.status(404).json({ success: false, message: 'Fitness class not found' });
    res.status(200).json(cls);
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

    let fitnessClass;
    if (mongoose.connection.readyState === 1) {
      fitnessClass = await FitnessClass.create({
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
      return res.status(201).json(populated);
    }

    fitnessClass = {
      _id: 'cls_' + Date.now(),
      title,
      category: category || 'HIIT',
      trainer: { _id: targetTrainer, name: 'Assigned Trainer', specialization: 'Fitness' },
      date,
      timeSlot,
      location: location || 'Studio A',
      capacity: maxCapacity,
      availableSpots: maxCapacity,
      status: 'Scheduled'
    };
    sampleClasses.push(fitnessClass);
    res.status(201).json(fitnessClass);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/classes/:id
// @desc    Delete/Cancel class schedule (Admin Only)
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const fitnessClass = await FitnessClass.findById(req.params.id);
      if (!fitnessClass) {
        return res.status(404).json({ success: false, message: 'Fitness class not found' });
      }
      await fitnessClass.deleteOne();
      return res.status(200).json({ success: true, message: 'Fitness class deleted successfully' });
    }

    const idx = sampleClasses.findIndex((c) => c._id === req.params.id);
    if (idx !== -1) sampleClasses.splice(idx, 1);
    res.status(200).json({ success: true, message: 'Fitness class deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
