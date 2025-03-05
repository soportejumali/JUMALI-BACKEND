const mongoose = require('mongoose');

const allowedUserSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['email', 'identification'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AllowedUser', allowedUserSchema);