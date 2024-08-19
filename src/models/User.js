const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: Number },
    dateOfBirth: { type: Date },
    isLocked: { type: Boolean, default: false } // Thêm trường khóa tài khoản
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
