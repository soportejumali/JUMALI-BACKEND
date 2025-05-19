const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'usuario'],
    default: 'usuario', 
  },
  nombreCompleto: {
    type: String,
    required: true,
  },
  cedula: {
    type: String,
    required: true,
    unique: true,
  },
  telefono: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  loginCode: {
    type: String
  },
  loginCodeExpiration: {
    type: Date
  },
  passwordResetCode: {
    type: String
  },
  passwordResetExpiration: {
    type: Date
  },
  visible: {
    type: Boolean,
    default: true
  },
  blocked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook para cifrar la contraseña antes de guardarla en la base de datos
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar contraseñas
userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Método para verificar si el usuario está activo
userSchema.methods.isActive = function() {
  return this.visible && !this.blocked;
};

// Índices para mejorar el rendimiento de las búsquedas
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ cedula: 1 });
userSchema.index({ role: 1 });
userSchema.index({ blocked: 1 });
userSchema.index({ visible: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;