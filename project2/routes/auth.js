const express = require('express');
const router = express.Router();
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Hàm kiểm tra hợp lệ
const isValidEmail = (email) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
const isValidPassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
const isValidName = (name) => /^[a-zA-Z\s]+$/.test(name);

// Hàm gửi email
const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    await transporter.sendMail({ from: process.env.SMTP_USER, to, subject, text });
};

// Đăng ký
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!isValidName(name) || !isValidEmail(email) || !isValidPassword(password)) {
            return res.status(400).json({ msg: 'Invalid input data' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(409).json({ msg: 'User already exists' });

        const verifyToken = Math.random().toString(36).substr(2);
        const verifyTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

        const newUser = new User({ name, email, password, role, verifyToken, verifyTokenExpires });
        await newUser.save();

        const verifyLink = `http://localhost:3000/api/auth/verify/${verifyToken}`;
        await sendEmail(email, "Verify Account", `Click here to verify: ${verifyLink}`);

        res.json({ msg: 'User created, check email for verification' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Xác thực email
router.get('/verify/:token', async (req, res) => {
    try {
        const user = await User.findOne({ verifyToken: req.params.token });
        if (!user || user.verifyTokenExpires < new Date()) {
            return res.status(400).json({ msg: 'Token is invalid or expired' });
        }

        user.isVerified = true;
        user.verifyToken = null;
        user.verifyTokenExpires = null;
        await user.save();

        res.json({ msg: 'Email verified successfully' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Đăng nhập
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!isValidEmail(email) || !isValidPassword(password)) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const user = await User.findOne({ email });
        if (!user || !user.checkPassword(password)) return res.status(400).json({ msg: "Invalid credentials" });
        if (!user.isVerified) return res.status(400).json({ msg: "Email not verified" });

        user.token = Math.random().toString(36).substr(2);
        await user.save();

        res.json({ token: user.token });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Quên mật khẩu
router.post('/password/reset', async (req, res) => {
    try {
        const { email } = req.body;
        if (!isValidEmail(email)) return res.status(400).json({ msg: 'Invalid email' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "User not found" });

        user.resetToken = Math.random().toString(36);
        user.verifyTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();

        const resetLink = `http://localhost:3000/api/auth/password/reset/${user.resetToken}`;
        await sendEmail(email, "Password Reset", `Click link to reset your password: ${resetLink}`);

        res.json({ msg: "Please check your email for reset instructions" });
    } catch (error) {
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
