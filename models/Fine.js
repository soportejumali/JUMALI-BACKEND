const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema({
  prestamo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    required: [true, 'El préstamo es obligatorio']
  },
  monto: {
    type: Number,
    required: [true, 'El monto es obligatorio'],
    min: [0, 'El monto no puede ser negativo']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  pagado: {
    type: Boolean,
    default: false
  },
  fechaPago: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar fechaPago cuando se marca como pagado
fineSchema.pre('save', function(next) {
  if (this.isModified('pagado') && this.pagado) {
    this.fechaPago = new Date();
  }
  next();
});

// Índices para mejorar el rendimiento de las búsquedas
fineSchema.index({ prestamo: 1 });
fineSchema.index({ pagado: 1 });
fineSchema.index({ fecha: 1 });

module.exports = mongoose.model('Fine', fineSchema);