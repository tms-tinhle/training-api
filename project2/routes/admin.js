const express = require('express');
const router = express.Router();
const { authenticate, adminAuth } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Lấy danh sách user (Admin only)
router.get('/users', authenticate, adminAuth, async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;
