const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Lấy hồ sơ người dùng
router.get('/profile', authenticate, async (req, res) => {
    res.json(req.user);
});

// Cập nhật hồ sơ
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { name, password } = req.body;
        if (name) req.user.name = name;
        if (password) req.user.password = password;
        await req.user.save();
        res.json({ msg: "Profile updated successfully" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;
