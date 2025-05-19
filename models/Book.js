const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true
  },
  autor: {
    type: String,
    required: [true, 'El autor es obligatorio'],
    trim: true
  },
  año: {
    type: Number,
    required: [true, 'El año es obligatorio']
  },
  editorial: {
    type: String,
    required: [true, 'La editorial es obligatoria'],
    trim: true
  },
  tipoLiteratura: {
    type: String,
    required: [true, 'El tipo de literatura es obligatorio'],
    trim: true
  },
  foto: {
    type: String,
    default: ''
  },
  cantidad: {
    type: Number,
    required: [true, 'La cantidad es obligatoria'],
    min: [0, 'La cantidad no puede ser negativa']
  },
  estado: {
    type: String,
    enum: ['disponible', 'eliminado'],
    default: 'disponible'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Eliminar todos los índices existentes
bookSchema.indexes().forEach(index => {
  bookSchema.index(index[0], { unique: false });
});

module.exports = mongoose.model('Book', bookSchema);