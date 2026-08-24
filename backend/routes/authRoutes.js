const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Member = require('../models/Member');
const store = require('../store');
const { protect } = require('../middleware/authGuard');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'itue301_fitness_secret_jwt_key_2026',
    { expiresIn: '30d' }
  );
};

// @route   POST /api/auth/register & /api/v1/auth/register
// @desc    Register a new member with bcrypt password hashing
// @access  Public
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, membershipType, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    let member;

    if (mongoose.connection.readyState === 1) {
      const memberExists = await Member.findOne({ email: email.toLowerCase() });
      if (memberExists) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists'
        });
      }

      member = await Member.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        membershipType: membershipType || 'Premium',
        role: role === 'admin' ? 'admin' : 'member'
      });
    } else {
      const memberExists = store.members.find((m) => m.email === email.toLowerCase());
      if (memberExists) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists'
        });
      }

      member = {
        _id: 'mem_' + Date.now(),
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        membershipType: membershipType || 'Premium',
        role: role === 'admin' ? 'admin' : 'member',
        createdAt: new Date()
      };
      store.members.push(member);
    }

    const token = generateToken(member._id);

    const userPayload = {
      id: member._id,
      _id: member._id,
      name: member.name,
      email: member.email,
      role: member.role,
      membershipType: member.membershipType
    };

    res.status(201).json({
      success: true,
      token,
      user: userPayload,
      member: userPayload,
      role: member.role
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/login & /api/v1/auth/login
// @desc    Authenticate member & return JWT token
// @access  Public
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    let member;
    if (mongoose.connection.readyState === 1) {
      member = await Member.findOne({ email: email.toLowerCase() }).select('+password');
    } else {
      member = store.members.find((m) => m.email === email.toLowerCase());
    }

    if (!member) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or user not found'
      });
    }

    if (password && member.password) {
      const isMatch = await bcrypt.compare(password, member.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
    }

    const token = generateToken(member._id);

    const userPayload = {
      id: member._id,
      _id: member._id,
      name: member.name,
      email: member.email,
      role: member.role,
      membershipType: member.membershipType
    };

    res.status(200).json({
      success: true,
      token,
      user: userPayload,
      member: userPayload,
      role: member.role
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/me & /api/v1/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
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
