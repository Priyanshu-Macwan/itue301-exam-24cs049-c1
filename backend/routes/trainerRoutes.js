const express = require('express');
const router = express.Router();
const Trainer = require('../models/Trainer');
const { protect, adminOnly } = require('../middleware/authGuard');

// @route   GET /api/trainers & /api/v1/trainers
// @desc    Get all trainer documents
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { specialization, search } = req.query;
    let query = {};

    if (specialization) {
      query.specialization = specialization;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    const trainers = await Trainer.find(query).sort({ rating: -1, createdAt: -1 });
    res.status(200).json(trainers);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/trainers/:id & /api/v1/trainers/:id
// @desc    Get single trainer
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }
    res.status(200).json(trainer);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/trainers & /api/v1/trainers
// @desc    Create trainer
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { name, specialization, bio, experienceYears, rating, hourlyRate, image, available } = req.body;

    if (!name || !specialization) {
      return res.status(400).json({ success: false, message: 'Please provide name and specialization' });
    }

    const trainer = await Trainer.create({
      name,
      specialization,
      bio: bio || 'Experienced fitness trainer dedicated to strength & movement.',
      experienceYears: experienceYears || 5,
      rating: rating || 4.9,
      hourlyRate: hourlyRate || 65,
      image: image || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
      available: available !== undefined ? available : true
    });

    res.status(201).json(trainer);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/trainers/:id & /api/v1/trainers/:id
// @desc    Update trainer
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    let trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    trainer = await Trainer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json(trainer);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/trainers/:id & /api/v1/trainers/:id
// @desc    Delete trainer
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    await trainer.deleteOne();
    res.status(200).json({ success: true, message: 'Trainer deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
