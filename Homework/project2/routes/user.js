const User = require('../models/User');
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Middleware for authentication
const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        if (!token) return res.status(401).json({ msg: 'No authentication token, authorization denied' });

        const user = await User.findOne({ token }).select("-password");
        if (!user) return res.status(401).json({ msg: 'Invalid token' });

        req.user = user;
        next();
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

// Middleware for authorization
const authorization = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user?.role)) {
            return res.status(403).json({ msg: 'Permission denied' });
        }
        next();
    }
};

// Function to send email
const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        text
    });
};

// 1. Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (role && !["user", "admin"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ msg: 'User already exists' });

        const verifyToken = Math.random().toString(36).substr(2);
        const verifyTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        const newUser = new User({ name, email, password, role, verifyToken, verifyTokenExpires });
        await newUser.save();

        const verifyLink = `http://localhost:3000/api/users/verify/${verifyToken}`;
        await sendEmail(email, "Verify Account", `<p>Click here to verify:</p><a href="${verifyLink}">${verifyLink}</a>`);

        res.json({ msg: 'User created, check email for verification' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err.message });
    }
});

// 2. Verify account
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

// 3. Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
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

// 4. Logout
router.post('/logout', authenticate, async (req, res) => {
    try {
        req.user.token = null;
        await req.user.save();

        res.json({ msg: 'Logged out' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// 5. Get profile by ID
router.get('/:id', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// 6. Update profile
router.put('/:id', authenticate, async (req, res) => {
    try {
        if (req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ message: "You can only update your own profile" });
        }

        const { name, password } = req.body;

        if (name) req.user.name = name;
        if (password) req.user.password = password;

        await req.user.save();
        res.json({ message: "Profile updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// 7. Get all users (Admin)
router.get('/', authenticate, authorization(["admin"]), async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

/// 8. Forgot password
router.post('/password/reset', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        user.resetToken = Math.random().toString(36);
        user.verifyTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        // Sửa lỗi URL sai
        const resetLink = `http://localhost:3000/api/users/password/reset/${user.resetToken}`;
        const emailContent = `<p>Click link to reset your password:</p><a href="${resetLink}">${resetLink}</a>`;
        await sendEmail(email, 123123, emailContent);

        res.json({ message: "Please check your email for reset instructions" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// 9. Reset password
router.put('/password/reset/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({ resetToken: token });
        if (!user) return res.status(400).json({ message: "Invalid or expired token" });

        if (user.verifyTokenExpires < new Date()) {
            return res.status(400).json({ message: "Token expired, please request again" });
        }

        user.password = password;
        user.resetToken = null;
        user.verifyTokenExpires = null;
        await user.save();

        res.json({ message: "Password reset successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// 10. Resend verification email
router.post('/verify/resend', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not exist!" });
        if (user.isVerified) return res.status(400).json({ message: "Account is already verified" });

        user.verifyToken = Math.random().toString(36).substr(2);
        await user.save();

        const verifyLink = `http://localhost:3000/api/users/verify/${user.verifyToken}`;
        const emailContent = `<p>Click link to verify email:</p><a href="${verifyLink}">${verifyLink}</a>`;
        await sendEmail(email, "Account verify, resent", emailContent);

        res.json({ message: "Resent! Please check your email" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;