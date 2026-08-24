const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Trainer = require('../models/Trainer');
const store = require('../store');
const { protect, adminOnly } = require('../middleware/authGuard');

// @route   GET /api/trainers & /api/v1/trainers
// @desc    Get all trainer documents
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { specialization, search } = req.query;

    if (mongoose.connection.readyState === 1) {
      let query = {};
      if (specialization) query.specialization = specialization;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { specialization: { $regex: search, $options: 'i' } }
        ];
      }
      const trainers = await Trainer.find(query).sort({ rating: -1, createdAt: -1 });
      return res.status(200).json(trainers);
    }

    // In-memory fallback dataset
    let result = [...store.trainers];
    if (specialization) {
      result = result.filter((t) => t.specialization === specialization);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.specialization.toLowerCase().includes(q)
      );
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/trainers/:id & /api/v1/trainers/:id
// @desc    Get single trainer
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const trainer = await Trainer.findById(req.params.id);
      if (!trainer) {
        return res.status(404).json({ success: false, message: 'Trainer not found' });
      }
      return res.status(200).json(trainer);
    }

    const trainer = store.trainers.find((t) => t._id.toString() === req.params.id);
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

    let trainer;
    if (mongoose.connection.readyState === 1) {
      trainer = await Trainer.create({
        name,
        specialization,
        bio: bio || 'Experienced fitness trainer dedicated to strength & movement.',
        experienceYears: experienceYears || 5,
        rating: rating || 4.9,
        hourlyRate: hourlyRate || 65,
        image: image || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
        available: available !== undefined ? available : true
      });
    } else {
      trainer = {
        _id: 'tr_' + Date.now(),
        name,
        specialization,
        bio: bio || 'Experienced fitness trainer dedicated to strength & movement.',
        experienceYears: experienceYears || 5,
        rating: rating || 4.9,
        hourlyRate: hourlyRate || 65,
        image: image || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
        available: available !== undefined ? available : true
      };
      store.trainers.push(trainer);
    }

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
    if (mongoose.connection.readyState === 1) {
      const trainer = await Trainer.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
      return res.status(200).json(trainer);
    }

    const idx = store.trainers.findIndex((t) => t._id.toString() === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }
    store.trainers[idx] = { ...store.trainers[idx], ...req.body };
    res.status(200).json(store.trainers[idx]);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/trainers/:id & /api/v1/trainers/:id
// @desc    Delete trainer
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const trainer = await Trainer.findById(req.params.id);
      if (!trainer) {
        return res.status(404).json({ success: false, message: 'Trainer not found' });
      }
      await trainer.deleteOne();
      return res.status(200).json({ success: true, message: 'Trainer deleted successfully' });
    }

    const idx = store.trainers.findIndex((t) => t._id.toString() === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }
    store.trainers.splice(idx, 1);
    res.status(200).json({ success: true, message: 'Trainer deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
