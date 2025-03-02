const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate } = require("../middlewares/authMiddleware");

/**
 * @route POST /auth/register
 * @desc Đăng ký tài khoản mới
 * @access Public
 */
router.post("/register", authController.register);

/**
 * @route GET /auth/verify/:token
 * @desc Xác thực email người dùng
 * @access Public
 */
router.get("/verify/:token", authController.verifyEmail);

/**
 * @route POST /auth/login
 * @desc Đăng nhập vào hệ thống
 * @access Public
 */
router.post("/login", authController.login);

/**
 * @route PUT /auth/change-password
 * @desc Đổi mật khẩu người dùng
 * @access Private (User đã đăng nhập)
 */
router.put("/change-password", authenticate, authController.changePassword);

/**
 * @route POST /auth/forgot-password
 * @desc Gửi email đặt lại mật khẩu
 * @access Public
 */
router.post("/forgot-password", authController.forgotPassword);

/**
 * @route POST /auth/reset-password/:token
 * @desc Đặt lại mật khẩu
 * @access Public
 */
router.post("/reset-password/:token", authController.resetPassword);

module.exports = router;
