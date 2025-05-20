const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

// Rutas protegidas que requieren autenticación
router.get('/',  loanController.getAllLoans);
router.post('/',  loanController.createLoan);
router.get('/user/:userId',  loanController.getUserLoans);
router.put('/:id/return',  loanController.returnBook);

module.exports = router;