const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middlewares/adminAuth');
const multer = require('multer');
const path = require('path');

// Middleware xác thực token cho các route admin
router.use(authenticateToken);

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// 1. Dashboard
router.get('/', (req, res) => {
    res.render('admin/dashboard', { layout: 'adminLayout' });
});

// 2. Quản lý tài khoản người dùng
router.get('/users', adminController.getAllUsers);
router.post('/users/add', adminController.addUser);
router.post('/users/set-admin/:id', adminController.setAdmin);
router.post('/users/toggle-lock/:id', adminController.toggleLock);
router.post('/users/reset-password/:id', adminController.resetPassword);

// 3. Quản lý sản phẩm
router.get('/products', adminController.getAllProducts);
router.get('/products/add', adminController.getAddProductPage);
router.post('/products', upload.fields([{ name: 'thumbnail' }, { name: 'images' }]), adminController.addProduct);
router.get('/products/edit/:id', adminController.getProductForEdit);
router.put('/products/:id', upload.fields([{ name: 'thumbnail' }, { name: 'images' }]), adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// 4. Quản lý danh mục
router.get('/categories', adminController.getAllCategories);
router.get('/categories/add', (req, res) => {
    res.render('admin/categories/add', { layout: 'adminLayout' });
});
router.post('/categories', adminController.addCategory);
router.get('/categories/edit/:id', adminController.getCategoryForEdit);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// 5. Quản lý đơn hàng
// Route để lấy danh sách tất cả đơn hàng với tìm kiếm và lọc
router.get('/orders', adminController.searchOrders); 
// Route để xem chi tiết đơn hàng
router.get('/orders/:id', adminController.getOrderDetails);
// Route để cập nhật trạng thái đơn hàng
router.put('/orders/:id/status', adminController.updateOrderStatus);
// Route để hủy đơn hàng
router.post('/orders/:id/cancel', adminController.cancelOrder);

module.exports = router;
