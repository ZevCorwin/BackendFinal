// src/routes/cartRouter.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authenticateToken = require('../middlewares/auth');

router.post('/add', authenticateToken, cartController.addToCart);
router.get('/', authenticateToken, cartController.getCart);
router.post('/update/:productId', authenticateToken, cartController.updateQuantity);
router.post('/remove/:productId', authenticateToken, cartController.removeFromCart);
router.post('/add-and-checkout', authenticateToken, cartController.addAndCheckout);

module.exports = router;
