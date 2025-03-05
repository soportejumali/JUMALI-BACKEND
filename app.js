const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

const cors = require('cors');  // Importa CORS
const path = require('path');

dotenv.config(); // Cargar variables de entorno

const app = express();



// Habilitar CORS para todas las rutas
app.use(cors());

// Conectar a la base de datos
connectDB();

// Middleware
app.use(express.json()); // Para parsear JSON en las solicitudes

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
/* 
app.use('/api/patient', patientRoutes);
app.use('/api/webhook', webHookRoutes); */

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
