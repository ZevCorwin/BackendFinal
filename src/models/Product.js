// src/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    thumbnail: { type: String, required: true }, // Ảnh đại diện của sản phẩm
    images: [{ type: String }], // Danh sách các ảnh mô tả sản phẩm
    description: { type: String, required: true },
    stock: { type: Number, default: 0 },
    reviews: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            rating: { type: Number, min: 1, max: 5 },
            comment: { type: String },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    options: [
        {
            size: { type: String },
            color: { type: String },
            extraPrice: { type: Number }
        }
    ],
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
