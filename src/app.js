const express = require('express');
const app = express();
const routes = require('./routes');
const adminAuthRoutes = require('./routes/adminAuth');
const adminRoutes = require('./routes/admin');
const connectDB = require('./config/db');
const path = require('path');
const authenticateToken = require('./middlewares/auth');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const axios = require('axios'); // Thêm dòng này để import axios
require('dotenv').config();

// Kết nối đến MongoDB
connectDB();

// Middleware để phân tích dữ liệu JSON từ client
app.use(express.json());

// Middleware để phân tích dữ liệu từ form HTML
app.use(express.urlencoded({ extended: true }));

// Middleware để phân tích cookie
app.use(cookieParser());

// Cấu hình session
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Nếu không dùng HTTPS, hãy đặt thành false
}));

// Cấu hình flash messages
app.use(flash());

// Middleware để thêm flash messages vào req
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

// Middleware để xử lý các phương thức HTTP khác (PUT, DELETE, PATCH)
app.use(methodOverride('_method'));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Cấu hình engine EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Phục vụ các file tĩnh từ thư mục 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Middleware kiểm tra người dùng đã đăng nhập cho các route cần thiết
app.use((req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        try {
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            req.user = verified;
        } catch (err) {
            console.error('Invalid Token:', err);
        }
    }
    next();
});

// Các route cho ứng dụng
app.use('/api', routes);
app.use('/admin', adminAuthRoutes);
app.use('/admin', adminRoutes);

// Các route khác
app.get('/', async (req, res) => {
    try {
        // Gọi API để lấy dữ liệu sản phẩm
        const response = await axios.get('http://localhost:8080/api/products');
        const products = response.data;

        // Render template với dữ liệu sản phẩm
        res.render('index', { title: 'Trang Chủ', user: req.user, products: products });
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).send('Error fetching products');
    }
});

// Route chi tiết sản phẩm
app.get('/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const response = await axios.get(`http://localhost:8080/api/products/${productId}`);
        const product = response.data;

        // Render trang product-detail với dữ liệu product và user
        res.render('product-detail', { title: 'Chi tiết sản phẩm', product: product, user: req.user });
    } catch (err) {
        console.error('Error fetching product details:', err);
        res.status(500).send('Error fetching product details');
    }
});

// Đảm bảo rằng route giỏ hàng được đăng ký đúng
app.use('/cart', require('./routes/cartRouter'));
app.use('/orders', require('./routes/orderRoutes'));

app.get('/register', (req, res) => {
    res.render('auth/register', { user: req.user });
});

app.get('/login', (req, res) => {
    res.render('auth/login', { user: req.user });
});

app.get('/logout', (req, res) => {
    res.clearCookie('token'); // Xóa token từ cookie
    res.redirect('/');
});

module.exports = app;
