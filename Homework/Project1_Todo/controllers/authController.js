const crypto = require("crypto");
const User = require("../models/User");
require("dotenv").config();

/**
 * @function generateToken
 * @desc Tạo một token xác thực cho người dùng.
 * @param {object} user - Đối tượng người dùng.
 * @returns {object} - Token và thời gian hết hạn.
 * @returns {string} return.token - Token xác thực.
 * @returns {Date} return.expiresAt - Thời gian hết hạn của token.
 */
function generateToken(user) {
    const payload = `${user}|${Date.now() + 24 * 60 * 60 * 1000}`;
    const hmac = crypto.createHmac("sha256", process.env.SECRET_KEY);
    const token = hmac.update(payload).digest("hex");

    console.log("Generated token inside generateToken():", token); // Kiểm tra token tại đây

    return {
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
}

/**
 * @route POST /register
 * @desc Đăng ký người dùng mới.
 * @access Public
 * @param {string} username - Tên người dùng (bắt buộc).
 * @param {string} password - Mật khẩu (bắt buộc, ít nhất 6 ký tự).
 * @returns {object} - Thông báo đăng ký thành công.
 * @throws {400} - Lỗi nếu tên người dùng đã tồn tại hoặc dữ liệu không hợp lệ.
 * @throws {500} - Lỗi server nếu có vấn đề trong quá trình đăng ký.
 * @example
 * // Đăng ký người dùng mới
 * POST /register
 * {
 * "username": "newUser",
 * "password": "password123"
 * }
 */
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Kiểm tra input không được để trống
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        // Kiểm tra password có đủ mạnh không (ít nhất 6 ký tự)
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // Kiểm tra xem username đã tồn tại chưa
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }
        
        // Tạo user mới
        const user = new User({ username });
        user.setPassword(password);
        await user.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error("Error during registration:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * @route POST /login
 * @desc Đăng nhập người dùng và trả về token xác thực.
 * @access Public
 * @param {string} username - Tên người dùng (bắt buộc).
 * @param {string} password - Mật khẩu (bắt buộc).
 * @returns {object} - Thông báo đăng nhập thành công và token.
 * @returns {string} return.token - Token xác thực.
 * @throws {400} - Lỗi nếu tên người dùng hoặc mật khẩu thiếu.
 * @throws {401} - Lỗi nếu thông tin đăng nhập không hợp lệ.
 * @throws {500} - Lỗi server nếu có vấn đề trong quá trình đăng nhập.
 * @example
 * // Đăng nhập người dùng
 * POST /login
 * {
 * "username": "newUser",
 * "password": "password123"
 * }
 */
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        const user = await User.findOne({ username });
        if (!user || !user.validatePassword(password)) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Tạo token
        const { token, expiresAt } = generateToken(user.username);
        user.token = token;
        user.tokenExpiresAt = expiresAt;
        
        await user.save();

        res.json({ message: "Login successful", token });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
};


/**
 * @route POST /logout
 * @desc Đăng xuất người dùng, vô hiệu hóa token.
 * @access Private (yêu cầu xác thực)
 * @returns {object} - Thông báo đăng xuất thành công.
 * @throws {401} - Lỗi nếu người dùng chưa đăng nhập.
 * @throws {500} - Lỗi server nếu có vấn đề trong quá trình đăng xuất.
 * @example
 * // Đăng xuất người dùng
 * POST /logout
 */
exports.logout = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        req.user.token = null;
        req.user.tokenExpiresAt = null;
        await req.user.save();

        res.json({ message: "Logout successful" });
    } catch (err) {
        console.error("Error during logout:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
