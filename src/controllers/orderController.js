const Order = require('../models/Order');
const Cart = require('../models/Cart');

exports.checkoutPage = async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!userId) {
            req.flash('error_msg', 'Có lỗi xảy ra khi xác định người dùng.');
            return res.redirect('/');
        }

        let cart = await Cart.findOne({ user: userId }).populate('items.product');

        if (!cart) {
            req.flash('error_msg', 'Giỏ hàng không tồn tại.');
            return res.redirect('/');
        }

        res.render('checkout', {
            title: 'Thanh Toán',
            user: req.user,
            cart: cart
        });
    } catch (error) {
        console.error('Lỗi khi tải trang thanh toán:', error);
        req.flash('error_msg', 'Có lỗi xảy ra khi tải trang thanh toán.');
        res.redirect('/');
    }
};

exports.placeOrder = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { fullName, street, city, state, phoneNumber, paymentMethod } = req.body;

        if (!userId) {
            req.flash('error_msg', 'Có lỗi xảy ra khi xác định người dùng.');
            return res.redirect('/');
        }

        let cart = await Cart.findOne({ user: userId }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            req.flash('error_msg', 'Giỏ hàng của bạn hiện tại không có sản phẩm nào.');
            return res.redirect('/cart');
        }

        // Calculate total price
        let totalPrice = cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);

        // Create new order
        const newOrder = new Order({
            user: userId,
            fullName,
            products: cart.items.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            })),
            totalPrice,
            shippingAddress: {
                street,
                city,
                state,
                country: 'Vietnam' // Always set country to Vietnam
            },
            phoneNumber,
            paymentMethod,
            paymentStatus: 'pending'
        });

        await newOrder.save();

        // Clear cart
        await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

        req.flash('success_msg', 'Đơn hàng của bạn đã được đặt thành công.');
        res.redirect('/');
    } catch (error) {
        console.error('Lỗi khi đặt hàng:', error);
        req.flash('error_msg', 'Có lỗi xảy ra khi đặt hàng.');
        res.redirect('/checkout');
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!userId) {
            req.flash('error_msg', 'Có lỗi xảy ra khi xác định người dùng.');
            return res.redirect('/auth/login');
        }

        // Lấy các đơn hàng của người dùng đã đăng nhập
        const orders = await Order.find({ user: userId }).populate('products.product').exec();

        res.render('my-orders', {
            title: 'Đơn Hàng Của Tôi',
            user: req.user,
            orders: orders
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách đơn hàng:', error);
        req.flash('error_msg', 'Có lỗi xảy ra khi lấy danh sách đơn hàng.');
        res.redirect('/');
    }
};
