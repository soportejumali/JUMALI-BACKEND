const express = require('express');
const { 
  getAllUsers, 
  blockUser, 
  deleteUser 
} = require('../controllers/userController');

const router = express.Router();

router.get('/', getAllUsers);
router.put('/:id/block', blockUser);
router.delete('/:id', deleteUser);

module.exports = router;