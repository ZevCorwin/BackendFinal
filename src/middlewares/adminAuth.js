// src/middlewares/adminAuth.js
const jwt = require('jsonwebtoken');

const authenticateAdminToken = (req, res, next) => {
    const token = req.cookies.adminToken; // Lấy token từ cookie

    if (!token) {
        // Nếu không có token, chuyển hướng đến trang đăng nhập
        return res.redirect('/admin/login');
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET); // Xác thực token
        req.user = verified; // Gán thông tin người dùng đã xác thực vào req
        // Kiểm tra xem người dùng có phải là admin không
        if (req.user.role !== 'admin') {
            return res.redirect('/admin/login');
        }
        next(); // Cho phép tiếp tục xử lý yêu cầu
    } catch (err) {
        console.error('Invalid Token:', err);
        res.redirect('/admin/login'); // Nếu token không hợp lệ, chuyển hướng đến trang đăng nhập
    }
};

module.exports = authenticateAdminToken;
