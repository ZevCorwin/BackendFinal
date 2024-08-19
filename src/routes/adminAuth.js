// src/routes/adminAuth.js
const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');

// Hiển thị trang đăng nhập
router.get('/login', (req, res) => {
    res.render('admin/auth/login');
});

// Xử lý đăng nhập
router.post('/login', adminAuthController.login);

// Đăng xuất
router.get('/logout', (req, res) => {
    res.clearCookie('adminToken');
    res.redirect('/admin/login'); // Hoặc trang khác sau khi đăng xuất
});


module.exports = router;
