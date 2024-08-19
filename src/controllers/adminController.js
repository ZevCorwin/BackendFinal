const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
// Lấy danh sách tất cả người dùng
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.render('admin/userManagement', { users, layout: 'adminLayout' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};


// Cấp quyền admin cho người dùng
const grantAdminRole = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findByIdAndUpdate(userId, { role: 'admin' }, { new: true });
        res.status(200).json({ message: `Cấp quyền admin cho ${user.username}`, user });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

const addUser = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, phoneNumber, dateOfBirth } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!username || !email || !password || !firstName || !lastName) {
            req.flash('error_msg', 'Vui lòng cung cấp tất cả các trường yêu cầu.');
            return res.redirect('/admin/users');
        }

        // Kiểm tra xem người dùng đã tồn tại chưa
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            req.flash('error_msg', 'Username đã tồn tại');
            return res.redirect('/admin/users');
        }

        // Tạo người dùng mới
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phoneNumber: phoneNumber ? Number(phoneNumber) : undefined, // Chuyển đổi số điện thoại thành kiểu số
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined // Chuyển đổi ngày sinh thành kiểu Date
        });

        await newUser.save();
        req.flash('success_msg', 'Tài khoản mới đã được thêm thành công');
        res.redirect('/admin/users');
    } catch (error) {
        console.error('Lỗi khi thêm tài khoản:', error);
        req.flash('error_msg', 'Lỗi khi thêm tài khoản');
        res.redirect('/admin/users');
    }
};


// Cấp/quản lý quyền admin
const setAdmin = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            req.flash('error_msg', 'Người dùng không tìm thấy');
            return res.redirect('/admin/users');
        }

        // Chuyển đổi quyền admin
        user.role = user.role === 'admin' ? 'user' : 'admin';
        await user.save();

        req.flash('success_msg', `Quyền admin đã được ${user.role === 'admin' ? 'cấp' : 'xóa'} cho người dùng.`);
        res.redirect('/admin/users');
    } catch (error) {
        req.flash('error_msg', 'Lỗi khi thay đổi quyền admin');
        res.redirect('/admin/users');
    }
};

// Khóa/Mở khóa tài khoản người dùng
const toggleLock = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            req.flash('error_msg', 'Người dùng không tìm thấy');
            return res.redirect('/admin/users');
        }

        // Chuyển đổi trạng thái khóa
        user.isLocked = !user.isLocked;
        await user.save();

        req.flash('success_msg', `Tài khoản đã được ${user.isLocked ? 'khóa' : 'mở khóa'}`);
        res.redirect('/admin/users');
    } catch (error) {
        req.flash('error_msg', 'Lỗi khi thay đổi trạng thái tài khoản');
        res.redirect('/admin/users');
    }
};

// Reset mật khẩu
const resetPassword = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            req.flash('error_msg', 'Người dùng không tìm thấy');
            return res.redirect('/admin/users');
        }

        // Đặt mật khẩu mặc định
        user.password = await bcrypt.hash('dangdeptrai', 10);
        await user.save();

        req.flash('success_msg', 'Mật khẩu đã được đặt lại thành công');
        res.redirect('/admin/users');
    } catch (error) {
        req.flash('error_msg', 'Lỗi khi đặt lại mật khẩu');
        res.redirect('/admin/users');
    }
};

