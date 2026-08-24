const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Trainer = require('../models/Trainer');
const store = require('../store');

// @route   GET /api/v1/trainers
// @desc    Get all trainer documents (Public - Requirement #12)
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const trainers = await Trainer.find();
      return res.status(200).json(trainers);
    }

    // Return in-memory trainers array fallback
    res.status(200).json(store.trainers);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
