const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');

const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const orderRoutes = require('./orderRoutes');
const cartRoutes = require('./cartRouter.js')

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/cart', cartRoutes);

router.get('/', async (req, res) => {
    try {
        const categories = await Category.find(); // Lấy tất cả category
        res.render('index', { categories }); // Truyền categories vào view
    } catch (err) {
        console.error(err);
        res.status(500).send("Đã có lỗi xảy ra khi tải trang");
    }
});

module.exports = router;