// Lấy danh sách sản phẩm
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.render('admin/products', { products, layout: 'adminLayout' });
    } catch (error) {
        console.error('Error in getAllProducts:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

// Lấy thông tin sản phẩm cho việc chỉnh sửa
const getProductForEdit = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
        }
        const categories = await Category.find(); // Lấy danh sách danh mục
        res.render('admin/products/edit', { product, categories, layout: 'adminLayout' });
    } catch (error) {
        console.error('Error in getProductForEdit:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

// Lấy trang thêm sản phẩm
const getAddProductPage = async (req, res) => {
    try {
        const categories = await Category.find(); // Lấy danh sách danh mục
        res.render('admin/products/add', { categories, layout: 'adminLayout' });
    } catch (error) {
        console.error('Error in getAddProductPage:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

// Thêm sản phẩm mới
const addProduct = async (req, res) => {
    try {
        let options = [];
        if (req.body.options) {
            try {
                options = JSON.parse(req.body.options);
            } catch (jsonError) {
                req.flash('error_msg', 'Dữ liệu tùy chọn không hợp lệ');
                return res.redirect('/admin/products/add');
            }
        }

        // Xử lý ảnh đại diện
        const thumbnail = req.files['thumbnail'] ? req.files['thumbnail'][0].path : '';

        // Xử lý ảnh mô tả
        const images = req.files['images'] ? req.files['images'].map(file => file.path) : [];

        const newProduct = new Product({
            ...req.body,
            thumbnail,
            images,
            options
        });
        await newProduct.save();
        req.flash('success_msg', 'Sản phẩm mới đã được thêm');
        res.redirect('/admin/products/add');
    } catch (error) {
        req.flash('error_msg', 'Lỗi khi thêm sản phẩm');
        res.redirect('/admin/products/add');
    }
};

// Cập nhật thông tin sản phẩm
const updateProduct = async (req, res) => {
    try {
        let options = [];
        if (req.body.options) {
            try {
                options = JSON.parse(req.body.options);
            } catch (jsonError) {
                req.flash('error_msg', 'Dữ liệu tùy chọn không hợp lệ. Vui lòng kiểm tra định dạng JSON.');
                return res.redirect(`/admin/products/edit/${req.params.id}`);
            }
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            req.flash('error_msg', 'Không tìm thấy sản phẩm với ID đã cho.');
            return res.redirect('/admin/products');
        }

        // Cập nhật ảnh đại diện
        if (req.files['thumbnail']) {
            product.thumbnail = req.files['thumbnail'][0].path;
        }

        // Cập nhật ảnh mô tả
        if (req.files['images']) {
            product.images = req.files['images'].map(file => file.path);
        }

        // Cập nhật các trường khác
        product.name = req.body.name || product.name;
        product.price = req.body.price || product.price;
        product.category = req.body.category || product.category;
        product.description = req.body.description || product.description;
        product.stock = req.body.stock || product.stock;
        product.options = options;

        await product.save();

        req.flash('success_msg', 'Sản phẩm đã được cập nhật thành công.');
        res.redirect('/admin/products');
    } catch (error) {
        req.flash('error_msg', 'Đã xảy ra lỗi khi cập nhật sản phẩm. Vui lòng thử lại sau.');
        res.redirect(`/admin/products/edit/${req.params.id}`);
    }
};




// Xóa sản phẩm
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            req.flash('error_msg', 'Sản phẩm không tìm thấy');
            return res.redirect('/admin/products');
        }

        req.flash('success_msg', 'Sản phẩm đã được xóa');
        res.redirect('/admin/products');
    } catch (error) {
        req.flash('error_msg', 'Lỗi khi xóa sản phẩm');
        res.redirect('/admin/products');
    }
};


// Lấy danh sách tất cả đơn hàng
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'username email') // Lấy thông tin người dùng liên quan
            .populate({
                path: 'products.product',
                select: 'name price' // Lấy thông tin sản phẩm liên quan
            })
            .exec(); // Thực thi truy vấn

        res.render('admin/orders', { orders }); // Truyền danh sách đơn hàng vào view
    } catch (error) {
        console.error('Lỗi khi lấy danh sách đơn hàng:', error);
        req.flash('error_msg', 'Lỗi khi lấy danh sách đơn hàng');
        res.redirect('/admin/orders');
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        // Kiểm tra nếu orderId là ObjectId hợp lệ
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            req.flash('error_msg', 'ID đơn hàng không hợp lệ');
            return res.redirect('/admin/orders');
        }

        const order = await Order.findById(orderId);
        if (!order) {
            req.flash('error_msg', 'Không tìm thấy đơn hàng');
            return res.redirect('/admin/orders');
        }

        order.status = status;
        await order.save();

        req.flash('success_msg', 'Trạng thái đơn hàng đã được cập nhật');
        res.redirect(`/admin/orders/${orderId}`);
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
        req.flash('error_msg', 'Lỗi khi cập nhật trạng thái đơn hàng');
        res.redirect('/admin/orders');
    }
};

const cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.id;

        // Kiểm tra nếu orderId là ObjectId hợp lệ
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            req.flash('error_msg', 'ID đơn hàng không hợp lệ');
            return res.redirect('/admin/orders');
        }

        const order = await Order.findById(orderId);
        if (!order) {
            req.flash('error_msg', 'Không tìm thấy đơn hàng');
            return res.redirect('/admin/orders');
        }

        order.status = 'cancelled';
        order.isCancelled = true;
        await order.save();

        req.flash('success_msg', 'Đơn hàng đã được hủy');
        res.redirect('/admin/orders');
    } catch (error) {
        console.error('Lỗi khi hủy đơn hàng:', error);
        req.flash('error_msg', 'Lỗi khi hủy đơn hàng');
        res.redirect('/admin/orders');
    }
};

const getOrderDetails = async (req, res) => {
    try {
        // Tìm đơn hàng theo ID và populate các thông tin sản phẩm
        const order = await Order.findById(req.params.id)
            .populate({
                path: 'products.product',
                select: 'name price thumbnail', // Chọn các trường cần thiết để populate
                model: 'Product'
            })
            .exec();

        if (!order) {
            return res.status(404).send('Order not found');
        }

        res.render('admin/orders/details', { order });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

const searchOrders = async (req, res) => {
    try {
        const { status, search, startDate, endDate } = req.query;

        // Tạo điều kiện lọc
        const filters = {};
        if (status) filters.status = status;
        if (search) filters.$or = [
            { '_id': search }, 
            { 'user.email': { $regex: search, $options: 'i' } }
        ];
        // Nếu có startDate và endDate, xử lý khoảng thời gian
        if (startDate && endDate) {
            // Đặt startDate vào lúc đầu ngày (00:00:00)
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);

            // Đặt endDate vào cuối ngày (23:59:59)
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);  // Điều chỉnh endDate thành cuối ngày

            filters.orderDate = { $gte: start, $lte: end };
        }

        // Kiểm tra và xử lý _id trong tìm kiếm
        if (filters.$or && filters.$or[0]['_id']) {
            filters.$or[0]['_id'] = mongoose.Types.ObjectId.isValid(filters.$or[0]['_id']) ? filters.$or[0]['_id'] : null;
        }

        const orders = await Order.find(filters)
            .populate('user', 'username email')
            .populate('products.product', 'name price')
            .exec();

        res.render('admin/orders', { orders, layout: 'adminLayout' });
    } catch (error) {
        console.error('Lỗi khi tìm kiếm/ lọc đơn hàng:', error);
        req.flash('error_msg', 'Lỗi khi tìm kiếm/ lọc đơn hàng');
        res.redirect('/admin/orders');
    }
};

// Lấy danh sách tất cả danh mục
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.render('admin/categories', { categories, layout: 'adminLayout' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

const getCategoryForEdit = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Danh mục không tìm thấy' });
        }
        res.render('admin/categories/edit', { category, layout: 'adminLayout' });
    } catch (error) {
        console.error('Error in getCategoryForEdit:', error); // Thêm dòng này để kiểm tra lỗi
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

// Thêm danh mục mới
const addCategory = async (req, res) => {
    try {
        const newCategory = new Category(req.body);
        await newCategory.save();
        res.redirect('/admin/categories'); // Chuyển hướng về trang danh sách danh mục sau khi thêm
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi thêm danh mục', error });
    }
};

// Cập nhật danh mục
const updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const updatedCategory = await Category.findByIdAndUpdate(categoryId, req.body, { new: true });
        res.redirect('/admin/categories'); // Chuyển hướng về trang danh sách danh mục sau khi cập nhật
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật danh mục', error });
    }
};

// Xóa danh mục
const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        await Category.findByIdAndDelete(categoryId);
        res.redirect('/admin/categories'); // Chuyển hướng về trang danh sách danh mục sau khi xóa
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa danh mục', error });
    }
};

module.exports = {
    getAllUsers,
    grantAdminRole,
    addUser,
    setAdmin,
    toggleLock,
    resetPassword,
    getAllProducts,
    getProductForEdit,
    getAddProductPage,
    addProduct,
    updateProduct,
    deleteProduct,
    getAllOrders,
    getOrderDetails,
    updateOrderStatus,
    cancelOrder,
    searchOrders,
    getAllCategories,
    getCategoryForEdit,
    addCategory,
    updateCategory,
    deleteCategory
};
