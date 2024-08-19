const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Trang thanh toán
router.get('/checkout', orderController.checkoutPage);

// Xử lý đặt hàng
router.post('/checkout', orderController.placeOrder);

// Hiển thị các đơn hàng của người dùng
router.get('/my-orders', orderController.getMyOrders);

module.exports = router;
