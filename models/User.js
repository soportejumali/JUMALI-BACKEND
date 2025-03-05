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
    default: 'usuario', 
  },
  nombreCompleto: {
    type: String,
    required: true,
  },
  cedula: {
    type: String,
    required: true,
  },
  telefono: {
    type: String,
    required: true,
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

});

// Pre-save hook para cifrar la contraseña antes de guardarla en la base de datos
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next(); // Si la contraseña no ha sido modificada, no hacemos nada
  }
  const salt = await bcrypt.genSalt(10); // Generar un 'salt' con 10 rondas
  this.password = await bcrypt.hash(this.password, salt); // Cifrar la contraseña
  next();
});

// Método para comparar contraseñas
userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password); // Compara la contraseña ingresada con la almacenada
};

const User = mongoose.model('User', userSchema);

module.exports = User;
