const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
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
    membershipType: {
      type: String,
      default: 'Premium'
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
