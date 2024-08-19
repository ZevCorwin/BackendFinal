const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authenticateToken = require('../middlewares/auth');
const { createProductValidator, updateProductValidator, validate } = require('../utils/validators');

// Lấy tất cả danh mục
router.get('/', categoryController.getAllCategories);

// Thêm danh mục mới
router.post('/', authenticateToken, createProductValidator, validate, categoryController.createCategory);

// Lấy danh mục theo ID
router.get('/:id', categoryController.getCategoryById);

// Cập nhật danh mục theo ID
router.put('/:id', authenticateToken, updateProductValidator, validate, categoryController.updateCategory);

// Xóa danh mục theo ID
router.delete('/:id', authenticateToken, categoryController.deleteCategory);

module.exports = router;
