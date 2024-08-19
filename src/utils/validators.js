const { body, validationResult } = require('express-validator');


const registerValidator = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
        .isAlphanumeric().withMessage('Username must be alphanumeric'),
    body('email')
        .trim()
        .isEmail().withMessage('Invalid email address')
        .normalizeEmail(),
    body('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('firstName')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isAlpha().withMessage('First name must contain only letters'),
    body('lastName')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isAlpha().withMessage('Last name must contain only letters'),
    body('phoneNumber')
        .optional()
        .isNumeric().withMessage('Phone number must be numeric')
        .isLength({ min: 10, max: 15 }).withMessage('Phone number must be between 10 and 15 digits'),
    body('dateOfBirth')
        .optional()
        .isDate().withMessage('Date of birth must be a valid date')
];

// Xác thực dữ liệu đăng nhập
const loginValidator = [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

// Xác thực dữ liệu tạo sản phẩm
const createProductValidator = [
    body('name').isString().notEmpty().withMessage('Product name is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('category').isMongoId().withMessage('Invalid category ID'),
    body('thumbnail').isString().optional(),
    body('images').isArray().optional(),
    body('description').isString().optional(),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('reviews').isArray().optional(),
    body('options').isObject().optional(),
];

// Xác thực dữ liệu cập nhật sản phẩm
const updateProductValidator = [
    body('name').isString().optional(),
    body('price').isNumeric().optional(),
    body('category').isMongoId().optional(),
    body('thumbnail').isString().optional(),
    body('images').isArray().optional(),
    body('description').isString().optional(),
    body('stock').isInt({ min: 0 }).optional(),
    body('reviews').isArray().optional(),
    body('options').isObject().optional(),
];

// Kiểm tra kết quả xác thực và trả lỗi nếu có
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    registerValidator,
    loginValidator,
    createProductValidator,
    updateProductValidator,
    validate,
};
