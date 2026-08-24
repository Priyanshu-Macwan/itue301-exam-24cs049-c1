const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Member = require('../models/Member');
const store = require('../store');

// authGuard middleware validates Bearer token and attaches req.member
const authGuard = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'itue301_fitness_secret_jwt_key_2026'
      );

      let member;
      if (mongoose.connection.readyState === 1) {
        member = await Member.findById(decoded.id).select('-password');
      } else {
        member = store.members.find((m) => m._id.toString() === decoded.id.toString());
      }

      if (!member) {
        return res.status(401).json({
          message: 'Member account not found'
        });
      }

      // Attach member object to request as req.member
      req.member = member;
      return next();
    } catch (error) {
      return res.status(401).json({
        message: 'Unauthorized: Invalid or expired Bearer token'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized: Missing Authorization Bearer token'
    });
  }
};

module.exports = authGuard;
