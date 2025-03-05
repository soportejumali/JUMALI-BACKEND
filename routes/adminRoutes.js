const express = require('express');
const { addAllowedUser, getAllowedUsers } = require('../controllers/adminController');

const router = express.Router();


// Rutas para usuarios permitidos
router.post('/allowed-users', addAllowedUser);
router.get('/allowed-users', getAllowedUsers);

module.exports = router;