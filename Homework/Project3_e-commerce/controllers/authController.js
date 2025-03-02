const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

/**
 * @route POST /auth/register
 * @desc Đăng ký tài khoản mới và gửi email xác thực
 * @access Public
 * @param {string} username - Tên người dùng
 * @param {string} email - Địa chỉ email
 * @param {string} password - Mật khẩu
 * @returns {object} response.user - Thông tin người dùng mới
 * @throws {400} - Email đã tồn tại
 * @throws {500} - Lỗi server
 */
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            isVerified: false
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully. Please verify your email." });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * @route GET /auth/verify/:token
 * @desc Xác thực email người dùng bằng token
 * @access Public
 * @param {string} token - Mã xác thực email
 * @returns {object} - Thông báo xác thực thành công
 * @throws {400} - Token không hợp lệ hoặc hết hạn
 * @throws {500} - Lỗi server
 */
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) return res.status(400).json({ message: "Invalid token" });

        user.isVerified = true;
        await user.save();

        res.json({ message: "Email verified successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * @route POST /auth/login
 * @desc Đăng nhập và nhận token xác thực
 * @access Public
 * @param {string} email - Địa chỉ email
 * @param {string} password - Mật khẩu
 * @returns {object} response.token - Token xác thực
 * @throws {401} - Email hoặc mật khẩu không chính xác
 * @throws {500} - Lỗi server
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(401).json({ message: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * @route PUT /auth/change-password
 * @desc Đổi mật khẩu người dùng
 * @access Private (User đã đăng nhập)
 * @param {string} oldPassword - Mật khẩu cũ
 * @param {string} newPassword - Mật khẩu mới
 * @returns {object} - Thông báo đổi mật khẩu thành công
 * @throws {400} - Mật khẩu cũ không đúng
 * @throws {500} - Lỗi server
 */
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * @route POST /auth/forgot-password
 * @desc Gửi email đặt lại mật khẩu
 * @access Public
 * @param {string} email - Địa chỉ email của người dùng
 * @returns {object} - Thông báo gửi email thành công
 * @throws {404} - Không tìm thấy tài khoản
 * @throws {500} - Lỗi server
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found" });

        // Giả lập gửi email chứa link đặt lại mật khẩu
        res.json({ message: "Password reset link sent to email" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * @route POST /auth/reset-password/:token
 * @desc Đặt lại mật khẩu bằng token
 * @access Public
 * @param {string} token - Token đặt lại mật khẩu
 * @param {string} newPassword - Mật khẩu mới
 * @returns {object} - Thông báo đặt lại mật khẩu thành công
 * @throws {400} - Token không hợp lệ hoặc hết hạn
 * @throws {500} - Lỗi server
 */
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) return res.status(400).json({ message: "Invalid token" });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: "Password reset successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
