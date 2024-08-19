const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Lấy tất cả sản phẩm
router.get('/', productController.getAllProducts);

// Lấy chi tiết sản phẩm theo ID
router.get('/:id', productController.getProductById);

router.get('/search', productController.searchProducts);

module.exports = router;
