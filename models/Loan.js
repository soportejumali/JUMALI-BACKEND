const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  libro: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  copia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Copy',
    required: true
  },
  fechaPrestamo: {
    type: Date,
    required: true,
    default: Date.now
  },
  fechaDevolucion: {
    type: Date,
    required: true
  },
  fechaDevolucionReal: {
    type: Date
  },
  estado: {
    type: String,
    enum: ['activo', 'devuelto', 'vencido'],
    default: 'activo'
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento de las búsquedas
loanSchema.index({ usuario: 1, libro: 1, estado: 1 });
loanSchema.index({ fechaDevolucion: 1 });

// Middleware para actualizar el estado del préstamo cuando se acerca la fecha de devolución
loanSchema.pre('save', function(next) {
  if (this.isModified('estado') || this.isNew) {
    if (this.estado === 'activo' && new Date() > this.fechaDevolucion) {
      this.estado = 'vencido';
    }
  }
  next();
});

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;