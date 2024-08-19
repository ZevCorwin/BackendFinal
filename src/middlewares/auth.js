const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[4] || req.cookies.token;

    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Gán thông tin người dùng vào req.user
        next();
    } catch (err) {
        console.error('Invalid Token:', err);
        res.status(400).json({ message: 'Invalid Token' });
    }
};

module.exports = authenticateToken;
