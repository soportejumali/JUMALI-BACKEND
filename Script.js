const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();  // Carga las variables de entorno

// Conectar a la base de datos
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a la base de datos'))
  .catch((err) => console.error('Error de conexión', err));

const createUser = async () => {
  const username = 'diegoalexander1598@gmail.com';
  const password = 'juandiego123'; // La contraseña que quieres encriptar
  const role = 'administrador'; // El rol que le asignamos
  const nombreCompleto = 'Juan Diego Patiño'; // El rol que le asignamos

  // Verificar si el usuario ya existe
  const userExists = await User.findOne({ username });
  if (userExists) {
    console.log('El usuario ya existe');
    return;
  }

  const user = new User({
    username,
    password,
    role,
    nombreCompleto,
  });

  await user.save();
  console.log('Usuario creado con éxito');
};

createUser();
