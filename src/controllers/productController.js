// src/controllers/productController.js
const Product = require('../models/Product');
const Category = require('../models/Category'); // Để kiểm tra tồn tại danh mục
const User = require('../models/User'); // Để kiểm tra tồn tại người dùng

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products); // Đảm bảo trả về dữ liệu JSON
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: 'Error fetching products' });
    }
};



// Lấy chi tiết sản phẩm theo ID
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name')
            .populate('reviews.user', 'username');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product); // Trả về JSON cho API endpoint
    } catch (error) {
        console.error('Error fetching product details:', error); // Log lỗi để biết chi tiết
        res.status(500).json({ message: 'Server error', error });
    }
};

const searchProducts = async (req, res) => {
    try {
        const searchTerm = req.query.search || '';
        const category = req.query.category || '';

        // Tạo truy vấn tìm kiếm
        const query = {};
        if (searchTerm) {
            query.name = { $regex: searchTerm, $options: 'i' };
        }
        if (category && /^[0-9a-fA-F]{24}$/.test(category)) {
            query.category = category;
        }

        const products = await Product.find(query).populate('category');
        const categories = await Category.find(); // Lấy tất cả danh mục

        res.render('index', { products, categories, title: 'Search Results' });
    } catch (err) {
        console.error('Lỗi khi tìm kiếm sản phẩm:', err.response ? err.response.data : err.message);
        res.status(500).send('Đã có lỗi xảy ra khi tìm kiếm sản phẩm.');
    }
};




module.exports = { getAllProducts, getProductById, searchProducts };
