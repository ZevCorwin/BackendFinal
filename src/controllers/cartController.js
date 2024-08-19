const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.addToCart = async (req, res) => {
    try {
        const productId = req.body.productId;
        const userId = req.user.userId; // Sử dụng `userId` từ token

        if (!userId) {
            console.error('User ID is missing');
            req.flash('error_msg', 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.');
            return res.redirect('/');
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // Tìm sản phẩm trong giỏ hàng
        const itemIndex = cart.items.findIndex(item => item.product.equals(productId));

        if (itemIndex > -1) {
            // Nếu sản phẩm đã có trong giỏ, tăng số lượng
            cart.items[itemIndex].quantity += 1;
        } else {
            // Nếu chưa có, thêm mới sản phẩm vào giỏ
            const product = await Product.findById(productId);
            if (!product) {
                console.error('Product not found');
                req.flash('error_msg', 'Sản phẩm không tồn tại.');
                return res.redirect('/');
            }
            cart.items.push({ product: productId, quantity: 1 });
        }

        await cart.save();
        req.flash('success_msg', 'Sản phẩm đã được thêm vào giỏ hàng!');
        res.redirect('/cart');
    } catch (error) {
        console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error);
        req.flash('error_msg', 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.');
        res.redirect('/');
    }
};


exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            req.flash('error_msg', 'Giỏ hàng của bạn đang trống.');
            return res.redirect('/');
        }

        // Render view với dữ liệu đúng
        res.render('cart', {
            cart,  // Gửi dữ liệu giỏ hàng
            title: 'Giỏ Hàng',
            user: req.user
        });
    } catch (error) {
        console.error('Lỗi khi hiển thị giỏ hàng:', error);
        req.flash('error_msg', 'Có lỗi xảy ra khi hiển thị giỏ hàng.');
        res.redirect('/');
    }
};

exports.updateQuantity = async (req, res) => {
    try {
        const productId = req.params.productId;
        const quantity = parseInt(req.body.quantity, 10);
        const userId = req.user.userId; // Sử dụng `userId` từ token

        if (!userId) {
            console.error('User ID is missing');
            req.flash('error_msg', 'Có lỗi xảy ra khi cập nhật số lượng sản phẩm.');
            return res.redirect('/cart');
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            req.flash('error_msg', 'Giỏ hàng không tồn tại.');
            return res.redirect('/');
        }

        const itemIndex = cart.items.findIndex(item => item.product.equals(productId));

        if (itemIndex > -1) {
            if (quantity <= 0) {
                // Nếu số lượng <= 0, xóa sản phẩm khỏi giỏ hàng
                cart.items.splice(itemIndex, 1);
            } else {
                // Cập nhật số lượng sản phẩm
                cart.items[itemIndex].quantity = quantity;
            }
        } else {
            req.flash('error_msg', 'Sản phẩm không tồn tại trong giỏ hàng.');
        }

        await cart.save();
        req.flash('success_msg', 'Số lượng sản phẩm đã được cập nhật!');
        res.redirect('/cart');
    } catch (error) {
        console.error('Lỗi khi cập nhật số lượng sản phẩm:', error);
        req.flash('error_msg', 'Có lỗi xảy ra khi cập nhật số lượng sản phẩm.');
        res.redirect('/cart');
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const productId = req.params.productId;
        const userId = req.user.userId; // Sử dụng `userId` từ token

        if (!userId) {
            console.error('User ID is missing');
            req.flash('error_msg', 'Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng.');
            return res.redirect('/cart');
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            req.flash('error_msg', 'Giỏ hàng không tồn tại.');
            return res.redirect('/');
        }

        const itemIndex = cart.items.findIndex(item => item.product.equals(productId));

        if (itemIndex > -1) {
            cart.items.splice(itemIndex, 1);
            await cart.save();
            req.flash('success_msg', 'Sản phẩm đã được xóa khỏi giỏ hàng!');
        } else {
            req.flash('error_msg', 'Sản phẩm không tồn tại trong giỏ hàng.');
        }

        res.redirect('/cart');
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error);
        req.flash('error_msg', 'Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng.');
        res.redirect('/cart');
    }
};

exports.addAndCheckout = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.body;

        if (!userId) {
            req.flash('error_msg', 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.');
            return res.redirect('/');
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // Xóa tất cả các sản phẩm cũ trong giỏ hàng
        cart.items = [];

        // Thêm sản phẩm vào giỏ hàng
        cart.items.push({ product: productId, quantity: 1 });

        await cart.save();

        // Chuyển hướng đến trang thanh toán
        res.redirect('/orders/checkout');
    } catch (error) {
        console.error('Lỗi khi thêm sản phẩm vào giỏ hàng và thanh toán:', error);
        req.flash('error_msg', 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.');
        res.redirect('/');
    }
};

exports.completeCheckout = async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!userId) {
            req.flash('error_msg', 'Có lỗi xảy ra khi thanh toán.');
            return res.redirect('/cart');
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart || cart.items.length === 0) {
            req.flash('error_msg', 'Giỏ hàng của bạn hiện tại không có sản phẩm nào.');
            return res.redirect('/cart');
        }

        // Xử lý thanh toán cho tất cả sản phẩm trong giỏ hàng
        // ...

        // Xóa giỏ hàng sau khi thanh toán
        await Cart.deleteOne({ user: userId });

        req.flash('success_msg', 'Thanh toán thành công.');
        res.redirect('/'); // Hoặc trang thành công tùy theo thiết kế của bạn
    } catch (error) {
        console.error('Lỗi khi thanh toán:', error);
        req.flash('error_msg', 'Có lỗi xảy ra khi thanh toán.');
        res.redirect('/cart');
    }
};

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

