// models/Copy.js
const mongoose = require('mongoose');

const copySchema = new mongoose.Schema({
  libro: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  copyId: {
    type: String,
    required: true,
    unique: true
  },
  estado: {
    type: String,
    enum: ['disponible', 'prestado', 'en_reparacion'],
    default: 'disponible'
  }
});

module.exports = mongoose.model('Copy', copySchema);