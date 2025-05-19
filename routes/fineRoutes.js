const express = require('express');
const { 
  getAllFines, 
  createFine, 
  payFine 
} = require('../controllers/fineController');

const router = express.Router();

router.get('/', getAllFines);
router.post('/', createFine);
router.put('/:id/pay', payFine);

module.exports = router;