const User = require('../models/User');
const jwt = require('jsonwebtoken');
const AllowedUser = require('../models/AllowedUser');

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.matchPassword(password)) || !user.visible) {
      return res.status(400).json({ message: 'Usuario o contraseña incorrectos o cuenta inactiva' });
    }

    // Crear el token JWT
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      nombreCompleto: user.nombreCompleto,
      email: user.username, 
      role: user.role,
      cedula: user.cedula,
      telefono: user.telefono,
      blocked: user.blocked,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
const resetPassword = async (req, res) => {
  try {
    const { username, password, code } = req.body;
    if (!code || !password) {
      return res.status(500).json({ message: 'Error en el servidor' });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    if (user.passwordResetCode !== code) {
      return res.status(400).json({ message: 'Código incorrecto' });
    }

    user.password = password;
    user.passwordResetCode = null;
    user.passwordResetExpiration = null;
    await user.save();
    return res.status(200).json({ message: 'Contraseña actualizada' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
}           
const verifyToken = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ valid: false, message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ valid: false, message: "Invalid token" });
    }

    res.json({ valid: true, user: decoded });
  });
};
const checkAllowedUser = async (req, res) => {
    try {
        const { email, cedula } = req.body;

        // Buscamos si existe el usuario en la lista de permitidos
        const allowedUser = await AllowedUser.findOne({
            $or: [
                { identifier: email, type: 'email' },
                { identifier: cedula, type: 'identification' }
            ]
        });

        if (!allowedUser) {
            return res.status(403).json({
                allowed: false,
                message: 'No te encuentras en la lista de usuarios permitidos del sistema'
            });
        }

        res.json({
            allowed: true,
            message: 'Usuario permitido'
        });

    } catch (error) {
        console.error('Error al verificar usuario permitido:', error);
        res.status(500).json({
            allowed: false,
            message: 'Error al verificar el acceso'
        });
    }
};
const registerUser = async (req, res) => {
    try {
        const { email, cedula, password, nombreCompleto, telefono } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({
            $or: [
                { username: email },
                { cedula: cedula }            ]
        });

        if (existingUser) {
            let message = '';
            if (existingUser.username === email) {
                message = 'El correo electrónico ya se encuentra registrado';
            } else if (existingUser.cedula === cedula) {
                message = 'La cédula ya se encuentra registrada';
            } else {
                message = 'El nombre de usuario ya está en uso';
            }
            return res.status(400).json({ message });
        }

        // Crear nuevo usuario
        const user = new User({
            username: email,   
            password,
            nombreCompleto,
            cedula,
            telefono,   
            role: 'usuario',
            email: email
        });

        await user.save();

        res.status(201).json({
            message: 'Usuario registrado exitosamente'
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({
            message: 'Error en el servidor al procesar el registro'
        });
    }
};
module.exports = {
  loginUser,
  verifyToken,
  resetPassword,
  checkAllowedUser,
  registerUser,
};