// src/middlewares/admin.js
const User = require('../models/User');

const admin = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = admin;
