const mongoose = require('mongoose');

// Member Mongoose Schema
const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false
    },
    phone: {
      type: String,
      default: ''
    },
    membershipType: {
      type: String,
      enum: ['basic', 'premium', 'platinum'],
      default: 'basic'
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Member', memberSchema);
