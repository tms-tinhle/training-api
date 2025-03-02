const User = require("../models/User");

/**
 * @route GET /users
 * @desc Lấy danh sách tất cả người dùng (chỉ admin mới có quyền).
 * @access Private (Admin)
 * @returns {array} response.users - Danh sách tất cả người dùng (ẩn trường password).
 * @throws {500} - Lỗi server.
 */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * @route GET /users/:id
 * @desc Lấy thông tin người dùng theo ID.
 * @access Private (Admin, User)
 * @param {string} id - ID của người dùng cần lấy thông tin.
 * @returns {object} response.user - Thông tin người dùng (ẩn trường password).
 * @throws {404} - Người dùng không tồn tại.
 * @throws {500} - Lỗi server.
 */
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * @route PUT /users/:id
 * @desc Cập nhật thông tin người dùng.
 * @access Private (User)
 * @param {string} id - ID của người dùng cần cập nhật.
 * @param {string} [username] - Tên người dùng mới.
 * @param {string} [email] - Email mới.
 * @param {string} [role] - Vai trò mới (chỉ admin mới được cập nhật).
 * @returns {object} response.user - Thông tin người dùng sau khi cập nhật.
 * @throws {404} - Người dùng không tồn tại.
 * @throws {500} - Lỗi server.
 */
exports.updateUser = async (req, res) => {
    try {
        const { username, email, role } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.username = username || user.username;
        user.email = email || user.email;

        // Chỉ admin mới có quyền cập nhật role
        if (req.user.role === "admin" && role) {
            user.role = role;
        }

        await user.save();
        res.json({ message: "User updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * @route DELETE /users/:id
 * @desc Xóa người dùng theo ID (chỉ admin mới có quyền).
 * @access Private (Admin)
 * @param {string} id - ID của người dùng cần xóa.
 * @returns {object} - Thông báo xóa thành công.
 * @throws {404} - Người dùng không tồn tại.
 * @throws {500} - Lỗi server.
 */
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        await user.deleteOne();
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
