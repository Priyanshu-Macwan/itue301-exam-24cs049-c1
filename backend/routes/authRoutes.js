const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Member = require('../models/Member');
const { protect } = require('../middleware/authGuard');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'itue301_fitness_secret_jwt_key_2026',
    { expiresIn: '30d' }
  );
};

// @route   POST /api/auth/register
// @desc    Public Signup — Creates a member account in MongoDB Atlas (Always forces role = member)
// @access  Public
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, membershipType } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    const memberExists = await Member.findOne({ email: email.toLowerCase() });
    if (memberExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // SECURITY: Public registration ALWAYS forces role = 'member'
    const member = await Member.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      membershipType: membershipType || 'Premium',
      role: 'member'
    });

    const token = generateToken(member._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: member._id,
        name: member.name,
        email: member.email,
        role: member.role,
        membershipType: member.membershipType
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate member or admin using email & password
// @access  Public
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const member = await Member.findOne({ email: email.toLowerCase() }).select('+password');
    if (!member) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or user not found'
      });
    }

    const isMatch = await bcrypt.compare(password, member.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(member._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: member._id,
        name: member.name,
        email: member.email,
        role: member.role,
        membershipType: member.membershipType
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private (protect)
router.get('/me', protect, async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        membershipType: req.user.membershipType
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
