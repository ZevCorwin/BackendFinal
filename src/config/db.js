// src/config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Kết nối tới MongoDB thành công');
    } catch (error) {
        console.error('Không thể kết nối đến MongoDB:', error.message);
        process.exit(1); // Thoát chương trình nếu không thể kết nối
    }
};

module.exports = connectDB;
