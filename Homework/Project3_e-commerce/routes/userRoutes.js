const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate, authorize } = require("../middlewares/authMiddlewares");

/**
 * @route GET /users
 * @desc Lấy danh sách tất cả người dùng (chỉ admin có quyền).
 */
router.get("/", authenticate, authorize(["admin"]), userController.getAllUsers);

/**
 * @route GET /users/:id
 * @desc Lấy thông tin người dùng theo ID (admin hoặc chính user đó).
 */
router.get("/:id", authenticate, authorize(["admin", "user"]), userController.getUserById);

/**
 * @route PUT /users/:id
 * @desc Cập nhật thông tin người dùng (chỉ chính user đó hoặc admin).
 */
router.put("/:id", authenticate, authorize(["user", "admin"]), userController.updateUser);

/**
 * @route DELETE /users/:id
 * @desc Xóa người dùng theo ID (chỉ admin có quyền).
 */
router.delete("/:id", authenticate, authorize(["admin"]), userController.deleteUser);

module.exports = router;
