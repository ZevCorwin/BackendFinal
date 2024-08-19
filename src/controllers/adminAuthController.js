// src/controllers/adminAuthController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Đăng nhập admin
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Tìm admin theo email
        const user = await User.findOne({ email });
        if (!user || user.role !== 'admin') {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Tạo token
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Lưu token vào cookie và chuyển hướng về trang admin
        res.cookie('adminToken', token, { httpOnly: true, maxAge: 3600000 });
        res.redirect('/admin');
        
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = { login };
