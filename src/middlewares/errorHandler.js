// src/middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    }

    if (err.name === 'CastError') {
        return res.status(404).json({ message: 'Resource not found' });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
    }

    // Handle other errors
    res.status(500).json({ message: 'Something went wrong!' });
};

module.exports = errorHandler;
