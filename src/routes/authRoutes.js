const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidator, loginValidator, validate } = require('../utils/validators');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin'); // Middleware kiểm tra quyền admin

// Route đăng ký
router.post('/register', registerValidator, validate, authController.register);

// Route đăng nhập
router.post('/login', loginValidator, validate, authController.login);

// Route đăng xuất
router.post('/logout', authController.logout);

// Route lấy thông tin người dùng hiện tại
router.get('/profile', auth, authController.getProfile);

// Route lấy thông tin tất cả người dùng (cần quyền admin)
router.get('/users', auth, admin, authController.getAllUsers);

// Route lấy thông tin người dùng theo ID (cần quyền admin)
router.get('/users/:id', auth, admin, authController.getUserById);

module.exports = router;
