const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Member = require('../models/Member');
const store = require('../store');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'itue301_fitness_secret_jwt_key_2026',
    { expiresIn: '30d' }
  );
};

// @route   POST /api/v1/auth/login
// @desc    Authenticate member by email & return token (Requirement #11)
// @access  Public
router.post('/login', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    let member;
    if (mongoose.connection.readyState === 1) {
      member = await Member.findOne({ email: email.toLowerCase() });
    } else {
      member = store.members.find((m) => m.email === email.toLowerCase());
    }

    if (!member) {
      return res.status(401).json({
        success: false,
        message: 'Member account not found'
      });
    }

    const token = generateToken(member._id);

    res.status(200).json({
      member: {
        _id: member._id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        membershipType: member.membershipType,
        role: member.role || 'member'
      },
      token: token,
      role: member.role || 'member'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
