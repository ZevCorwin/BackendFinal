const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Đăng ký người dùng
const register = async (req, res) => {
    try {
        console.log(req.body);
        const { username, email, password, firstName, lastName, phoneNumber, dateOfBirth } = req.body;

        // Kiểm tra xem email hoặc username đã tồn tại chưa
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo người dùng mới
        const user = new User({
            username,
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phoneNumber: phoneNumber ? Number(phoneNumber) : undefined, // Chuyển đổi số điện thoại thành kiểu số
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined // Chuyển đổi ngày sinh thành kiểu Date
        });

        await user.save();

        res.redirect('/login');
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


// Đăng nhập người dùng
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Tìm người dùng theo email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Kiểm tra nếu tài khoản bị khóa
        if (user.isLocked) {
            return res.status(403).json({ message: 'Account is locked' });
        }

        // So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Tạo token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Gửi token và chuyển hướng đến trang chủ
        res.cookie('token', token, { httpOnly: true }); // Lưu token trong cookie
        res.redirect('/'); // Chuyển hướng đến trang chủ
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Đăng xuất người dùng
const logout = (req, res) => {
    // Xóa token phía client
    res.status(200).json({ message: 'User logged out successfully' });
};

// Khóa tài khoản người dùng
const lockAccount = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndUpdate(userId, { isLocked: true }, { new: true });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Account locked successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Mở khóa tài khoản người dùng
const unlockAccount = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndUpdate(userId, { isLocked: false }, { new: true });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Account unlocked successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Lấy thông tin người dùng hiện tại
const getProfile = async (req, res) => {
    try {
        const userId = req.user._id; // Lấy ID người dùng từ token xác thực
        const user = await User.findById(userId); // Tìm người dùng theo ID

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Xóa thông tin nhạy cảm trước khi trả về
        const { password, ...userProfile } = user.toObject();

        res.status(200).json(userProfile);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


// Lấy thông tin tất cả người dùng (cần quyền admin)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Lấy thông tin người dùng theo ID (cần quyền admin)
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = { register, login, logout, lockAccount, unlockAccount, getProfile, getAllUsers, getUserById };
