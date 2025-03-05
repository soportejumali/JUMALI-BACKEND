const express = require('express');
const { loginUser, verifyToken, resetPassword, checkAllowedUser, registerUser } = require('../controllers/authController');

const router = express.Router();

// Ruta para login
router.post('/login', loginUser);
router.put('/reset-password', resetPassword);
router.get("/verify-token", verifyToken);
router.post('/check-allowed', checkAllowedUser);
router.post('/register', registerUser);

module.exports = router;
