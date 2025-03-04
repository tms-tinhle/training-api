const User = require('../models/User');

// Middleware xác thực người dùng
const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ msg: 'No authentication token' });

        const user = await User.findOne({ token }).select("-password");
        if (!user) return res.status(401).json({ msg: 'Invalid token' });

        req.user = user;
        next();
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

// Middleware kiểm tra quyền admin
const adminAuth = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Permission denied' });
    }
    next();
};

module.exports = { authenticate, adminAuth };
